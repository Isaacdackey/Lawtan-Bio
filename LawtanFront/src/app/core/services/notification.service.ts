import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  toastMessage = signal<string | null>(null);
  private timerId: any = null;

  afficherToast(message: string, durationMs: number = 4000): void {
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
    this.toastMessage.set(message);
    this.timerId = setTimeout(() => {
      this.toastMessage.set(null);
      this.timerId = null;
    }, durationMs);
  }

  fermerToast(): void {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.toastMessage.set(null);
  }
}
