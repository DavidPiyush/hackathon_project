import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, appendFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Make sure SESSION_SECRET exists before dev or build.
 *
 * Without this, a fresh clone builds fine and then fails at the moment someone
 * tries to sign in: `next start` runs with NODE_ENV=production, the session
 * module refuses to sign with the development fallback, and the user sees
 * "UNEXPECTED ERROR" while the real reason sits in the server log. That reads
 * as "the app is broken" rather than "one variable is unset".
 *
 * So the secret is generated on first run and written to `.env.local`, which
 * is gitignored. Idempotent: an existing value is never overwritten.
 *
 * A hosted deployment sets SESSION_SECRET in its own environment; this script
 * then finds it already present and does nothing.
 */

const ENV_PATH = join(process.cwd(), ".env.local");
const KEY = "SESSION_SECRET";

function hasSecret(contents) {
  return contents
    .split(/\r?\n/)
    .some((line) => {
      const match = line.match(/^\s*SESSION_SECRET\s*=\s*(.*)$/);

      // A present-but-empty assignment is not a secret.
      return match ? match[1].trim().length >= 32 : false;
    });
}

// Already provided by the environment (CI, Vercel, Docker) — nothing to do.
if (process.env[KEY] && process.env[KEY].length >= 32) {
  process.exit(0);
}

const secret = randomBytes(32).toString("base64");

if (!existsSync(ENV_PATH)) {
  writeFileSync(
    ENV_PATH,
    [
      "# Generated automatically on first run. Safe to edit.",
      "# This file is gitignored and must not be committed.",
      "",
      `${KEY}=${secret}`,
      "",
      "# Origin of the FastAPI backend, e.g. http://localhost:8000",
      "# Leave blank to run the console self-contained.",
      "NEXT_PUBLIC_API_URL=",
      "",
    ].join("\n"),
  );

  console.log(`[setup] created .env.local with a generated ${KEY}`);
  process.exit(0);
}

const contents = readFileSync(ENV_PATH, "utf8");

if (hasSecret(contents)) {
  process.exit(0);
}

// The file exists but the key is missing or too short — append rather than
// rewrite, so nothing the developer put there is lost.
appendFileSync(
  ENV_PATH,
  `${contents.endsWith("\n") ? "" : "\n"}\n# Generated automatically because it was missing.\n${KEY}=${secret}\n`,
);

console.log(`[setup] added a generated ${KEY} to .env.local`);
