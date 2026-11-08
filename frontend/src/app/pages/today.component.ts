import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { RoutineView } from '../models';
import { RingComponent } from '../ring.component';
import { addDays, isValidDate, parse, todayStr } from '../date-utils';

@Component({
  selector: 'app-today',
  standalone: true,
  imports: [RingComponent, DatePipe],
  template: `
    <div class="page">
      <header class="head">
        <div>
          <h1 class="page-title">{{ isToday() ? greeting() + ' 💪' : (dateObj() | date: 'EEEE') }}</h1>
          <p class="page-sub">{{ dateObj() | date: 'MMMM d, y' }}</p>
        </div>
        <app-ring [value]="percent()" [size]="76" [stroke]="9" [centerText]="done() + '/' + items().length" />
      </header>

      <div class="datenav">
        <button (click)="go(-1)" aria-label="Previous day">‹</button>
        <button class="today-btn" (click)="goToday()" [disabled]="isToday()">Today</button>
        <button (click)="go(1)" [disabled]="isToday()" aria-label="Next day">›</button>
      </div>

      @if (!isToday()) {
        <p class="past-note">Editing a past day. Your changes update your history.</p>
      }

      @if (error()) {
        <div class="error">Couldn't load your workout. Make sure the backend is running on port 8080.</div>
      }

      @if (!loading() && !error() && items().length === 0) {
        <div class="empty">
          <span class="emoji">😴</span>
          <p>Rest day. Nothing scheduled.</p>
          <p class="page-sub">Add workouts for this day from the Plan tab.</p>
        </div>
      }

      <section class="list">
        @for (r of items(); track r.id) {
          <article class="card item" [class.done]="r.completed">
            <button class="check" (click)="toggle(r)" [attr.aria-label]="r.completed ? 'Mark not done' : 'Mark done'">
              @if (r.completed) { ✓ }
            </button>

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
              <a class="video" [href]="r.videoUrl" target="_blank" rel="noopener" aria-label="Watch exercise video">▶</a>
            }
          </article>
        }
      </section>

      @if (items().length > 0 && done() === items().length) {
        <div class="card celebrate">🎉 Workout complete. Great job!</div>
      }
    </div>
  `,
  styles: [`
    .head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .datenav { display: flex; gap: 8px; margin-bottom: 18px; }
    .datenav button {
      flex: 1; padding: 10px 0; border-radius: 12px; background: var(--surface);
      border: 1px solid var(--border); font-weight: 700; font-size: 16px;
    }
    .datenav .today-btn { flex: 2; font-size: 14px; color: var(--accent); }
    .datenav button:disabled { opacity: .35; }
    .past-note { font-size: 12px; color: var(--orange); margin: -6px 0 14px; text-align: center; }
    .list { display: flex; flex-direction: column; gap: 12px; }
    .item { display: flex; align-items: center; gap: 14px; padding: 14px; transition: opacity .2s, border-color .2s; }
    .item.done { opacity: .6; border-color: var(--accent); }
    .item.done h3 { text-decoration: line-through; }
    .check {
      flex: none; width: 36px; height: 36px; border-radius: 50%;
      border: 2px solid var(--border); font-weight: 800; color: var(--accent-ink);
      display: flex; align-items: center; justify-content: center;
    }
    .done .check { background: var(--accent); border-color: var(--accent); }
    .info { flex: 1; min-width: 0; }
    h3 { font-size: 16px; font-weight: 700; margin-bottom: 6px; }
    .meta { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; font-size: 13px; color: var(--muted); }
    .video {
      flex: none; width: 42px; height: 42px; border-radius: 50%;
      background: var(--surface-2); color: var(--accent);
      display: flex; align-items: center; justify-content: center; font-size: 14px;
    }
    .celebrate { margin-top: 16px; text-align: center; font-weight: 700; color: var(--accent); }
  `]
})
export class TodayComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  date = signal(todayStr());
  items = signal<RoutineView[]>([]);
  loading = signal(true);
  error = signal(false);

  dateObj = computed(() => parse(this.date()));
  isToday = computed(() => this.date() === todayStr());
  done = computed(() => this.items().filter(i => i.completed).length);
  percent = computed(() => this.items().length ? (this.done() * 100) / this.items().length : 0);

  greeting(): string {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  }

  ngOnInit(): void {
    // The selected day lives in the URL (?date=yyyy-MM-dd) so History can link straight to a day.
    this.route.queryParamMap.subscribe(p => {
      const q = p.get('date');
      this.date.set(isValidDate(q) && q <= todayStr() ? q : todayStr());
      this.load();
    });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.api.day(this.date()).subscribe({
      next: list => { this.items.set(list); this.loading.set(false); },
      error: () => { this.error.set(true); this.loading.set(false); }
    });
  }

  go(delta: number): void {
    const next = addDays(this.date(), delta);
    if (next > todayStr()) return;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { date: next === todayStr() ? null : next }
    });
  }

  goToday(): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: { date: null } });
  }

  toggle(r: RoutineView): void {
    this.api.toggle(r.id, this.date()).subscribe({
      next: res => this.items.update(list => list.map(i => i.id === r.id ? { ...i, completed: res.completed } : i)),
      error: () => this.error.set(true)
    });
  }
}
