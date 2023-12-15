import OpenAI from "openai";
import * as fs from "fs";

export class OpenAIAudio {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async recognize(stream: fs.ReadStream): Promise<string> {
    const transcript = await this.client.audio.transcriptions.create({
      file: stream,
      model: "whisper-1",
      language: "ja",
    });
    return transcript.text;
  }
}
