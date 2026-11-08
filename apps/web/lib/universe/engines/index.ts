import type {EngineLogic, EngineType} from '../types';
import {counting} from './counting';

/** Pure engine logic registry (storyboards, predictions, challenges). Views live in components/universe/engines. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const LOGIC: Partial<Record<EngineType, EngineLogic<any>>> = {
  counting,
};
