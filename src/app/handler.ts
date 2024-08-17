import { Connector } from "../connector";
import { Message, Thread } from "./message";

export type MessageHandler = (
  connector: Connector,
  thread: Thread,
  message: Message
) => Promise<void>;
