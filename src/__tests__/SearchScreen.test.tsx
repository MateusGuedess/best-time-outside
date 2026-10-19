import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import { fireEvent, renderRouter, screen } from "expo-router/testing-library";

import CityScreen from "@/app/city/[id]";
import SearchScreen from "@/app/index";
import { getCity, searchCities } from "@/services/geocoding";
import { NetworkError } from "@/services/http";
import { loadRecentCities, saveRecentCities } from "@/services/recentCities";
import {
  clearTestQueryClients,
  createQueryWrapper,
  createTestQueryClient,
} from "@/test/queryWrapper";
import type { City } from "@/types/city";

jest.mock("@/services/geocoding");

const searchCitiesMock = jest.mocked(searchCities);
const getCityMock = jest.mocked(getCity);

const lisbon: City = {
  id: 2267057,
  name: "Lisboa",
  latitude: 38.71667,
  longitude: -9.13333,
  region: "Lisboa",
  country: "Portugal",
  countryCode: "PT",
};

async function renderApp() {
  await renderRouter(
    {
      _layout: () => <Stack />,
      index: SearchScreen,
      "city/[id]": CityScreen,
    },
    { initialUrl: "/", wrapper: createQueryWrapper(createTestQueryClient()) },
  );
}

async function typeSearch(term: string) {
  await fireEvent.changeText(screen.getByLabelText("Buscar cidade"), term);
}

afterEach(async () => {
  clearTestQueryClients();
  searchCitiesMock.mockReset();
  getCityMock.mockReset();
  await AsyncStorage.clear();
});

describe("SearchScreen", () => {
  it("explains the app before the first search", async () => {
    await renderApp();

    expect(await screen.findByText(/Digite o nome de uma cidade/)).toBeOnTheScreen();
  });

  it("opens the selected city from the cache and saves it as recent", async () => {
    searchCitiesMock.mockResolvedValue([lisbon]);
    await renderApp();

    await typeSearch("lisboa");
    await fireEvent.press(await screen.findByLabelText("Lisboa, Lisboa, Portugal"));

    expect(await screen.findByRole("header", { name: "Lisboa" })).toBeOnTheScreen();
    expect(getCityMock).not.toHaveBeenCalled();
    expect(await loadRecentCities()).toEqual([lisbon]);
  });

  it("shows the recent cities while the field is empty", async () => {
    await saveRecentCities([lisbon]);

    await renderApp();

    expect(await screen.findByText("Buscas recentes")).toBeOnTheScreen();
    expect(screen.getByText("Lisboa, Portugal")).toBeOnTheScreen();
  });

  it("tells when no city matches the term", async () => {
    searchCitiesMock.mockResolvedValue([]);
    await renderApp();

    await typeSearch("xqzxqz");

    expect(await screen.findByText("Nenhuma cidade encontrada para “xqzxqz”.")).toBeOnTheScreen();
  });

  it("shows loading instead of an outdated empty result while the next search runs", async () => {
    searchCitiesMock.mockResolvedValueOnce([]).mockReturnValueOnce(new Promise(() => {}));
    await renderApp();

    await typeSearch("xqz");
    expect(await screen.findByText("Nenhuma cidade encontrada para “xqz”.")).toBeOnTheScreen();

    await typeSearch("xqzab");

    expect(await screen.findByText("Buscando cidades…")).toBeOnTheScreen();
    expect(screen.queryByText("Nenhuma cidade encontrada para “xqzab”.")).not.toBeOnTheScreen();
  });

  it("shows the connection error and retries on demand", async () => {
    searchCitiesMock.mockRejectedValueOnce(new NetworkError()).mockResolvedValueOnce([lisbon]);
    await renderApp();

    await typeSearch("lisboa");
    expect(await screen.findByText("Sem conexão. Verifique sua internet.")).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(await screen.findByLabelText("Lisboa, Lisboa, Portugal")).toBeOnTheScreen();
  });

  it("shows loading while retrying a failed search", async () => {
    searchCitiesMock
      .mockRejectedValueOnce(new NetworkError())
      .mockReturnValueOnce(new Promise(() => {}));
    await renderApp();

    await typeSearch("lisboa");
    await fireEvent.press(await screen.findByRole("button", { name: "Tentar novamente" }));

    expect(await screen.findByText("Buscando cidades…")).toBeOnTheScreen();
    expect(screen.queryByText("Sem conexão. Verifique sua internet.")).not.toBeOnTheScreen();
  });
});
