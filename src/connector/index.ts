import { App } from "../app";
import { Message, Thread } from "../assistants";

export interface Connector {
  // Register event listener to app
  addListener(app: App): Promise<void>;
  // Send actual message to user
  sendMessages(
    thread: Thread,
    messages: AsyncGenerator<Message>
  ): Promise<void>;
}
