import { Brain } from "./brain";
import { Message, TextMessageContent } from "../app/message";

export class MockBrain implements Brain {
  async *respond(message: Message): AsyncGenerator<Message> {
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
