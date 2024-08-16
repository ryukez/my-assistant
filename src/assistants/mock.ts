import { Assistant } from "./assistant";
import { Message, TextMessageContent } from "./message";

export class MockAssistant implements Assistant {
  async *respond(message: Message): AsyncGenerator<Message> {
    yield {
      id: `mock-assistant-${Date.now()}-0`,
      content: new TextMessageContent(`Hello World!`),
      threadId: message.threadId,
    };

    yield {
      id: `mock-assistant-${Date.now()}-1`,
      content: new TextMessageContent(
        `Your message: ${message.content.string()}`
      ),
      threadId: message.threadId,
    };
  }
}
