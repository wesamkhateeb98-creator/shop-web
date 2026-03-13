import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  readonly visible = signal(false);
  readonly message = signal('');

  private resolver: ((value: boolean) => void) | null = null;

  confirm(message: string): Promise<boolean> {
    this.message.set(message);
    this.visible.set(true);
    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
    });
  }

  accept(): void {
    this.visible.set(false);
    this.resolver?.(true);
    this.resolver = null;
  }

  cancel(): void {
    this.visible.set(false);
    this.resolver?.(false);
    this.resolver = null;
  }
}
