import {
  Card,
  Center,
  ChakraProvider,
  Flex,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react';
import { bind } from '@react-rxjs/core';
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
      <Tabs display={'flex'} flexDir={'column'} height={'100%'} isFitted>
        <TabPanels flexGrow={1}>
          <TabPanel height={'100%'}>
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
          </TabPanel>
        </TabPanels>
        <TabList>
          <Tab>Weather</Tab>
          <Tab>Activities</Tab>
        </TabList>
      </Tabs>
    </ChakraProvider>
  );
}

export default App;
