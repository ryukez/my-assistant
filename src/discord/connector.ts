import { Client, Message as DiscordMessage, Partials } from "discord.js";
import { Connector } from "../connector";
import { App } from "../app";
import { Message, TextMessageContent } from "../assistants";

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

  async addListener(app: App): Promise<void> {
    this.client.on("messageCreate", async (message: DiscordMessage) =>
      this.onMessage(app, message)
    );

    await this.client.login(this.token);
  }

  private addMessageToThread(threadId: string, message: DiscordMessage) {
    this.threads.set(
      threadId,
      (this.threads.get(threadId) ?? []).concat(message)
    );
  }

  async onMessage(app: App, message: DiscordMessage): Promise<void> {
    if (message.channelId !== this.textChannelId || message.author.bot) return;

    const id = `discord-user-message-${message.id}`;

    const threadId = `discord-thread-${message.id}`;
    this.addMessageToThread(threadId, message);

    await app.onMessage(this, {
      id,
      content: new TextMessageContent(message.content),
      threadId,
    });
  }

  async sendMessage(message: Message): Promise<void> {
    const thread = this.threads.get(message.threadId);
    if (!thread || thread.length === 0) {
      throw new Error("thread not found");
    }

    const lastMessage = thread[thread.length - 1];
    const discordMessage = await this.reply(
      lastMessage,
      message.content.string()
    );
    this.addMessageToThread(message.threadId, discordMessage);
  }

  // for test
  async reply(message: DiscordMessage, text: string): Promise<DiscordMessage> {
    return message.reply(text);
  }
}
