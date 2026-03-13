import { Injectable, signal } from '@angular/core';

export type SnackbarType = 'success' | 'error' | 'warning' | 'info';

export interface SnackbarMessage {
  text: string;
  type: SnackbarType;
  id: number;
}

@Injectable({ providedIn: 'root' })
export class SnackbarService {
  readonly messages = signal<SnackbarMessage[]>([]);

  private counter = 0;

  success(text: string): void {
    this.show(text, 'success');
  }

  error(text: string): void {
    this.show(text, 'error');
  }

  warning(text: string): void {
    this.show(text, 'warning');
  }

  info(text: string): void {
    this.show(text, 'info');
  }

  dismiss(id: number): void {
    this.messages.update((msgs) => msgs.filter((m) => m.id !== id));
  }

  private show(text: string, type: SnackbarType, duration = 4000): void {
    const id = ++this.counter;
    this.messages.update((msgs) => [...msgs, { text, type, id }]);
    setTimeout(() => this.dismiss(id), duration);
  }
}
