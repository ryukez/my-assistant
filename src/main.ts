// import dotenv from "dotenv";
// import { WebClient } from "@slack/web-api";
// import {
//   Function,
//   WeatherDailyForecast,
// } from "./functions";
// import { DiscordBot, DiscordBotVoiceExtension } from "./discord";
// import { OpenAIAssistant, OpenAIAudio } from "./openai";
// import { VoiceVox } from "./voicevox";
// import { runServer } from "./server";

// type Env = {
//   DISCORD_TOKEN: string;
//   DISCORD_GUILD_ID: string;
//   DISCORD_TEXT_CHANNEL_ID: string;
//   DISCORD_VOICE_CHANNEL_ID: string;
//   DISCORD_ENABLE_VOICE: string;

//   OPENAI_API_KEY: string;
//   OPENAI_ASSISTANT_ID: string;

//   SLACK_API_TOKEN: string;

//   VOICEVOX_API_URL: string;
//   VOICEVOX_SPEAKER_ID: string;

//   WEATHER_API_KEY: string;

//   PORT: string;
// };

// const env: Env =
//   (dotenv.config().parsed as Env) ??
//   (() => {
//     throw new Error(".env file not found");
//   })();

// const slack = new WebClient(env.SLACK_API_TOKEN);

// const functions: Function[] = [
//   new WeatherDailyForecast(env.WEATHER_API_KEY),
// ];

// const assistant = new OpenAIAssistant(
//   env.OPENAI_API_KEY,
//   env.OPENAI_ASSISTANT_ID,
//   functions
// );
// const recognizer = new OpenAIAudio(env.OPENAI_API_KEY);
// const synthesizer = new VoiceVox(env.VOICEVOX_API_URL, env.VOICEVOX_SPEAKER_ID);

// const discordBot = new DiscordBot(
//   env.DISCORD_TOKEN,
//   assistant,
//   env.DISCORD_GUILD_ID,
//   env.DISCORD_TEXT_CHANNEL_ID,
//   env.DISCORD_ENABLE_VOICE
//     ? new DiscordBotVoiceExtension(
//         env.DISCORD_VOICE_CHANNEL_ID,
//         recognizer,
//         synthesizer
//       )
//     : undefined
// );

// runServer(parseInt(env.PORT) || 8080);

// discordBot.run();

import { program } from "commander";
import { serverCommand } from "./commands/server";

program.addCommand(serverCommand);

program.parse(process.argv);
