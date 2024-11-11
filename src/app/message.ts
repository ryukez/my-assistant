export interface Thread {
  id: string;
}

// messages in chat
export type Message = {
  id: string;
  content: MessageContent;
  user?: {
    id: string;
  };
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

export class ImageMessageContent implements MessageContent {
  constructor(public altText: string, public imageURL: string) {}

  type: MessageContentType = "image";
  get text() {
    return this.altText;
  }
}

export class UnknownMessageContent implements MessageContent {
  constructor() {}

  type: MessageContentType = "unknown";
  text: string = "unknown content";
}
