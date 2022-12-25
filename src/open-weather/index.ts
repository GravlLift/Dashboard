import { map, Observable, switchMap } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import type { CurrentConditionsResponse, HourlyResponse } from './models/index';
export * from './models/index.d';

const location$ = new Observable<{ lat: number; lon: number }>((observer) =>
  window.navigator.geolocation.getCurrentPosition((pos) => {
    observer.next({
      lat: pos.coords.latitude,
      lon: pos.coords.longitude,
    });
    observer.complete();
  })
);

export module OpenWeather {
  const baseCall = <TResponse>(route: string) =>
    location$.pipe(
      switchMap(({ lat, lon }) =>
        ajax<TResponse>({
          url: 'https://api.openweathermap.org/data/2.5/' + route,
          queryParams: {
            appid: process.env.REACT_APP_OPEN_WEATHER_API_KEY as string,
            lat,
            lon,
          },
          withCredentials: false,
          crossDomain: true,
        }).pipe(map((ajaxResponse) => ajaxResponse.response))
      )
    );

  export const currentConditions = (): Observable<CurrentConditionsResponse> =>
    baseCall('weather');

  export const forecast = (): Observable<HourlyResponse> =>
    baseCall('forecast');
}
