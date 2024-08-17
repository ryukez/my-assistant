import { Command } from "commander";
import { MockBrain } from "../../../brain";
import { App } from "../../../app";
import { CLI } from "../../../process";
import { ConsoleConnector } from "../../../connector";

export const cliCommand = new Command()
  .command("cli")
  .description("Run chatbot in CLI mode")
  .action(async () => {
    const cli = new CLI();
    const brain = new MockBrain();
    const consoleConnector = new ConsoleConnector(cli);

    const app = new App(cli, brain, [consoleConnector]);
    app.run();
  });
