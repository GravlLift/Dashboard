import { createServer } from 'http';
import WebSocket from 'ws';
import { parse } from 'url';
import next from 'next';
import { data$ } from './data';
import { Subscription } from 'rxjs';

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
    let subscription: Subscription;
    websockets.push(ws);
    ws.on('message', (message) => {
      const { lat, lon } = JSON.parse(message.toString());
      subscription = data$(lat, lon).subscribe((data: any) => {
        ws.send(JSON.stringify(data));
      });
    });
    ws.onclose = () => {
      subscription?.unsubscribe();
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
