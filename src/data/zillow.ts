import cloudscraper from 'cloudscraper';
import { DateTime } from 'luxon';

export async function getZestimateHistory(zpid: string) {
  const url = `https://www.zillow.com/graphql/?zpid=${zpid}&timePeriod=TEN_YEARS&metricType=LOCAL_HOME_VALUES&forecast=true&operationName=HomeValueChartDataQuery`;
  const response = (await cloudscraper({
    method: 'POST',
    url,
    json: true,
    body: {
      operationName: 'HomeValueChartDataQuery',
      variables: {
        zpid,
        timePeriod: 'TEN_YEARS',
        metricType: 'LOCAL_HOME_VALUES',
        forecast: true,
      },
      query:
        'query HomeValueChartDataQuery($zpid: ID!, $metricType: HomeValueChartMetricType, $timePeriod: HomeValueChartTimePeriod) {\n  property(zpid: $zpid) {\n    homeValueChartData(metricType: $metricType, timePeriod: $timePeriod) {\n      points {\n        x\n        y\n      }\n      name\n    }\n  }\n}\n',
    },
  })) as {
    data: {
      property: {
        homeValueChartData: {
          name: string;
          points: { x: number; y: number }[];
        }[];
      };
    };
  };

  return [
    {
      x: DateTime.fromObject({ year: 2021, month: 3, day: 22 }).toMillis(),
      y: 600000,
    },
    ...response.data.property.homeValueChartData[0].points.filter(
      (p) =>
        DateTime.fromMillis(p.x) >=
        DateTime.fromObject({ year: 2021, month: 3, day: 22 })
    ),
  ];
}
