import { ArrowUpIcon } from '@chakra-ui/icons';
import {
  Box,
  Center,
  Flex,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  Image,
  TabPanels,
  Tabs,
} from '@chakra-ui/react';
import {
  BarElement,
  CategoryScale,
  Chart,
  ChartOptions,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  TimeSeriesScale,
} from 'chart.js';
import 'chartjs-adapter-luxon';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { DateTime } from 'luxon';
import React, { FC } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { debounceTime, Subject } from 'rxjs';
import { kelvinToFahrenheit } from '../../conversions';
import { CurrentConditionsResponse } from '../../open-weather';
import { HourlyForecast } from '../../open-weather/models/forecast/hourly';
import styles from './ForecastChart.module.css';

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  TimeSeriesScale,
  Filler
);

interface ForecastChartProps {
  current: CurrentConditionsResponse;
  hourlyForecasts: HourlyForecast[];
}

const baseOptions: ChartOptions<'bar' | 'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    datalabels: {
      anchor: 'end',
      align: 'end',
      offset: 2,
    },
    tooltip: { mode: 'index' },
  },
  layout: { padding: { top: 20 } },
  scales: {
    y: {
      border: { display: false },
      grid: { display: false },
      ticks: { display: false },
    },
    x: {
      grid: { display: false },
      border: { display: false },
      type: 'timeseries',
      position: 'bottom',
      display: true,
      time: {
        unit: 'hour',
        displayFormats: { hour: 'h a' },
      },
      ticks: {
        stepSize: 3,
      },
    },
  },
};

