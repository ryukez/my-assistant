import * as readline from "node:readline/promises";
import { Process } from "./process";

type Handler = (line: string) => Promise<void>;

export class CLI implements Process {
  private handlers: Handler[] = [];

  constructor(private prompt: string = "> waiting input...: ") {}

  async run(): Promise<void> {
    //@ts-ignore
    const rl = readline.createInterface(process.stdin, process.stdout);

    while (true) {
      const line = await rl.question(this.prompt);
      for (const handler of this.handlers) {
        await handler(line);
      }
    }
  }

  addHandler(handler: Handler) {
    this.handlers.push(handler);
  }
}
