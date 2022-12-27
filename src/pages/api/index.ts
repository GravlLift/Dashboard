import { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'url';
import { combineLatest, lastValueFrom, map } from 'rxjs';
import {
  CurrentConditionsResponse,
  OpenWeather,
} from '../../data/open-weather';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const request = parse(req.url!, true);
  const [hourly, current] = await Promise.all([
    OpenWeather.forecast(
      request.query.lat as string,
      request.query.lon as string
    ),
    OpenWeather.currentConditions(
      request.query.lat as string,
      request.query.lon as string
    ),
  ]);
  res.status(200).json({
    hourly: hourly.list,
    current: current as CurrentConditionsResponse | null,
  });
}
