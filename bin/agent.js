#!/usr/bin/env node
import { existsSync } from "node:fs";
import path from "node:path";

const envFile = path.join(import.meta.dirname, "..", ".env");
if (existsSync(envFile)) process.loadEnvFile(envFile);

await import("../src/index.ts");
