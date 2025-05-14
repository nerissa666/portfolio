import { z } from "zod";
import { CompleteToolCallPayload } from "@/app/db/redis";
import { ReactNode } from "react";

const paramsSchema = z.object({
  location: z
    .string()
    .describe("The city or location to get weather for, in English only"),
  units: z
    .enum(["metric", "imperial"])
    .default("metric")
    .describe("Units of measurement (metric or imperial)"),
});

export type ParamsType = z.infer<typeof paramsSchema>;

export const specs = {
  description: "A tool to get current weather information for a location",
  parameters: paramsSchema,
};

async function getWeatherData(location: string, units: string) {
  // First, get the coordinates for the location
  const geoResponse = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      location
    )}&count=1`
  );

  if (!geoResponse.ok) {
    throw new Error("Failed to find location");
  }

  const geoData = await geoResponse.json();
  if (!geoData.results?.[0]) {
    throw new Error("Location not found");
  }

  const { latitude, longitude } = geoData.results[0];

  // Then get the weather data
  const weatherResponse = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&wind_speed_unit=${
      units === "metric" ? "ms" : "mph"
    }&temperature_unit=${units === "metric" ? "celsius" : "fahrenheit"}`
  );

  if (!weatherResponse.ok) {
    throw new Error("Failed to fetch weather data");
  }

  const weatherData = await weatherResponse.json();
  const current = weatherData.current;

  return {
    temperature: Math.round(current.temperature_2m),
    description: getWeatherDescription(current.weather_code),
    humidity: current.relative_humidity_2m,
    windSpeed: Math.round(current.wind_speed_10m),
    icon: getWeatherIcon(current.weather_code),
  };
}

function getWeatherIcon(code: number): string {
  // WMO Weather interpretation codes (WW)
  // https://open-meteo.com/en/docs
  if (code === 0) return "☀️"; // Clear sky
  if (code >= 1 && code <= 3) return "☁️"; // Partly cloudy
  if (code >= 45 && code <= 48) return "🌫️"; // Fog
  if (code >= 51 && code <= 55) return "🌧️"; // Drizzle
  if (code >= 56 && code <= 57) return "🌨️"; // Freezing drizzle
  if (code >= 61 && code <= 65) return "🌧️"; // Rain
  if (code >= 66 && code <= 67) return "🌨️"; // Freezing rain
  if (code >= 71 && code <= 77) return "❄️"; // Snow
  if (code >= 80 && code <= 82) return "🌧️"; // Rain showers
  if (code >= 85 && code <= 86) return "🌨️"; // Snow showers
  if (code >= 95 && code <= 99) return "⛈️"; // Thunderstorm
  return "❓"; // Unknown
}

function getWeatherDescription(code: number): string {
  // WMO Weather interpretation codes (WW)
  // https://open-meteo.com/en/docs
  if (code === 0) return "Clear sky";
  if (code >= 1 && code <= 3) return "Partly cloudy";
  if (code >= 45 && code <= 48) return "Foggy";
  if (code >= 51 && code <= 55) return "Drizzle";
  if (code >= 56 && code <= 57) return "Freezing drizzle";
  if (code >= 61 && code <= 65) return "Rain";
  if (code >= 66 && code <= 67) return "Freezing rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Rain showers";
  if (code >= 85 && code <= 86) return "Snow showers";
  if (code >= 95 && code <= 99) return "Thunderstorm";
  return "Unknown";
}

export async function execute(
  args: ParamsType,
  completeToolCallServerAction: (
    payload: CompleteToolCallPayload
  ) => Promise<ReactNode>,
  {
    toolCallId,
    toolCallGroupId,
  }: {
    toolCallId: string;
    toolCallGroupId: string;
  }
) {
  try {
    const weatherData = await getWeatherData(args.location, args.units);
    const node = await completeToolCallServerAction({
      toolCallGroupId,
      toolCallId,
      result: weatherData,
    });

    return (
      <>
        {node}
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">
            Weather in {args.location}
          </h3>
          <div className="flex items-center gap-4">
            <span className="text-4xl">{weatherData.icon}</span>
            <div>
              <p className="text-2xl font-bold">
                {weatherData.temperature}°{args.units === "metric" ? "C" : "F"}
              </p>
              <p className="text-gray-600 capitalize">
                {weatherData.description}
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Humidity</p>
              <p className="font-medium">{weatherData.humidity}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Wind Speed</p>
              <p className="font-medium">
                {weatherData.windSpeed}{" "}
                {args.units === "metric" ? "m/s" : "mph"}
              </p>
            </div>
          </div>
        </div>
      </>
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch weather data";
    await completeToolCallServerAction({
      toolCallGroupId: "",
      toolCallId: "",
      result: { error: errorMessage },
    });
    return <div className="text-red-500">{errorMessage}</div>;
  }
}
