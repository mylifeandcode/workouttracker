// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

import { EnvironmentConfig } from 'app/core/_models/environment-config';

export const environment: EnvironmentConfig = {
  production: false//,
  //apiRoot: 'http://localhost:5600/api/'
};
