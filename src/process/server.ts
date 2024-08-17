import express from "express";
import { logger } from "../logger";
import { Process } from "./process";

export class Server implements Process {
  private app: express.Express;

  constructor(private port: number = 8080) {
    const app = express();

    app.use(express.json());

    app.get("/", (req, res) => {
      res.send("🤖Bot is running!!🤖");
    });

    this.app = app;
  }

  // TODO: abstract server implmentation
  express(): express.Express {
    return this.app;
  }

  async run() {
    this.app.listen(this.port, () => {
      logger.info(`App listening on port ${this.port}`);
    });
  }
}
