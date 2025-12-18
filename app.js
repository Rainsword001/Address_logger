import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import citizenRoutes from "./routes/citizen.route.js";
import { globalErrorHandler } from "./middlewares/error.middleware.js";

import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from 'path';
const swaggerDocument = YAML.load(path.resolve('config/swagger.yaml'));

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Swagger UI
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/citizens", citizenRoutes);

// Error Handler
app.use(globalErrorHandler);

export default app;
