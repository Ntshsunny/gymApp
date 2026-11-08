import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <router-outlet />

    @if (auth.loggedIn()) {
      <nav class="tabbar">
        <a routerLink="/today" routerLinkActive="active">
          <span class="ico">🏋️</span><span>Today</span>
        </a>
        <a routerLink="/plan" routerLinkActive="active">
          <span class="ico">📅</span><span>Plan</span>
        </a>
        <a routerLink="/history" routerLinkActive="active">
          <span class="ico">🗓️</span><span>History</span>
        </a>
        <a routerLink="/library" routerLinkActive="active">
          <span class="ico">⭐</span><span>My exercises</span>
        </a>
        <a routerLink="/stats" routerLinkActive="active">
          <span class="ico">📊</span><span>Stats</span>
        </a>
      </nav>
    }
  `,
  styles: [`
    .tabbar {
      position: fixed; left: 0; right: 0; bottom: 0;
      display: flex; justify-content: center; gap: 4px;
      padding: 10px 10px calc(10px + env(safe-area-inset-bottom));
      background: rgba(15, 17, 21, 0.92);
      backdrop-filter: blur(14px);
      border-top: 1px solid var(--border);
      z-index: 10;
    }
    a {
      flex: 1; max-width: 104px; min-width: 0;
      display: flex; flex-direction: column; align-items: center; gap: 2px;
      padding: 8px 2px; border-radius: 14px;
      font-size: 11px; font-weight: 600; color: var(--muted); text-align: center;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      transition: background .15s, color .15s;
    }
    .ico { font-size: 20px; filter: grayscale(1); opacity: .7; }
    a.active { background: var(--surface-2); color: var(--accent); }
    a.active .ico { filter: none; opacity: 1; }
  `]
})
export class AppComponent {
  auth = inject(AuthService);
}
