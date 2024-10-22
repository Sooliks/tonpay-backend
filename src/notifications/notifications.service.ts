import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from "./notifications.gateway";

@Injectable()
export class NotificationsService {
    constructor(private notificationsGateway: NotificationsGateway) {}
    async notifyAll(message: string) {
        this.notificationsGateway.sendNotificationToAll(message);
    }
    async notifyUser(userId: string, message: string) {
        this.notificationsGateway.sendNotificationToUser(userId, message);
    }
    async getCurrentOnline(){
        return this.notificationsGateway.getCurrentOnline()
    }
}
