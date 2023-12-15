import { OpusEncoder } from "@discordjs/opus";
import {
  EndBehaviorType,
  VoiceConnectionStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  joinVoiceChannel,
} from "@discordjs/voice";
import { Guild } from "discord.js";
import { Transform } from "stream";
import { FileWriter } from "wav";
import * as fs from "fs";
import { Recognizer, Synthesizer } from "../voice";

const VOICE_CONNECTION_TIMEOUT = 10e3; // timeout for voice connection to be ready. 10s
const INPUT_SAMPLING_RATE = 16000; // 16kHz
const INPUT_CHANNELS = 1; // mono
const INPUT_AFTER_SILENCE = 1000; // time to be judged as speech ended. 1s
const INPUT_NOISE_THRESHOLD_SIZE = 40000; // files within this size are regarded as noise and ignored. 40KB

export class DiscordBotVoiceExtension {
  public isReady = false;
  private audioPlayer = createAudioPlayer();

  constructor(
    private voiceChannelId: string,
    private recognizer: Recognizer,
    private synthesizer: Synthesizer
  ) {}

  async connectToVoiceChannel(
    guild: Guild,
    inputHandler: (text: string) => Promise<void>
  ) {
    const connection = joinVoiceChannel({
      guildId: guild.id,
      channelId: this.voiceChannelId,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: true,
    });

    await entersState(
      connection,
      VoiceConnectionStatus.Ready,
      VOICE_CONNECTION_TIMEOUT
    );

    console.log("Connected to voice channel!");

    connection.subscribe(this.audioPlayer);

    fs.mkdirSync("/tmp/my-assistant/voice/", { recursive: true });

    connection.receiver.speaking.on("start", (userId) => {
      const encoder = new OpusEncoder(INPUT_SAMPLING_RATE, INPUT_CHANNELS);

      const filename = `/tmp/my-assistant/voice/${Date.now()}.wav`;

      const audio = connection.receiver
        .subscribe(userId, {
          end: {
            behavior: EndBehaviorType.AfterSilence,
            duration: INPUT_AFTER_SILENCE,
          },
        })
        .pipe(new OpusDecodingStream({}, encoder))
        .pipe(
          new FileWriter(filename, {
            sampleRate: INPUT_SAMPLING_RATE,
            channels: INPUT_CHANNELS,
          })
        );

      audio.on("done", async () => {
        // Ignore noise
        const stat = fs.statSync(filename);
        if (stat.size < INPUT_NOISE_THRESHOLD_SIZE) return;

        const text = await this.recognizer.recognize(
          fs.createReadStream(filename)
        );

        await inputHandler(text);

        fs.unlinkSync(filename);
      });
    });

    this.isReady = true;
  }

  async playVoice(text: string) {
    const stream = await this.synthesizer.synthesize(text);
    this.audioPlayer.play(createAudioResource(stream));
  }
}

class OpusDecodingStream extends Transform {
  encoder;

  constructor(options: object, encoder: OpusEncoder) {
    super(options);
    this.encoder = encoder;
  }

  _transform(data: Buffer, encoding: string, callback: () => void) {
    this.push(this.encoder.decode(data));
    callback();
  }
}
