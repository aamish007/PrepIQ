import { chatClient, streamClient } from "../lib/stream.js";
import Session from "../models/Session.js";

export async function createSession(req, res){
    try {
        const {problem, difficulty}=req.body;
        const userId=req.user._id;
        const clerkId=req.user.clerkId;
        if(!problem || !difficulty){
            return res.status(400).json({message: "Problem and difficulty are required."});
        }
        //generates a unique callId for the session, which will be used for video call setup and identification. The callId is created by combining a prefix ("session_"), the current timestamp, and a random string. This ensures that each session has a distinct identifier that can be used to manage video calls and associate them with the correct session in the database.
        const callId=`session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        //create a new session in the database with the provided problem, difficulty, host user ID, and generated callId. The session is initialized with a status of "active" and no participant. The created session object is then returned in the response with a 201 status code, indicating that the session was successfully created.
        const session=await Session.create({problem, difficulty, host: userId, callId});
        //create stream video call for the session using the generated callId. The call is created with custom data that includes the ID of the user who created the session (created_by_id) and additional information about the session (problem, difficulty, and sessionId). This allows the application to manage video calls associated with each session and ensure that they are properly linked to the corresponding session in the database.
        await streamClient.video.call("default", callId).getOrCreate({
            data: {
                created_by_id: clerkId,
                custom: {problem, difficulty, sessionId: session._id.toString()},
            },
        });
        //chat messaging
        const channel=chatClient.channel("messaging", callId, {
            name: `${problem} Session`,
            created_by_id: clerkId,
            members: [clerkId],
        })

        await channel.create();
        res.status(201).json({session});
    } catch (error) {
        console.log("Error in createSession controller: ", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getActiveSessions(_, res){
    try {
        const sessions=await Session.find({status: "active"})
        .populate("host", "name profileImage") //populates allows us to get the details where in the session model we took reference
        .sort({createdAt: -1})
        .limit(20);

        res.status(200).json({sessions});
    } catch (error) {
        console.log("Error in getActiveSessions controller: ", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getMyRecentSessions(req, res){
    try {
        //gets sessions where user is either host or participant
        const sessions=await Session.find({
            status:"completed",
            $or: [{host:userId}, {participant: userId}],
        })
        .sort({createdAt: -1})
        .limit(20);
        res.status(200).json({sessions});
    } catch (error) {
        console.log("Error in getMyRecentSessions controller: ", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getSessionById(req, res){
    try {
        const id=req.params;
        const session=await Session.findById(id)
        .populate("host", "name email profileImage clerkId")
        .populate("participant", "name email profileImage clerkId");

        if(!session){
            return res.status(404).json({message: "Session not found."});
        }

        res.status(200).json({session});
    } catch (error) {
        console.log("Error in getSessionById controller: ", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function joinSession(req, res){
    try {
        const {id}=req.params;
        const userId=req.user._id;
        const clerkId=req.user.clerkId;

        const session=await Session.findById(id);

        if(!session){
            return res.status(404).json({message: "Session not found."});
        }
        //checks if session is already joined by someone else or not
        if(session.participant){
            return res.status(404).json({message: "Session is already full."});
        }

        session.participant=userId;
        await session.save();

        const channel=chatClient.channel("messaging", session.callId);
        await channel.addMembers([clerkId]);

        res.status(200).json({session});
    } catch (error) {
        console.log("Error in joinSession controller: ", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function endSession(req, res){
    try {
        const id=req.params;
        const userId=req.user._id;

        const session=await Session.findById(id);
        
        if(!session){
            return res.status(404).json({message: "Session not found."});
        }
        //check if user is host of the session, only host can end the session
        if(session.host.toString() !== userId.toString()){
            return res.status(403).json({message: "Only host can end the session."});
        }

        //check if session is already completed or not
        if(session.status === "completed"){
            return res.status(400).json({message: "Session is already completed."});
        }

        session.status="completed";
        await session.save();

        //delete stream video call for the session using the callId. The call is deleted with the "hard" option set to true, which means that the call will be permanently removed from Stream's servers. This ensures that once a session is ended, the associated video call is also removed and cannot be accessed again.
        const call=streamClient.video.call("default", session.callId);
        await call.delete({hard: true});

        //delete stream chat channel
        const channel=chatClient.channel("messaging", session.callId);
        await channel.delete();

        res.status(200).json({message: "Session ended successfully."});

    } catch (error) {
        console.log("Error in endSession controller: ", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}