import { Observable } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import type { CurrentConditionsResponse, HourlyResponse } from './models';
import { combineLatest, map } from 'rxjs';
export * from './models';

export interface OpenWeatherData {
  current: CurrentConditionsResponse;
  hourly: HourlyResponse['list'];
}
const baseCall = <TResponse>(
  route: string,
  lat: number | string,
  lon: number | string
) => {
  const params = new URLSearchParams({
    appid: process.env.OPEN_WEATHER_API_KEY as string,
    lat: lat.toString(),
    lon: lon.toString(),
  });
  return fromFetch<TResponse>(
    `https://api.openweathermap.org/data/2.5/${route}?${params}`,
    { selector: (response) => response.json() }
  );
};

export const currentConditions$ = (
  lat: number | string,
  lon: number | string
): Observable<CurrentConditionsResponse> => baseCall('weather', lat, lon);

export const forecast$ = (
  lat: number | string,
  lon: number | string
): Observable<HourlyResponse> => baseCall('forecast', lat, lon);
