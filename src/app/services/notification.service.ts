import { Injectable, signal } from '@angular/core';

export interface Notification {
    id: string;
    title: string;
    message: string;
    time: Date;
    read: boolean;
    type: 'new_order' | 'status_update' | 'system';
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    notifications = signal<Notification[]>([]);
    unreadCount = signal(0);
    isOnline = signal(true);

    addNotification(notification: Omit<Notification, 'id' | 'read'>) {
        const newNotification: Notification = {
            ...notification,
            id: Date.now().toString(),
            read: false
        };

        this.notifications.update(notifications => [newNotification, ...notifications.slice(0, 9)]);
        this.updateUnreadCount();
    }

    clearNotifications() {
        this.notifications.set([]);
        this.updateUnreadCount();
    }

    setOnlineStatus(online: boolean) {
        this.isOnline.set(online);
    }

    private updateUnreadCount() {
        this.unreadCount.set(this.notifications().filter(n => !n.read).length);
    }
} 