import {
  Box,
  Center,
  Flex,
  SimpleGrid,
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
  Tab,
  TabList,
  Tabs,
} from '@chakra-ui/react';
import {
  BarElement,
  Chart,
  TimeSeriesScale,
  TimeUnit,
  Tooltip,
} from 'chart.js';
import { DateTime, Duration } from 'luxon';
import React, { FC, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import styles from './Running.module.css';

interface RunningProps {
  activities: {
    timestamp: DateTime;
    distanceM: number;
    averageSpeedMps: number;
  }[];
}

const dateConfig = {
  sevenDays: {
    unit: 'day' as const,
    minus: { days: 7 },
  },
  fourWeeks: {
    unit: 'week' as const,
    minus: { weeks: 4 },
  },
  sixMonths: {
    unit: 'month' as const,
    minus: { months: 6 },
  },
  oneYear: {
    unit: 'month' as const,
    minus: { years: 1 },
  },
};

Chart.register(BarElement, TimeSeriesScale, Tooltip);

const Running: FC<RunningProps> = ({ activities }) => {
  const [dateRange, setDateRange] =
    React.useState<keyof typeof dateConfig>('sevenDays');

  const now = React.useMemo(
    () => DateTime.local().endOf(dateConfig[dateRange].unit),
    [dateRange]
  );

  const rangeStart = useMemo(
    () => now.minus(dateConfig[dateRange].minus),
    [dateRange, now]
  );
  const filteredActivities = React.useMemo(
    () => activities.filter((a) => a.timestamp > rangeStart),
    [activities, rangeStart]
  );

  const totalDistance = React.useMemo(
    () =>
      filteredActivities.reduce((prev, next) => prev + next.distanceM, 0) /
      1609,
    [filteredActivities]
  );
  const averagePace = React.useMemo(
    () =>
      Duration.fromObject({
        minutes:
          26.8224 /
          (filteredActivities.reduce(
            (prev, next) => prev + next.averageSpeedMps,
            0
          ) /
            filteredActivities.length),
      }).normalize(),
    [filteredActivities]
  );

  const { distanceData, paceData, averageDistance } = React.useMemo(() => {
    const allBuckets = new Map<number, typeof activities>();
    for (const activity of filteredActivities) {
      const dateBucket = activity.timestamp
        .startOf(dateConfig[dateRange].unit)
        .toMillis();
      if (!allBuckets.has(dateBucket)) {
        allBuckets.set(dateBucket, []);
      }
      allBuckets.get(dateBucket)!.push(activity);
    }

    const distanceData = [];
    const paceData = [];
    let totalDistance = 0;
    for (const entry of allBuckets) {
      const x = DateTime.fromMillis(entry[0]);
      const distance =
        entry[1].reduce((prev, next) => prev + next.distanceM, 0) / 1609;
      totalDistance += distance;
      distanceData.push({
        x,
        y: distance,
      });
      paceData.push({
        x,
        y: Duration.fromObject({
          minutes:
            26.8224 /
            (entry[1].reduce((prev, next) => prev + next.averageSpeedMps, 0) /
              entry[1].length),
        }).normalize(),
      });
    }

    return {
      distanceData,
      paceData,
      averageDistance: totalDistance / allBuckets.size,
    };
  }, [filteredActivities, dateRange]);

  return (
    <Flex direction={'column'} height={'100%'}>
      <Tabs
        align={'end'}
        onChange={(i) =>
          setDateRange(
            (['sevenDays', 'fourWeeks', 'sixMonths', 'oneYear'] as const)[i]
          )
        }
      >
        <TabList>
          <Tab>7 Days</Tab>
          <Tab>4 Weeks</Tab>
          <Tab>6 Months</Tab>
          <Tab>1 Year</Tab>
        </TabList>
      </Tabs>
      <Flex flexGrow={1} p={4} flexDir={'column'}>
        <Box className={styles.flexItem}>
          <StatGroup>
            <Stat>
              <StatLabel>Total Distance</StatLabel>
              <StatNumber>{totalDistance.toFixed(2)} mi</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>
                Average Distance per {dateConfig[dateRange].unit}
              </StatLabel>
              <StatNumber>{averageDistance.toFixed(2)} mi</StatNumber>
            </Stat>
          </StatGroup>
          <Box flexGrow={1}>
            <Line
              options={{
                maintainAspectRatio: false,
                scales: {
                  x: {
                    suggestedMin: rangeStart.toMillis(),
                    max: now.toMillis(),
                    grid: { display: false },
                    type: 'timeseries',
                    time: {
                      unit: dateConfig[dateRange].unit,
                    },
                  },
                },
              }}
              data={{
                datasets: [
                  {
                    data: distanceData,
                    borderColor: 'rgba(0, 0, 255, 0.2)',
                  },
                ],
              }}
            ></Line>
          </Box>
        </Box>
        <Box className={styles.flexItem}>
          <Stat>
            <StatLabel>Average Pace</StatLabel>
            <StatNumber>{averagePace.toFormat('m:ss')} min/mi</StatNumber>
          </Stat>
          <Box flexGrow={1}>
            <Line
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: {
                    ticks: {
                      callback: (value) => {
                        return typeof value === 'number'
                          ? Duration.fromMillis(value).toFormat('m:ss')
                          : value;
                      },
                    },
                  },
                  x: {
                    suggestedMin: rangeStart.toMillis(),
                    max: now.toMillis(),
                    grid: { display: false },
                    type: 'timeseries',
                    time: {
                      unit: dateConfig[dateRange].unit,
                    },
                  },
                },
              }}
              data={{
                datasets: [
                  {
                    data: paceData,
                    borderColor: 'rgba(255, 0, 0, 0.2)',
                  },
                ],
              }}
            ></Line>
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
};

export default Running;
