import { readFileSync, existsSync, readdirSync } from "fs";
import { join, extname, basename } from "path";
import { requireConfig } from "../lib/config.js";
import { createClient } from "../lib/api.js";

export async function pushCommand(file) {
  const config = requireConfig();

  // Find .stl.json in current directory
  const metaPath = findMetaFile();
  if (!metaPath) {
    console.error(
      "No .stl.json found. Run `stl pull <domain>` first, then cd into the domain directory."
    );
    process.exit(1);
  }

  const meta = JSON.parse(readFileSync(metaPath, "utf-8"));
  const api = createClient(meta.server || config.server, config.apiKey);

  if (file) {
    // Push a specific file
    await pushFile(api, meta, file);
  } else {
    // Push all html/css files in the directory
    const dir = metaPath.replace("/.stl.json", "").replace(".stl.json", ".") ;
    const files = readdirSync(dir === "." ? "." : dir).filter(
      (f) => f.endsWith(".html") || f.endsWith(".css")
    );

    if (files.length === 0) {
      console.log("No .html or .css files found.");
      return;
    }

    for (const f of files) {
      const filePath = dir === "." ? f : join(dir, f);
      await pushFile(api, meta, filePath);
    }
  }
}

async function pushFile(api, meta, filePath) {
  if (!existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }

  const ext = extname(filePath);
  if (ext !== ".html" && ext !== ".css") {
    console.error(`Skipping ${filePath} (not .html or .css)`);
    return;
  }

  const name = basename(filePath, ext);
  const pageInfo = meta.pages[name];

  if (!pageInfo) {
    console.error(
      `No page mapping found for "${name}". Known pages: ${Object.keys(meta.pages).join(", ")}`
    );
    return;
  }

  const content = readFileSync(filePath, "utf-8");
  const attr = ext === ".html" ? "html" : "css";

  try {
    await api.updatePage(pageInfo.id, { [attr]: content });
    console.log(`Pushed ${filePath} -> ${pageInfo.name} (${attr})`);
  } catch (err) {
    console.error(`Failed to push ${filePath}: ${err.message}`);
  }
}

function findMetaFile() {
  // Check current directory
  if (existsSync(".stl.json")) return ".stl.json";

  // Check if we're inside a pulled directory (parent has it)
  // Not going up - user should cd into the domain directory
  return null;
}
