import { getForecast } from "./forecast";

const fetchMock = jest.spyOn(globalThis, "fetch");

afterEach(() => fetchMock.mockReset());

describe("getForecast", () => {
  it("asks for two days of hourly data in the city's time zone", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          utc_offset_seconds: 0,
          timezone: "Europe/Lisbon",
          hourly: {
            time: [],
            temperature_2m: [],
            apparent_temperature: [],
            precipitation_probability: [],
            wind_speed_10m: [],
            uv_index: [],
            weather_code: [],
          },
          daily: { time: [], sunrise: [], sunset: [] },
        }),
      ),
    );

    await getForecast({ latitude: 38.7, longitude: -9.1 });

    const url = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(url.searchParams.get("latitude")).toBe("38.7");
    expect(url.searchParams.get("longitude")).toBe("-9.1");
    expect(url.searchParams.get("timezone")).toBe("auto");
    expect(url.searchParams.get("forecast_days")).toBe("2");
    expect(url.searchParams.get("daily")).toBe("sunrise,sunset");
    expect(url.searchParams.get("hourly")?.split(",")).toEqual(
      expect.arrayContaining(["apparent_temperature", "precipitation_probability", "uv_index"]),
    );
  });
});
