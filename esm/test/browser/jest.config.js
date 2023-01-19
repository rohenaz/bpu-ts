const config = {
    preset: "ts-jest",
    displayName: "Browser Environment Tests",
    testEnvironment: "jsdom",
    testMatch: ["<rootDir>/test.ts"],
};
export default config;
