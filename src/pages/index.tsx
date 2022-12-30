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
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';
import { Subscription } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import CurrentConditions from '../components/CurrentConditions/CurrentConditions';
import ForecastChart from '../components/ForecastChart/ForecastChart';
import Running from '../components/Running/Running';
import { Data } from '../data';
import styles from './index.module.css';

function App() {
  const [forecasts, setForecasts] = useState<Data['weather'] | undefined>();
  const [garminData, setGarminData] = useState<Data['garmin'] | undefined>();
  useEffect(() => {
    let ws: WebSocketSubject<Data | { lat: number; lon: number }>;
    let subscription: Subscription;

    function startWebSocket() {
      ws = webSocket({
        url: 'ws://localhost:3000',
      });

      subscription = ws.subscribe({
        next: (msg) => {
          if ('weather' in msg) {
            setForecasts(msg.weather);
          }
          if ('garmin' in msg) {
            setGarminData(msg.garmin);
          }
        },
        error: () => {
          subscription?.unsubscribe();
          startWebSocket();
        },
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
        <Tabs
          display={'flex'}
          flexDir={'column'}
          height={'100%'}
          isFitted
          defaultIndex={1}
        >
          <TabPanels flexGrow={1}>
            <TabPanel>
              <Flex height={'100%'}>
                <Card className={styles.card}>
                  {forecasts?.hourly?.length && forecasts.current ? (
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
            <TabPanel>
              <Flex height={'100%'}>
                <Card className={styles.card}>
                  {garminData ? (
                    <Running
                      activities={garminData.activities.map((a) => ({
                        timestamp: DateTime.fromMillis(a.beginTimestamp),
                        distanceM: a.distance,
                        averageSpeedMps: a.averageSpeed,
                      }))}
                    ></Running>
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
            <Tab>Jason Running</Tab>
          </TabList>
        </Tabs>
      </ChakraProvider>
    </div>
  );
}

export default App;
