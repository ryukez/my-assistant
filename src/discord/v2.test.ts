import { Message as DiscordMessage } from "discord.js";
import { MockAssistant } from "../assistants";
import { DiscordBotV2 } from "./v2";

describe("DiscordBotV2", () => {
  it("should respond to messages in the text channel", async () => {
    const bot = new DiscordBotV2("token", new MockAssistant(), "channel-id");

    const discordMessage1 = {
      content: "first message",
    } as unknown as DiscordMessage;
    const discordMessage2 = {
      content: "second message",
    } as unknown as DiscordMessage;
    const discordMessage3 = {
      content: "third message",
    } as unknown as DiscordMessage;

    jest.spyOn(bot, "reply").mockImplementation(async (message, text) => {
      if (message.content === "first message") {
        expect(text).toEqual("Hello World!");
        return discordMessage2;
      }
      if (message.content === "second message") {
        expect(text).toEqual("Your message: first message");
        return discordMessage3;
      }

      throw new Error("Unexpected message");
    });

    const responses: DiscordMessage[] = [];
    for await (const m of bot.handleUserMessage(discordMessage1)) {
      responses.push(m);
    }
    expect(responses).toEqual([discordMessage2, discordMessage3]);
  });
});
