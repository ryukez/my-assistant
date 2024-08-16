// messages in chat
export type Message = {
  id: string;
  content: MessageContent;
  threadId: string;
};

export type MessageContentType = "text";

// message body
export interface MessageContent {
  type(): MessageContentType;
  string(): string;
}

export class TextMessageContent implements MessageContent {
  constructor(public text: string) {}

  type(): MessageContentType {
    return "text";
  }

  string(): string {
    return this.text;
  }
}
