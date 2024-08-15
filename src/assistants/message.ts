export type MessageType = "text";

// messages in chat
export type ChatMessage = {
  id: string;
  message: Message;
};

// message body
export interface Message {
  type(): MessageType;
  string(): string;
}

export class TextMessage implements Message {
  constructor(public text: string) {}

  type(): MessageType {
    return "text";
  }

  string(): string {
    return this.text;
  }
}
