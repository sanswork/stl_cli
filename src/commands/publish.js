import { readFileSync, existsSync } from "fs";
import { requireConfig } from "../lib/config.js";
import { createClient } from "../lib/api.js";

export async function publishCommand(page, opts) {
  const config = requireConfig();

  // Find .stl.json in current directory
  if (!existsSync(".stl.json")) {
    console.error(
      "No .stl.json found. Run `stl pull <domain>` first, then cd into the domain directory."
    );
    process.exit(1);
  }

  const meta = JSON.parse(readFileSync(".stl.json", "utf-8"));
  const api = createClient(meta.server || config.server, config.apiKey);

  if (opts.all) {
    // Publish all pages
    const names = Object.keys(meta.pages);
    console.log(`Publishing ${names.length} page(s)...`);

    for (const name of names) {
      await publishOne(api, meta.pages[name], name);
    }
  } else if (page) {
    // Publish a specific page
    const pageInfo = meta.pages[page];
    if (!pageInfo) {
      console.error(
        `Page "${page}" not found. Known pages: ${Object.keys(meta.pages).join(", ")}`
      );
      process.exit(1);
    }
    await publishOne(api, pageInfo, page);
  } else {
    console.error("Specify a page name or use --all to publish all pages.");
    console.log(
      `Available pages: ${Object.keys(meta.pages).join(", ")}`
    );
    process.exit(1);
  }
}

async function publishOne(api, pageInfo, name) {
  try {
    await api.publishPage(pageInfo.id);
    console.log(`Published: ${pageInfo.name} (${name})`);
  } catch (err) {
    console.error(`Failed to publish ${name}: ${err.message}`);
  }
}
