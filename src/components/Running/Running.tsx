import {
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Tab,
  TabList,
  Tabs,
} from '@chakra-ui/react';
import { DateTime, Duration } from 'luxon';
import React, { FC } from 'react';
import styles from './Running.module.css';

interface RunningProps {
  activities: {
    timestamp: DateTime;
    distanceM: number;
    averageSpeedMps: number;
  }[];
}

const Running: FC<RunningProps> = ({ activities }) => {
  const now = React.useMemo(() => DateTime.local(), []);
  const [startDate, setStartDate] = React.useState(now.plus({ days: -7 }));
  const filteredActivities = React.useMemo(
    () => activities.filter((a) => a.timestamp > startDate),
    [activities, startDate]
  );

  const totalDistanceM = React.useMemo(
    () => filteredActivities.reduce((prev, next) => prev + next.distanceM, 0),
    [filteredActivities]
  );
  const averagePaceMps = React.useMemo(
    () =>
      filteredActivities.reduce(
        (prev, next) => prev + next.averageSpeedMps,
        0
      ) / filteredActivities.length,
    [filteredActivities]
  );

  return (
    <div className={styles.Running}>
      <Tabs
        align={'end'}
        onChange={(i) =>
          setStartDate(
            [
              now.plus({ days: -7 }),
              now.plus({ weeks: -4 }),
              now.plus({ months: -6 }),
              now.plus({ years: -1 }),
            ][i]
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
      <SimpleGrid columns={2} spacing={10}>
        <Stat>
          <StatLabel>Total Distance</StatLabel>
          <StatNumber>{(totalDistanceM / 1609).toFixed(2)} mi</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Average Pace</StatLabel>
          <StatNumber>
            {Duration.fromObject({ minutes: 26.8224 / averagePaceMps })
              .normalize()
              .toFormat('mm:ss')}{' '}
            min/mi
          </StatNumber>
        </Stat>
      </SimpleGrid>
    </div>
  );
};

export default Running;
