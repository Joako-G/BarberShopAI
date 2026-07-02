import "dotenv/config";
import app from "./app";
import { loadEnv } from "./config/env";

const env = loadEnv();

const PORT = env.PORT;

app.listen(PORT, () => {
  console.info(`Server running on port ${PORT} [${env.NODE_ENV}]`);
});
