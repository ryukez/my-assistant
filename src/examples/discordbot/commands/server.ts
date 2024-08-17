import { Command } from "commander";
import { OpenAIChatCompletionBrain } from "../../../brain";
import { App } from "../../../app";
import { Server } from "../../../process";
import { DiscordConnector } from "../../../connector";

export const serverCommand = new Command()
  .command("server")
  .description("Run chatbot in server mode")
  .action(async () => {
    const server = new Server();
    const brain = new OpenAIChatCompletionBrain(
      process.env["OPENAI_API_KEY"] ?? ""
    );
    const discordConnector = new DiscordConnector(
      process.env["DISCORD_TOKEN"] ?? "",
      process.env["DISCORD_TEXT_CHANNEL_ID"] ?? ""
    );

    const app = new App(server, brain, [discordConnector]);
    app.run();
  });
