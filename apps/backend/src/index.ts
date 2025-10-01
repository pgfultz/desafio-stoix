import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import tasksRouter from "./routes/tasks";
import {
  csrfConstants,
  generateCsrfToken,
  setCsrfCookie,
} from "./security/csrf";
import { errorHandler } from "./middleware/errorHandler";
import { config } from "./config";
import { prisma } from "./prisma";

const app = express();
const PORT = Number(config.port);

app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/csrf-token", (req, res) => {
  let token = req.cookies?.[csrfConstants.CSRF_COOKIE];
  if (!token) {
    token = generateCsrfToken();
  }
  setCsrfCookie(res, token);
  // sempre retorna o header necessario, mas nao expoe o token s ja existir no cookie
  res.json({ 
    header: csrfConstants.CSRF_HEADER,
    // so expoe o token se nao houver cookie (primeira requisicao)
    ...(req.cookies?.[csrfConstants.CSRF_COOKIE] ? {} : { csrfToken: token })
  });
});

app.use("/api/tasks", tasksRouter);

app.use(errorHandler);

async function start() {
  try {
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

start();

async function shutdown() {
  console.log("Shutting down...");
  try {
    await prisma.$disconnect();
  } finally {
    process.exit(0);
  }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
