/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+.tsx?$': ['ts-jest', {}],
  },
  preset: 'ts-jest',
  detectOpenHandles: true,
  openHandlesTimeout: 10 * 1000,
  testTimeout: 10 * 1000,
};
