import { Message, MessageHandler, Thread } from "../app";

export interface Connector {
  // Register event listener to app
  addListener(handler: MessageHandler): Promise<void>;
  // Send actual message to user
  sendMessages(
    thread: Thread,
    messages: AsyncGenerator<Message>
  ): Promise<void>;
}
