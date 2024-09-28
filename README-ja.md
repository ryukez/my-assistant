# my-assistant

個人アシスタントアプリを簡単に構築するための Typescript フレームワーク

<a href="./README.md">README in English is here</a>

## インストール

```sh
npm install my-assistant
```

## 使い方

実際の使用例については、examples/ディレクトリを参照してください。

アシスタントを構築するために必要な 3 つのコアコンポーネントがあります。

![overview](https://github.com/user-attachments/assets/c429ca69-545d-49c9-a231-22e45d71b4e4)

### Process

アプリケーションがアクティブな間に動作するメインプロセスです（例: サーバー、CLI）。

Process には `run()` という唯一のメソッドがあり、アプリケーションが終了するまで実行され続けることが期待されます。

```ts
export interface Process {
  run(): Promise<void>;
}
```

### Brain

アシスタントの動作を制御するコアコンポーネント。このコンポーネントも次のようなシンプルなインターフェースを持ちます。

```ts
export interface Brain {
  respond(thread: Thread, message: Message): AsyncGenerator<Message>;
}
```

`response()` は [AsyncGenerator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncGenerator) としてメッセージを返すことが期待されます。

この Brain コンポーネントには、関数呼び出し、ドキュメントの取得、データの保存など、実装者がさまざまな動作を自由に実装することができます。唯一の要件は、エンドユーザーに返されるアシスタントの応答として、メッセージのシーケンスを返すことです。

これらのメッセージには、実際のコンテンツと一意の識別子が含まれている必要があります。一意のプレフィックスとして my-own-assistant-${timestamp} などを追加することをお勧めします。

```ts
export type Message = {
  id: string;
  content: MessageContent;
};
```

### Connector

このコンポーネントは、CLI、Discord、Slack などの実際のアプリケーションにおけるメッセージの転送を管理します。

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

Connector は 2 つのメソッドを持つことが期待されます。

`addListener()` は、アプリケーションにメッセージを受信するための機構（レシーバー）を登録するためのものです。Connector はレシーバーの中で handler を呼び出し、受信したメッセージを Brain に渡して応答を生成します。メッセージを待つ方法は、Webhook やポーリングなど、どのような方法でもかまいません。

`sendMessages()` は、アプリケーションが生成したアシスタントの応答をエンドユーザーに送信する必要があるときに呼び出されます。与えられるメッセージは、1 つのユーザーのクエリに対する応答として生成されたメッセージのまとまりです。メッセージを 1 つずつ送信するか、すべてを一度に送信するかは、コネクタの設計次第で自由に決めることができます。（例：例えば Discord ではメッセージを 1 件ずつ送ることが可能ですが、LINE では API の仕様上 1 つのユーザーメッセージに対してまとめて送る必要があるため、全てのメッセージを待って送信するよう設計します。）

Thread は、メッセージをグループ化するための概念です。スレッドの設計はチャットアプリケーションによって異なるため、スレッドの管理は Connector の責任となります。それぞれ一意な識別子を持つスレッドとして独自に定義します。適切にスレッドを設計することで、Brain コンポーネントは関連するメッセージを考慮して応答を生成することができるようになります。

> [!NOTE]
> 現在のところ、Discord と LINE の Connector のみが実装されています。他の Connector も近日中に実装予定ですが、自分で簡単に実装することもできます！

### App

APp は、上記のビルドブロックを 1 つのアプリケーションにコンパイルするためのシンプルなコンポーネントです。

- Connector の受信したメッセージを Brain に渡す。
- Brain の生成されたメッセージを Connector に渡す。
- Process の実行を開始する。

### アプリを組み立てる

アプリケーションを実行するため必要なのは、3 つのコンポーネント（Process、Brain、Connector）を準備し、それらを App に渡すだけです。以下は examples/mock の例です。

```ts
const cli = new CLI();
const brain = new MockBrain();
const consoleConnector = new ConsoleConnector(cli);

const app = new App(cli, brain, [consoleConnector]);
app.run();
```

複数の Connector をアプリに渡すことができます。これにより、1 つのアプリケーションを Discord や Slack などの複数のインターフェースで実行することができます。

App に組み込むコンポーネントには、このモジュールに含まれるビルトインコンポーネントを利用するか、自分で定義することができます。はじめはシンプルなユースケースに対してビルトインコンポーネントを使用し、必要に応じて独自のコンポーネントを作成することをお勧めします。

## サンプルの実行方法

このレポジトリをクローンし、プロジェクトのルートディレクトリで以下を実行してください。

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
> このサンプルを実行すると OpenAI クレジットが消費されるので注意してください！ (gpt-4o-mini を使用した場合、通常 1 つのメッセージごとにかかるコストは 1 円未満です。)

実行には[OpenAI API key](https://platform.openai.com/docs/quickstart) と [Discord token & text_channel_id](https://discord.com/developers/docs/quick-start/getting-started) を準備する必要があります。詳細は公式ドキュメントを参照してください。

```sh
export DISCORD_TOKEN=xxxxxx
export DISCORD_TEXT_CHANNEL_ID=xxxxxx
export OPENAI_API_KEY=xxxxxx
```

```sh
% node dist/examples/discordbot/main.js server
```

指定したテキストチャネルを開き、アシスタントとチャットできるのを確認してください！

<img width="375" alt="image" src="https://github.com/user-attachments/assets/5388f167-ae4f-4eab-8dff-29b5638ce026">

## 免責事項

このプロジェクトは完全にオープンソースであり、MIT ライセンス内で自由に利用できます。Contribution ももちろん歓迎です！

ただし、このプロジェクトはまだ実験段階であり、多くの破壊的な変更が行われる可能性があることに注意してください。本番環境での使用は推奨されません。

## ライセンス

このプロジェクトは MIT ライセンスの下でライセンスされています。詳細は LICENSE ファイルを参照してください。
