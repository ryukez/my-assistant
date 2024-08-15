import { Command } from "commander";
import { logger } from "../logger/logger";
import dotenv from "dotenv";
import { DiscordBotV2 } from "../discord";
import { MockAssistant } from "../assistants";
import { runServer } from "../server";

type Env = {
  SERVER_PORT: string;
  DISCORD_TOKEN: string;
  DISCORD_TEXT_CHANNEL_ID: string;
};

export const discordCommand = new Command()
  .command("discord")
  .description("Run Discord bot")
  .action(async () => {
    const env: Env =
      (dotenv.config().parsed as Env) ??
      (() => {
        throw new Error(".env file not found");
      })();

    const assistant = new MockAssistant();

    const discordBot = new DiscordBotV2(
      env.DISCORD_TOKEN,
      assistant,
      env.DISCORD_TEXT_CHANNEL_ID
    );

    logger.debug("Discord bot is running...");
    await discordBot.run();

    runServer(parseInt(env.SERVER_PORT) || 8080);
  });
