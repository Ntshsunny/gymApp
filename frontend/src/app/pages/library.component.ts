import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from '../api.service';
import { AuthService } from '../auth.service';
import { Exercise } from '../models';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page">
      <div class="top">
        <div>
          <h1 class="page-title">My exercises</h1>
          <p class="page-sub">Add your own exercises, then schedule them in your Plan.</p>
        </div>
      </div>

      <div class="account">
        <span>Signed in as <b>{{ auth.username() }}</b></span>
        <button (click)="auth.logout()">Sign out</button>
      </div>

      @if (message()) { <div class="error">{{ message() }}</div> }

      <button class="add" (click)="open.set(!open())">{{ open() ? 'Close' : '+ Add my own exercise' }}</button>

      @if (open()) {
        <form class="card form" (ngSubmit)="save()">
          <label>Name
            <input name="name" maxlength="100" placeholder="e.g. Cable Crossover" [(ngModel)]="form.name" required>
          </label>
          <label>Category / muscle group
            <input name="group" maxlength="50" list="groups" placeholder="Pick one or type your own"
                   [(ngModel)]="form.muscleGroup" required>
            <datalist id="groups">
              @for (g of groups(); track g.name) { <option [value]="g.name"></option> }
            </datalist>
          </label>
          <label>Sample video link (optional)
            <input name="video" type="url" maxlength="500" placeholder="https://youtube.com/…" [(ngModel)]="form.videoUrl">
          </label>
          <label>Notes (optional)
            <input name="desc" maxlength="500" placeholder="Form tips, reminders…" [(ngModel)]="form.description">
          </label>
          <button class="save" type="submit" [disabled]="busy() || !form.name.trim() || !form.muscleGroup.trim()">Save exercise</button>
        </form>
      }

      @for (g of groups(); track g.name) {
        <h2 class="sec">{{ g.name }}</h2>
        <section class="list">
          @for (e of g.items; track e.id) {
            <article class="card item">
              <div class="info">
                <h3>{{ e.name }} @if (e.custom) { <span class="chip mine">Mine</span> }</h3>
                @if (e.description) { <p>{{ e.description }}</p> }
              </div>
              @if (e.videoUrl) {
                <a class="icon-btn" [href]="e.videoUrl" target="_blank" rel="noopener" aria-label="Watch video">▶</a>
              }
              @if (e.custom) {
                <button class="icon-btn del" (click)="remove(e)" aria-label="Delete exercise">✕</button>
              }
            </article>
          }
        </section>
      }
    </div>
  `,
  styles: [`
    .account {
      display: flex; justify-content: space-between; align-items: center;
      margin: 14px 0; font-size: 13px; color: var(--muted);
    }
    .account b { color: var(--text); }
    .account button { color: var(--accent); font-weight: 700; font-size: 13px; }
    .add {
      width: 100%; padding: 14px; border-radius: 14px;
      border: 1px dashed var(--border); color: var(--accent); font-weight: 700;
    }
    .form { margin-top: 14px; display: flex; flex-direction: column; gap: 12px; }
    label { display: flex; flex-direction: column; gap: 6px; font-size: 12px; color: var(--muted); font-weight: 600; }
    input {
      background: var(--surface-2); border: 1px solid var(--border); color: var(--text);
      border-radius: 12px; padding: 12px; font-size: 16px; width: 100%;
    }
    .save { padding: 14px; border-radius: 14px; background: var(--accent); color: var(--accent-ink); font-weight: 800; }
    .save:disabled { opacity: .4; }
    .sec { font-size: 15px; font-weight: 700; margin: 22px 0 10px; color: var(--muted); text-transform: uppercase; letter-spacing: .05em; }
    .list { display: flex; flex-direction: column; gap: 10px; }
    .item { display: flex; align-items: center; gap: 10px; padding: 12px 14px; }
    .info { flex: 1; min-width: 0; }
    h3 { font-size: 15px; font-weight: 700; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    p { font-size: 13px; color: var(--muted); margin-top: 3px; }
    .mine { background: var(--accent); color: var(--accent-ink); }
    .icon-btn {
      flex: none; width: 38px; height: 38px; border-radius: 50%;
      background: var(--surface-2); color: var(--accent);
      display: flex; align-items: center; justify-content: center; font-size: 13px;
    }
    .icon-btn.del { color: var(--danger); }
  `]
})
export class LibraryComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);

  exercises = signal<Exercise[]>([]);
  open = signal(false);
  busy = signal(false);
  message = signal('');

  form = { name: '', muscleGroup: '', videoUrl: '', description: '' };

  groups = computed(() => {
    const byGroup = new Map<string, Exercise[]>();
    for (const e of this.exercises()) {
      const items = byGroup.get(e.muscleGroup) ?? [];
      items.push(e);
      byGroup.set(e.muscleGroup, items);
    }
    return Array.from(byGroup, ([name, items]) => ({ name, items }));
  });

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.api.exercises().subscribe({
      next: list => this.exercises.set(list),
      error: () => this.message.set("Couldn't load exercises. Make sure the backend is running on port 8080.")
    });
  }

  save(): void {
    this.message.set('');
    this.busy.set(true);
    this.api.createExercise({
      name: this.form.name.trim(),
      muscleGroup: this.form.muscleGroup.trim(),
      videoUrl: this.form.videoUrl.trim() || null,
      description: this.form.description.trim() || null
    }).subscribe({
      next: () => {
        this.busy.set(false);
        this.form = { name: '', muscleGroup: '', videoUrl: '', description: '' };
        this.open.set(false);
        this.load();
      },
      error: () => {
        this.busy.set(false);
        this.message.set('Could not save. Check the details; the video link must start with http:// or https://');
      }
    });
  }

  remove(e: Exercise): void {
    this.message.set('');
    this.api.removeExercise(e.id).subscribe({
      next: () => this.load(),
      error: (err: HttpErrorResponse) =>
        this.message.set(err.status === 409
          ? `"${e.name}" is still in your plan. Remove it from the Plan tab first.`
          : "Couldn't delete that exercise.")
    });
  }
}
