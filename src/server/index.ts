import express from "express";

export function runServer(port: number) {
  const app = express();
  app.get("/", (req, res) => {
    res.send("🤖Bot is running!!🤖");
  });

  // GAEで最小インスタンス数を指定するには、Warmup Endpoint を有効にする必要がある
  app.get("/_ah/warmup", (req, res) => {
    res.sendStatus(200);
  });

  app.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });
}
