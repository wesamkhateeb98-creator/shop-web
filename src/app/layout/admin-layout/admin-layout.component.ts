import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="min-h-screen bg-[var(--color-bg)]">
      <!-- Sidebar -->
      <app-sidebar
        [isOpen]="sidebarOpen()"
        (closeSidebar)="sidebarOpen.set(false)"
      />

      <!-- Backdrop for mobile -->
      @if (sidebarOpen()) {
        <div
          class="fixed inset-0 z-30 bg-black/50 lg:hidden"
          (click)="sidebarOpen.set(false)"
        ></div>
      }

      <!-- Main content -->
      <div
        class="transition-all duration-300"
        [class.lg:ms-64]="sidebarOpen()"
      >
        <app-topbar (toggleSidebar)="toggleSidebar()" />

        <main class="p-4 md:p-6">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayoutComponent {
  readonly sidebarOpen = signal(true);

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }
}
