/** Eight additional textbook models. Each result depends only on the supplied
 * parameters and time; there is no DOM, animation clock or random state here. */
import type {AnimationSpec} from './animations';

const p=(key:string,label:string,min:number,max:number,step:number,initial:number,unit='')=>({key,label,min,max,step,initial,unit});
const fmt=(value:number,digits=2)=>value.toFixed(digits);
const clamp=(value:number,low:number,high:number)=>Math.max(low,Math.min(high,value));
export const ease=(u:number)=>{const t=clamp(u,0,1);return t*t*(3-2*t)};
const gcd=(a:number,b:number):number=>b===0?Math.abs(a):gcd(b,a%b);

export function fractionSum(a:number,b:number,c:number,d:number) {
  const numerator=a*d+c*b,denominator=b*d,common=gcd(numerator,denominator);
  return {first:a/b,second:c/d,sum:numerator/denominator,numerator:numerator/common,denominator:denominator/common};
}
export function fractionPosition(first:number,second:number,t:number) {
  return first*ease(t/3)+second*ease((t-4)/4);
}

export function areaTiles(x:number,a:number,b:number) {
  return {square:x*x,top:a*x,side:b*x,corner:a*b,total:(x+a)*(x+b)};
}

export function equationBalance(a:number,b:number,x:number,t:number) {
  const rhs=a*x+b,removed=b*ease((t-1)/3),divisor=1+(a-1)*ease((t-4.5)/3);
  return {rhs,removed,divisor,coefficient:a/divisor,constant:(b-removed)/divisor,right:(rhs-removed)/divisor,solution:x};
}

export const COIL_AREA=.05; // m²
export function induction(field:number,turns:number,hz:number,t:number) {
  const omega=2*Math.PI*hz,theta=omega*t,flux=field*COIL_AREA*Math.cos(theta);
  return {theta,flux,emf:turns*field*COIL_AREA*omega*Math.sin(theta),peak:turns*field*COIL_AREA*omega,frequency:hz};
}

export const GAS_VOLUME=4; // L
export const GAS_DURATION=8;
export function boyle(pressure:number,compression:number,t:number) {
  const volume=GAS_VOLUME*(1-compression*ease(t/GAS_DURATION));
  return {volume,pressure:pressure*GAS_VOLUME/volume,pv:pressure*GAS_VOLUME,temperature:'constant'};
}

export const PHOTON_EV_PER_1E14_HZ=.4135667696;
export function photoelectric(frequency:number,workFunction:number) {
  const energy=frequency*PHOTON_EV_PER_1E14_HZ,kinetic=Math.max(0,energy-workFunction);
  const emitted=energy>=workFunction;
  return {energy,kinetic,emitted,threshold:workFunction/PHOTON_EV_PER_1E14_HZ,
    speed:Math.sqrt(2*kinetic*1.602176634e-19/9.1093837139e-31)/1e6};
}

export const RIEMANN_DURATION=8;
export function riemannRight(n:number,power:number) {
  let estimate=0;
  for(let i=1;i<=n;i++)estimate+=(i/n)**power/n;
  const exact=1/(power+1);
  return {estimate,exact,error:estimate-exact};
}

export function refraction(n1:number,n2:number,incidentDegrees:number) {
  const incident=incidentDegrees*Math.PI/180,sine=n1*Math.sin(incident)/n2;
  const totalInternalReflection=sine>1+1e-12;
  const transmitted=totalInternalReflection?null:Math.asin(Math.min(1,sine))*180/Math.PI;
  const critical=n1>n2?Math.asin(n2/n1)*180/Math.PI:null;
  return {transmitted,totalInternalReflection,critical,snell:n1*Math.sin(incident)};
}

/** These eight cards fill the six unrepresented taxonomy nodes and add
 * separate calculus and optics topics without inventing backend taxonomy ids. */
