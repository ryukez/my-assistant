import { Readable } from "stream";
import * as fs from "fs";

export interface Synthesizer {
  synthesize(text: string): Promise<Readable>;
}

export interface Recognizer {
  recognize(stream: fs.ReadStream): Promise<string>;
}
