import {
  Box,
  Center,
  CircularProgress,
  CircularProgressLabel,
  Flex,
  SimpleGrid,
  Tab,
  TabList,
  Tabs,
} from '@chakra-ui/react';
import {
  BarElement,
  Chart,
  ChartOptions,
  TimeSeriesScale,
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
    unit: 'day' as const,
    minus: { weeks: 4 },
  },
  sixMonths: {
    unit: 'week' as const,
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
    React.useState<keyof typeof dateConfig>('fourWeeks');

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
      averageDistance:
        totalDistance /
        now
          .diff(rangeStart, dateConfig[dateRange].unit)
          .as(dateConfig[dateRange].unit),
    };
  }, [now, rangeStart, dateRange, filteredActivities]);

  const options = useMemo(
    () =>
      ({
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              title: (context) => {
                let formatStr: string;
                if (
                  dateConfig[dateRange].unit === 'day' ||
                  dateConfig[dateRange].unit === 'week'
                ) {
                  formatStr = 'DDD';
                } else if (dateConfig[dateRange].unit === 'month') {
                  formatStr = 'LLL yyyy';
                } else {
                  formatStr = 'yyyy';
                }

                return (context[0].raw as { x: DateTime }).x.toFormat(
                  formatStr
                );
              },
              label: (context) => {
                if (context.datasetIndex === 0) {
                  return `${context.formattedValue} mi`;
                } else {
                  return `${context.formattedValue} min/mi`;
                }
              },
            },
          },
        },
        scales: {
          x: {
            suggestedMin: rangeStart.toMillis(),
            max: now.toMillis(),
            grid: { display: false },
            type: 'timeseries',
            ticks: {
              autoSkip: false,
              stepSize: 3,
            },
            time: {
              unit: dateConfig[dateRange].unit,
            },
          },
        },
      } as ChartOptions<'line'>),
    [dateRange, rangeStart, now]
  );

  return (
    <Flex direction={'column'} height={'100%'}>
      <Tabs
        align={'end'}
        defaultIndex={1}
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
        <Flex>
          <Center className={styles.statDial}>
            <Box>
              <Center>
                <CircularProgress size={'150px'} thickness={3} value={100}>
                  <CircularProgressLabel fontSize={'3xl'}>
                    {totalDistance.toFixed(2)}
                  </CircularProgressLabel>
                </CircularProgress>
              </Center>
              <Center fontWeight={'bold'}>Total Distance</Center>
            </Box>
          </Center>
          <Center className={styles.statDial}>
            <Box>
              <Center>
                <CircularProgress
                  size={'150px'}
                  thickness={3}
                  value={100}
                  color={'green.400'}
                >
                  <CircularProgressLabel fontSize={'3xl'}>
                    {averageDistance.toFixed(2)}
                  </CircularProgressLabel>
                </CircularProgress>
              </Center>
              <Center fontWeight={'bold'}>
                Average Distance per {dateConfig[dateRange].unit}
              </Center>
            </Box>
          </Center>
          <Center className={styles.statDial}>
            <Box>
              <Center>
                <CircularProgress
                  size={'150px'}
                  thickness={3}
                  value={100}
                  color={'red.400'}
                >
                  <CircularProgressLabel fontSize={'3xl'}>
                    {averagePace.toFormat('m:ss')}
                  </CircularProgressLabel>
                </CircularProgress>
              </Center>
              <Center fontWeight={'bold'}>Average Pace</Center>
            </Box>
          </Center>
        </Flex>
        <Flex flexGrow={1} flexDir={{ lg: 'column', xl: 'row' }}>
          <Box flexGrow={1} flexBasis={0}>
            <Line
              options={{
                ...options,
                plugins: {
                  ...options.plugins,
                  tooltip: {
                    ...options.plugins?.tooltip,
                    callbacks: {
                      ...options.plugins?.tooltip?.callbacks,
                      label: (context) => {
                        return `${context.formattedValue} mi`;
                      },
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
          <Box flexGrow={1} flexBasis={0}>
            <Line
              options={{
                ...options,
                plugins: {
                  ...options.plugins,
                  tooltip: {
                    ...options.plugins?.tooltip,
                    callbacks: {
                      ...options.plugins?.tooltip?.callbacks,
                      label: (context) => {
                        return (
                          (context.raw as { y: Duration }).y.toFormat('m:ss') +
                          ' min/mi'
                        );
                      },
                    },
                  },
                },
                scales: {
                  ...options.scales,
                  y: {
                    ticks: {
                      callback: (value) => {
                        return typeof value === 'number'
                          ? Duration.fromMillis(value).toFormat('m:ss')
                          : value;
                      },
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
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Running;
