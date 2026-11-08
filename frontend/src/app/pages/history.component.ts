import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';
import { HistoryDay } from '../models';
import { RingComponent } from '../ring.component';
import { parse, todayStr } from '../date-utils';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [RingComponent, DatePipe],
  template: `
    <div class="page">
      <h1 class="page-title">History</h1>
      <p class="page-sub">Your last 30 days. Tap a day to view or edit it.</p>

      @if (error()) {
        <div class="error">Couldn't load your history. Make sure the backend is running on port 8080.</div>
      }

      @if (rows().length) {
        <div class="card summary">
          <span class="big">{{ perfect() }}</span>
          <span class="lbl">fully completed workout days in the last 30 days</span>
        </div>
      }

      <section class="list">
        @for (r of rows(); track r.date) {
          <button class="card row" [disabled]="r.total === 0" (click)="open(r)">
            <app-ring [value]="r.percent" [size]="48" [stroke]="6" [centerText]="r.total ? r.percent + '' : '–'"
                      [color]="r.total && r.done === r.total ? 'var(--accent)' : 'var(--blue)'" />
            <div class="info">
              <h3>{{ toDate(r.date) | date: 'EEE, MMM d' }}</h3>
              <p>{{ r.total === 0 ? 'Rest day' : r.done + ' of ' + r.total + ' exercises done' }}</p>
            </div>
            @if (r.total) { <span class="go">›</span> }
          </button>
        }
      </section>
    </div>
  `,
  styles: [`
    .summary { display: flex; align-items: center; gap: 14px; margin: 18px 0 14px; }
    .big { font-size: 34px; font-weight: 800; color: var(--accent); }
    .lbl { font-size: 13px; color: var(--muted); font-weight: 600; }
    .list { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
    .row { display: flex; align-items: center; gap: 14px; padding: 12px 14px; width: 100%; text-align: left; }
    .row:disabled { opacity: .5; cursor: default; }
    .info { flex: 1; min-width: 0; }
    h3 { font-size: 15px; font-weight: 700; }
    p { font-size: 13px; color: var(--muted); margin-top: 2px; }
    .go { font-size: 22px; color: var(--muted); }
  `]
})
export class HistoryComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);

  rows = signal<HistoryDay[]>([]);
  error = signal(false);
  perfect = computed(() => this.rows().filter(r => r.total > 0 && r.done === r.total).length);

  toDate = parse;

  ngOnInit(): void {
    this.api.history(30).subscribe({
      next: list => this.rows.set(list),
      error: () => this.error.set(true)
    });
  }

  open(r: HistoryDay): void {
    this.router.navigate(['/today'], { queryParams: { date: r.date === todayStr() ? null : r.date } });
  }
}
