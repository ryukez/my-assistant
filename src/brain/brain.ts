import { Message } from "../app/message";

export class BrainError extends Error {
  constructor(public code: "internal" | "badRequest", message: string) {
    super(message);
  }
}

export interface Brain {
  // get bot response
  // response messages are expected to have unique ids
  respond(message: Message): AsyncGenerator<Message>;
}
