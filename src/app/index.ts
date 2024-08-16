import express from "express";
import { Assistant, AssistantError, Message, Thread } from "../assistants";
import { logger } from "../logger";
import { Connector } from "../connector";

export interface App {
  server(): express.Express;
  onMessage(
    connector: Connector,
    thread: Thread,
    message: Message
  ): Promise<void>;
}

export class ExpressApp implements App {
  private express: express.Express;

  constructor(private assistant: Assistant, connectors: Connector[]) {
    const e = express();

    e.use(express.json());

    e.get("/", (req, res) => {
      res.send("🤖Bot is running!!🤖");
    });

    // GAEで最小インスタンス数を指定するには、Warmup Endpoint を有効にする必要がある
    e.get("/_ah/warmup", (req, res) => {
      res.sendStatus(200);
    });

    this.express = e;

    for (const connector of connectors) {
      connector.addListener(this);
    }
  }

  run() {
    this.express.listen(8080, () => {
      logger.info("App listening on port 8080");
    });
  }

  // TODO: abstract server implmentation
  server() {
    return this.express;
  }

  async onMessage(connector: Connector, thread: Thread, message: Message) {
    try {
      await connector.sendMessages(thread, this.assistant.respond(message));
    } catch (e) {
      let text = "Unhandled error";
      if (e instanceof AssistantError) {
        text = `Internal error: ${e.message}`;
      } else {
        text = `Unhandled error: ${e}`;
      }
      logger.error(text, { message_id: message.id });
    }
  }
}
