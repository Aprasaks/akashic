export interface GpsPoint {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface HealthSteps {
  id: string;
  user_id: string;
  date: string;
  steps: number;
  weight_kg: number | null;
  calories_burned: number | null;
  route: GpsPoint[] | null;
  distance_m: number | null;
  created_at: string;
}

export interface HealthStepsInput {
  date: string;
  steps: number;
  weight_kg: number | null;
  calories_burned: number | null;
  route: GpsPoint[] | null;
  distance_m: number | null;
}
