'use client';
import type {EngineType} from '@/lib/universe/types';
import type {EngineView} from './types';
import {countingView} from './counting';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VIEWS: Partial<Record<EngineType, EngineView<any>>> = {
  counting: countingView,
};
