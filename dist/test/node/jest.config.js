"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    preset: "ts-jest",
    displayName: "Node Environment Tests",
    testEnvironment: "node",
    testMatch: ["<rootDir>/test.ts"],
};
exports.default = config;
