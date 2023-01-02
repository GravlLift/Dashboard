import {
  Box,
  Flex,
  Stat,
  StatArrow,
  StatGroup,
  StatHelpText,
  StatLabel,
  StatNumber,
} from '@chakra-ui/react';
import { Chart, Filler, Tooltip } from 'chart.js';
import { DateTime } from 'luxon';
import React, { FC, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import styles from './Zillow.module.css';

interface ZillowProps {
  data: { x: DateTime; y: number }[];
}
Chart.register(Tooltip, Filler);

const Zillow: FC<ZillowProps> = ({ data }) => {
  const now = useMemo(() => DateTime.local(), []);
  const currentValue = useMemo(() => data[data.length - 1].y, [data]);
  const historicValue = useMemo(() => {
    const original = data[0].y;
    return {
      allTime: original,
      oneYear: data.find((d) => d.x >= now.minus({ year: 1 }))?.y ?? original,
      sixMonth: data.find((d) => d.x >= now.minus({ month: 6 }))?.y ?? original,
    };
  }, [data, now]);
  const percentChange = useMemo(
    () => ({
      allTime: (currentValue - historicValue.allTime) / historicValue.allTime,
      oneYear: (currentValue - historicValue.oneYear) / historicValue.oneYear,
      sixMonth:
        (currentValue - historicValue.sixMonth) / historicValue.sixMonth,
    }),
    [currentValue, historicValue]
  );
  return (
    <Flex className={styles.Zillow}>
      <StatGroup>
        <Stat>
          <StatLabel>Current Value</StatLabel>
          <StatNumber>
            {data[data.length - 1].y?.toLocaleString(undefined, {
              style: 'currency',
              currency: 'USD',
              notation: 'compact',
              minimumFractionDigits: 1,
            })}
          </StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Change 6 Months</StatLabel>
          <StatNumber>
            {(currentValue - historicValue.sixMonth).toLocaleString(undefined, {
              style: 'currency',
              currency: 'USD',
              notation: 'compact',
              minimumFractionDigits: 1,
            })}
          </StatNumber>
          <StatHelpText>
            <StatArrow
              type={
                historicValue.sixMonth >= currentValue ? 'decrease' : 'increase'
              }
            />
            {percentChange.sixMonth.toLocaleString(undefined, {
              style: 'percent',
              minimumFractionDigits: 2,
            })}
          </StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>Change 1 Year</StatLabel>
          <StatNumber>
            {(currentValue - historicValue.oneYear).toLocaleString(undefined, {
              style: 'currency',
              currency: 'USD',
              signDisplay: 'exceptZero',
              notation: 'compact',
              minimumFractionDigits: 1,
            })}
          </StatNumber>
          <StatHelpText>
            <StatArrow
              type={
                historicValue.oneYear >= currentValue ? 'decrease' : 'increase'
              }
            />
            {percentChange.oneYear.toLocaleString(undefined, {
              style: 'percent',
              minimumFractionDigits: 2,
            })}
          </StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>Change Since Purchase</StatLabel>
          <StatNumber>
            {(currentValue - historicValue.allTime).toLocaleString(undefined, {
              style: 'currency',
              currency: 'USD',
              signDisplay: 'exceptZero',
              notation: 'compact',
              minimumFractionDigits: 1,
            })}
          </StatNumber>
          <StatHelpText>
            <StatArrow
              type={
                historicValue.allTime >= currentValue ? 'decrease' : 'increase'
              }
            />
            {percentChange.allTime.toLocaleString(undefined, {
              style: 'percent',
              minimumFractionDigits: 2,
            })}
          </StatHelpText>
        </Stat>
      </StatGroup>
      <Box flexGrow={1}>
        <Line
          options={{
            plugins: {
              tooltip: {
                callbacks: {
                  title: (context) =>
                    (context[0].raw as { x: DateTime }).x.toFormat('DDD'),
                  label: (context) => `$${context.formattedValue}`,
                },
              },
            },
            maintainAspectRatio: false,
            scales: {
              y: {},
              x: {
                grid: { display: false },
                type: 'time',
                ticks: {
                  stepSize: 3,
                },
              },
            },
          }}
          data={{
            datasets: [
              {
                data: data,
                borderColor: 'rgb(0, 77, 0)',
                backgroundColor: 'rgba(0, 255, 0, 0.2)',
                fill: true,
                tension: 0.5,
              },
            ],
          }}
        ></Line>
      </Box>
    </Flex>
  );
};

export default Zillow;
