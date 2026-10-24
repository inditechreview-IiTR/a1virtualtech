import { spawn } from "node:child_process";
import { resolve } from "node:path";

// ProductOS currently appends --allowed-hosts all to the dev command, but
// Vite 8 removed that CLI option. Keep the intended sandbox preview behavior
// through the Vite config instead, and remove only the unsupported CLI flag.
const forwarded = process.argv.slice(2);
const args = [];
for (let i = 0; i < forwarded.length; i += 1) {
  if (forwarded[i] === "--allowed-hosts") {
    i += 1; // discard its value (usually "all")
    continue;
  }
  if (forwarded[i].startsWith("--allowed-hosts=")) continue;
  args.push(forwarded[i]);
}

const viteBin = resolve("node_modules/vite/bin/vite.js");
const child = spawn(process.execPath, [viteBin, ...args], {
  stdio: "inherit",
  env: process.env,
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}
child.on("error", (error) => {
  console.error("Unable to start Vite:", error.message);
  process.exitCode = 1;
});
child.on("exit", (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
