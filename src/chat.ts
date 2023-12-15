export interface Message {
  id: string;
  text: string;
}

export class AssistantError extends Error {
  constructor(public code: "internal" | "badRequest", message: string) {
    super(message);
  }
}

export interface Assistant {
  // get assistant response
  //  - message: message for assistant to respond
  //  - handler: send generated response to user. Required to obtain message id
  //  - messageIdToReply: message id which user replies to. If not specified, new thread will be created
  respond(
    message: Message,
    handler: (text: string) => Promise<Message>,
    messageIdToReply?: string
  ): Promise<Message>;
}
