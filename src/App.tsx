import { Card, Center, ChakraProvider, Spinner } from '@chakra-ui/react';
import { bind } from '@react-rxjs/core';
import '@tremor/react/dist/esm/tremor.css';
import { combineLatest, map, switchMap, timer } from 'rxjs';
import CurrentConditions from './components/CurrentConditions/CurrentConditions';
import ForecastChart from './components/ForecastChart/ForecastChart';
import { CurrentConditionsResponse, OpenWeather } from './open-weather';
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
      <Card p={4} m={2} height="100%">
        {forecasts.hourly.length && forecasts.current ? (
          <>
            <CurrentConditions current={forecasts.current}></CurrentConditions>
            <ForecastChart
              hourlyForecasts={forecasts.hourly}
              current={forecasts.current}
            />
          </>
        ) : (
          <Center>
            <Spinner />
          </Center>
        )}
      </Card>
    </ChakraProvider>
  );
}

export default App;
