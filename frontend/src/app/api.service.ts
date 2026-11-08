import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API } from './config';
import { Day, Exercise, ExerciseRequest, HistoryDay, RoutineRequest, RoutineView, Stats } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  /** Workout list for a date ("yyyy-MM-dd"). */
  day(date: string): Observable<RoutineView[]> {
    return this.http.get<RoutineView[]>(`${API}/routines/day`, { params: { date } });
  }

  week(): Observable<Record<Day, RoutineView[]>> {
    return this.http.get<Record<Day, RoutineView[]>>(`${API}/routines/week`);
  }

  toggle(id: number, date: string): Observable<{ completed: boolean }> {
    return this.http.post<{ completed: boolean }>(`${API}/routines/${id}/toggle`, {}, { params: { date } });
  }

  create(req: RoutineRequest): Observable<RoutineView> {
    return this.http.post<RoutineView>(`${API}/routines`, req);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/routines/${id}`);
  }

  exercises(): Observable<Exercise[]> {
    return this.http.get<Exercise[]>(`${API}/exercises`);
  }

  createExercise(req: ExerciseRequest): Observable<Exercise> {
    return this.http.post<Exercise>(`${API}/exercises`, req);
  }

  removeExercise(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/exercises/${id}`);
  }

  stats(): Observable<Stats> {
    return this.http.get<Stats>(`${API}/stats`);
  }

  history(days = 30): Observable<HistoryDay[]> {
    return this.http.get<HistoryDay[]>(`${API}/history`, { params: { days } });
  }
}
