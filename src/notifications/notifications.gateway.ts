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

@WebSocketGateway({cors: {origin: "*"}})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  constructor(private readonly jwtService: JwtService, private readonly configService: ConfigService) {}

  private connectedUsers: Map<string, string> = new Map();


  // Логика отправки уведомлений всем клиентам
  sendNotificationToAll(message: string) {
    this.server.emit('notification', { message });
  }

  // Логика отправки уведомления конкретному пользователю
  sendNotificationToUser(userId: string, message: string) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('notification', { message });
    } else {
      console.log(`User ${userId} not connected`);
    }
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
      this.connectedUsers.set(payload.id, client.id);
    } catch (error) {
      client.disconnect();
    }
  }
  handleDisconnect(client: Socket) {
    const userId = [...this.connectedUsers.entries()].find(([, socketId]) => socketId === client.id)?.[0];
    if (userId) {
      this.connectedUsers.delete(userId);
    }
  }

  // Пример подписки на событие
  @SubscribeMessage('customEvent')
  handleCustomEvent(@MessageBody() data: any) {
    // Обработка события
  }
}
