import { expect, test, beforeEach } from 'vitest'
import { TestRunner } from "@boardzilla/core";
import setup, { Hearts } from '../src/game/index.js';

let runner: TestRunner<Hearts>

beforeEach(() => {
  runner = new TestRunner(setup);
})
