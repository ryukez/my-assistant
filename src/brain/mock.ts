import { Brain } from "./brain";
import { Message, TextMessageContent, Thread } from "../app";

export class MockBrain implements Brain {
  async *respond(thread: Thread, message: Message): AsyncGenerator<Message> {
    yield {
      id: `mock-${Date.now()}-0`,
      content: new TextMessageContent(`Hello World!`),
    };

    yield {
      id: `mock-${Date.now()}-1`,
      content: new TextMessageContent(`Your message: ${message.content.text}`),
    };
  }
}
