import type {EngineLogic, EngineType} from '../types';
import {counting} from './counting';
import {objects} from './objects';
import {placeValue} from './place-value';
import {column} from './column';
import {array} from './array';
import {division} from './division';
import {laws} from './laws';
import {fraction} from './fraction';

import {decimal} from './decimal';
import {numberLine} from './number-line';
import {angle} from './angle';
import {area} from './area';
import {circle} from './circle';
import {solid} from './solid';
import {balance} from './balance';
import {percent} from './percent';
import {data} from './data';
import {probability} from './probability';
/** Pure engine logic registry (storyboards, predictions, challenges). Views live in components/universe/engines. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const LOGIC: Partial<Record<EngineType, EngineLogic<any>>> = {
  counting, objects, 'place-value': placeValue, column, array, division, laws, fraction,
  decimal: decimal,
  'number-line': numberLine,
  angle: angle,
  area: area,
  circle: circle,
  solid: solid,
  balance: balance,
  percent: percent,
  data: data,
  probability: probability,
};