const ForecastChart: FC<ForecastChartProps> = (props) => {
  const currentDate = DateTime.fromMillis(props.current.dt * 1000);
  const scrollableRef = React.useRef<HTMLDivElement>(null);
  const scrollSubject$ = React.useMemo(() => new Subject<number>(), []);
  const { temperature, precipitation, winds, feelsLike, dateFirstOccurrences } =
    React.useMemo(() => {
      const feelsLike = [];
      const temperature = [];
      const precipitation = [];
      const winds = [];
      const dateSet = new Set<number>();
      const dateFirstOccurrences: [DateTime, number][] = [];

      for (let i = 0; i < props.hourlyForecasts.length; i++) {
        const x = DateTime.fromMillis(props.hourlyForecasts[i].dt * 1000);

        temperature.push({
          x,
          y: kelvinToFahrenheit(props.hourlyForecasts[i].main.temp),
          icon: props.hourlyForecasts[i].weather[0].icon,
        });
        precipitation.push({
          x,
          y: props.hourlyForecasts[i].rain?.['3h'] ?? 0,
        });
        winds.push({
          x,
          speed: props.hourlyForecasts[i].wind.speed,
          deg: props.hourlyForecasts[i].wind.deg,
        });
        feelsLike.push({
          x,
          y: kelvinToFahrenheit(props.hourlyForecasts[i].main.feels_like),
        });

        const dateStart = x.startOf('day');
        if (!dateSet.has(dateStart.toMillis())) {
          dateSet.add(dateStart.toMillis());
          dateFirstOccurrences.push([dateStart, i]);
        }
      }

      return {
        temperature,
        precipitation,
        winds,
        feelsLike,
        dateFirstOccurrences,
      };
    }, [props.hourlyForecasts]);
  const [selectedDate, selectDate] = React.useState<DateTime | undefined>(
    DateTime.local().startOf('day')
  );

  React.useEffect(() => {
    const subscription = scrollSubject$
      .pipe(debounceTime(100))
      .subscribe((percentScrolled) => {
        const approximateIndex = Math.round(
          percentScrolled * props.hourlyForecasts.length
        );
        const date = dateFirstOccurrences.find(
          (_, i) =>
            i >= dateFirstOccurrences.length - 1 ||
            (approximateIndex >= dateFirstOccurrences[i][1] &&
              approximateIndex < dateFirstOccurrences[i + 1][1])
        )?.[0];
        selectDate(date);
      });
    return () => subscription.unsubscribe();
  }, [scrollSubject$, props.hourlyForecasts.length, dateFirstOccurrences]);

  return (
    <Box className={styles.ForecastChart}>
      {props.hourlyForecasts.length > 0 ? (
        <>
          <Tabs>
            <TabList>
              <Tab>Temperature</Tab>
              <Tab>Precipitation</Tab>
              <Tab>Wind</Tab>
            </TabList>
            <TabPanels
              ref={scrollableRef}
              className={styles.scrollable}
              onScroll={(e) =>
                scrollSubject$.next(
                  e.currentTarget?.scrollLeft / e.currentTarget?.scrollWidth
                )
              }
            >
              <TabPanel>
                <Line
                  plugins={[ChartDataLabels]}
                  options={{
                    ...baseOptions,
                    plugins: {
                      ...baseOptions.plugins,
                      datalabels: {
                        ...baseOptions.plugins?.datalabels,
                        formatter: (value: { y: number }) => {
                          return (+value.y).toFixed(0);
                        },
                      },
                    },
                  }}
                  data={{
                    datasets: [
                      {
                        backgroundColor: 'rgba(255, 204, 0, 0.2)',
                        borderColor: '#fc0',
                        fill: true,
                        pointRadius: 0,
                        data: temperature,
                        tension: 0.5,
                      },
                      {
                        borderColor: '#fc0',
                        borderDash: [5, 5],
                        pointRadius: 0,
                        data: feelsLike,
                        tension: 0.5,
                        animation: false,
                      },
                    ],
                  }}
                ></Line>
              </TabPanel>
              <TabPanel>
                <Bar
                  plugins={[ChartDataLabels]}
                  options={{
                    ...baseOptions,
                    plugins: {
                      ...baseOptions.plugins,
                      datalabels: {
                        ...baseOptions.plugins?.datalabels,
                        formatter: (value: { y: number }) =>
                          (+value.y).toFixed(1),
                      },
                    },
                  }}
                  data={{
                    datasets: [
                      {
                        data: precipitation,
                        backgroundColor: 'rgba(0, 0, 255, 0.2)',
                        borderColor: '#00f',
                        borderWidth: {
                          top: 1,
                        },
                        barPercentage: 1,
                        categoryPercentage: 1,
                      },
                    ],
                  }}
                ></Bar>
              </TabPanel>
              <TabPanel>
                <Flex height={'100%'}>
                  {winds.map((w) => (
                    <Flex
                      height={'100%'}
                      key={w.x.toMillis()}
                      flexGrow={1}
                      direction={'column'}
                    >
                      <Center fontSize={'xs'}>{Math.round(w.speed)} mph</Center>
                      <Center flexGrow={1}>
                        <ArrowUpIcon
                          boxSize={w.speed / 5 + 0.5 + 'em'}
                          style={{ transform: 'rotate(' + w.deg + 'deg)' }}
                        />
                      </Center>
                      <Center fontSize={'xs'}>{w.x.toFormat('h a')}</Center>
                    </Flex>
                  ))}
                </Flex>
              </TabPanel>
            </TabPanels>
          </Tabs>
          <Tabs
            isFitted
            variant={'soft-rounded'}
            index={dateFirstOccurrences.findIndex(
              (d) => selectedDate !== undefined && +d[0] === +selectedDate
            )}
            onChange={(index) => {
              const dataPointToScrollTo = dateFirstOccurrences[index][1];
              const percentScroll = dataPointToScrollTo / temperature.length;

              scrollableRef.current?.scrollTo({
                left: percentScroll * scrollableRef.current?.scrollWidth,
                behavior: 'smooth',
              });
            }}
          >
            <TabList>
              {dateFirstOccurrences.map(([d]) => {
                let hiTemp: number,
                  lowTemp: number,
                  dayIcon: string | undefined;
                if (+currentDate.startOf('day') === +d) {
                  dayIcon = props.current.weather[0].icon;
                  hiTemp = kelvinToFahrenheit(props.current.main.temp_max);
                  lowTemp = kelvinToFahrenheit(props.current.main.temp_min);
                } else {
                  const dateTemps = temperature.filter(
                    (t) => +t.x.startOf('day') === +d
                  );
                  dayIcon = dateTemps.find((t) => t.x.hour === 13)?.icon;
                  hiTemp = Math.max(...dateTemps.map((t) => t.y));
                  lowTemp = Math.min(...dateTemps.map((t) => t.y));
                }
                return (
                  <Tab key={d.toMillis()}>
                    <Flex direction={'column'}>
                      <Center>{d.toFormat('EEE')}</Center>
                      <Center>
                        <Image
                          src={`https://openweathermap.org/img/wn/${dayIcon}.png`}
                        />
                      </Center>
                      <Center>
                        {Math.round(lowTemp)} / {Math.round(hiTemp)}
                      </Center>
                    </Flex>
                  </Tab>
                );
              })}
            </TabList>
          </Tabs>
        </>
      ) : (
        <Center minHeight={200}>
          <Spinner />
        </Center>
      )}
    </Box>
  );
};

export default ForecastChart;
