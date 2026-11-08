import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';
import { LoginComponent } from './pages/login.component';
import { TodayComponent } from './pages/today.component';
import { PlanComponent } from './pages/plan.component';
import { HistoryComponent } from './pages/history.component';
import { LibraryComponent } from './pages/library.component';
import { StatsComponent } from './pages/stats.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'today' },
  { path: 'login', component: LoginComponent },
  { path: 'today', component: TodayComponent, canActivate: [authGuard] },
  { path: 'plan', component: PlanComponent, canActivate: [authGuard] },
  { path: 'history', component: HistoryComponent, canActivate: [authGuard] },
  { path: 'library', component: LibraryComponent, canActivate: [authGuard] },
  { path: 'stats', component: StatsComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'today' }
];
