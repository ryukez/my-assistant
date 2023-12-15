import fetch from "node-fetch";

export class WeatherDailyForecast {
  name = "weather.daily_forecast";

  constructor(private apiKey: string) {}

  async call(): Promise<string> {
    const url = `http://api.weatherapi.com/v1/forecast.json?key=${this.apiKey}&q=Tokyo&days=1&aqi=no&alerts=no`;

    const resp = await fetch(url);
    const json = await resp.json();

    const day = json["forecast"]["forecastday"][0]["day"];

    return JSON.stringify({
      weather: day["condition"]["text"],
      minTemperature: day["mintemp_c"],
      maxTemperature: day["maxtemp_c"],
      rainProbability: day["daily_will_it_rain"],
    });
  }
}
