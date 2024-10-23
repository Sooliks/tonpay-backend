import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import { ChatSocketService } from './chat-socket.service';
import { Server, Socket } from "socket.io";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Message } from "@prisma/client";

@WebSocketGateway({cors: {origin: "*"}, namespace: 'chat'})
export class ChatSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  constructor(private readonly configService: ConfigService, private readonly jwtService: JwtService) {}
  private readonly connectedUsers: Map<string, string> = new Map();
  async handleConnection(@ConnectedSocket() client: Socket) {
    try {
      const payload = await this.jwtService.verifyAsync(client.handshake.auth.token, { secret: this.configService.get<string>('JWT_CONSTANTS') })
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

  sendMessageToUser(userId: string, message: Message) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('chat', { message });
    } else {
      console.log(`User ${userId} not connected`);
    }
  }


}
