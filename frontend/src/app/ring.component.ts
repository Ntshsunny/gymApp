import { Component, Input } from '@angular/core';

/** Circular progress ring (SVG). value is 0-100. */
@Component({
  selector: 'app-ring',
  standalone: true,
  template: `
    <div class="wrap" [style.width.px]="size" [style.height.px]="size">
      <svg [attr.width]="size" [attr.height]="size" [attr.viewBox]="'0 0 ' + size + ' ' + size">
        <circle class="track" [attr.cx]="size / 2" [attr.cy]="size / 2" [attr.r]="radius"
                [attr.stroke-width]="stroke" fill="none" />
        <circle class="bar" [attr.cx]="size / 2" [attr.cy]="size / 2" [attr.r]="radius"
                [attr.stroke-width]="stroke" fill="none" stroke-linecap="round"
                [attr.stroke]="color"
                [attr.stroke-dasharray]="circumference"
                [attr.stroke-dashoffset]="offset"
                [attr.transform]="'rotate(-90 ' + size / 2 + ' ' + size / 2 + ')'" />
      </svg>
      <div class="center">
        <div class="val" [style.font-size.px]="size * 0.24">{{ centerText ?? (clamped + '%') }}</div>
        @if (sub) { <div class="sub" [style.font-size.px]="Math.max(10, size * 0.1)">{{ sub }}</div> }
      </div>
    </div>
    @if (label) { <div class="label">{{ label }}</div> }
  `,
  styles: [`
    :host { display: inline-flex; flex-direction: column; align-items: center; gap: 6px; }
    .wrap { position: relative; }
    .track { stroke: var(--surface-2); }
    .bar { transition: stroke-dashoffset .9s cubic-bezier(.2, .8, .2, 1); }
    .center {
      position: absolute; inset: 0;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
    }
    .val { font-weight: 800; letter-spacing: -0.02em; line-height: 1; }
    .sub { color: var(--muted); margin-top: 3px; }
    .label { font-size: 12px; color: var(--muted); font-weight: 600; text-align: center; }
  `]
})
export class RingComponent {
  @Input() value = 0;
  @Input() size = 120;
  @Input() stroke = 12;
  @Input() color = 'var(--accent)';
  @Input() label = '';
  @Input() sub = '';
  @Input() centerText: string | null = null;

  protected readonly Math = Math;

  get clamped(): number { return Math.round(Math.min(100, Math.max(0, this.value))); }
  get radius(): number { return (this.size - this.stroke) / 2; }
  get circumference(): number { return 2 * Math.PI * this.radius; }
  get offset(): number { return this.circumference * (1 - this.clamped / 100); }
}
