import OpenAI from "openai";
import { AssistantError } from "../chat";
import { MessageContentText } from "openai/resources/beta/threads/messages/messages";
import { Message, TextMessageContent } from "./message";

export class OpenAIAssistant {
  private client: OpenAI;

  async *respond(message: Message): AsyncGenerator<Message> {
    const thread = await this.client.beta.threads.create();
    const threadId = thread.id;

    await this.client.beta.threads.messages.create(threadId, {
      role: "user",
      content: message.content.string(),
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

      if (run.status === "completed") break;

      await sleep(1000);
    }

    const threadMessages = await this.client.beta.threads.messages.list(
      threadId
    );
    const lastMessage = threadMessages.data[0];
    if (lastMessage.role !== "assistant") {
      throw new AssistantError(
        "internal",
        "invalid response of OpenAI API: lastMessage.role !== 'assistant'"
      );
    }
    const text = lastMessage.content
      .filter((c) => c.type === "text")
      .map((c) => (c as MessageContentText).text.value)
      .join("\n\n");

    // split by 500 characters
    for (let i = 0; i < text.length; i += 500) {
      yield {
        id: `openai-${lastMessage.id}-${i / 500}`,
        content: new TextMessageContent(text.slice(i, i + 500)),
        threadId: message.threadId,
      };
    }
  }

  constructor(apiKey: string, private assistantId: string) {
    this.client = new OpenAI({ apiKey });
  }
}

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
