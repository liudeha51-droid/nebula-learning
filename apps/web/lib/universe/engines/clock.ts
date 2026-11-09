import type {EngineLogic} from '../types';
import {int, num, pick, str} from '../math';
import {sc, predict} from './util';

export type ClockMode = 'read' | 'elapsed' | '24h' | 'calendar';
export interface ClockConfig {mode: ClockMode; step: number; h: number; m: number; start: number; end: number; year: number; month: number}
export const hm = (mins: number) => `${Math.floor(mins / 60) % 24}:${String(((mins % 60) + 60) % 60).padStart(2, '0')}`;
export const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
export const daysIn = (y: number, m: number) => [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
/** Day of week (0 = Sunday) via Zeller-like Sakamoto method. */
export function weekday(y: number, m: number, d: number) { const t = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4]; if (m < 3) y -= 1; return (y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) + t[m - 1] + d) % 7; }

export const clock: EngineLogic<ClockConfig> = {
  type: 'clock', label: 'Time machine',
  parse: r => ({mode: str(r.mode, 'read'), step: num(r.step, 60), h: num(r.h, 3), m: num(r.m, 0), start: num(r.start, 470), end: num(r.end, 615), year: num(r.year, 2026), month: num(r.month, 9)}),
  validate: c => (c.mode === 'elapsed' && c.end <= c.start ? ['end after start'] : c.month < 1 || c.month > 12 ? ['month 1–12'] : []),
  scenes: c => {
    switch (c.mode) {
      case 'elapsed': { const firstHour = Math.ceil(c.start / 60) * 60; return [
        sc('intro', 'introduce', 'A school morning', `A lesson starts at ${hm(c.start)}.`, 5),
        sc('problem', 'problem', 'How long?', `It ends at ${hm(c.end)}. How long is it?`, 5),
        sc('jump1', 'explore', 'Jump to the hour', `${hm(c.start)} → ${hm(firstHour)}: ${firstHour - c.start} minutes.`, 8),
        sc('jump2', 'manipulate', 'Jump to the end', `${hm(firstHour)} → ${hm(c.end)}: ${c.end - firstHour} minutes.`, 8),
        sc('discover', 'discover', `${c.end - c.start} minutes`, `${firstHour - c.start} + ${c.end - firstHour} = ${c.end - c.start} minutes${c.end - c.start >= 60 ? ` = ${Math.floor((c.end - c.start) / 60)} h ${(c.end - c.start) % 60} min` : ''}.`, 7),
        sc('explain', 'explain', 'Elapsed time', 'Use a timeline: jump to a whole hour first, then the rest. 1 hour = 60 minutes.', 7),
        sc('apply', 'apply', 'Your turn', 'Calculate durations.', 5)]; }
      case '24h': return [
        sc('intro', 'introduce', 'A whole day', 'The hour hand goes round twice every day.', 5),
        sc('problem', 'problem', '3 o’clock — but which?', 'How do timetables tell 3 a.m. from 3 p.m.?', 6),
        sc('morning', 'explore', 'Morning: 0 to 12', 'From midnight the hours count 0, 1, 2… up to 12 at noon.', 8),
        sc('afternoon', 'manipulate', 'Afternoon: keep counting', `After noon, keep counting: 13, 14, 15… so ${c.h - 12} p.m. is ${c.h}:${String(c.m).padStart(2, '0')}.`, 8),
        sc('discover', 'discover', '+12 after noon', 'For p.m. times (except 12 p.m.), add 12 to the hour.', 6),
        sc('explain', 'explain', '24-hour clock', 'Midnight 0:00, noon 12:00, last minute 23:59. Intervals across noon: count to 12:00, then on.', 8),
        sc('apply', 'apply', 'Your turn', 'Convert and calculate.', 5)];
      case 'calendar': return [
        sc('intro', 'introduce', `${MONTHS[c.month - 1]} ${c.year}`, 'A calendar page.', 5),
        sc('problem', 'problem', 'How many days?', `How many days does ${MONTHS[c.month - 1]} have this year?`, 5),
        sc('fill', 'explore', 'Fill the month', `Days fill the weeks, 7 to a row: ${daysIn(c.year, c.month)} days.`, 9),
        sc('year', 'manipulate', 'The whole year', '31, 28 or 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31.', 8),
        sc('discover', 'discover', isLeap(c.year) ? `${c.year} is a leap year` : `${c.year} is a common year`, isLeap(c.year) ? 'February has 29 days; the year has 366.' : 'February has 28 days; the year has 365.', 7),
        sc('explain', 'explain', 'Leap years', 'Divisible by 4 → leap, except century years, which must be divisible by 400 (2000 yes, 1900 no).', 8),
        sc('apply', 'apply', 'Your turn', 'Calendar problems.', 5)];
      default: return [
        sc('intro', 'introduce', 'A clock', 'A clock face with a short hour hand and a long minute hand.', 5),
        sc('problem', 'problem', 'Which hand is which?', 'How do the two hands work together?', 5),
        sc('turn', 'explore', 'One full turn', 'The minute hand goes all the way round in one hour; the hour hand moves one number.', 10),
        sc('set', 'manipulate', `Set ${c.h}:${String(c.m).padStart(2, '0')}`, c.m === 0 ? `Minute hand on 12, hour hand on ${c.h}.` : `Minute hand on ${c.m / 5}, hour hand ${c.m >= 30 ? 'past the middle between' : 'just past'} ${c.h} and ${c.h % 12 + 1}.`, 8),
        sc('discover', 'discover', `${c.h}:${String(c.m).padStart(2, '0')}`, c.m === 0 ? `A whole hour: ${c.h} o’clock.` : `${c.m} minutes past ${c.h}.`, 6),
        sc('explain', 'explain', 'Reading time', 'Read the hour hand first (the number it has passed), then the minutes (5 per number). 1 h = 60 min, 1 min = 60 s.', 8),
        sc('apply', 'apply', 'Your turn', 'Read and set clocks.', 5)];
    }
  },
  prediction: c => {
    switch (c.mode) {
      case 'elapsed': return predict(`From ${hm(c.start)} to ${hm(c.end)} is…`, [['a', `${c.end - c.start} min`], ['b', `${(Math.floor(c.end / 60) - Math.floor(c.start / 60)) * 100 + (c.end % 60) - (c.start % 60)} min`]], 'a', 'An hour has 60 minutes, not 100.', 2);
      case '24h': return predict(`${c.h - 12}:${String(c.m).padStart(2, '0')} p.m. in 24-hour time is…`, [['a', `${c.h}:${String(c.m).padStart(2, '0')}`], ['b', `${c.h - 12}:${String(c.m).padStart(2, '0')}`]], 'a', 'Add 12 after noon.', 3);
      case 'calendar': return predict(`February ${c.year} has…`, [['a', '29 days'], ['b', '28 days']], isLeap(c.year) ? 'a' : 'b', isLeap(c.year) ? 'Leap year.' : 'Common year.', 4);
      default: return predict('While the minute hand goes once around, the hour hand moves…', [['a', 'One number'], ['b', 'Once around too'], ['c', 'Not at all']], 'a', 'One hour passes.', 2);
    }
  },
  challenge: (c, r) => {
    switch (c.mode) {
      case 'elapsed': { const s = int(r, 7, 15) * 60 + int(r, 1, 11) * 5, d = int(r, 4, 20) * 5; return {prompt: `A film starts at ${hm(s)} and lasts ${d} minutes. When does it end?`, kind: 'choice', options: [hm(s + d), hm(s + d + 40), hm(s + d - 10)], answer: hm(s + d), hint: 'Jump to the next hour first.', explanation: `${hm(s + d)}.`}; }
      case '24h': { const h = int(r, 1, 11), m = int(r, 0, 11) * 5; return {prompt: `${h}:${String(m).padStart(2, '0')} p.m. in 24-hour time — what is the hour?`, kind: 'number', answer: h + 12, hint: '+12', explanation: `${h + 12}:${String(m).padStart(2, '0')}.`}; }
      case 'calendar': { const y = pick(r, [1900, 2000, 2023, 2024, 2025, 2028, 2100]); return {prompt: `Is ${y} a leap year?`, kind: 'choice', options: ['Yes', 'No'], answer: isLeap(y) ? 'Yes' : 'No', hint: 'Century years need 400.', explanation: `${y} ${isLeap(y) ? 'is' : 'is not'} a leap year.`}; }
      default: { const h = int(r, 1, 12), m = c.step >= 60 ? 0 : int(r, 0, 11) * 5; return {prompt: `The hour hand is ${m ? `between ${h} and ${h % 12 + 1}` : `on ${h}`} and the minute hand points to ${m ? m / 5 : 12}. What time is it?`, kind: 'choice', options: [`${h}:${String(m).padStart(2, '0')}`, `${h % 12 + 1}:${String(m).padStart(2, '0')}`, `${m ? m / 5 : 12}:${String(h * 5 % 60).padStart(2, '0')}`].filter((v, i, a) => a.indexOf(v) === i), answer: `${h}:${String(m).padStart(2, '0')}`, hint: 'Hour hand first.', explanation: `${h}:${String(m).padStart(2, '0')}.`}; }
    }
  },
  describe: c => c.mode === 'calendar' ? `Calendar for ${MONTHS[c.month - 1]} ${c.year}.` : c.mode === 'elapsed' ? `Timeline from ${hm(c.start)} to ${hm(c.end)}.` : `Analogue clock showing ${c.h}:${String(c.m).padStart(2, '0')} with continuously moving hands.`,
};
