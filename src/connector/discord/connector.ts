import { Client, Message as DiscordMessage, Partials } from "discord.js";
import { Connector } from "..";
import { Message, MessageHandler, TextMessageContent, Thread } from "../../app";

export class DiscordConnector implements Connector {
  private client: Client;
  private threads: Map<string, DiscordMessage[]> = new Map();

  constructor(private token: string, private textChannelId: string) {
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
  }

  async addListener(handler: MessageHandler): Promise<void> {
    this.client.on("messageCreate", async (message: DiscordMessage) =>
      this.onMessage(message, handler)
    );

    await this.client.login(this.token);
  }

  async onMessage(
    message: DiscordMessage,
    handler: MessageHandler
  ): Promise<void> {
    if (message.channelId !== this.textChannelId || message.author.bot) return;

    const id = `discord-user-message-${message.id}`;

    const thread: DiscordThread = {
      id: `discord-thread-${message.id}`,
      messages: [message],
    };

    await handler(this, thread, {
      id,
      content: new TextMessageContent(message.content),
    });
  }

  async sendMessages(
    thread: Thread,
    messages: AsyncGenerator<Message>
  ): Promise<void> {
    const discordThread = thread as DiscordThread;
    if (discordThread.messages.length === 0) {
      throw new Error("thread not found");
    }

    let messageToReply =
      discordThread.messages[discordThread.messages.length - 1];

    for await (const message of messages) {
      const discordMessage = await this.reply(
        messageToReply,
        message.content.text
      );
      messageToReply = discordMessage;
    }
  }

  // for test
  async reply(message: DiscordMessage, text: string): Promise<DiscordMessage> {
    return message.reply(text);
  }
}

type DiscordThread = {
  id: string;
  messages: DiscordMessage[];
};
