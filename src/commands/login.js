import { createInterface } from "readline";
import { loadConfig, saveConfig } from "../lib/config.js";

function prompt(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export async function loginCommand(opts) {
  const existing = loadConfig() || {};

  const server =
    opts.server ||
    (await prompt(
      `Server URL [${existing.server || "https://app.startthelanding.com"}]: `
    )) ||
    existing.server ||
    "https://app.startthelanding.com";

  const apiKey =
    opts.key ||
    (await prompt("API Key: "));

  if (!apiKey) {
    console.error("API key is required.");
    process.exit(1);
  }

  if (!apiKey.startsWith("stl_api_")) {
    console.error(
      'Invalid API key format. Keys should start with "stl_api_".'
    );
    process.exit(1);
  }

  saveConfig({ server, apiKey });
  console.log(`Saved config. Server: ${server}`);
}
