import { Component, OnInit, inject, signal } from '@angular/core';
import { ApiService } from '../api.service';
import { Stats } from '../models';
import { RingComponent } from '../ring.component';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [RingComponent],
  template: `
    <div class="page">
      <h1 class="page-title">Your stats</h1>
      <p class="page-sub">This week's progress</p>

      @if (error()) {
        <div class="error">Couldn't reach the server. Make sure the backend is running on port 8080.</div>
      }

      @if (s(); as s) {
        <section class="card hero">
          <app-ring [value]="s.weekPercent" [size]="150" [stroke]="16" label="Week completed"
                    [sub]="s.weekDone + ' of ' + s.weekTotal" />
          <div class="hero-side">
            <app-ring [value]="s.todayPercent" [size]="84" [stroke]="10" color="var(--blue)" label="Today"
                      [centerText]="s.todayDone + '/' + s.todayTotal" />
          </div>
        </section>

        <section class="tiles">
          <div class="card tile">
            <span class="big">🔥 {{ s.streakDays }}</span>
            <span class="lbl">Day streak</span>
          </div>
          <div class="card tile">
            <span class="big">⏱ {{ s.minutesPlannedWeek }}</span>
            <span class="lbl">Planned min / week</span>
          </div>
        </section>

        <h2 class="sec">Daily completion</h2>
        <section class="card days">
          @for (d of s.days; track d.day) {
            <app-ring [value]="d.percent" [size]="38" [stroke]="5" [color]="d.total ? 'var(--accent)' : 'var(--border)'"
                      [centerText]="''" [label]="d.day" />
          }
        </section>

        <h2 class="sec">Muscle focus</h2>
        <section class="card muscles">
          @for (m of s.muscleGroups; track m.muscleGroup; let i = $index) {
            <app-ring [value]="m.percent" [size]="86" [stroke]="9" [color]="colors[i % colors.length]"
                      [label]="m.muscleGroup + ' · ' + m.count" />
          }
        </section>
      }
    </div>
  `,
  styles: [`
    .hero { display: flex; justify-content: space-around; align-items: center; margin-top: 20px; padding: 22px 12px; }
    .tiles { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; }
    .tile { display: flex; flex-direction: column; gap: 4px; }
    .big { font-size: 26px; font-weight: 800; }
    .lbl { font-size: 12px; color: var(--muted); font-weight: 600; }
    .sec { font-size: 16px; font-weight: 700; margin: 24px 0 10px; }
    .days { display: flex; justify-content: space-between; padding: 16px 12px; }
    .muscles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px 4px; justify-items: center; }
  `]
})
export class StatsComponent implements OnInit {
  private api = inject(ApiService);

  s = signal<Stats | null>(null);
  error = signal(false);
  colors = ['var(--accent)', 'var(--blue)', 'var(--orange)', 'var(--pink)', 'var(--purple)'];

  ngOnInit(): void {
    this.api.stats().subscribe({
      next: v => this.s.set(v),
      error: () => this.error.set(true)
    });
  }
}
