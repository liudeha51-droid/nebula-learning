/** Pure models behind the concept animations. No DOM access: every frame is a
 * deterministic function of (parameters, time), so the models are unit-tested
 * and a paused or scrubbed animation shows exactly what a playing one would. */

export const G=9.8;
export type Params=Record<string,number>;
export interface ParamSpec {key:string;label:string;min:number;max:number;step:number;initial:number;unit:string}
export interface Reading {label:string;value:string}
export interface AnimationSpec {
  id:string;node:string;subject:'math'|'physics';title:string;summary:string;notice:string;formula:string;
  caveat?:string;loop:boolean;params:ParamSpec[];
  duration:(p:Params)=>number;readings:(p:Params,t:number)=>Reading[];
}

export const rad=(degrees:number)=>degrees*Math.PI/180;
export const deg=(radians:number)=>radians*180/Math.PI;
export function fmt(value:number,digits=2):string {const text=value.toFixed(digits);return Number(text)===0?(0).toFixed(digits):text}
export const clamp=(value:number,low:number,high:number)=>Math.min(high,Math.max(low,value));
export const smooth=(u:number)=>{const c=clamp(u,0,1);return c*c*(3-2*c)};

// ---------- Mathematics ----------

/** y = a(x - h)^2 + k */
export const parabola=(a:number,h:number,k:number,x:number)=>a*(x-h)**2+k;
export function parabolaRoots(a:number,h:number,k:number):number[] {
  if(a===0)return [];
  const q=-k/a;
  if(q<0)return [];
  if(q===0)return [h];
  return [h-Math.sqrt(q),h+Math.sqrt(q)];
}
export const PARABOLA_SWEEP=[-5,5] as const;
export const parabolaX=(t:number,duration:number)=>PARABOLA_SWEEP[0]+(PARABOLA_SWEEP[1]-PARABOLA_SWEEP[0])*clamp(t/duration,0,1);

/** Point on a circle of radius r after turning through theta. */
export const circlePoint=(r:number,theta:number)=>({x:r*Math.cos(theta),y:r*Math.sin(theta)});
export const TRIG_DURATION=10;
export const trigAngle=(t:number)=>2*Math.PI*(t/TRIG_DURATION);

/** Slope of the secant of f(x)=x^2 between x0 and x0+h; the limit 2*x0 at h=0. */
export const secantSlope=(x0:number,h:number)=>h===0?2*x0:((x0+h)**2-x0**2)/h;
export const SECANT_DURATION=9;
export const SECANT_START=1.5;
/** The gap h shrinks smoothly to exactly 0, then holds for the last 1.5 s. */
export const secantGap=(t:number)=>SECANT_START*(1-smooth(t/(SECANT_DURATION-1.5)));

export function vectorSum(aLength:number,aDegrees:number,bLength:number,bDegrees:number) {
  const a={x:aLength*Math.cos(rad(aDegrees)),y:aLength*Math.sin(rad(aDegrees))};
  const b={x:bLength*Math.cos(rad(bDegrees)),y:bLength*Math.sin(rad(bDegrees))};
  const x=a.x+b.x,y=a.y+b.y;
  return {a,b,x,y,length:Math.hypot(x,y),angle:deg(Math.atan2(y,x))};
}
export const VECTOR_DURATION=7;
/** slide: how far b has moved to the tip of a; grow: how much of the resultant is drawn. */
export const vectorPhase=(t:number)=>({slide:smooth((t-1)/2.5),grow:smooth((t-3.8)/1.6)});

/** Chord AB subtends `central` degrees at the centre of a unit circle; P is at
 * `pDegrees` on the major arc. Returns the inscribed angle APB in degrees. */
export function inscribed(central:number,pDegrees:number) {
  const A=circlePoint(1,rad(-90-central/2)),B=circlePoint(1,rad(-90+central/2)),P=circlePoint(1,rad(pDegrees));
  const ux=A.x-P.x,uy=A.y-P.y,vx=B.x-P.x,vy=B.y-P.y;
  const angle=deg(Math.acos(clamp((ux*vx+uy*vy)/(Math.hypot(ux,uy)*Math.hypot(vx,vy)),-1,1)));
  return {A,B,P,angle};
}
export const INSCRIBED_DURATION=10;
/** P swings back and forth along the major arc, staying 12 degrees clear of A and B. */
export function inscribedPoint(central:number,t:number) {
  const half=(360-central)/2-12;
  return 90+half*Math.sin(2*Math.PI*t/INSCRIBED_DURATION);
}

