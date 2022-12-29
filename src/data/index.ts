import { combineLatest, map, shareReplay } from 'rxjs';
import { OpenWeather } from './open-weather';

export function data$(lat: number, lon: number) {
  return combineLatest([
    OpenWeather.currentConditions(lat, lon),
    OpenWeather.forecast(lat, lon),
  ]).pipe(
    map(([current, hourly]) => ({
      current,
      hourly: hourly.list,
    })),
    shareReplay(1)
  );
}
