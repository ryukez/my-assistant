import { App } from "../app";
import { Message } from "../assistants";

export interface Connector {
  // Register event listener to app
  addListener(app: App): Promise<void>;
  // Send actual message to user
  sendMessage(message: Message): Promise<void>;
}