function mulberry32(seed:number) {
  let a=seed>>>0;
  return ()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296};
}
export const COIN_FLIPS=400;
export const COIN_DURATION=20;
/** Running proportion of heads after each of `count` seeded flips with P(heads)=p. */
export function coinRun(p:number,seed:number,count=COIN_FLIPS):number[] {
  const next=mulberry32(Math.round(seed)*7919+17);const out:number[]=[];let heads=0;
  for(let i=1;i<=count;i++){if(next()<p)heads++;out.push(heads/i)}
  return out;
}
export const coinCount=(t:number)=>clamp(Math.floor(t/COIN_DURATION*COIN_FLIPS),0,COIN_FLIPS);

// ---------- Physics ----------

export function projectile(speed:number,angleDegrees:number,t:number) {
  const vx=speed*Math.cos(rad(angleDegrees)),vy0=speed*Math.sin(rad(angleDegrees));
  const flight=2*vy0/G;const time=clamp(t,0,flight);
  return {x:vx*time,y:Math.max(0,vy0*time-G*time*time/2),vx,vy:vy0-G*time,flight,range:vx*flight,peak:vy0*vy0/(2*G)};
}

export const INCLINE_LENGTH=4;
export const INCLINE_MASS=2;
/** Block released from rest at the top of a 4 m ramp. One friction coefficient
 * is used for both static and kinetic friction. */
export function incline(angleDegrees:number,mu:number,t:number) {
  const theta=rad(angleDegrees);
  const weight=INCLINE_MASS*G,parallel=weight*Math.sin(theta),normal=weight*Math.cos(theta);
  const acceleration=Math.max(0,G*(Math.sin(theta)-mu*Math.cos(theta)));
  const slides=acceleration>1e-9;
  const friction=slides?mu*normal:parallel;
  const end=slides?Math.sqrt(2*INCLINE_LENGTH/acceleration):Infinity;
  const time=clamp(t,0,end);
  return {weight,parallel,normal,friction,acceleration,slides,end,distance:slides?Math.min(INCLINE_LENGTH,acceleration*time*time/2):0,speed:slides?acceleration*time:0};
}

/** Exact period of a pendulum released from rest at theta0, via the arithmetic-geometric mean. */
export function pendulumPeriod(length:number,releaseDegrees:number) {
  let a=1,b=Math.cos(rad(releaseDegrees)/2);
  for(let i=0;i<12;i++){const m=(a+b)/2;b=Math.sqrt(a*b);a=m}
  return 2*Math.PI*Math.sqrt(length/G)/a;
}
export const PENDULUM_MASS=1;
/** Fourth-order Runge-Kutta integration of theta'' = -(g/L) sin(theta); no small-angle approximation. */
export function pendulum(length:number,releaseDegrees:number,t:number) {
  const period=pendulumPeriod(length,releaseDegrees);
  const target=((t%period)+period)%period;const k=G/length;
  let theta=rad(releaseDegrees),omega=0;
  const steps=Math.max(1,Math.ceil(target*500));const dt=target/steps;
  for(let i=0;i<steps&&dt>0;i++){
    const k1t=omega,k1w=-k*Math.sin(theta);
    const k2t=omega+dt/2*k1w,k2w=-k*Math.sin(theta+dt/2*k1t);
    const k3t=omega+dt/2*k2w,k3w=-k*Math.sin(theta+dt/2*k2t);
    const k4t=omega+dt*k3w,k4w=-k*Math.sin(theta+dt*k3t);
    theta+=dt/6*(k1t+2*k2t+2*k3t+k4t);omega+=dt/6*(k1w+2*k2w+2*k3w+k4w);
  }
  const speed=length*omega;
  const potential=PENDULUM_MASS*G*length*(1-Math.cos(theta)),kinetic=PENDULUM_MASS*speed*speed/2;
  return {theta,omega,speed,potential,kinetic,total:PENDULUM_MASS*G*length*(1-Math.cos(rad(releaseDegrees))),period};
}

