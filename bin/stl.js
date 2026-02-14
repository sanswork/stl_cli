#!/usr/bin/env node

import { program } from "commander";
import { loginCommand } from "../src/commands/login.js";
import { pullCommand } from "../src/commands/pull.js";
import { pushCommand } from "../src/commands/push.js";
import { publishCommand } from "../src/commands/publish.js";

program
  .name("stl")
  .description("StartTheLanding CLI - edit pages locally")
  .version("1.0.0");

program
  .command("login")
  .description("Configure API key and server URL")
  .option("-s, --server <url>", "Server URL")
  .option("-k, --key <apiKey>", "API key")
  .action(loginCommand);

program
  .command("pull <domain>")
  .description("Download all pages for a domain to local files")
  .action(pullCommand);

program
  .command("push [file]")
  .description("Upload changed HTML/CSS files to the server")
  .action(pushCommand);

program
  .command("publish [page]")
  .description("Compile and publish pages on the server")
  .option("-a, --all", "Publish all pages")
  .action(publishCommand);

program.parse();
