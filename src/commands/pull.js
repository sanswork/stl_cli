import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { requireConfig } from "../lib/config.js";
import { createClient } from "../lib/api.js";

export async function pullCommand(domainName) {
  const config = requireConfig();
  const api = createClient(config.server, config.apiKey);

  // Find the domain
  console.log(`Looking up domain "${domainName}"...`);
  const domain = await api.getDomainByName(domainName);

  if (!domain) {
    console.error(`Domain "${domainName}" not found.`);
    process.exit(1);
  }

  // Get all pages
  const pages = await api.listPages(domain.id);

  if (pages.length === 0) {
    console.log("No pages found for this domain.");
    return;
  }

  // Create directory
  const dir = domainName;
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  // Build page mapping and write files
  const pageMap = {};

  for (const page of pages) {
    const attrs = page.attributes;
    const name = slugify(attrs.name);
    pageMap[name] = {
      id: page.id,
      name: attrs.name,
      path: attrs.path,
      isActive: attrs.is_active,
    };

    // Write HTML file
    const htmlFile = join(dir, `${name}.html`);
    writeFileSync(htmlFile, attrs.html || "");
    console.log(`  ${htmlFile}`);

    // Write CSS file
    const cssFile = join(dir, `${name}.css`);
    writeFileSync(cssFile, attrs.css || "");
    console.log(`  ${cssFile}`);
  }

  // Write metadata
  const meta = {
    domainId: domain.id,
    domainName: domainName,
    server: config.server,
    pages: pageMap,
  };
  writeFileSync(join(dir, ".stl.json"), JSON.stringify(meta, null, 2) + "\n");

  console.log(
    `\nPulled ${pages.length} page(s) to ./${dir}/`
  );
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
