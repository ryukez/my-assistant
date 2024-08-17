import { program } from "commander";
import { cliCommand } from "./commands/cli";

program.addCommand(cliCommand);

program.parse(process.argv);
