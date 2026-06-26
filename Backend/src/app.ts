import express from "express";
import cors from "cors";
import routes from "./routes";
import { errorHandler } from "./middlewares";
import { createCorsOptions } from "./config/cors";
import { loadEnv } from "./config/env";

const app = express();
const env = loadEnv();

app.set("trust proxy", env.TRUST_PROXY);
app.use(cors(createCorsOptions(env)));
app.use(express.json());

app.use(routes);

app.use(errorHandler);

export default app;
