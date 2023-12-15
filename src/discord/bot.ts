import {
  Client,
  Message as DiscordMessage,
  Partials,
  TextBasedChannel,
} from "discord.js";
import { Assistant, AssistantError, Message } from "../chat";
import { DiscordBotVoiceExtension } from "./voice";

const VOICE_THREAD_PERSISTENCE_SECONDS = 60 * 5 * 1000; // time for a conversation (thread) to be kept. 5 minutes
const VOICE_MESSAGE_HEADER = "[voice message from user] ";
const ASSISTANT_NICKNAME = "アリス";

export class DiscordBot {
  private client: Client;
  private lastVoiceMessage: DiscordMessage | undefined;

  constructor(
    private token: string,
    private assistant: Assistant,
    private guildId: string,
    private textChannelId: string,
    private voiceExtension?: DiscordBotVoiceExtension
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

      await this.handleUserMessage(message);
    });

    this.client.once("ready", async () => {
      console.log("Ready!");
      console.log(this.client.user?.tag);

      if (voiceExtension) {
        const guild = await this.client.guilds.fetch(guildId);

        await voiceExtension.connectToVoiceChannel(guild, async (rawText) => {
          console.log(rawText);

          if (rawText.startsWith(ASSISTANT_NICKNAME)) {
            const text = rawText.replace(
              new RegExp(`^${ASSISTANT_NICKNAME}[,.、。]*`),
              ""
            );

            const channel = this.client.channels.cache.get(
              textChannelId
            ) as TextBasedChannel;

            // Bind to ongoing conversation if it's within 5 minutes from the last conversation, else create a new thread
            const now = new Date();
            let message: DiscordMessage;
            if (
              this.lastVoiceMessage &&
              now.getTime() - this.lastVoiceMessage.createdAt.getTime() <
                VOICE_THREAD_PERSISTENCE_SECONDS
            ) {
              message = await this.lastVoiceMessage.reply(
                `${VOICE_MESSAGE_HEADER}${text}`
              );
            } else {
              message = await channel.send(`[voice message from user] ${text}`);
            }
            const resp = await this.handleUserMessage(message, text);
            this.lastVoiceMessage = resp;
          }
        });
      }
    });
  }

  async run(): Promise<string> {
    return this.client.login(this.token);
  }

  private async handleUserMessage(
    message: DiscordMessage,
    textOverride?: string
  ): Promise<DiscordMessage> {
    try {
      const messageIdToReply = message.reference?.messageId;
      let reply: DiscordMessage | undefined;

      await this.assistant.respond(
        {
          id: message.id,
          text: textOverride ?? message.content,
        },
        async (text): Promise<Message> => {
          // no await to run in parallel
          if (this.voiceExtension?.isReady) {
            this.voiceExtension.playVoice(text);
          }

          reply = await message.reply(text);

          return {
            id: reply.id,
            text: reply.content,
          };
        },
        messageIdToReply
      );

      if (!reply) {
        throw new Error("No reply generated");
      }
      return reply;
    } catch (e) {
      let text = "Unhandled error";
      if (e instanceof AssistantError) {
        text = `Internal error: ${e.message}`;
      } else {
        text = `Unhandled error: ${e}`;
      }
      console.error(text);

      const reply = await message.reply(text);
      return reply;
    }
  }
}
