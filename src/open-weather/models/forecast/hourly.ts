import { Coord } from '../coord';

interface Main {
  temp: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  sea_level: number;
  grnd_level: number;
  humidity: number;
  temp_kf: number;
  feels_like: number;
}

interface Weather {
  id: number;
  main: string;
  description: string;
  icon: string;
}

interface Clouds {
  all: number;
}

interface Wind {
  speed: number;
  deg: number;
}

interface Sys {
  pod: string;
}

interface Precipitation {
  '1h'?: number;
  '3h'?: number;
}

export interface HourlyForecast {
  dt: number;
  main: Main;
  weather: Weather[];
  clouds: Clouds;
  wind: Wind;
  sys: Sys;
  dt_txt: string;
  rain: Precipitation;
  snow: Precipitation;
}

interface City {
  id: number;
  name: string;
  coord: Coord;
  country: string;
}

export interface HourlyResponse {
  cod: string;
  message: number;
  cnt: number;
  list: HourlyForecast[];
  city: City;
}
