import express from "express";
import cors from "cors";
import { adrRouter } from "./adr/routes.js";
import { graphRouter } from "./graph/routes.js";
import { componentRouter } from "./component/routes.js";
import { ingestionRouter } from "./ingestion/routes.js";
import { repositoryRouter } from "./repository/routes.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/api/adrs", adrRouter);
  app.use("/api/graph", graphRouter);
  app.use("/api/components", componentRouter);
  app.use("/api/ingest", ingestionRouter);
  app.use("/api/repositories", repositoryRouter);

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  return app;
}
