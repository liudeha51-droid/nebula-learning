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
import {solidView} from './solid';
import {balanceView} from './balance';
import {percentView} from './percent';
import {dataView} from './data';
import {probabilityView} from './probability';
import {proportionView} from './proportion';
import {measureView} from './measure';
import {clockView} from './clock';
import {moneyView} from './money';
import {coordinateView} from './coordinate';
import {transformView} from './transform';
import {factorView} from './factor';
import {sortingView} from './sorting';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VIEWS: Partial<Record<EngineType, EngineView<any>>> = {
  counting: countingView, objects: objectsView, 'place-value': placeValueView, column: columnView, array: arrayView, division: divisionView, laws: lawsView, fraction: fractionView,
  decimal: decimalView,
  'number-line': numberLineView,
  angle: angleView,
  area: areaView,
  circle: circleView,
  solid: solidView,
  balance: balanceView,
  percent: percentView,
  data: dataView,
  probability: probabilityView,
  proportion: proportionView,
  measure: measureView,
  clock: clockView,
  money: moneyView,
  coordinate: coordinateView,
  transform: transformView,
  factor: factorView,
  sorting: sortingView,
};
