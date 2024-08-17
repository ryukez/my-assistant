export interface Thread {
  id: string;
}

// messages in chat
export type Message = {
  id: string;
  content: MessageContent;
};

export type MessageContentType = string;

// message body
export interface MessageContent {
  type: MessageContentType;
  text: string;
}

export class TextMessageContent implements MessageContent {
  constructor(public text: string) {}

  type: MessageContentType = "text";
}

export class UnknownMessageContent implements MessageContent {
  constructor() {}

  type: MessageContentType = "unknown";
  text: string = "unknown content";
}
