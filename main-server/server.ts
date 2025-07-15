import express from 'express';
import dotenv from 'dotenv';
import * as http from "node:http";
import { initSocket } from "./src/websocket/socket";
import {app} from "./app";


dotenv.config();


const PORT = process.env.PORT || 3000;


const server=http.createServer(app)

// WebSocket i Http   sunucusuna bağla


initSocket(server)

server.listen(PORT,() => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
})


