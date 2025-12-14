import * as constants from '@config/constants';
import { env } from '@config/env';

export const config = {
  env: env,
  constants: {
    ...constants,
  },
};
