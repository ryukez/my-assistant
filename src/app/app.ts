import { Brain, BrainError } from "../brain";
import { logger } from "../logger";
import { Connector } from "../connector";
import { Message, Thread } from "./message";
import { Process } from "../process";

export class App {
  constructor(
    private process: Process,
    private brain: Brain,
    connectors: Connector[]
  ) {
    for (const connector of connectors) {
      connector.addListener(this.onMessage.bind(this));
    }
  }

  async run() {
    await this.process.run();
  }

  async onMessage(connector: Connector, thread: Thread, message: Message) {
    try {
      await connector.sendMessages(thread, this.brain.respond(thread, message));
    } catch (e) {
      let text = "Unhandled error";
      if (e instanceof BrainError) {
        text = `Internal error: ${e.message}`;
      } else {
        text = `Unhandled error: ${e}`;
      }
      logger.error(text, { message_id: message.id });
    }
  }
}
