import {describe,it,expect} from 'vitest';
import {ANIMATIONS,G,animationForNode,initialParams,parabolaRoots,secantSlope,secantGap,SECANT_DURATION,vectorSum,inscribed,inscribedPoint,coinRun,COIN_FLIPS,projectile,incline,INCLINE_LENGTH,pendulum,pendulumPeriod,collide,collision,standingWave,STRING_LENGTH,ohm,circlePoint,trigAngle,TRIG_DURATION} from './animations';

describe('mathematics models',()=>{
  it('finds parabola intercepts only when they exist',()=>{
    expect(parabolaRoots(1,0,-4)).toEqual([-2,2]);
    expect(parabolaRoots(1,2,0)).toEqual([2]);
    expect(parabolaRoots(1,0,1)).toEqual([]);
    expect(parabolaRoots(0,0,-1)).toEqual([]);
  });
  it('completes exactly one turn per loop',()=>{
    expect(trigAngle(TRIG_DURATION)).toBeCloseTo(2*Math.PI,12);
    const q=circlePoint(1.5,trigAngle(TRIG_DURATION/4));expect(q.x).toBeCloseTo(0,12);expect(q.y).toBeCloseTo(1.5,12);
  });
  it('secant slope of x^2 is 2x0+h and reaches the tangent slope',()=>{
    expect(secantSlope(1,.5)).toBeCloseTo(2.5,12);
    expect(secantSlope(-1,0)).toBe(-2);
    expect(secantGap(0)).toBe(1.5);expect(secantGap(SECANT_DURATION)).toBe(0);
    let last=Infinity;for(let t=0;t<=SECANT_DURATION;t+=.25){const h=secantGap(t);expect(h).toBeLessThanOrEqual(last);last=h}
  });
  it('adds vectors by components',()=>{
    const s=vectorSum(3,0,4,90);expect(s.x).toBeCloseTo(3,12);expect(s.y).toBeCloseTo(4,12);expect(s.length).toBeCloseTo(5,12);
    expect(vectorSum(3,0,3,180).length).toBeCloseTo(0,12);
  });
  it('keeps the inscribed angle at half the central angle wherever P is',()=>{
    for(const central of [40,100,170])for(let t=0;t<=10;t+=.5)expect(inscribed(central,inscribedPoint(central,t)).angle).toBeCloseTo(central/2,9);
  });
  it('produces repeatable coin runs that approach p',()=>{
    expect(coinRun(.5,3)).toEqual(coinRun(.5,3));
    expect(coinRun(.5,3)).not.toEqual(coinRun(.5,4));
    expect(coinRun(.5,1)).toHaveLength(COIN_FLIPS);
    for(const p of [.1,.5,.9])for(let seed=1;seed<=9;seed++)expect(Math.abs(coinRun(p,seed)[COIN_FLIPS-1]-p)).toBeLessThan(.08);
  });
});