/** Velocities after a head-on collision with body 2 initially at rest; e is the coefficient of restitution. */
export function collide(m1:number,m2:number,u1:number,e:number) {
  return {v1:(m1-e*m2)*u1/(m1+m2),v2:(1+e)*m1*u1/(m1+m2)};
}
export const COLLISION_GAP=3;
export const COLLISION_TRACK=[-4.5,7.5] as const;
export const cartWidth=(mass:number)=>.9+.25*mass;
export function collision(m1:number,m2:number,u1:number,e:number,t:number) {
  const {v1,v2}=collide(m1,m2,u1,e);const impact=COLLISION_GAP/u1;
  // x1, x2 are the touching faces: the front of cart 1 and the back of cart 2.
  const before=t<impact;
  const x1=before?-COLLISION_GAP+u1*t:v1*(t-impact),x2=before?0:v2*(t-impact);
  const now1=before?u1:v1,now2=before?0:v2;
  return {v1,v2,impact,before,x1,x2,now1,now2,momentum:m1*now1+m2*now2,kinetic:m1*now1*now1/2+m2*now2*now2/2,kineticBefore:m1*u1*u1/2,kineticAfter:m1*v1*v1/2+m2*v2*v2/2};
}
export function collisionDuration(m1:number,m2:number,u1:number,e:number) {
  const {v2}=collide(m1,m2,u1,e);
  const room=COLLISION_TRACK[1]-cartWidth(m2);
  return COLLISION_GAP/u1+Math.min(3.5,room/v2);
}

export const STRING_LENGTH=1.2;
export const WAVE_SPEED=1.2;
/** Two identical waves travelling in opposite directions along a string fixed at both ends. */
export function standingWave(harmonic:number,amplitude:number,x:number,t:number) {
  const wavelength=2*STRING_LENGTH/harmonic,k=2*Math.PI/wavelength,omega=k*WAVE_SPEED;
  const right=amplitude/2*Math.sin(k*x-omega*t),left=amplitude/2*Math.sin(k*x+omega*t);
  return {right,left,sum:right+left,wavelength,frequency:WAVE_SPEED/wavelength};
}
export const WAVE_DURATION=4;

export const ohm=(voltage:number,resistance:number)=>({current:voltage/resistance,power:voltage*voltage/resistance});
/** Dot spacings travelled per second for each ampere, so dot speed is proportional to current. */
export const CIRCUIT_FLOW=.5;
/** A whole number of dot spacings, so the looping animation has no visible seam. */
export function circuitDuration(voltage:number,resistance:number) {
  const step=1/(CIRCUIT_FLOW*ohm(voltage,resistance).current);
  return Math.ceil(8/step)*step;
}

// ---------- Catalogue ----------

const p=(key:string,label:string,min:number,max:number,step:number,initial:number,unit=''):ParamSpec=>({key,label,min,max,step,initial,unit});

