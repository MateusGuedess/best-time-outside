import { Stack } from "expo-router";
import { fireEvent, renderRouter, screen } from "expo-router/testing-library";

import CityScreen from "@/app/city/[id]";
import { getForecast } from "@/services/forecast";
import { getCity } from "@/services/geocoding";
import { NetworkError } from "@/services/http";
import { twoDayForecast } from "@/test/forecastFactory";
import {
  clearTestQueryClients,
  createQueryWrapper,
  createTestQueryClient,
} from "@/test/queryWrapper";
import type { City } from "@/types/city";

jest.mock("@/services/geocoding");
jest.mock("@/services/forecast");

const getCityMock = jest.mocked(getCity);
const getForecastMock = jest.mocked(getForecast);

const ubatuba: City = {
  id: 3445831,
  name: "Ubatuba",
  latitude: -23.43389,
  longitude: -45.07111,
  region: "São Paulo",
  country: "Brasil",
  countryCode: "BR",
};

const RAIN = { precipitationProbability: 90 };

async function renderCity() {
  await renderRouter(
    { _layout: () => <Stack />, "city/[id]": CityScreen },
    {
      initialUrl: `/city/${ubatuba.id}`,
      wrapper: createQueryWrapper(createTestQueryClient()),
    },
  );
}

beforeEach(() => {
  jest.spyOn(Date, "now").mockReturnValue(Date.parse("2026-10-18T12:30:00-03:00"));
  getCityMock.mockResolvedValue(ubatuba);
});

afterEach(() => {
  clearTestQueryClients();
  jest.restoreAllMocks();
  getCityMock.mockReset();
  getForecastMock.mockReset();
});

describe("CityScreen", () => {
  it("shows the best window of the day and avoids the rainy night", async () => {
    getForecastMock.mockResolvedValue(
      twoDayForecast((date, hour) => {
        const isRainyNight = date === "2026-10-18" ? hour >= 19 : hour < 2;
        return isRainyNight ? RAIN : {};
      }),
    );

    await renderCity();

    expect(await screen.findByText("Durante o dia")).toBeOnTheScreen();
    expect(screen.getByText("★ Melhor do dia")).toBeOnTheScreen();
    expect(screen.getAllByText("Domingo, 18 de outubro")).toHaveLength(2);
    expect(screen.getByLabelText("Ótimo")).toBeOnTheScreen();
    expect(screen.getByText("Entre 12h e 16h")).toBeOnTheScreen();
    expect(screen.getByText("Baixa chance de chuva")).toBeOnTheScreen();
    expect(screen.getByLabelText("Evite")).toBeOnTheScreen();
    expect(screen.getByText("Restaurante aconchegante")).toBeOnTheScreen();
  });

  it("shows the region and country so homonymous cities are told apart", async () => {
    getForecastMock.mockResolvedValue(twoDayForecast(() => ({})));

    await renderCity();

    await screen.findByText("Durante o dia");
    expect(screen.getAllByText("São Paulo, Brasil").length).toBeGreaterThan(0);
  });

  it("scrolls the hours sideways on every page", async () => {
    getForecastMock.mockResolvedValue(twoDayForecast());

    await renderCity();

    await screen.findByText("Durante o dia");
    const strips = screen.getAllByTestId("hour-strip");
    expect(strips).toHaveLength(2);
    strips.forEach((strip) => expect(strip).toHaveProp("horizontal", true));
  });

  it("explains how an hour was scored when it is tapped", async () => {
    getForecastMock.mockResolvedValue(twoDayForecast());

    await renderCity();

    await screen.findByText("Durante o dia");
    await fireEvent.press(screen.getAllByLabelText("13h, horário recomendado")[0]!);

    expect(await screen.findByText("Nota 100 de 100")).toBeOnTheScreen();
    expect(screen.getByText("Dentro do horário recomendado")).toBeOnTheScreen();
    expect(screen.getByText("Nota final")).toBeOnTheScreen();

    await fireEvent.press(screen.getAllByLabelText("Fechar")[0]!);

    expect(screen.queryByText("Nota final")).not.toBeOnTheScreen();
  });

  it("asks for the forecast with the city coordinates", async () => {
    getForecastMock.mockResolvedValue(twoDayForecast());

    await renderCity();

    await screen.findByText("Durante o dia");
    expect(getForecastMock).toHaveBeenCalledWith(
      { latitude: ubatuba.latitude, longitude: ubatuba.longitude },
      expect.any(AbortSignal),
    );
  });

  it("keeps the city name and offers a retry when the forecast fails", async () => {
    getForecastMock.mockRejectedValue(new NetworkError());

    await renderCity();

    expect(await screen.findByText("Tentar novamente")).toBeOnTheScreen();
    expect(screen.getByRole("header", { name: "Ubatuba" })).toBeOnTheScreen();
  });
});
