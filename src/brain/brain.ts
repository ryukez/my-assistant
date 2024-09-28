import { Message, Thread } from "../app";

export class BrainError extends Error {
  constructor(public code: "internal" | "badRequest", message: string) {
    super(message);
  }
}

export interface Brain {
  // get bot response
  // response messages are expected to have unique ids
  respond(thread: Thread, message: Message): AsyncGenerator<Message>;
}
