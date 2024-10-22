import { ConnectedSocket, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { ChatService } from './chat.service';
import { Server, Socket } from "socket.io";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@WebSocketGateway({cors: {origin: "*"}, namespace: 'chat'})
export class ChatGateway {
  @WebSocketServer()
  server: Server;
  constructor(private readonly chatService: ChatService, private readonly configService: ConfigService, private readonly jwtService: JwtService) {}
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
  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, room: string): void {
    client.join(room);
    console.log(`Client ${client.id} joined room: ${room}`);
  }
}
