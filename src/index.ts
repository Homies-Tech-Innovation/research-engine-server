import { config } from '@config';
import app from '@/app';

app.listen(config.env.PORT, () => {
  // TODO: update to use logger
  console.log(`\x1b[92m✔ server running at\x1b[0m http://localhost:${config.env.PORT}`);
});
