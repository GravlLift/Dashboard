import {
  Box,
  Center,
  Flex,
  Image,
  Link,
  Spacer,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { DateTime } from 'luxon';
import { FC } from 'react';
import { kelvinToFahrenheit } from '../../conversions';
import { CurrentConditionsResponse } from '../../open-weather';
import styles from './CurrentConditions.module.css';

interface CurrentConditionsProps {
  current: CurrentConditionsResponse | null;
}

const CurrentConditions: FC<CurrentConditionsProps> = ({ current }) =>
  current != null ? (
    <Flex className={styles.CurrentConditions}>
      <Box padding={0}>
        <Image
          src={`https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`}
        ></Image>
      </Box>
      <Center fontSize={50}>
        {kelvinToFahrenheit(current.main.temp).toFixed(0)}
      </Center>
      <Box fontSize={'sm'} minWidth={100}>
        °F
      </Box>
      <Box>
        <Flex lineHeight={1.2}>
          <Box flexGrow={1}>Feels Like:</Box>
          <Box textAlign={'right'} marginLeft={10}>
            {kelvinToFahrenheit(current.main.feels_like, true)}°
          </Box>
        </Flex>
        <Flex lineHeight={1.2}>
          <Box flexGrow={1}>Humidity:</Box>
          <Box textAlign={'right'} marginLeft={10}>
            {current.main.humidity}%
          </Box>
        </Flex>
        <Flex lineHeight={1.2}>
          <Box flexGrow={1}>Wind:</Box>
          <Box textAlign={'right'} marginLeft={10}>
            {Math.round(current.wind.speed)} mph
          </Box>
        </Flex>
      </Box>
      <Spacer flexGrow={1} />
      <Box textAlign={'right'}>
        <Box fontSize={'3xl'}>{current.name}</Box>
        <Box>
          {DateTime.fromMillis(current.dt * 1000).toFormat('EEEE h:mm a')}
        </Box>
        <Box>{current.weather[0].main}</Box>
      </Box>
    </Flex>
  ) : (
    <Center>
      <Spinner />
    </Center>
  );

export default CurrentConditions;
