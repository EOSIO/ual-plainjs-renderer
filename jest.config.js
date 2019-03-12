module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  modulePathIgnorePatterns: [
    '<rootDir>/dist/', 
    '<rootDir>/examples/'
  ],
  collectCoverageFrom: [
    "src/**/*.{ts}",
    "!<rootDir>/node_modules/",
    "!src/AuthMocks/*.{ts}"
  ]
}
