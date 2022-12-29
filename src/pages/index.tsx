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
import { useEffect, useState } from 'react';
import { catchError, EMPTY, of, Subscription } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import CurrentConditions from '../components/CurrentConditions/CurrentConditions';
import ForecastChart from '../components/ForecastChart/ForecastChart';
import type {
  CurrentConditionsResponse,
  HourlyForecast,
} from '../data/open-weather';
import styles from './index.module.css';

function App() {
  const [forecasts, setForecasts] = useState({
    hourly: [] as HourlyForecast[],
    current: null as CurrentConditionsResponse | null,
  });
  useEffect(() => {
    let ws: WebSocketSubject<any>;
    let subscription: Subscription;

    function startWebSocket() {
      ws = webSocket({
        url: 'ws://localhost:3000',
      });

      subscription = ws
        .pipe(
          catchError(() => {
            startWebSocket();
            return EMPTY;
          })
        )
        .subscribe((msg) => {
          setForecasts(
            msg as {
              hourly: HourlyForecast[];
              current: CurrentConditionsResponse;
            }
          );
        });

      window.navigator.geolocation.getCurrentPosition((position) => {
        ws.next({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      });
    }

    startWebSocket();
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div style={{ height: '100vh' }}>
      <ChakraProvider>
        <Tabs display={'flex'} flexDir={'column'} height={'100%'} isFitted>
          <TabPanels flexGrow={1}>
            <TabPanel height={'100%'}>
              <Flex height={'100%'}>
                <Card className={styles.card}>
                  {forecasts?.hourly.length && forecasts.current ? (
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
    </div>
  );
}

export default App;
