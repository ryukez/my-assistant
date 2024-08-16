import { Message as DiscordMessage } from "discord.js";
import { Message, MockAssistant, TextMessageContent } from "../assistants";
import { DiscordConnector } from "./connector";
import { ExpressApp } from "../app";

describe("DiscordConnector", () => {
  it("should respond to messages in the text channel", async () => {
    const connector = new DiscordConnector("token", "channel-id");

    const userMessage = {
      author: {
        bot: false,
      },
      channelId: "channel-id",
      id: "user-message",
      content: "Hello, world!",
    } as unknown as DiscordMessage;

    const replyMessage1 = {
      id: "reply-message-1",
      content: "reply 1",
    } as unknown as DiscordMessage;

    const replyMessage2 = {
      id: "reply-message-2",
      content: "reply 2",
    } as unknown as DiscordMessage;

    jest.spyOn(connector, "reply").mockImplementation(async (message, text) => {
      if (message.id === "user-message") {
        expect(text).toEqual("message1");
        return replyMessage1;
      }
      if (message.id === "reply-message-1") {
        expect(text).toEqual("message2");
        return replyMessage2;
      }

      throw new Error("Unexpected message");
    });

    const expectedThread = {
      id: "discord-thread-user-message",
      messages: [userMessage],
    };

    const app = new ExpressApp(new MockAssistant(), []);
    jest
      .spyOn(app, "onMessage")
      .mockImplementation(async (conector, thread, message) => {
        expect(thread).toEqual(expectedThread);
        expect(message.content.string()).toEqual("Hello, world!");
      });

    await connector.onMessage(app, userMessage);

    const threadId = "discord-thread-user-message";

    await connector.sendMessages(expectedThread, generateMessages());
  });
});

async function* generateMessages(): AsyncGenerator<Message> {
  yield {
    id: "response",
    content: new TextMessageContent("message1"),
  };

  yield {
    id: "response",
    content: new TextMessageContent("message2"),
  };
}
