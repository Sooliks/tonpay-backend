import {
  ConnectedSocket,
  MessageBody, OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@WebSocketGateway({cors: {origin: "*"}, namespace: 'notifications'})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  constructor(private readonly jwtService: JwtService, private readonly configService: ConfigService) {}
  private readonly connectedUsers: Map<string, string> = new Map();
  sendNotificationToAll(message: string) {
    this.server.emit('notification', { message });
  }
  sendNotificationToUser(userId: string, message: string) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('notification', { message });
    } else {
      console.log(`User ${userId} not connected`);
    }
  }
  getConnectedUsers(){
    return this.connectedUsers;
  }
  async handleConnection(@ConnectedSocket() client: Socket) {
    try {
      const token = client.handshake.auth.token;
      const payload = await this.jwtService.verifyAsync(
          token,
          {
            secret: this.configService.get<string>('JWT_CONSTANTS')
          }
      )
      if(this.connectedUsers.has(payload.id))return

      this.connectedUsers.set(payload.id, client.id);
    } catch (error) {
      client.disconnect();
    }
  }
  async handleDisconnect(client: Socket) {
    const userId = [...this.connectedUsers.entries()].find(([, socketId]) => socketId === client.id)?.[0];
    if (userId) {
      this.connectedUsers.delete(userId);
    }
  }
}
