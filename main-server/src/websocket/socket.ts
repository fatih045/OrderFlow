// src/websocket/socket.ts
import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";

let io: SocketIOServer;

// WebSocket sunucusunu başlat
export function initSocket(server: HttpServer) {
    io = new SocketIOServer(server, {
        cors: {
            origin: "*", // Gerekirse frontend adresiyle sınırla
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket: Socket) => {
        console.log("🟢 New client connected:", socket.id);

        socket.on("disconnect", () => {
            console.log("🔴 Client disconnected:", socket.id);
        });
    });

    console.log("✅ WebSocket server initialized");
}

// WebSocket ile frontend'e sipariş gönder
export function emitNewOrder(order: any) {
    if (!io) {
        console.error("❌ WebSocket server not initialized");
        return;
    }

    io.emit("new-order", order); // → frontend 'new-order' eventini dinler
}