describe('physics models',()=>{
  it('lands a projectile at the textbook range',()=>{
    const s=projectile(20,45,0);
    expect(s.range).toBeCloseTo(400/G,9);expect(s.peak).toBeCloseTo(100/G,9);
    const landed=projectile(20,45,s.flight);expect(landed.y).toBeCloseTo(0,9);expect(landed.vy).toBeCloseTo(-s.vy,9);expect(landed.vx).toBe(s.vx);
    expect(projectile(20,30,0).range).toBeCloseTo(projectile(20,60,0).range,9);
  });
  it('holds a block when friction can balance the slope',()=>{
    const held=incline(15,.5,5);expect(held.slides).toBe(false);expect(held.distance).toBe(0);expect(held.friction).toBeCloseTo(held.parallel,12);
    const free=incline(30,0,1);expect(free.acceleration).toBeCloseTo(G/2,12);expect(free.distance).toBeCloseTo(G/4,12);
    expect(incline(30,0,99).distance).toBe(INCLINE_LENGTH);
    expect(incline(45,1,1).slides).toBe(false);
  });
  it('conserves pendulum energy and returns after one period',()=>{
    const period=pendulumPeriod(1.5,60);
    expect(pendulumPeriod(1,1)).toBeCloseTo(2*Math.PI*Math.sqrt(1/G),4);
    expect(period).toBeGreaterThan(2*Math.PI*Math.sqrt(1.5/G));
    for(let t=0;t<2*period;t+=period/13){const s=pendulum(1.5,60,t);expect(s.potential+s.kinetic).toBeCloseTo(s.total,6)}
    const half=pendulum(1.5,60,period/2);expect(half.theta).toBeCloseTo(-Math.PI/3,6);expect(half.omega).toBeCloseTo(0,5);
    const quarter=pendulum(1.5,60,period/4);expect(quarter.theta).toBeCloseTo(0,6);expect(quarter.potential).toBeCloseTo(0,6);
  });
  it('conserves momentum for every restitution and energy only when elastic',()=>{
    for(const e of [0,.3,1]){const {v1,v2}=collide(2,3,2.5,e);expect(2*v1+3*v2).toBeCloseTo(5,12);expect(v2-v1).toBeCloseTo(e*2.5,12)}
    const equal=collide(2,2,3,1);expect(equal.v1).toBeCloseTo(0,12);expect(equal.v2).toBeCloseTo(3,12);
    const stuck=collide(1,3,4,0);expect(stuck.v1).toBeCloseTo(stuck.v2,12);
    const after=collision(2,3,2.5,1,5);expect(after.kineticAfter).toBeCloseTo(after.kineticBefore,12);expect(after.before).toBe(false);
    expect(collision(2,3,2.5,0,5).kineticAfter).toBeLessThan(after.kineticBefore);
    for(const t of [0,.5,1.2,2,4]){const s=collision(2,3,2.5,.4,t);expect(s.momentum).toBeCloseTo(5,12);expect(s.x1).toBeLessThanOrEqual(s.x2+1e-12)}
  });
  it('keeps standing-wave nodes still and fits whole half-wavelengths',()=>{
    for(let n=1;n<=6;n++){
      const s=standingWave(n,1,0,0);expect(s.wavelength*n/2).toBeCloseTo(STRING_LENGTH,12);
      for(let node=0;node<=n;node++)for(const t of [0,.37,1.9])expect(standingWave(n,1,node*s.wavelength/2,t).sum).toBeCloseTo(0,12);
    }
    const s=standingWave(2,.8,STRING_LENGTH/4,0);expect(s.sum).toBeCloseTo(.8,12);
  });
  it('applies Ohm’s law',()=>{expect(ohm(6,3)).toEqual({current:2,power:12})});
});

describe('catalogue',()=>{
  it('has unique ids, one animation per taxonomy node, and valid parameters',()=>{
    expect(new Set(ANIMATIONS.map(a=>a.id)).size).toBe(ANIMATIONS.length);
    expect(new Set(ANIMATIONS.map(a=>a.node)).size).toBe(ANIMATIONS.length);
    for(const a of ANIMATIONS){
      expect(a.node.split('.')[0]).toBe(a.subject);
      for(const q of a.params){expect(q.min).toBeLessThan(q.max);expect(q.initial).toBeGreaterThanOrEqual(q.min);expect(q.initial).toBeLessThanOrEqual(q.max)}
    }
    expect(animationForNode('physics.motion')?.id).toBe('projectile');expect(animationForNode('math.numbers')).toBeNull();
  });
  it('gives finite durations and readings across every parameter extreme',()=>{
    for(const a of ANIMATIONS){
      const corners=[initialParams(a),Object.fromEntries(a.params.map(q=>[q.key,q.min])),Object.fromEntries(a.params.map(q=>[q.key,q.max]))];
      for(const q of a.params){corners.push({...initialParams(a),[q.key]:q.min},{...initialParams(a),[q.key]:q.max})}
      for(const params of corners){
        const duration=a.duration(params);expect(Number.isFinite(duration)&&duration>0,`${a.id} duration`).toBe(true);
        for(const t of [0,duration/3,duration]){const rows=a.readings(params,t);expect(rows.length).toBeGreaterThan(0);for(const row of rows)expect(row.value,`${a.id} ${row.label}`).not.toMatch(/NaN|Infinity|undefined/)}
      }
    }
  });
});
