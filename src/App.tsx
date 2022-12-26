import { Card, Center, ChakraProvider, Flex, Spinner } from '@chakra-ui/react';
import { bind } from '@react-rxjs/core';
import '@tremor/react/dist/esm/tremor.css';
import { combineLatest, map, switchMap, timer } from 'rxjs';
import styles from './App.module.css';
import CurrentConditions from './components/CurrentConditions/CurrentConditions';
import ForecastChart from './components/ForecastChart/ForecastChart';
import { CurrentConditionsResponse, OpenWeather } from './data/open-weather';

const [useForecasts] = bind(
  timer(0, 5 * 60 * 1000).pipe(
    switchMap(() =>
      combineLatest([OpenWeather.forecast(), OpenWeather.currentConditions()])
    ),
    map(([hourly, current]) => ({
      hourly: hourly.list,
      current: current as CurrentConditionsResponse | null,
    }))
  ),
  { hourly: [], current: null }
);

function App() {
  const forecasts = useForecasts();
  return (
    <ChakraProvider>
      <Flex height={'100%'}>
        <Card className={styles.card}>
          {forecasts.hourly.length && forecasts.current ? (
            <>
              <CurrentConditions
                current={forecasts.current}
              ></CurrentConditions>
              <ForecastChart
                hourlyForecasts={forecasts.hourly}
                current={forecasts.current}
              />
            </>
          ) : (
            <Center flexGrow={1}>
              <Spinner size={'xl'} />
            </Center>
          )}
        </Card>
      </Flex>
    </ChakraProvider>
  );
}

export default App;
