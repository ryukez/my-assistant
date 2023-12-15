import { GoogleAuth } from "google-auth-library";
import fetch from "node-fetch";
import { PassThrough, Readable } from "stream";

export class VoiceVox {
  constructor(private baseURL: string, private speaker: string) {}

  async getAuthorizationHeaderForGCloud() {
    const googleAuth = new GoogleAuth();
    const client = await googleAuth.getIdTokenClient(this.baseURL);

    const clientHeaders = await client.getRequestHeaders();
    return clientHeaders["Authorization"];
  }

  async synthesize(text: string): Promise<Readable> {
    const auth = await this.getAuthorizationHeaderForGCloud();

    const res = await fetch(
      `${this.baseURL}/audio_query?text=${text}&speaker=${this.speaker}`,
      {
        method: "POST",
        headers: {
          Authorization: auth,
          "Content-Type": "application/json",
        },
      }
    );

    const query = await res.json();

    const sound = await fetch(
      `${this.baseURL}/synthesis?speaker=${this.speaker}`,
      {
        method: "POST",
        headers: {
          Authorization: auth,
          "Content-Type": "application/json",
          accept: "audio/wav",
          responseType: "stream",
        },
        body: JSON.stringify(query),
      }
    );

    const rawStream = new PassThrough();
    sound.body?.pipe(rawStream);

    return rawStream;
  }
}
