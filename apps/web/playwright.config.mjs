import {defineConfig} from '@playwright/test';

export default defineConfig({
  testDir:'./tests',
  testMatch:'**/*.spec.mjs',
  timeout:120_000,
  retries:0,
  workers:1,
  reporter:'list',
  use:{
    baseURL:'http://127.0.0.1:3410',
    headless:true,
    trace:'retain-on-failure'
  }
});
