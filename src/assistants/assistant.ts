import { Message } from "./message";

export class AssistantError extends Error {
  constructor(public code: "internal" | "badRequest", message: string) {
    super(message);
  }
}

export interface Assistant {
  // get assistant response
  // response messages are expected to have unique ids
  respond(message: Message): AsyncGenerator<Message>;
}
