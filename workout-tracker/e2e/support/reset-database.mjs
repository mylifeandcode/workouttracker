// @ts-check
/*
 * Drops the E2E database so the API rebuilds it from scratch on boot.
 *
 * This runs as the first half of the API's webServer command in playwright.config.ts
 * (`node e2e/support/reset-database.mjs && dotnet run ...`) rather than from Playwright's
 * globalSetup, because globalSetup runs *after* webServer processes have started — by which
 * point the API has already migrated and seeded whatever database it was pointed at.
 *
 * It reads the same ConnectionStrings__WorkoutTrackerDatabase value the API is about to use,
 * so the two can never disagree about which database is in play.
 *
 * Plain .mjs (not .ts) with no dependencies, because it has to run under bare `node` before
 * any test tooling is involved.
 */

import { execFileSync } from 'node:child_process';

const connectionString = process.env['ConnectionStrings__WorkoutTrackerDatabase'];

if (!connectionString) {
  fail('ConnectionStrings__WorkoutTrackerDatabase is not set. This script is meant to be run by the Playwright webServer command.');
}

const server = readSetting(connectionString, ['server', 'data source']);
const database = readSetting(connectionString, ['database', 'initial catalog']);
const userId = readSetting(connectionString, ['user id', 'uid']);
const password = readSetting(connectionString, ['password', 'pwd']);

if (!server) fail(`Could not read a server from the connection string: ${connectionString}`);
if (!database) fail(`Could not read a database name from the connection string: ${connectionString}`);

/*
 * Guard rails. This script drops an entire database, so it refuses anything that doesn't
 * look unmistakably like a throwaway E2E database unless explicitly overridden.
 */
if (!/^[A-Za-z0-9_]+$/.test(database)) {
  fail(`Refusing to drop database "${database}": the name must be plain alphanumerics/underscores.`);
}

if (!/e2e/i.test(database) && process.env['E2E_ALLOW_UNSAFE_DB_RESET'] !== '1') {
  fail(
    `Refusing to drop database "${database}" because its name does not contain "E2E".\n` +
    `  This guard exists so a mistyped E2E_DB_CONNECTION can't destroy your dev database.\n` +
    `  If you really mean it, set E2E_ALLOW_UNSAFE_DB_RESET=1.`
  );
}

const sql = `
IF DB_ID(N'${database}') IS NOT NULL
BEGIN
    ALTER DATABASE [${database}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE [${database}];
END`;

const args = ['-S', server, '-d', 'master', '-b', '-Q', sql];
if (userId && password) {
  args.push('-U', userId, '-P', password);
} else {
  args.push('-E'); //Trusted connection
}

console.log(`[db-reset] Dropping ${database} on ${server}...`);

try {
  execFileSync('sqlcmd', args, { stdio: ['ignore', 'pipe', 'pipe'] });
} catch (error) {
  if (error && error.code === 'ENOENT') {
    fail('sqlcmd was not found on PATH. Install the SQL Server command line tools, or set E2E_DB_CONNECTION to a server you can reach with sqlcmd.');
  }

  const details = [error?.stdout?.toString(), error?.stderr?.toString()].filter(Boolean).join('\n').trim();
  fail(`Failed to drop ${database}:\n${details || error?.message}`);
}

console.log(`[db-reset] ${database} dropped. The API will recreate, migrate and seed it on boot.`);

/**
 * Reads a value out of a SQL Server connection string, trying each of the given key aliases.
 * @param {string} value
 * @param {string[]} keys
 * @returns {string | undefined}
 */
function readSetting(value, keys) {
  for (const part of value.split(';')) {
    const separatorIndex = part.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = part.slice(0, separatorIndex).trim().toLowerCase();
    if (keys.includes(key)) {
      return part.slice(separatorIndex + 1).trim();
    }
  }

  return undefined;
}

/**
 * @param {string} message
 * @returns {never}
 */
function fail(message) {
  console.error(`[db-reset] ${message}`);
  process.exit(1);
}
