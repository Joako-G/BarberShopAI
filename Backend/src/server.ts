import "dotenv/config";
import app from "./app";
import { loadEnv } from "./config/env";

const env = loadEnv();

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} [${env.NODE_ENV}]`);
  console.log("Backend iniciado:", new Date().toISOString());
console.log("Supabase URL:", env.SUPABASE_URL);
});
