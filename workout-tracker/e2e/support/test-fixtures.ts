import { test as base } from '@playwright/test';
import * as fs from 'node:fs/promises';
import { ApiClient } from './api-client';
import { E2E_ADMIN, PROVISIONED_USERS_FILE } from './env';
import type { User } from '../../src/app/api/types.gen';

export interface ProvisionedUsers {
  admin: User;
  standard: User;
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

export const test = base.extend<Fixtures>({
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