export const ANIMATIONS:AnimationSpec[]=[
  {id:'parabola',node:'math.functions',subject:'math',title:'Shaping a parabola',loop:false,
    summary:'A point traces y = a(x − h)² + k while you stretch, flip and shift the curve.',
    notice:'h and k move the vertex without changing the shape. Only a changes how steep the curve is and which way it opens.',
    formula:'y=a(x-h)^2+k',
    params:[p('a','Stretch a',-2,2,.25,1),p('h','Shift right h',-3,3,.5,0),p('k','Shift up k',-4,4,.5,-2)],
    duration:()=>8,
    readings:(q,t)=>{const x=parabolaX(t,8),roots=parabolaRoots(q.a,q.h,q.k);return [
      {label:'Vertex',value:`(${fmt(q.h,1)}, ${fmt(q.k,1)})`},
      {label:'Shape',value:q.a===0?'Flat line (a = 0)':q.a>0?'Opens upward':'Opens downward'},
      {label:'x-intercepts',value:roots.length?roots.map(r=>fmt(r)).join(' and '):'None'},
      {label:'Tracing point',value:`(${fmt(x)}, ${fmt(parabola(q.a,q.h,q.k,x))})`}]}},
  {id:'unit-circle',node:'math.trigonometry',subject:'math',title:'From circle to sine wave',loop:true,
    summary:'A point turns around a circle; its height unrolls into sine and its horizontal position into cosine.',
    notice:'One full turn of the circle is exactly one full cycle of both waves. Cosine is the same wave, a quarter turn ahead.',
    formula:'(x,\\,y)=(r\\cos\\theta,\\;r\\sin\\theta)',
    params:[p('r','Radius r',.5,1.5,.25,1)],
    duration:()=>TRIG_DURATION,
    readings:(q,t)=>{const theta=trigAngle(t),point=circlePoint(q.r,theta);return [
      {label:'Angle θ',value:`${fmt(deg(theta),0)}° = ${fmt(theta/Math.PI)}π rad`},
      {label:'r sin θ (height)',value:fmt(point.y)},
      {label:'r cos θ (across)',value:fmt(point.x)},
      {label:'sin²θ + cos²θ',value:fmt((point.x**2+point.y**2)/q.r**2)}]}},
  {id:'derivative',node:'math.calculus',subject:'math',title:'Secant becomes tangent',loop:false,
    summary:'Two points on y = x² slide together. The secant line through them settles onto the tangent.',
    notice:'The secant slope is 2x₀ + h. As the gap h shrinks to zero, it approaches 2x₀: the derivative at x₀.',
    formula:'f\'(x_0)=\\lim_{h\\to 0}\\frac{f(x_0+h)-f(x_0)}{h}',
    params:[p('x0','Point x₀',-1,1.5,.25,1)],
    duration:()=>SECANT_DURATION,
    readings:(q,t)=>{const h=secantGap(t);return [
      {label:'Gap h',value:fmt(h,3)},
      {label:'Secant slope',value:h===0?'—':fmt(secantSlope(q.x0,h),3)},
      {label:'Tangent slope 2x₀',value:fmt(2*q.x0)},
      {label:'Difference',value:h===0?'0 (limit reached)':fmt(secantSlope(q.x0,h)-2*q.x0,3)}]}},
  {id:'vector-addition',node:'math.vectors',subject:'math',title:'Adding vectors head to tail',loop:false,
    summary:'Vector b slides to the tip of a. The resultant runs from the start of a to the end of b.',
    notice:'The resultant is shorter than |a| + |b| unless the two vectors point the same way. Components simply add.',
    formula:'\\vec a+\\vec b=(a_x+b_x,\\;a_y+b_y)',
    params:[p('aAngle','Direction of a',0,180,5,20,'°'),p('bAngle','Direction of b',0,180,5,100,'°'),p('bLength','Length of b',1,4,.5,2.5)],
    duration:()=>VECTOR_DURATION,
    readings:q=>{const s=vectorSum(3,q.aAngle,q.bLength,q.bAngle);return [
      {label:'a',value:`(${fmt(s.a.x)}, ${fmt(s.a.y)})`},
      {label:'b',value:`(${fmt(s.b.x)}, ${fmt(s.b.y)})`},
      {label:'a + b',value:`(${fmt(s.x)}, ${fmt(s.y)})`},
      {label:'|a + b|',value:`${fmt(s.length)} at ${fmt(s.angle,0)}°`}]}},
  {id:'inscribed-angle',node:'math.geometry',subject:'math',title:'The inscribed angle theorem',loop:true,
    summary:'Point P travels around the circle while chord AB stays put. Watch the angle at P.',
    notice:'Wherever P sits on the arc, angle APB never changes, and it is always half the angle at the centre.',
    formula:'\\angle APB=\\tfrac12\\,\\angle AOB',
    params:[p('central','Central angle AOB',40,170,5,100,'°')],
    duration:()=>INSCRIBED_DURATION,
    readings:(q,t)=>{const at=inscribedPoint(q.central,t);return [
      {label:'Central angle AOB',value:`${fmt(q.central,0)}°`},
      {label:'Inscribed angle APB',value:`${fmt(inscribed(q.central,at).angle,1)}°`},
      {label:'Position of P',value:`${fmt(at,0)}° around the circle`}]}},
  {id:'law-of-large-numbers',node:'math.statistics',subject:'math',title:'The law of large numbers',loop:false,
    summary:'400 simulated coin flips. The running share of heads wanders early, then settles near the true probability.',
    notice:'Short runs can be far from p. The share converges because early luck is diluted, not because the coin “corrects” itself.',
    formula:'\\frac{\\text{heads}}{n}\\;\\longrightarrow\\;p\\quad\\text{as }n\\to\\infty',
    caveat:'Flips come from a seeded pseudo-random generator, so each sample run is repeatable.',
    params:[p('p','P(heads) p',.1,.9,.1,.5),p('seed','Sample run',1,9,1,1)],
    duration:()=>COIN_DURATION,
    readings:(q,t)=>{const n=coinCount(t),run=coinRun(q.p,q.seed);const share=n?run[n-1]:null;return [
      {label:'Flips so far n',value:String(n)},
      {label:'Heads',value:share===null?'0':String(Math.round(share*n))},
      {label:'Share of heads',value:share===null?'—':fmt(share,3)},
      {label:'Distance from p',value:share===null?'—':fmt(Math.abs(share-q.p),3)}]}},
  {id:'projectile',node:'physics.motion',subject:'physics',title:'Projectile motion',loop:false,
    summary:'A ball is launched over level ground. Horizontal and vertical motion are shown as separate velocity arrows.',
    notice:'The horizontal arrow never changes. Only the vertical arrow shrinks, flips and grows: gravity acts downward alone.',
    formula:'x=v_0\\cos\\theta\\,t,\\qquad y=v_0\\sin\\theta\\,t-\\tfrac12 g t^2',
    caveat:'No air resistance; g = 9.8 m/s².',
    params:[p('speed','Launch speed v₀',8,26,1,22,' m/s'),p('angle','Launch angle θ',10,80,5,50,'°')],
    duration:q=>projectile(q.speed,q.angle,0).flight,
    readings:(q,t)=>{const s=projectile(q.speed,q.angle,t);return [
      {label:'Time',value:`${fmt(Math.min(t,s.flight))} s of ${fmt(s.flight)} s`},
      {label:'Position',value:`${fmt(s.x,1)} m across, ${fmt(s.y,1)} m up`},
      {label:'Velocity',value:`${fmt(s.vx,1)} m/s across, ${fmt(s.vy,1)} m/s up`},
      {label:'Range · peak height',value:`${fmt(s.range,1)} m · ${fmt(s.peak,1)} m`}]}},
  {id:'incline',node:'physics.forces',subject:'physics',title:'Forces on an incline',loop:false,
    summary:'A 2 kg block is released on a ramp. Weight, normal force and friction are drawn to scale.',
    notice:'The block only slides when the pull along the slope, mg sin θ, beats the largest friction available, μ mg cos θ.',
    formula:'a=g\\,(\\sin\\theta-\\mu\\cos\\theta)',
    caveat:'One coefficient μ is used for both static and kinetic friction; g = 9.8 m/s².',
    params:[p('angle','Ramp angle θ',5,60,1,30,'°'),p('mu','Friction coefficient μ',0,1,.05,.3)],
    duration:q=>{const s=incline(q.angle,q.mu,0);return s.slides?Math.min(12,s.end)+.6:3},
    readings:(q,t)=>{const s=incline(q.angle,q.mu,t);return [
      {label:'Pull along slope mg sin θ',value:`${fmt(s.parallel,1)} N`},
      {label:'Normal force mg cos θ',value:`${fmt(s.normal,1)} N`},
      {label:'Friction',value:`${fmt(s.friction,1)} N${s.slides?'':' (static, balances the pull)'}`},
      {label:'Acceleration · speed',value:s.slides?`${fmt(s.acceleration)} m/s² · ${fmt(s.speed)} m/s`:'0 — the block stays put'}]}},
  {id:'pendulum-energy',node:'physics.energy',subject:'physics',title:'Energy in a pendulum',loop:true,
    summary:'A 1 kg bob swings without friction. Bars track gravitational potential and kinetic energy.',
    notice:'Energy changes form but the total bar never moves: all potential at the turning points, all kinetic at the bottom.',
    formula:'mgh+\\tfrac12mv^2=\\text{constant}',
    caveat:'No friction or air resistance. The swing is integrated numerically, without the small-angle approximation.',
    params:[p('length','String length L',.5,2.5,.25,1.5,' m'),p('release','Release angle',10,80,5,45,'°')],
    duration:q=>2*pendulumPeriod(q.length,q.release),
    readings:(q,t)=>{const s=pendulum(q.length,q.release,t);return [
      {label:'Potential energy',value:`${fmt(s.potential)} J`},
      {label:'Kinetic energy',value:`${fmt(s.kinetic)} J`},
      {label:'Total',value:`${fmt(s.potential+s.kinetic)} J`},
      {label:'Speed · period',value:`${fmt(Math.abs(s.speed))} m/s · ${fmt(s.period)} s`}]}},
  {id:'collision',node:'physics.momentum',subject:'physics',title:'Collisions and momentum',loop:false,
    summary:'A moving cart hits a stationary one. Change the masses and how bouncy the collision is.',
    notice:'Total momentum is identical before and after, whatever the bounciness. Kinetic energy survives only when e = 1.',
    formula:'m_1u_1+m_2u_2=m_1v_1+m_2v_2',
    caveat:'Frictionless track. e is the coefficient of restitution: 1 is perfectly elastic, 0 means the carts stick together.',
    params:[p('m1','Mass of cart 1',1,5,.5,2,' kg'),p('m2','Mass of cart 2',1,5,.5,3,' kg'),p('u1','Speed of cart 1',1,4,.5,2.5,' m/s'),p('e','Bounciness e',0,1,.1,1)],
    duration:q=>collisionDuration(q.m1,q.m2,q.u1,q.e),
    readings:(q,t)=>{const s=collision(q.m1,q.m2,q.u1,q.e,t);return [
      {label:'Velocities now',value:`${fmt(s.now1)} m/s and ${fmt(s.now2)} m/s`},
      {label:'Total momentum',value:`${fmt(s.momentum)} kg·m/s`},
      {label:'Total kinetic energy',value:`${fmt(s.kinetic)} J`},
      {label:'Energy kept by collision',value:`${fmt(100*s.kineticAfter/s.kineticBefore,0)}%`}]}},
  {id:'standing-wave',node:'physics.waves',subject:'physics',title:'Standing waves on a string',loop:true,
    summary:'Two identical waves travel in opposite directions. Their sum is a wave that stays in place.',
    notice:'Nodes never move because the two waves always cancel there. Only whole numbers of half-wavelengths fit the string.',
    formula:'\\lambda_n=\\frac{2L}{n},\\qquad f_n=\\frac{v}{\\lambda_n}',
    caveat:'String length 1.2 m, wave speed 1.2 m/s, drawn in real time. Amplitude is exaggerated for visibility.',
    params:[p('harmonic','Harmonic n',1,6,1,3),p('amplitude','Amplitude',.2,1,.1,.8)],
    duration:()=>WAVE_DURATION,
    readings:q=>{const s=standingWave(q.harmonic,q.amplitude,0,0);return [
      {label:'Wavelength λ',value:`${fmt(s.wavelength)} m`},
      {label:'Frequency f',value:`${fmt(s.frequency)} Hz`},
      {label:'Nodes (including ends)',value:String(q.harmonic+1)},
      {label:'Antinodes',value:String(q.harmonic)}]}},
  {id:'circuit',node:'physics.electricity',subject:'physics',title:'Ohm’s law in a circuit',loop:true,
    summary:'A battery drives charge through one resistor. Dots move faster and the resistor glows brighter as current rises.',
    notice:'Doubling the voltage doubles the current. Doubling the resistance halves it. Power grows with the square of the voltage.',
    formula:'I=\\frac{V}{R},\\qquad P=VI',
    caveat:'Dots show the direction and relative size of conventional current. Real electrons drift the other way, far more slowly.',
    params:[p('voltage','Battery voltage V',1.5,12,.5,6,' V'),p('resistance','Resistance R',1,20,1,6,' Ω')],
    duration:q=>circuitDuration(q.voltage,q.resistance),
    readings:q=>{const s=ohm(q.voltage,q.resistance);return [
      {label:'Current I',value:`${fmt(s.current)} A`},
      {label:'Power P',value:`${fmt(s.power)} W`},
      {label:'Charge per second',value:`${fmt(s.current)} C`}]}},
];

export const animationForNode=(node:string)=>ANIMATIONS.find(a=>a.node===node)||null;
export const initialParams=(spec:AnimationSpec):Params=>Object.fromEntries(spec.params.map(q=>[q.key,q.initial]));
