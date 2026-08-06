import { test as base } from '@playwright/test';
import * as fs from 'node:fs/promises';
import { ApiClient } from './api-client';
import { E2E_ADMIN, E2E_USER, PROVISIONED_USERS_FILE } from './env';
import { createSessionState } from './session';
import type { User } from '../../src/app/api/types.gen';

export interface ProvisionedUsers {
  admin: User;
  standard: User;
}

/** Which account the browser starts logged in as; `null` starts logged out. */
export type AuthenticateAs = 'admin' | 'standard' | null;

interface Options {
  authenticateAs: AuthenticateAs;
}

interface Fixtures {
  /** API client authenticated as the E2E admin, for arranging and verifying state. */
  api: ApiClient;
  /** The accounts the global setup created, including their real ids. */
  users: ProvisionedUsers;
  /**
   * Builds a name unique to this test and run. Use it for anything written to the database so
   * tests don't collide with each other or with leftovers from a partially-failed run.
   */
  uniqueName: (prefix: string) => string;
}

export const test = base.extend<Options & Fixtures>({
  //Override per file or per test with test.use({ authenticateAs: 'admin' | null }).
  authenticateAs: ['standard', { option: true }],

  /*
   * Overriding the built-in storageState so every test gets a freshly minted session. See
   * session.ts for why a shared, pre-saved session file cannot work here.
   */
  storageState: async ({ authenticateAs }, use) => {
    if (authenticateAs === null) {
      await use({ cookies: [], origins: [] });
      return;
    }

    const credentials = authenticateAs === 'admin' ? E2E_ADMIN : E2E_USER;
    await use(await createSessionState(credentials));
  },

  api: async ({}, use) => {
    const client = await ApiClient.authenticateAs(E2E_ADMIN.userName, E2E_ADMIN.password);
    await use(client);
    await client.dispose();
  },

  users: async ({}, use) => {
    const contents = await fs.readFile(PROVISIONED_USERS_FILE, 'utf-8');
    await use(JSON.parse(contents) as ProvisionedUsers);
  },

  uniqueName: async ({}, use, testInfo) => {
    let sequence = 0;
    //Worker index + start time keeps this unique across parallel workers and reruns alike.
    const runToken = `${testInfo.workerIndex}${Date.now().toString(36).slice(-4)}`;
    await use((prefix: string) => `${prefix}-${runToken}-${++sequence}`);
  },
});

export { expect } from '@playwright/test';
