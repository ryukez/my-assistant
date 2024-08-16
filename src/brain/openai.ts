import OpenAI from "openai";
import { MessageContentText } from "openai/resources/beta/threads/messages/messages";
import { Message, TextMessageContent } from "../app/message";
import { BrainError } from "./brain";

export class OpenAIBrain {
  private client: OpenAI;

  async *respond(message: Message): AsyncGenerator<Message> {
    const thread = await this.client.beta.threads.create();
    const threadId = thread.id;

    await this.client.beta.threads.messages.create(threadId, {
      role: "user",
      content: message.content.text,
    });

    let run = await this.client.beta.threads.runs.create(threadId, {
      assistant_id: this.assistantId,
    });

    // TODO: use streaming
    // TODO: handle thread
    while (true) {
      run = await this.client.beta.threads.runs.retrieve(threadId, run.id);
      if (
        run.status === "in_progress" ||
        run.status === "queued" ||
        run.status === "cancelling"
      )
        continue;

      if (run.status === "completed") {
        console.log(JSON.stringify(run, null, 2));
        break;
      }

      await sleep(1000);
    }

    const threadMessages = await this.client.beta.threads.messages.list(
      threadId
    );
    const lastMessage = threadMessages.data[0];
    if (lastMessage.role !== "assistant") {
      throw new BrainError(
        "internal",
        "invalid response of OpenAI API: lastMessage.role !== 'assistant'"
      );
    }
    const text = lastMessage.content
      .filter((c) => c.type === "text")
      .map((c) => (c as MessageContentText).text.value)
      .join("\n\n");

    const annotations = lastMessage.content
      .filter((c) => c.type === "text")
      .flatMap((c) => (c as MessageContentText).text.annotations)
      .map((a) => a.text)
      .join("\n");

    console.log(JSON.stringify(lastMessage, null, 2));

    // split by 500 characters
    for (let i = 0; i < text.length; i += 500) {
      yield {
        id: `openai-${lastMessage.id}-${i / 500}`,
        content: new TextMessageContent(text.slice(i, i + 500)),
      };
    }
  }

  constructor(apiKey: string, private assistantId: string) {
    this.client = new OpenAI({ apiKey });
  }
}

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
