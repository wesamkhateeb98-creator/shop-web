import { Pipe, PipeTransform } from '@angular/core';
import { OrderStatus } from '@core/models/order.model';

@Pipe({ name: 'statusBadge', standalone: true, pure: true })
export class StatusBadgePipe implements PipeTransform {
  private readonly classes: Record<number, string> = {
    [OrderStatus.Pending]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    [OrderStatus.Confirmed]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    [OrderStatus.Shipped]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    [OrderStatus.Delivered]: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    [OrderStatus.Cancelled]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  transform(status: OrderStatus): string {
    return this.classes[status] ?? '';
  }
}
