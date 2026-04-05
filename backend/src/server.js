import express from "express";
import { ENV } from "./lib/env.js";
import path from "path";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import { serve } from "inngest/express";
import { functions, inngest } from "./lib/inngest.js";
import {clerkMiddleware} from "@clerk/express"
import { protectRoute } from "./middleware/protectRoute.js";
const app = express();

const __dirname=path.resolve();

app.use(express.json());
app.use(cors({origin: ENV.CLIENT_URL, credentials: true}));

app.use(clerkMiddleware());

app.use("/api/inngest", serve({client: inngest, functions}))
app.get("/health", (req, res) => {
    res.status(200).json({ message: "bhak, World!" });
});

app.get("/books", (req, res) => {
    res.status(200).json({ message: "chal, World!" });
});

app.get("/video-calls", protectRoute ,(req,res)=>{
    res.status(200).json({message: "video calls endpoint"});
})

if(ENV.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("/{*any}", (req, res) => {
        res.sendFile(path.join(__dirname,"../frontend","dist", "index.html" ));
})};

// app.listen(ENV.PORT, () => {
//     console.log("Server is running on port " + ENV.PORT);
//     connectDB();
// });

const startServer= async () =>{
    try{
        await connectDB();
        app.listen(ENV.PORT, () => console.log("Server is running on port " + ENV.PORT));
    }
    catch(error){
        console.error(`Error: ${error.message}`);
    }
}
startServer();