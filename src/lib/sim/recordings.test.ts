import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { FAULT_RECORDINGS, recordingMix, scenarioRecording } from "./recordings";

describe("uploaded fault recordings", () => {
  test("all seven recordings are available", () => {
    assert.deepEqual(FAULT_RECORDINGS.map((r) => r.id), ["cv", "alternator", "steering", "rod", "bearing", "vacuum", "misfire"]);
  });
  test("vacuum and misfire recordings match the relevant scenarios", () => {
    assert.equal(scenarioRecording("accord-vacuum-leak"), "vacuum");
    assert.equal(scenarioRecording("f150-misfire-coil"), "misfire");
    assert.equal(scenarioRecording("head-gasket-seep"), undefined);
  });
  test("electrical ground faults are not presented as alternator bearing faults", () => {
    assert.equal(scenarioRecording("high-resistance-ground"), undefined);
  });
  test("engine recordings stop with engine and wheel faults are silent stationary", () => {
    assert.equal(recordingMix("rod", false, 0, 0, 0).gain, 0);
    assert.equal(recordingMix("cv", true, 0, 800, 0).gain, 0);
    assert.equal(recordingMix("bearing", true, 35, 1800, 20).gain, 0.7);
  });
});