import { forecastSchema } from "./forecast.schema";

const response = {
  latitude: -23.37,
  longitude: -45,
  utc_offset_seconds: -10800,
  timezone: "America/Sao_Paulo",
  hourly_units: { time: "iso8601" },
  hourly: {
    time: ["2026-10-18T14:00", "2026-10-18T15:00"],
    temperature_2m: [21.3, 22.1],
    apparent_temperature: [25.4, 26.7],
    precipitation_probability: [75, 80],
    wind_speed_10m: [2.4, 5.8],
    uv_index: [8.7, 7],
    weather_code: [53, 51],
  },
  daily: {
    time: ["2026-10-18"],
    sunrise: ["2026-10-18T05:24"],
    sunset: ["2026-10-18T18:06"],
  },
};

describe("forecastSchema", () => {
  it("turns the parallel hourly arrays into one object per hour", () => {
    const { hours } = forecastSchema.parse(response);

    expect(hours).toEqual([
      {
        time: { date: "2026-10-18", hour: 14, minute: 0 },
        temperature: 21.3,
        apparentTemperature: 25.4,
        precipitationProbability: 75,
        windSpeed: 2.4,
        uvIndex: 8.7,
        weatherCode: 53,
      },
      expect.objectContaining({ time: { date: "2026-10-18", hour: 15, minute: 0 } }),
    ]);
  });

  it("keeps times in the city's local time, without converting to the device time zone", () => {
    const forecast = forecastSchema.parse(response);

    expect(forecast.utcOffsetSeconds).toBe(-10800);
    expect(forecast.timezone).toBe("America/Sao_Paulo");
    expect(forecast.days).toEqual([
      {
        date: "2026-10-18",
        sunrise: { date: "2026-10-18", hour: 5, minute: 24 },
        sunset: { date: "2026-10-18", hour: 18, minute: 6 },
      },
    ]);
  });

  it("rejects hourly arrays of different lengths instead of shifting data", () => {
    const shifted = {
      ...response,
      hourly: { ...response.hourly, uv_index: [8.7] },
    };

    expect(forecastSchema.safeParse(shifted).success).toBe(false);
  });

  it("drops hours with a missing value and keeps the rest", () => {
    const withNull = {
      ...response,
      hourly: { ...response.hourly, apparent_temperature: [25.4, null] },
    };

    const { hours } = forecastSchema.parse(withNull);

    expect(hours.map(({ time }) => time.hour)).toEqual([14]);
  });

  it("drops days without sunrise or sunset", () => {
    const polar = {
      ...response,
      daily: { time: ["2026-10-18"], sunrise: [null], sunset: ["2026-10-18T18:06"] },
    };

    expect(forecastSchema.parse(polar).days).toEqual([]);
  });

  it("rejects times that are not in the local ISO format", () => {
    const withOffset = {
      ...response,
      hourly: { ...response.hourly, time: ["2026-10-18T14:00Z", "2026-10-18T15:00Z"] },
    };

    expect(forecastSchema.safeParse(withOffset).success).toBe(false);
  });
});
