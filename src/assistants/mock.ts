import { Assistant } from "./assistant";
import { ChatMessage, TextMessage } from "./message";

export class MockAssistant implements Assistant {
  async *respond(message: ChatMessage): AsyncGenerator<ChatMessage> {
    yield {
      id: `mock-assistant-${Date.now()}-0`,
      message: new TextMessage(`Hello World!`),
    };

    yield {
      id: `mock-assistant-${Date.now()}-1`,
      message: new TextMessage(`Your message: ${message.message.string()}`),
    };
  }
}
