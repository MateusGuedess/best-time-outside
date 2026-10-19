import { geocodingCitySchema, geocodingSearchSchema } from "./geocoding.schema";

const santaMaria = {
  id: 3450083,
  name: "Santa Maria",
  latitude: -29.68417,
  longitude: -53.80694,
  elevation: 146.0,
  feature_code: "PPLA2",
  country_code: "BR",
  timezone: "America/Sao_Paulo",
  population: 271735,
  country: "Brasil",
  admin1: "Rio Grande do Sul",
  admin2: "Santa Maria",
};

describe("geocodingCitySchema", () => {
  it("maps the API shape to the domain shape", () => {
    expect(geocodingCitySchema.parse(santaMaria)).toEqual({
      id: 3450083,
      name: "Santa Maria",
      latitude: -29.68417,
      longitude: -53.80694,
      region: "Rio Grande do Sul",
      country: "Brasil",
      countryCode: "BR",
    });
  });

  it("accepts a city without the optional fields", () => {
    const { admin1, country, country_code, ...minimal } = santaMaria;

    expect(geocodingCitySchema.parse(minimal)).toEqual({
      id: 3450083,
      name: "Santa Maria",
      latitude: -29.68417,
      longitude: -53.80694,
      region: undefined,
      country: undefined,
      countryCode: undefined,
    });
  });

  it("rejects a city without coordinates", () => {
    const { latitude, ...withoutLatitude } = santaMaria;

    expect(geocodingCitySchema.safeParse(withoutLatitude).success).toBe(false);
  });
});

describe("geocodingSearchSchema", () => {
  it("returns the list of cities", () => {
    expect(geocodingSearchSchema.parse({ results: [santaMaria] })).toHaveLength(1);
  });

  it("returns an empty list when the API omits results", () => {
    expect(geocodingSearchSchema.parse({ generationtime_ms: 0.14 })).toEqual([]);
  });

  it("rejects the whole response when a city is malformed", () => {
    const result = geocodingSearchSchema.safeParse({ results: [{ ...santaMaria, id: "x" }] });

    expect(result.success).toBe(false);
  });
});
