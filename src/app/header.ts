import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  private notificationService = inject(NotificationService);

  isOnline = this.notificationService.isOnline;
  notifications = this.notificationService.notifications;
  showNotifications = signal(false);
  unreadNotifications = this.notificationService.unreadCount;

  toggleNotifications() {
    this.showNotifications.update(show => !show);
  }

  clearNotifications() {
    this.notificationService.clearNotifications();
  }
}
