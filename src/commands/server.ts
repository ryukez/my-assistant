import { Command } from "commander";
import dotenv from "dotenv";
import { OpenAIBrain } from "../brain/openai";
import { DiscordConnector } from "../discord";
import { ExpressApp } from "../app/app";
import { LineConnector } from "../line/connector";

type Env = {
  // OpenAI
  OPENAI_API_KEY: string;
  OPENAI_ASSISTANT_ID: string;

  // Discord
  DISCORD_TOKEN: string;
  DISCORD_TEXT_CHANNEL_ID: string;

  // LINE
  LINE_CHANNEL_SECRET: string;
  LINE_CHANNEL_ACCESS_TOKEN: string;
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

    const brain = new OpenAIBrain(env.OPENAI_API_KEY, env.OPENAI_ASSISTANT_ID);

    const discordConnector = new DiscordConnector(
      env.DISCORD_TOKEN,
      env.DISCORD_TEXT_CHANNEL_ID
    );

    const lineConnector = new LineConnector(
      env.LINE_CHANNEL_SECRET,
      env.LINE_CHANNEL_ACCESS_TOKEN
    );

    const app = new ExpressApp(brain, [discordConnector, lineConnector]);
    app.run();
  });
