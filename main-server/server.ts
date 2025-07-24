import express from 'express';
import dotenv from 'dotenv';
import * as http from "node:http";

import {app} from "./app";
import { initWebSocket } from './src/ws/websocket';


dotenv.config();


const PORT = process.env.PORT || 3000;


const server=http.createServer(app)

// WebSocket i Http   sunucusuna bağla


initWebSocket(server)

server.listen(PORT,() => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
})


