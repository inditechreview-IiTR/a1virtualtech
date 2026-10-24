// These files are bundled in public/audio so playback works independently of the
// original Lovable project and its private asset proxy.
const cv = { url: "/audio/bad_CV_joint.mp3" };
const alternator = { url: "/audio/bad_alternator.mp3" };
const steering = { url: "/audio/bad_power_steering_pump.mp3" };
const rod = { url: "/audio/bad_rod_knock.mp3" };
const bearing = { url: "/audio/bad_wheel_bearing.mp3" };
const vacuum = { url: "/audio/intake_vacuum_leak.mp3" };
const misfire = { url: "/audio/misfire.mp3" };

export const FAULT_RECORDINGS = [
  { id: "cv", label: "CV joint clicking", url: cv.url, kind: "wheel" },
  { id: "alternator", label: "Alternator noise", url: alternator.url, kind: "engine" },
  { id: "steering", label: "Power steering pump", url: steering.url, kind: "engine" },
  { id: "rod", label: "Rod knock", url: rod.url, kind: "engine" },
  { id: "bearing", label: "Wheel bearing", url: bearing.url, kind: "wheel" },
  { id: "vacuum", label: "Intake vacuum leak", url: vacuum.url, kind: "vacuum" },
  { id: "misfire", label: "Engine misfire", url: misfire.url, kind: "engine" },
] as const;

export type RecordingId = (typeof FAULT_RECORDINGS)[number]["id"];
export type RecordingStatus = "idle" | "loading" | "ready" | "error";

// Match the actual diagnosis, not a shared legacy synthetic audio profile.
export function scenarioRecording(scenarioId: string): RecordingId | undefined {
  if (scenarioId === "accord-vacuum-leak") return "vacuum";
  if (scenarioId === "f150-misfire-coil") return "misfire";
  return undefined;
}

export function recordingMix(
  id: RecordingId,
  running: boolean,
  speed: number,
  rpm: number,
  throttle: number,
) {
  const recording = FAULT_RECORDINGS.find((item) => item.id === id);
  const wheel = recording?.kind === "wheel";
  const activity = wheel ? Math.min(1, Math.max(0, speed) / 25) : running ? 1 : 0;
  // Small changes preserve the recorded acoustic signature; these are reference
  // recordings, not vehicle-specific RPM-calibrated recordings.
  const rate = wheel
    ? Math.min(1.15, Math.max(0.85, speed / 35))
    : id === "vacuum"
      ? 1
      : Math.min(1.15, Math.max(0.9, rpm / 1400));
  const gain =
    activity * (id === "vacuum" ? 0.65 - Math.min(100, Math.max(0, throttle)) * 0.003 : 0.7);
  return { gain, rate };
}
