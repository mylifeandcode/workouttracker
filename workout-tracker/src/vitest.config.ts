import { configDefaults, defineConfig } from 'vitest/config';
import { webdriverio } from '@vitest/browser-webdriverio'

export default defineConfig({
  test: {
    /*
    browser: {
      enabled: true,
      provider: webdriverio({
        capabilities: {
          acceptInsecureCerts: true,
          browserName: 'chrome',
          'goog:chromeOptions': {
            args: [
              '--disable-web-security',
              '--allow-running-insecure-content'
            ]
          }
        }
      }),
      instances: [
        { browser: 'chrome' }  // browser name goes here, not in capabilities
      ],      
    },*/
    coverage: {
      provider: 'v8',
      exclude: [
        ...configDefaults.exclude, "**/*.html"
      ],
    },
  },
});
