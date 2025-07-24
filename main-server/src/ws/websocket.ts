// src/ws/websocket.ts
import { WebSocketServer, WebSocket } from 'ws';

const clients = new Set<WebSocket>();

export function initWebSocket(server: any) {
    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws: WebSocket) => {
        console.log('New WebSocket client connected');
        clients.add(ws);

        ws.on('close', () => {
            clients.delete(ws);
            console.log('Client disconnected');
        });
    });
}

// Yeni sipariş geldiğinde bunu çağır:
export function broadcastNewOrder(order: any) {
    const message = JSON.stringify({
        type: 'NEW_ORDER',
        payload: order
    });

    for (const client of clients) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    }
}
