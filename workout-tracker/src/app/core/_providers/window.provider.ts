// window.provider.ts
import { WINDOW } from '../_injection-tokens/window.token';

export const windowProvider = {
  provide: WINDOW,
  useFactory: () => window
};