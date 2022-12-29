import GC from 'garmin-connect';

let GCClient: GC.GarminConnect;
async function initialize() {
  if (!GCClient) {
    if (!process.env.GARMIN_USERNAME || !process.env.GARMIN_PASSWORD) {
      throw new Error('Garmin username and password must be set in .env file');
    }
    GCClient = new GC.GarminConnect({
      username: process.env.GARMIN_USERNAME,
      password: process.env.GARMIN_PASSWORD,
    });
  }
  await GCClient.restoreOrLogin(
    GCClient.sessionJson,
    (GCClient as unknown as { credentials: { username: string } }).credentials
      .username,
    (GCClient as unknown as { credentials: { password: string } }).credentials
      .password
  );
}

export async function getActivities() {
  await initialize();
  return await GCClient.getActivities(0, 10);
}
