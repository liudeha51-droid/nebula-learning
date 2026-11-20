import {describe,it,expect} from 'vitest';
import {ANIMATIONS,animationsForNode,initialParams} from './animations';
import {ADDITIONAL_ANIMATIONS,areaTiles,boyle,equationBalance,fractionPosition,fractionSum,induction,photoelectric,refraction,riemannRight,COIL_AREA,GAS_VOLUME} from './animation-expansion';
import {ADDITIONAL_SCENES,type Palette} from '../components/animation-expansion-scenes';

describe('eight new pure animation models',()=>{
  it('adds unlike-denominator fractions and reduces them',()=>{
    expect(fractionSum(1,2,1,3)).toMatchObject({sum:5/6,numerator:5,denominator:6});
    expect(fractionSum(2,4,2,4)).toMatchObject({sum:1,numerator:1,denominator:1});
    expect(fractionPosition(.5,.25,0)).toBe(0);
    expect(fractionPosition(.5,.25,3)).toBeCloseTo(.5,10);
    expect(fractionPosition(.5,.25,8)).toBeCloseTo(.75,10);
  });
  it('builds binomial area from exactly four tiles',()=>{
    expect(areaTiles(3,2,1)).toEqual({square:9,top:6,side:3,corner:2,total:20});
    for(const x of [1,3,5])for(const a of [1,4])for(const b of [1,4]){
      const v=areaTiles(x,a,b);expect(v.square+v.top+v.side+v.corner).toBe(v.total);
    }
  });
  it('keeps an equation balanced through subtraction and division',()=>{
    const start=equationBalance(3,6,4,0),end=equationBalance(3,6,4,8);
    expect(start).toMatchObject({rhs:18,coefficient:3,constant:6,right:18});
    expect(end.coefficient).toBeCloseTo(1,12);
    expect(end.constant).toBeCloseTo(0,12);
    expect(end.right).toBeCloseTo(4,12);
    for(let t=0;t<=8;t+=.25){const v=equationBalance(3,6,4,t);expect(v.coefficient*4+v.constant).toBeCloseTo(v.right,10)}
  });
  it('induction obeys Faraday’s law and peaks when flux crosses zero',()=>{
    const f=1.25,B=.8,N=40,quarter=induction(B,N,f,1/(4*f));
    expect(induction(B,N,f,0).flux).toBeCloseTo(B*COIL_AREA,12);
    expect(induction(B,N,f,0).emf).toBeCloseTo(0,12);
    expect(quarter.flux).toBeCloseTo(0,12);
    expect(quarter.emf).toBeCloseTo(quarter.peak,12);
    expect(induction(B,N,f,1/f).emf).toBeCloseTo(0,12);
  });
  it('Boyle’s law conserves PV and doubles pressure at half volume',()=>{
    const before=boyle(100,.5,0),after=boyle(100,.5,8);
    expect(before.volume).toBe(GAS_VOLUME);
    expect(after.volume).toBeCloseTo(2,12);
    expect(after.pressure).toBeCloseTo(200,12);
    for(let t=0;t<=8;t+=.25){const s=boyle(160,.7,t);expect(s.pressure*s.volume).toBeCloseTo(160*GAS_VOLUME,10)}
  });
  it('the photoelectric threshold depends on frequency, not intensity',()=>{
    const low=photoelectric(4,3),high=photoelectric(10,3);
    expect(low.emitted).toBe(false);expect(low.kinetic).toBe(0);
    expect(high.emitted).toBe(true);expect(high.kinetic).toBeCloseTo(high.energy-3,12);
    expect(high.speed).toBeGreaterThan(0);
    expect(photoelectric(20,3).kinetic).toBeGreaterThan(high.kinetic);
    expect(high.threshold).toBeGreaterThan(4);
  });
  it('right-endpoint sums overestimate and converge to the integral',()=>{
    for(const power of [1,2,3]){
      const a=riemannRight(2,power),b=riemannRight(16,power),c=riemannRight(48,power);
      expect(a.exact).toBeCloseTo(1/(power+1),12);
      expect(a.error).toBeGreaterThan(b.error);
      expect(b.error).toBeGreaterThan(c.error);
      expect(c.error).toBeGreaterThan(0);
    }
  });
  it('Snell’s law handles equal media, refraction and total internal reflection',()=>{
    expect(refraction(1,1,50).transmitted).toBeCloseTo(50,10);
    const glass=refraction(1,1.5,30);
    expect(glass.totalInternalReflection).toBe(false);
    expect(glass.transmitted).toBeCloseTo(19.4712206345,8);
    const tir=refraction(1.5,1,60);
    expect(tir.transmitted).toBeNull();
    expect(tir.totalInternalReflection).toBe(true);
    expect(tir.critical).toBeCloseTo(41.810314896,8);
    const before=refraction(1.5,1,30);expect(before.transmitted).not.toBeNull();
  });
});

describe('catalogue and Canvas smoke checks',()=>{
  it('has 20 unique ids across all 18 original taxonomy nodes',()=>{
    const math=['numbers','algebra','equations','functions','geometry','trigonometry','vectors','statistics','calculus'].map(n=>'math.'+n);
    const physics=['motion','forces','energy','momentum','electricity','magnetism','waves','thermal','modern'].map(n=>'physics.'+n);
    expect(ANIMATIONS).toHaveLength(20);
    expect(new Set(ANIMATIONS.map(a=>a.id)).size).toBe(20);
    expect(new Set(ANIMATIONS.map(a=>a.node))).toEqual(new Set([...math,...physics]));
    expect(animationsForNode('math.calculus')).toHaveLength(2);
    expect(animationsForNode('physics.waves')).toHaveLength(2);
    expect(Object.keys(ADDITIONAL_SCENES).sort()).toEqual(ADDITIONAL_ANIMATIONS.map(a=>a.id).sort());
  });
  it('is deterministic and draws finite coordinates at slider limits, loop boundaries and mobile width',()=>{
    const palette:Palette={text:'#fff',muted:'#aaa',faint:'#777',grid:'#333',axis:'#555',purple:'#aab',mint:'#aee',amber:'#fc9',rose:'#f9a',panel:'#111',well:'#222',body:'#333',block:'#444'};
    const canvas=new Proxy({},{
      get(_target,key){if(key==='measureText')return (value:string)=>({width:value.length*6});
        return (...args:unknown[])=>{for(const v of args)if(typeof v==='number')expect(Number.isFinite(v),String(key)).toBe(true)};
      },set(){return true}
    }) as unknown as CanvasRenderingContext2D;
    for(const spec of ADDITIONAL_ANIMATIONS){
      const initial=initialParams(spec),min=Object.fromEntries(spec.params.map(p=>[p.key,p.min])),max=Object.fromEntries(spec.params.map(p=>[p.key,p.max]));
      for(const params of [initial,min,max,...spec.params.map(p=>({...initial,[p.key]:p.min})),...spec.params.map(p=>({...initial,[p.key]:p.max}))]){
        const duration=spec.duration(params);
        expect(Number.isFinite(duration)&&duration>0).toBe(true);
        for(const t of [0,duration/3,duration]){
          const readings=spec.readings(params,t);
          expect(readings).toEqual(spec.readings(params,t));
          for(const reading of readings)expect(reading.value).not.toMatch(/NaN|Infinity|undefined/);
          for(const [w,h] of [[360,260],[860,450]]){
            expect(()=>ADDITIONAL_SCENES[spec.id](canvas,w,h,params,t,palette),spec.id).not.toThrow();
          }
        }
      }
    }
  });
});
