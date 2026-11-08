import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page wrap">
      <div class="logo">🏋️</div>
      <h1 class="page-title">GymFlow</h1>
      <p class="page-sub">{{ mode() === 'login' ? 'Welcome back. Sign in to continue.' : 'Create your account to start tracking.' }}</p>

      <form class="card form" (ngSubmit)="submit()">
        <label>Username
          <input name="username" autocomplete="username" autocapitalize="none" [(ngModel)]="username" required>
        </label>
        <label>Password
          <input name="password" type="password"
                 [attr.autocomplete]="mode() === 'login' ? 'current-password' : 'new-password'"
                 [(ngModel)]="password" required>
        </label>

        @if (error()) { <div class="error">{{ error() }}</div> }

        <button class="primary" type="submit" [disabled]="busy()">
          {{ busy() ? 'Please wait…' : (mode() === 'login' ? 'Sign in' : 'Create account') }}
        </button>
      </form>

      <button class="switch" type="button" (click)="toggleMode()">
        {{ mode() === 'login' ? "New here? Create an account" : 'Already have an account? Sign in' }}
      </button>
    </div>
  `,
  styles: [`
    .wrap { padding-top: 56px; padding-bottom: 32px; }
    .logo { font-size: 48px; margin-bottom: 8px; }
    .form { margin-top: 24px; display: flex; flex-direction: column; gap: 14px; }
    label { display: flex; flex-direction: column; gap: 6px; font-size: 12px; color: var(--muted); font-weight: 600; }
    input {
      background: var(--surface-2); border: 1px solid var(--border); color: var(--text);
      border-radius: 12px; padding: 12px; font-size: 16px; width: 100%;
    }
    .error { margin-top: 0; }
    .primary {
      padding: 14px; border-radius: 14px; background: var(--accent); color: var(--accent-ink); font-weight: 800;
    }
    .primary:disabled { opacity: .5; }
    .switch { margin: 18px auto 0; display: block; color: var(--accent); font-weight: 600; font-size: 14px; }
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  mode = signal<'login' | 'register'>('login');
  username = '';
  password = '';
  error = signal('');
  busy = signal(false);

  toggleMode(): void {
    this.mode.update(m => (m === 'login' ? 'register' : 'login'));
    this.error.set('');
  }

  submit(): void {
    const user = this.username.trim();
    if (this.mode() === 'register') {
      if (!/^[A-Za-z0-9_.-]{3,30}$/.test(user)) {
        this.error.set('Username must be 3-30 characters: letters, numbers, . _ -');
        return;
      }
      if (this.password.length < 6) {
        this.error.set('Password must be at least 6 characters.');
        return;
      }
    } else if (!user || !this.password) {
      this.error.set('Enter your username and password.');
      return;
    }

    this.error.set('');
    this.busy.set(true);
    const call = this.mode() === 'login'
      ? this.auth.login(user, this.password)
      : this.auth.register(user, this.password);

    call.subscribe({
      next: () => { this.busy.set(false); this.router.navigateByUrl('/today'); },
      error: (e: HttpErrorResponse) => {
        this.busy.set(false);
        if (e.status === 0) this.error.set("Couldn't reach the server. Make sure the backend is running on port 8080.");
        else if (e.status === 401) this.error.set('Invalid username or password.');
        else if (e.status === 409) this.error.set('That username is already taken.');
        else this.error.set('Something went wrong. Please check your details and try again.');
      }
    });
  }
}
