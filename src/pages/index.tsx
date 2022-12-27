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
import useSWR from 'swr';
import CurrentConditions from '../components/CurrentConditions/CurrentConditions';
import ForecastChart from '../components/ForecastChart/ForecastChart';
import { CurrentConditionsResponse } from '../data/open-weather';
import type { HourlyForecast } from '../data/open-weather/models/forecast/hourly';
import styles from './index.module.css';

const fetcher = async (...args: Parameters<typeof fetch>) => {
  const { lat, lon } = await new Promise<{ lat: number; lon: number }>(
    (resolve) =>
      window.navigator.geolocation.getCurrentPosition((pos) => {
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      })
  );
  args[0] += `?lat=${lat}&lon=${lon}`;
  return await fetch(...args).then(
    (res) =>
      res.json() as Promise<{
        hourly: HourlyForecast[];
        current: CurrentConditionsResponse;
      }>
  );
};
function App() {
  const { data: forecasts } = useSWR(`/api`, fetcher);

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
