import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { API } from './config';
import { AuthResponse } from './models';

const TOKEN_KEY = 'gym_token';
const USER_KEY = 'gym_user';

// localStorage can throw (private mode, blocked storage), so every access is guarded.
const read = (key: string): string | null => {
  try { return localStorage.getItem(key); } catch { return null; }
};
const write = (key: string, value: string | null): void => {
  try {
    if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value);
  } catch { /* ignore */ }
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly token = signal<string | null>(read(TOKEN_KEY));
  readonly username = signal<string | null>(read(USER_KEY));
  readonly loggedIn = computed(() => !!this.token());

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API}/auth/login`, { username, password })
      .pipe(tap(r => this.store(r)));
  }

  register(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API}/auth/register`, { username, password })
      .pipe(tap(r => this.store(r)));
  }

  /** Ends the session on the server (best effort), then clears it locally. */
  logout(): void {
    this.http.post<void>(`${API}/auth/logout`, {}).subscribe({
      next: () => this.clear(),
      error: () => this.clear()
    });
  }

  /** Clears the local session and goes to the login screen. */
  clear(): void {
    write(TOKEN_KEY, null);
    write(USER_KEY, null);
    this.token.set(null);
    this.username.set(null);
    this.router.navigateByUrl('/login');
  }

  private store(r: AuthResponse): void {
    write(TOKEN_KEY, r.token);
    write(USER_KEY, r.username);
    this.token.set(r.token);
    this.username.set(r.username);
  }
}
