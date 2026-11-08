import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { ApiService } from '../api.service';
import { DAYS, Day, Exercise, RoutineView } from '../models';

@Component({
  selector: 'app-plan',
  standalone: true,
  imports: [FormsModule, TitleCasePipe],
  template: `
    <div class="page">
      <h1 class="page-title">Weekly plan</h1>
      <p class="page-sub">Your routine for every day</p>

      <div class="days">
        @for (d of days; track d) {
          <button [class.active]="d === selected()" (click)="selected.set(d)">
            {{ d.slice(0, 3) | titlecase }}
            @if ((week()[d] ?? []).length) { <i>{{ week()[d].length }}</i> }
          </button>
        }
      </div>

      @if (error()) {
        <div class="error">Couldn't reach the server. Make sure the backend is running on port 8080.</div>
      }

      <section class="list">
        @for (r of week()[selected()] ?? []; track r.id) {
          <article class="card item">
            <div class="info">
              <h3>{{ r.exerciseName }}</h3>
              <div class="meta">
                <span class="chip">{{ r.muscleGroup }}</span>
                <span>{{ r.sets }} × {{ r.reps }}</span>
                @if (r.weightKg > 0) { <span>{{ r.weightKg }} kg</span> }
                @if (r.durationMin > 0) { <span>⏱ {{ r.durationMin }} min</span> }
              </div>
            </div>
            @if (r.videoUrl) {
              <a class="icon-btn" [href]="r.videoUrl" target="_blank" rel="noopener" aria-label="Watch video">▶</a>
            }
            <button class="icon-btn del" (click)="remove(r)" aria-label="Delete">✕</button>
          </article>
        } @empty {
          <div class="empty"><span class="emoji">🛌</span>Rest day. Add a workout below.</div>
        }
      </section>

      <button class="add" (click)="open.set(!open())">{{ open() ? 'Close' : '+ Add exercise' }}</button>

      @if (open()) {
        <form class="card form" (ngSubmit)="save()">
          <label>Exercise
            <select name="exercise" [(ngModel)]="form.exerciseId" required>
              <option [ngValue]="null" disabled>Choose exercise…</option>
              @for (e of exercises(); track e.id) {
                <option [ngValue]="e.id">{{ e.name }} ({{ e.muscleGroup }})</option>
              }
            </select>
          </label>
          <div class="row">
            <label>Sets <input name="sets" type="number" min="1" [(ngModel)]="form.sets" required></label>
            <label>Reps <input name="reps" type="number" min="1" [(ngModel)]="form.reps" required></label>
          </div>
          <div class="row">
            <label>Weight (kg) <input name="kg" type="number" min="0" step="0.5" [(ngModel)]="form.weightKg"></label>
            <label>Minutes <input name="min" type="number" min="0" [(ngModel)]="form.durationMin"></label>
          </div>
          <button class="save" type="submit" [disabled]="!form.exerciseId">Add to {{ selected() | titlecase }}</button>
        </form>
      }
    </div>
  `,
  styles: [`
    .days { display: flex; gap: 6px; margin: 18px 0; overflow-x: auto; padding-bottom: 4px; }
    .days button {
      flex: 1; min-width: 46px; padding: 10px 0; border-radius: 14px;
      background: var(--surface); border: 1px solid var(--border);
      font-size: 13px; font-weight: 700; color: var(--muted); position: relative;
    }
    .days button.active { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
    .days i {
      display: block; font-style: normal; font-size: 10px; font-weight: 700; margin-top: 2px; opacity: .8;
    }
    .list { display: flex; flex-direction: column; gap: 12px; }
    .item { display: flex; align-items: center; gap: 10px; padding: 14px; }
    .info { flex: 1; min-width: 0; }
    h3 { font-size: 16px; font-weight: 700; margin-bottom: 6px; }
    .meta { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; font-size: 13px; color: var(--muted); }
    .icon-btn {
      flex: none; width: 38px; height: 38px; border-radius: 50%;
      background: var(--surface-2); color: var(--accent);
      display: flex; align-items: center; justify-content: center; font-size: 13px;
    }
    .icon-btn.del { color: var(--danger); }
    .add {
      width: 100%; margin-top: 18px; padding: 14px; border-radius: 14px;
      border: 1px dashed var(--border); color: var(--accent); font-weight: 700;
    }
    .form { margin-top: 14px; display: flex; flex-direction: column; gap: 12px; }
    .row { display: flex; gap: 12px; }
    .row label { flex: 1; }
    label { display: flex; flex-direction: column; gap: 6px; font-size: 12px; color: var(--muted); font-weight: 600; }
    input, select {
      background: var(--surface-2); border: 1px solid var(--border); color: var(--text);
      border-radius: 12px; padding: 12px; font-size: 16px; width: 100%;
    }
    .save {
      padding: 14px; border-radius: 14px; background: var(--accent); color: var(--accent-ink);
      font-weight: 800;
    }
    .save:disabled { opacity: .4; }
  `]
})
export class PlanComponent implements OnInit {
  private api = inject(ApiService);

  days = DAYS;
  selected = signal<Day>(DAYS[(new Date().getDay() + 6) % 7]); // JS: Sunday=0 → Monday-first index
  week = signal<Record<Day, RoutineView[]>>({} as Record<Day, RoutineView[]>);
  exercises = signal<Exercise[]>([]);
  open = signal(false);
  error = signal(false);

  form: { exerciseId: number | null; sets: number; reps: number; weightKg: number; durationMin: number } =
    { exerciseId: null, sets: 3, reps: 10, weightKg: 0, durationMin: 10 };

  ngOnInit(): void {
    this.load();
    this.api.exercises().subscribe(list => this.exercises.set(list));
  }

  private load(): void {
    this.api.week().subscribe({
      next: w => this.week.set(w),
      error: () => this.error.set(true)
    });
  }

  save(): void {
    if (!this.form.exerciseId) return;
    this.api.create({
      dayOfWeek: this.selected(),
      exerciseId: this.form.exerciseId,
      sets: this.form.sets,
      reps: this.form.reps,
      weightKg: this.form.weightKg || 0,
      durationMin: this.form.durationMin || 0
    }).subscribe(() => {
      this.form.exerciseId = null;
      this.open.set(false);
      this.load();
    });
  }

  remove(r: RoutineView): void {
    this.api.remove(r.id).subscribe(() => this.load());
  }
}
