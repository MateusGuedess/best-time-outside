import { addHours, cityNow, fromMinutes, toMinutes } from "./localTime";

describe("cityNow", () => {
  it("returns the wall clock time of the city, not of the device", () => {
    const fourteenTenInSaoPaulo = Date.UTC(2026, 9, 18, 17, 10);

    expect(cityNow(fourteenTenInSaoPaulo, -3 * 3600)).toEqual({
      date: "2026-10-18",
      hour: 14,
      minute: 10,
    });
    expect(cityNow(fourteenTenInSaoPaulo, 1 * 3600)).toEqual({
      date: "2026-10-18",
      hour: 18,
      minute: 10,
    });
  });

  it("moves to the next day when the city is already past midnight", () => {
    const lateEveningUtc = Date.UTC(2026, 9, 18, 23, 30);

    expect(cityNow(lateEveningUtc, 2 * 3600)).toEqual({ date: "2026-10-19", hour: 1, minute: 30 });
  });
});

describe("addHours", () => {
  it("rolls over to the next day", () => {
    expect(addHours({ date: "2026-10-18", hour: 23, minute: 0 }, 1)).toEqual({
      date: "2026-10-19",
      hour: 0,
      minute: 0,
    });
  });
});

describe("toMinutes / fromMinutes", () => {
  it("round-trips a local time", () => {
    const time = { date: "2026-02-28", hour: 23, minute: 59 };

    expect(fromMinutes(toMinutes(time))).toEqual(time);
  });
});
