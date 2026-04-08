import {StreamChat} from 'stream-chat'
import {StreamClient} from "@stream-io/node-sdk"
import {ENV} from './env.js'
// import { use } from 'react'
const apiKey=ENV.STREAM_API_KEY
const apiSecret=ENV.STREAM_API_SECRET

if(!apiKey || !apiSecret){
    console.error("Stream API Key or secret is missing.")
}
export const streamClient=new StreamClient(apiKey,apiSecret); //used for video call
export const chatClient=StreamChat.getInstance(apiKey,apiSecret); //used for chatting

export const upsertStreamUser= async(userData)=>{
    try{
        await chatClient.upsertUser(userData)
        console.log("User upserted to Stream: ", userData)
    }
    catch(error){
        console.error("Error upserting user to Stream:",error)
    }
}

export const deleteStreamUser= async(userId)=>{
    try{
        await chatClient.deleteUser(userId)
        console.log("User deleted from Stream: ", userId)
    }
    catch(error){
        console.error("Error deleting user from Stream:",error)
    }
}