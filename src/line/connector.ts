import { messagingApi, middleware, WebhookEvent } from "@line/bot-sdk";
import {
  App,
  Message,
  MessageContent,
  TextMessageContent,
  Thread,
} from "../app";
import { Connector } from "../connector";

export class LineConnector implements Connector {
  constructor(
    private channelSecret: string,
    private channelAccessToken: string
  ) {}

  async addListener(app: App): Promise<void> {
    app.server().post(
      "/webhook/line",
      async (req, res) => {
        for (const event of req.body.events as WebhookEvent[]) {
          if (event.type !== "message") {
            continue;
          }

          const content = ((): MessageContent => {
            if (event.message.type === "text")
              return new TextMessageContent(event.message.text);

            throw new Error("Unsupported message type");
          })();

          const id = `line-user-message-${event.message.id}`;

          const thread: LineThread = {
            id: `line-thread-${event.message.id}`,
            replyToken: event.replyToken,
          };

          await app.onMessage(this, thread, {
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

    const client = new messagingApi.MessagingApiClient({
      channelAccessToken: this.channelAccessToken,
    });

    const lineMessages: { type: "text"; text: string }[] = [];
    for await (const message of messages) {
      lineMessages.push({ type: "text", text: message.content.text });
    }

    await client.replyMessage({
      replyToken: lineThread.replyToken,
      messages: lineMessages,
    });
  }
}

type LineThread = {
  id: string;
  replyToken: string;
};
