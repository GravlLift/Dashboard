import { getActivities } from './garmin-connect';
import type {
  CurrentConditionsResponse,
  HourlyResponse,
} from './open-weather/models';

export interface Data {
  weather: {
    current: CurrentConditionsResponse;
    hourly: HourlyResponse['list'];
  };
  garmin: {
    activities: Awaited<ReturnType<typeof getActivities>>;
  };
  house: { zestimateHistory: { x: number; y: number }[] };
}
