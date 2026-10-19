/// <reference types="bun" />
import { describe, expect, test } from "bun:test";
import { FAULT_RECORDINGS, recordingMix, scenarioRecording } from "./recordings";

describe("uploaded fault recordings", () => {
  test("all seven recordings are available", () => {
    expect(FAULT_RECORDINGS.map((r) => r.id)).toEqual(["cv", "alternator", "steering", "rod", "bearing", "vacuum", "misfire"]);
  });
  test("vacuum and misfire recordings match the relevant scenarios", () => {
    expect(scenarioRecording("accord-vacuum-leak")).toBe("vacuum");
    expect(scenarioRecording("f150-misfire-coil")).toBe("misfire");
  });
  test("electrical ground faults are not presented as alternator bearing faults", () => {
    expect(scenarioRecording("high-resistance-ground")).toBeUndefined();
  });
  test("engine recordings stop with engine and wheel faults are silent stationary", () => {
    expect(recordingMix("rod", false, 0, 0, 0).gain).toBe(0);
    expect(recordingMix("cv", true, 0, 800, 0).gain).toBe(0);
    expect(recordingMix("bearing", true, 35, 1800, 20).gain).toBe(0.7);
  });
});