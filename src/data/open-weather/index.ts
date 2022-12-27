import type { CurrentConditionsResponse, HourlyResponse } from './models';
export * from './models/index.d';

export module OpenWeather {
  async function baseCall<TResponse>(
    route: string,
    lat: number | string,
    lon: number | string
  ) {
    const searchParams = new URLSearchParams({
      appid: process.env.OPEN_WEATHER_API_KEY as string,
      lat: lat.toString(),
      lon: lon.toString(),
    });
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/${route}?${searchParams}`
    );
    return (await res.json()) as TResponse;
  }

  export const currentConditions = (
    lat: number | string,
    lon: number | string
  ): Promise<CurrentConditionsResponse> => baseCall('weather', lat, lon);

  export const forecast = (
    lat: number | string,
    lon: number | string
  ): Promise<HourlyResponse> => baseCall('forecast', lat, lon);
}
