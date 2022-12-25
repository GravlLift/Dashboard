export interface DailyForecast {
  dt: number;
  temp: { min: number; max: number };
}

export interface DailyResponse {
  list: DailyForecast[];
}
