import { Injectable, signal } from '@angular/core';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts = signal<Toast[]>([]);

  show(message: string, type: 'success' | 'error' | 'info' = 'info', duration = 4000) {
    const newToast = { message, type, duration };
    this.toasts.update(currentToasts => [...currentToasts, newToast]);
    
    setTimeout(() => this.remove(newToast), duration);
  }

  remove(toastToRemove: Toast) {
    this.toasts.update(currentToasts => currentToasts.filter(toast => toast !== toastToRemove));
  }
}
