import { getCity, searchCities } from "./geocoding";

const fetchMock = jest.spyOn(globalThis, "fetch");

const lisbon = {
  id: 2267057,
  name: "Lisboa",
  latitude: 38.71667,
  longitude: -9.13333,
  country_code: "PT",
  country: "Portugal",
  admin1: "Lisboa",
};

function respondWith(body: unknown) {
  fetchMock.mockResolvedValue(new Response(JSON.stringify(body)));
}

function requestedUrl() {
  return new URL(String(fetchMock.mock.calls[0]?.[0]));
}

afterEach(() => fetchMock.mockReset());

describe("searchCities", () => {
  it("queries the search endpoint with the term and the app language", async () => {
    respondWith({ results: [lisbon] });

    await searchCities("lisboa", "pt");

    const url = requestedUrl();
    expect(url.pathname).toBe("/v1/search");
    expect(url.searchParams.get("name")).toBe("lisboa");
    expect(url.searchParams.get("language")).toBe("pt");
  });

  it("encodes terms with spaces and accents", async () => {
    respondWith({ results: [] });

    await searchCities("São Paulo", "pt");

    expect(requestedUrl().searchParams.get("name")).toBe("São Paulo");
  });

  it("returns domain cities", async () => {
    respondWith({ results: [lisbon] });

    await expect(searchCities("lisboa", "pt")).resolves.toEqual([
      expect.objectContaining({ id: 2267057, countryCode: "PT", region: "Lisboa" }),
    ]);
  });

  it("forwards the abort signal to fetch", async () => {
    respondWith({ results: [] });
    const controller = new AbortController();
    controller.abort();

    await searchCities("lisboa", "pt", controller.signal);

    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.signal?.aborted).toBe(true);
  });
});

describe("getCity", () => {
  it("queries the get endpoint by id", async () => {
    respondWith(lisbon);

    await expect(getCity(2267057, "en")).resolves.toMatchObject({ id: 2267057 });

    const url = requestedUrl();
    expect(url.pathname).toBe("/v1/get");
    expect(url.searchParams.get("id")).toBe("2267057");
    expect(url.searchParams.get("language")).toBe("en");
  });
});