export const ADDITIONAL_ANIMATIONS:AnimationSpec[]=[
  {id:'fraction-addition',node:'math.numbers',subject:'math',title:'Adding fractions on a number line',loop:false,
    summary:'Two hops along a number line make the sum of fractions visible, even when the denominators differ.',
    notice:'Equal-sized parts require a common denominator. The answer is the same point regardless of how you write the fraction.',
    formula:'\\frac{a}{b}+\\frac{c}{d}=\\frac{ad+bc}{bd}',
    params:[p('a','First numerator',1,4,1,1),p('b','First denominator',2,8,1,3),p('c','Second numerator',1,4,1,1),p('d','Second denominator',2,8,1,4)],
    duration:()=>8,readings:(q,t)=>{const s=fractionSum(q.a,q.b,q.c,q.d);return [
      {label:'First fraction',value:q.a+'/'+q.b+' = '+fmt(s.first,3)},
      {label:'Second fraction',value:q.c+'/'+q.d+' = '+fmt(s.second,3)},
      {label:'Current number-line position',value:fmt(fractionPosition(s.first,s.second,t),3)},
      {label:'Reduced sum',value:s.numerator+'/'+s.denominator+' = '+fmt(s.sum,3)}]}},
  {id:'area-model',node:'math.algebra',subject:'math',title:'Multiplying binomials with area',loop:false,
    summary:'Four coloured rectangles build the area of (x + a)(x + b), one product at a time.',
    notice:'Every term in the first bracket multiplies every term in the second. The two middle rectangles both contain x.',
    formula:'(x+a)(x+b)=x^2+(a+b)x+ab',
    params:[p('x','Side x',1,5,1,3),p('a','Extension a',1,4,1,2),p('b','Extension b',1,4,1,1)],
    duration:()=>8,readings:q=>{const s=areaTiles(q.x,q.a,q.b);return [
      {label:'x × x',value:fmt(s.square,0)+' square units'},
      {label:'a × x and b × x',value:fmt(s.top,0)+' + '+fmt(s.side,0)},
      {label:'a × b',value:fmt(s.corner,0)+' square units'},
      {label:'Whole area',value:fmt(s.total,0)+' square units'}]}},
  {id:'equation-balance',node:'math.equations',subject:'math',title:'Keeping an equation balanced',loop:false,
    summary:'Subtract the same amount from both sides, then divide both sides by the same positive number.',
    notice:'The equation stays equal at every step. Removing b alone is not enough: dividing by a isolates x.',
    formula:'ax+b=c\\quad\\Longrightarrow\\quad x=\\frac{c-b}{a}',
    params:[p('a','Coefficient a',1,5,1,3),p('b','Added amount b',0,8,1,6),p('x','Hidden solution x',1,6,1,4)],
    duration:()=>8,readings:(q,t)=>{const s=equationBalance(q.a,q.b,q.x,t);return [
      {label:'Starting right side c',value:fmt(s.rhs,0)},
      {label:'Subtracted from both sides',value:fmt(s.removed,2)},
      {label:'Divided both sides by',value:fmt(s.divisor,2)},
      {label:'Result x',value:fmt(s.solution,0)}]}},
  {id:'coil-induction',node:'physics.magnetism',subject:'physics',title:'Induction in a rotating coil',loop:true,
    summary:'A coil rotates in a magnetic field. Changing flux generates a voltage that alternates sign.',
    notice:'The voltage is greatest when the flux changes fastest, not when the flux itself is largest.',
    formula:'\\Phi=BA\\cos\\theta,\\qquad \\mathcal{E}=-N\\frac{d\\Phi}{dt}',
    caveat:'Ideal uniform magnetic field and a coil of area 0.05 m². Voltage is open-circuit; no current is calculated.',
    params:[p('field','Magnetic field B',.2,1.2,.1,.8,' T'),p('turns','Coil turns N',10,100,10,40),p('hz','Rotation frequency',.2,2,.2,1,' Hz')],
    duration:q=>2/q.hz,readings:(q,t)=>{const s=induction(q.field,q.turns,q.hz,t);return [
      {label:'Flux per turn',value:fmt(s.flux,4)+' Wb'},
      {label:'Induced voltage',value:fmt(s.emf,3)+' V'},
      {label:'Peak voltage',value:fmt(s.peak,3)+' V'},
      {label:'Coil angle',value:fmt((s.theta*180/Math.PI)%360,0)+'°'}]}},
  {id:'boyles-law',node:'physics.thermal',subject:'physics',title:'Compressing an ideal gas',loop:false,
    summary:'A piston squeezes gas at a constant temperature. Volume falls while pressure rises.',
    notice:'The pressure-volume product stays constant in this model: halving the volume doubles the absolute pressure.',
    formula:'P_1V_1=P_2V_2\\qquad(T=\\text{constant})',
    caveat:'Isothermal ideal-gas model; absolute pressure is in kPa, volume in litres. Heat exchange holds temperature constant.',
    params:[p('pressure','Initial pressure',80,200,10,100,' kPa'),p('compression','Volume reduction',.1,.8,.1,.5)],
    duration:()=>GAS_DURATION,readings:(q,t)=>{const s=boyle(q.pressure,q.compression,t);return [
      {label:'Gas volume',value:fmt(s.volume,2)+' L'},
      {label:'Absolute pressure',value:fmt(s.pressure,2)+' kPa'},
      {label:'Pressure × volume',value:fmt(s.pv,2)+' kPa·L'},
      {label:'Temperature',value:'Held constant'}]}},
  {id:'photoelectric-effect',node:'physics.modern',subject:'physics',title:'The photoelectric effect',loop:true,
    summary:'Photons hit a metal surface. Electrons escape only when each photon exceeds the material threshold energy.',
    notice:'Below threshold, more photons cannot release electrons. Above threshold, higher frequency increases their kinetic energy.',
    formula:'K_{\\max}=hf-W,\\qquad K_{\\max}\\ge 0',
    caveat:'Single-photon, ideal metal model. Frequency is in 10¹⁴ Hz; intensity and electron interactions are held fixed.',
    params:[p('frequency','Light frequency',2,20,.5,10,' ×10¹⁴ Hz'),p('work','Work function W',1,5,.25,2.5,' eV')],
    duration:()=>6,readings:q=>{const s=photoelectric(q.frequency,q.work);return [
      {label:'Photon energy hf',value:fmt(s.energy,3)+' eV'},
      {label:'Metal threshold W',value:fmt(q.work,2)+' eV'},
      {label:'Electron emitted?',value:s.emitted?'Yes':'No'},
      {label:'Max electron kinetic energy',value:fmt(s.kinetic,3)+' eV'}]}},
  {id:'riemann-sum',node:'math.calculus',subject:'math',title:'Estimating area with rectangles',loop:false,
    summary:'More right-endpoint rectangles estimate the area beneath y = x to a chosen power between zero and one.',
    notice:'For this increasing function, right-endpoint sums overestimate the true integral and approach it as n grows.',
    formula:'\\int_0^1 x^p\\,dx=\\frac{1}{p+1}',
    params:[p('n','Rectangles n',2,48,1,8),p('power','Power p',1,3,1,2)],
    duration:()=>RIEMANN_DURATION,readings:q=>{const s=riemannRight(q.n,q.power);return [
      {label:'Right-endpoint estimate',value:fmt(s.estimate,5)},
      {label:'Exact integral',value:fmt(s.exact,5)},
      {label:'Overestimate',value:fmt(s.error,5)},
      {label:'Rectangles',value:String(q.n)}]}},
  {id:'refraction',node:'physics.waves',subject:'physics',title:'Bending light at a boundary',loop:false,
    summary:'A ray changes direction as it crosses materials. From a denser optical medium it may reflect completely.',
    notice:'The normal is the angle reference. Going into a higher refractive index bends the ray towards the normal.',
    formula:'n_1\\sin\\theta_1=n_2\\sin\\theta_2',
    caveat:'Geometric optics with ideal flat media. Beyond the critical angle, the model shows total internal reflection.',
    params:[p('n1','Upper medium n₁',1,2.5,.1,1),p('n2','Lower medium n₂',1,2.5,.1,1.5),p('angle','Incident angle',10,80,5,45,'°')],
    duration:()=>7,readings:q=>{const s=refraction(q.n1,q.n2,q.angle);return [
      {label:'Incidence',value:fmt(q.angle,0)+'°'},
      {label:'Refraction',value:s.transmitted===null?'None — total internal reflection':fmt(s.transmitted,2)+'°'},
      {label:'Critical angle',value:s.critical===null?'Not applicable':fmt(s.critical,2)+'°'},
      {label:'Upper n₁ / lower n₂',value:fmt(q.n1,1)+' / '+fmt(q.n2,1)}]}},
];
