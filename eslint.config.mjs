import { createConfigs } from 'eslint-config-retn0';

export default [
  ...createConfigs(),
  {
    rules: {
      'no-undef': ['off'],
    },
  },
];
