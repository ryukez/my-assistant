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
  private threadsByUser: Map<string, LineThread> = new Map();

  constructor(
    private server: Server,
    private channelSecret: string,
    channelAccessToken: string,
    private options?: {
      threadActiveDurationSeconds?: number;
    }
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

          var thread: LineThread = {
            id: `line-thread-${event.message.id}`,
            replyToken: event.replyToken,
            lastUpdatedAt: new Date(),
          };

          // Show loading animation
          if (event.source.userId) {
            await this.client.showLoadingAnimation({
              chatId: event.source.userId,
              loadingSeconds: 60,
            });

            if (this.threadsByUser.has(event.source.userId)) {
              const lastThread = this.threadsByUser.get(event.source.userId)!;

              // Use the last thread if it's still active
              if (
                new Date().getTime() - lastThread.lastUpdatedAt.getTime() <
                (this.options?.threadActiveDurationSeconds ?? 5 * 60) * 1000 // default: 5 minutes
              ) {
                thread.id = lastThread.id;
              }
            }

            this.threadsByUser.set(event.source.userId, thread);
          }

          await handler(this, thread, {
            id,
            content,
            user: event.source.userId
              ? { id: `line:${event.source.userId}` }
              : undefined,
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
  lastUpdatedAt: Date;
};
