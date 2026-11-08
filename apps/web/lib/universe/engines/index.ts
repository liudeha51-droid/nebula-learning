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
import {proportion} from './proportion';
import {measure} from './measure';
import {clock} from './clock';
import {money} from './money';
import {coordinate} from './coordinate';
import {transform} from './transform';
import {factor} from './factor';
import {sorting} from './sorting';
import {shapes} from './shapes';
import {reasoning} from './reasoning';
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
  proportion: proportion,
  measure: measure,
  clock: clock,
  money: money,
  coordinate: coordinate,
  transform: transform,
  factor: factor,
  sorting: sorting,
  shapes: shapes,
  reasoning: reasoning,
};
