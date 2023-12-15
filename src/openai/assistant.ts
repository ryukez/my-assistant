import OpenAI from "openai";
import { Function } from "../functions/interface";
import { MessageContentText } from "openai/resources/beta/threads/messages/messages";
import { AssistantError, Message } from "../chat";

export class OpenAIAssistant {
  private client: OpenAI;
  private functions: Map<string, Function>;
  private threadOfMessage: { [key: string]: string } = {}; // message.id -> thread.id

  constructor(
    apiKey: string,
    private assistantId: string,
    functions: Function[]
  ) {
    this.client = new OpenAI({ apiKey });
    this.functions = new Map(functions.map((f) => [f.name, f]));
  }

  async respond(
    message: Message,
    handler: (text: string) => Promise<Message>,
    messageIdToReply?: string
  ): Promise<Message> {
    let threadId: string;
    if (messageIdToReply) {
      threadId = this.threadOfMessage[messageIdToReply];
      if (!threadId) {
        throw new AssistantError(
          "badRequest",
          "invalid refMessageId: not found"
        );
      }
    } else {
      const thread = await this.client.beta.threads.create();
      threadId = thread.id;
    }

    await this.client.beta.threads.messages.create(threadId, {
      role: "user",
      content: message.text,
    });

    this.threadOfMessage[message.id] = threadId;

    let run = await this.client.beta.threads.runs.create(threadId, {
      assistant_id: this.assistantId,
    });

    while (true) {
      run = await this.client.beta.threads.runs.retrieve(threadId, run.id);

      if (
        run.status === "in_progress" ||
        run.status === "queued" ||
        run.status === "cancelling"
      )
        continue;

      if (run.status === "completed") break;

      if (run.status === "requires_action") {
        const action = run.required_action;
        if (!action || action.type !== "submit_tool_outputs") {
          throw new AssistantError(
            "internal",
            "invalid response of OpenAI API: action.type !== 'submit_tool_outputs'"
          );
        }

        const outputs: OpenAI.Beta.Threads.Runs.RunSubmitToolOutputsParams.ToolOutput[] =
          [];

        for (const call of action.submit_tool_outputs.tool_calls) {
          if (call.type !== "function") {
            throw new AssistantError(
              "internal",
              "invalid response of OpenAI API: call.type !== 'function'"
            );
          }

          const f = this.functions.get(call.function.name);
          if (!f) {
            throw new AssistantError(
              "internal",
              `undefined function name: ${call.function.name}`
            );
          }

          const output = await f.call();

          outputs.push({
            tool_call_id: call.id,
            output,
          });
        }

        await this.client.beta.threads.runs.submitToolOutputs(
          threadId,
          run.id,
          {
            tool_outputs: outputs,
          }
        );
      }

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

    const replyMessage = await handler(text);
    this.threadOfMessage[replyMessage.id] = threadId;
    return replyMessage;
  }
}

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
