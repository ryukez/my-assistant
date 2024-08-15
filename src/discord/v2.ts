import { Client, Message as DiscordMessage, Partials } from "discord.js";
import { logger } from "../logger/logger";
import { Assistant, AssistantError, TextMessage } from "../assistants";

export class DiscordBotV2 {
  private client: Client;

  constructor(
    private token: string,
    private assistant: Assistant,
    textChannelId: string
  ) {
    this.client = new Client({
      intents: [
        "DirectMessages",
        "Guilds",
        "GuildMembers",
        "GuildMessages",
        "GuildVoiceStates",
        "MessageContent",
      ],
      partials: [Partials.Message, Partials.Channel],
    });

    this.client.on("messageCreate", async (message: DiscordMessage) => {
      if (message.channelId !== textChannelId || message.author.bot) return;

      for await (const m of this.handleUserMessage(message)) {
        logger.debug("message sent", { message_id: m.id });
      }
    });
  }

  async run(): Promise<string> {
    return this.client.login(this.token);
  }

  // private, for test
  async reply(message: DiscordMessage, text: string): Promise<DiscordMessage> {
    return message.reply(text);
  }

  // private, for test
  async *handleUserMessage(
    discordMessage: DiscordMessage
  ): AsyncGenerator<DiscordMessage> {
    let messageToReply = discordMessage;

    try {
      const userMessage = {
        id: `discord-user-${discordMessage.id}`,
        message: new TextMessage(discordMessage.content),
      };

      for await (const message of this.assistant.respond(userMessage)) {
        const reply = await this.reply(
          messageToReply,
          message.message.string()
        );

        yield reply;
        messageToReply = reply;
      }
    } catch (e) {
      let text = "Unhandled error";
      if (e instanceof AssistantError) {
        text = `Internal error: ${e.message}`;
      } else {
        text = `Unhandled error: ${e}`;
      }
      logger.error(text, { message_id: discordMessage.id });

      const reply = await this.reply(messageToReply, text);
      return reply;
    }
  }
}
