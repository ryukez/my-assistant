# my-assistant

Typescript framework for building personal assistant easily.

<a href="./README-ja.md">日本語の README はこちら</a>

## Install

```sh
npm install my-assistant
```

## Usage

See `examples/` directory for the actual usages.

We need 3 core components to build assistant.

![overview](https://github.com/user-attachments/assets/c429ca69-545d-49c9-a231-22e45d71b4e4)

### Process

Main process running while app is active, ex. server, cli.

Process has only one method `run()`, which is supposed to keep running until the application terminates:

```ts
export interface Process {
  run(): Promise<void>;
}
```

### Brain

The core component which controls assistant behaviour.
This component also has simple interface as follows:

```ts
export interface Brain {
  respond(thread: Thread, message: Message): AsyncGenerator<Message>;
}
```

`response()` is expected to return messages as [AsyncGenerator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncGenerator).

You can implement any behaviours in this Brain component, such as function calling, document retrieval, storing data, etc. Only you have to do is to return a sequence of messages as assistant response, which will be returned to the end user.

These messsages should have actual content, and unique identifiers. The recommendation is to add a unique prefix such as `my-own-assistant-${timestamp}`.

```ts
export type Message = {
  id: string;
  content: MessageContent;
};
```

### Connector

This component manages message transfer in the real-world application, such as CLI, Discord or Slack etc.

```ts
export interface Connector {
  addListener(handler: MessageHandler): Promise<void>;
  sendMessages(
    thread: Thread,
    messages: AsyncGenerator<Message>
  ): Promise<void>;
}

export type MessageHandler = (
  connector: Connector,
  thread: Thread,
  message: Message
) => Promise<void>;
```

Connector is expected to have two methods.

`addListener()` is for registering message receiver to the application. In the message receiver, Connector should call `handler`, which passes the received message to Brain and generates response. You can wait for messages in any way, such as webhook or polling etc.

`sendMessages()` is called when the application needs generated assistant response to the end user. Given messages are supposed to be a chunk of messages which is generated as response to a single user query. It's count on Connector how to send a sequence of messages, such as sending them one by one when generated, or sending them all at once.

`Thread` is a concept to organize messsages into groups. Thread design depends on chat application, so it is the responsibility of Connector to handle threading. You should define own thread with unique identifier. With proper design of threading, Brain component can take related messages into consideration when generating responses.

> [!NOTE]
> Currently, only Discord and LINE connectors are implemented. Other connectors will be ready soon, but you can easily implement them by yourself!

### App

App is a simple component to compile above build blocks into a single application.

- Passes received messages (by Connector) to Brain.
- Passes generated messages (by Brain) to Connector.
- Runs Process.

### Build

All you have to do is to prepare 3 components (Process, Brain, Connector) and pass them into App. Here is an example of `examples/mock`:

```ts
const cli = new CLI();
const brain = new MockBrain();
const consoleConnector = new ConsoleConnector(cli);

const app = new App(cli, brain, [consoleConnector]);
app.run();
```

Note that you can pass multiple connectors to the app. This makes it possible to run single application with diverse interfaces, e.g. Discord and Slack.

You can utilize built-in components included in this module, or define them by yourself. It is recommended to start with built-in components for simple usecases and move on building self components when it's really necessary.

## How to run example

In project root:

```sh
npm install
npx tsc
```

**mock**

```sh
% node dist/examples/mock/main.js cli
> waiting input...: Hello!
[mock-1723861916272-0] Hello World!
[mock-1723861916273-1] Your message: Hello!
```

**discordbot**

> [!NOTE]
> Take care, running this example consumes OpenAI credits! (Usually 1 message makes only <$0.01 with gpt-4o-mini)

You need to prepare [OpenAI API key](https://platform.openai.com/docs/quickstart), and [Discord token & text_channel_id](https://discord.com/developers/docs/quick-start/getting-started). Refer to official documents for details.

```sh
export DISCORD_TOKEN=xxxxxx
export DISCORD_TEXT_CHANNEL_ID=xxxxxx
export OPENAI_API_KEY=xxxxxx
```

```sh
% node dist/examples/discordbot/main.js server
```

Now you can chat with assistant in the designated text channel!

<img width="375" alt="image" src="https://github.com/user-attachments/assets/5388f167-ae4f-4eab-8dff-29b5638ce026">

## Disclaimer

This is fully open-source project, and feel free to make use in MIT License. Your contribution is also really appreciated!!

Note that this project is still in an experimental phase, and there would be a lot of breaking changes. Usage in production is not recommended.

## License

This project is licensed under the MIT License, see the LICENSE file for details.
