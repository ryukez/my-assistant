import { program } from "commander";
import { serverCommand } from "./commands/server";

program.addCommand(serverCommand);

program.parse(process.argv);
