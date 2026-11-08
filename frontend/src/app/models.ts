export type Day = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export const DAYS: Day[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export interface AuthResponse {
  token: string;
  username: string;
}

export interface Exercise {
  id: number;
  name: string;
  muscleGroup: string;
  videoUrl: string | null;
  description: string | null;
  /** true when created by the signed-in user */
  custom: boolean;
}

export interface ExerciseRequest {
  name: string;
  muscleGroup: string;
  videoUrl: string | null;
  description: string | null;
}

export interface RoutineView {
  id: number;
  dayOfWeek: Day;
  date: string | null;
  exerciseId: number;
  exerciseName: string;
  muscleGroup: string;
  videoUrl: string | null;
  sets: number;
  reps: number;
  weightKg: number;
  durationMin: number;
  completed: boolean;
}

export interface RoutineRequest {
  dayOfWeek: Day;
  exerciseId: number;
  sets: number;
  reps: number;
  weightKg: number;
  durationMin: number;
}

export interface MuscleStat { muscleGroup: string; count: number; percent: number; }
export interface DayStat { day: string; done: number; total: number; percent: number; }
export interface HistoryDay { date: string; day: string; done: number; total: number; percent: number; }

export interface Stats {
  todayDone: number;
  todayTotal: number;
  todayPercent: number;
  weekDone: number;
  weekTotal: number;
  weekPercent: number;
  streakDays: number;
  minutesPlannedWeek: number;
  muscleGroups: MuscleStat[];
  days: DayStat[];
}
