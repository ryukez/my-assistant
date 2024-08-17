import { messagingApi, middleware, WebhookEvent } from "@line/bot-sdk";
import {
  Message,
  MessageContent,
  MessageHandler,
  TextMessageContent,
  Thread,
  UnknownMessageContent,
} from "../../app";
import { Connector } from "..";
import { Server } from "../../process";

export class LineConnector implements Connector {
  private client: messagingApi.MessagingApiClient;

  constructor(
    private server: Server,
    private channelSecret: string,
    channelAccessToken: string
  ) {
    this.client = new messagingApi.MessagingApiClient({
      channelAccessToken,
    });
  }

  async addListener(handler: MessageHandler): Promise<void> {
    this.server.express().post(
      "/webhook/line",
      async (req, res) => {
        for (const event of req.body.events as WebhookEvent[]) {
          if (event.type !== "message") {
            continue;
          }

          const content: MessageContent = (() => {
            if (event.message.type === "text") {
              return new TextMessageContent(event.message.text);
            }
            // TODO: handle other message types
            return new UnknownMessageContent();
          })();

          const id = `line-user-message-${event.message.id}`;

          const thread: LineThread = {
            id: `line-thread-${event.message.id}`,
            replyToken: event.replyToken,
          };

          // Show loading animation
          if (event.source.userId) {
            await this.client.showLoadingAnimation({
              chatId: event.source.userId,
              loadingSeconds: 60,
            });
          }

          await handler(this, thread, {
            id,
            content,
          });
        }
        res.sendStatus(200);
      },
      middleware({ channelSecret: this.channelSecret })
    );
  }

  async sendMessages(
    thread: Thread,
    messages: AsyncGenerator<Message>
  ): Promise<void> {
    const lineThread = thread as LineThread;

    const lineMessages: { type: "text"; text: string }[] = [];
    for await (const message of messages) {
      lineMessages.push({ type: "text", text: message.content.text });
    }

    await this.client.replyMessage({
      replyToken: lineThread.replyToken,
      messages: lineMessages,
    });
  }
}

type LineThread = {
  id: string;
  replyToken: string;
};