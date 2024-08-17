import { Message, MessageHandler, TextMessageContent, Thread } from "../app";
import { CLI } from "../process";

export class ConsoleConnector {
  constructor(private cli: CLI) {}

  async addListener(handler: MessageHandler) {
    this.cli.addHandler(async (line) => {
      const timestamp = Date.now();

      const message: Message = {
        id: `console-user-message-${timestamp}`,
        content: new TextMessageContent(line),
      };

      await handler(this, { id: `console-thread-${timestamp}` }, message);
    });
  }

  async sendMessages(thread: Thread, messages: AsyncGenerator<Message>) {
    for await (const message of messages) {
      console.log(`[${message.id}] ${message.content.text}`);
    }
  }
}
