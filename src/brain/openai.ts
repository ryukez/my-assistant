import OpenAI from "openai";
import { Message, TextMessageContent } from "../app";
import { BrainError } from "./brain";

export class OpenAIChatCompletionBrain {
  private client: OpenAI;

  async *respond(message: Message): AsyncGenerator<Message> {
    const completion = await this.client.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant.",
        },
        {
          role: "user",
          content: message.content.text,
        },
      ],
    });

    if (completion.choices.length === 0) {
      throw new BrainError("internal", "no completion generated");
    }

    yield {
      id: `openai-${Date.now()}`,
      content: new TextMessageContent(
        completion.choices[0].message.content ?? "something wrong"
      ),
    };
  }

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }
}
