import { createServer } from 'http';
import next from 'next';
import { from, SubscriptionLike, switchMap, timer } from 'rxjs';
import { combineLatest } from 'rxjs/internal/observable/combineLatest';
import { parse } from 'url';
import WebSocket from 'ws';
import { Data } from './data';
import { getActivities } from './data/garmin-connect';
import { currentConditions$, forecast$ } from './data/open-weather';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const port = 3000;
const handle = app.getRequestHandler();
const websockets: WebSocket.WebSocket[] = [];

app.prepare().then(() => {
  const server = createServer((req, res) =>
    handle(req, res, parse(req.url || '', true))
  );
  const wss = new WebSocket.Server({ noServer: true });

  wss.on('connection', (ws) => {
    websockets.push(ws);

    const subscriptions: SubscriptionLike[] = [];
    const timer$ = timer(0, 1000 * 60 * 15);

    // Datat that requires no user input can be sent immediately
    subscriptions.push(
      timer$
        .pipe(switchMap(() => from(getActivities())))
        .subscribe((activities) => {
          ws.send(JSON.stringify({ garmin: { activities } } as Data));
        })
    );

    // Data that requires user input will wait for the appropriate message
    ws.on('message', (message) => {
      try {
        const messageObj = JSON.parse(message.toString());

        if ('lat' in messageObj && 'lon' in messageObj) {
          subscriptions.push(
            timer$
              .pipe(
                switchMap(() =>
                  combineLatest([
                    currentConditions$(messageObj.lat, messageObj.lon),
                    forecast$(messageObj.lat, messageObj.lon),
                  ])
                )
              )
              .subscribe((data) => {
                ws.send(
                  JSON.stringify({
                    weather: {
                      current: data[0],
                      hourly: data[1].list,
                    },
                  } as Data)
                );
              })
          );
        }
      } catch (e) {
        console.log('Received non-JSON message');
      }
    });

    ws.onclose = () => {
      subscriptions.forEach((s) => s.unsubscribe());
      websockets.splice(websockets.indexOf(ws), 1);
    };
  });

  server.on('upgrade', function (req, socket, head) {
    const { pathname } = parse(req.url || '', true);
    if (pathname !== '/_next/webpack-hmr') {
      wss.handleUpgrade(req, socket, head, function done(ws) {
        wss.emit('connection', ws, req);
      });
    }
  });

  server.listen(port, () => {
    console.log(
      `> Ready on http://localhost:${port} and ws://localhost:${port}`
    );
  });
});
