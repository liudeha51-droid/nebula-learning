'use client';
import type {EngineType} from '@/lib/universe/types';
import type {EngineView} from './types';
import {countingView} from './counting';
import {objectsView} from './objects';
import {placeValueView} from './place-value';
import {columnView} from './column';
import {arrayView} from './array';
import {divisionView} from './division';
import {lawsView} from './laws';
import {fractionView} from './fraction';

import {decimalView} from './decimal';
import {numberLineView} from './number-line';
import {angleView} from './angle';
import {areaView} from './area';
import {circleView} from './circle';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VIEWS: Partial<Record<EngineType, EngineView<any>>> = {
  counting: countingView, objects: objectsView, 'place-value': placeValueView, column: columnView, array: arrayView, division: divisionView, laws: lawsView, fraction: fractionView,
  decimal: decimalView,
  'number-line': numberLineView,
  angle: angleView,
  area: areaView,
  circle: circleView,
};
