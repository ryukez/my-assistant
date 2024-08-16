import { Command } from "commander";
import dotenv from "dotenv";
import { runServer } from "../server";
import { OpenAIAssistant } from "../assistants/openai";
import { DiscordConnector } from "../discord";
import { ExpressApp } from "../app";
import { MockAssistant } from "../assistants";

type Env = {
  DISCORD_TOKEN: string;
  DISCORD_TEXT_CHANNEL_ID: string;
  OPENAI_API_KEY: string;
  OPENAI_ASSISTANT_ID: string;
};

export const serverCommand = new Command()
  .command("server")
  .description("Run bot server")
  .action(async () => {
    const env: Env =
      (dotenv.config().parsed as Env) ??
      (() => {
        throw new Error(".env file not found");
      })();

    const assistant = new OpenAIAssistant(
      env.OPENAI_API_KEY,
      env.OPENAI_ASSISTANT_ID
    );

    const discordBot = new DiscordConnector(
      env.DISCORD_TOKEN,
      env.DISCORD_TEXT_CHANNEL_ID
    );

    const app = new ExpressApp(assistant, [discordBot]);
    app.run();
  });
