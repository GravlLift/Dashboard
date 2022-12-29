import { DateTime, Duration } from 'luxon';
import React, { FC } from 'react';
import styles from './TotalDistanceChart.module.css';

interface TotalDistanceChartProps {
  activities: {
    timestamp: DateTime;
    distance: number;
  }[];
  window: Duration;
}

const TotalDistanceChart: FC<TotalDistanceChartProps> = () => {
  return (
    <div className={styles.TotalDistanceChart}>
      TotalDistanceChart Component
    </div>
  );
};

export default TotalDistanceChart;
