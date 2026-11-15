/** Canvas renderers for the concept animations. Each scene draws one frame from
 * (parameters, time) using the pure models in lib/animations.ts, laid out
 * against the current canvas size so it stays legible on a phone. */
import {themeColor,type ThemeId} from '@/lib/themes';
import {type Params,rad,clamp,fmt,parabola,parabolaRoots,parabolaX,circlePoint,trigAngle,secantSlope,secantGap,vectorSum,vectorPhase,inscribed,inscribedPoint,coinRun,coinCount,COIN_FLIPS,projectile,incline,INCLINE_LENGTH,pendulum,collision,cartWidth,COLLISION_TRACK,standingWave,STRING_LENGTH,ohm,CIRCUIT_FLOW} from '@/lib/animations';

type Ctx=CanvasRenderingContext2D;
export type Scene=(c:Ctx,W:number,H:number,q:Params,t:number)=>void;
interface Box {l:number;t:number;w:number;h:number}
interface Plane {X:(x:number)=>number;Y:(y:number)=>number;sx:number;sy:number;box:Box}

const BASE={text:'#eeecf5',muted:'#aaa6b9',faint:'#5d5873',grid:'#262332',axis:'#4a455c',purple:'#bba7f5',mint:'#92d5c4',amber:'#d8b87d',rose:'#e59ab4',panel:'#191821',well:'#221f2e',body:'#2b2640',block:'#3a3350'};
/** Palette for the frame being drawn; drawScene swaps it to the active theme before each scene runs. */
let C=BASE;
const palettes=new Map<ThemeId,typeof BASE>();
function palette(theme:ThemeId) {
  let found=palettes.get(theme);
  if(!found){found=Object.fromEntries(Object.entries(BASE).map(([key,color])=>[key,themeColor(color,theme)])) as typeof BASE;palettes.set(theme,found)}
  return found;
}
const FONT='Inter,"Segoe UI",Arial,sans-serif';

function plane(box:Box,x0:number,x1:number,y0:number,y1:number,equal=false):Plane {
  let sx=box.w/(x1-x0),sy=box.h/(y1-y0),ox=box.l,oy=box.t+box.h;
  if(equal){const s=Math.min(sx,sy);ox+=(box.w-s*(x1-x0))/2;oy-=(box.h-s*(y1-y0))/2;sx=sy=s}
  return {X:x=>ox+(x-x0)*sx,Y:y=>oy-(y-y0)*sy,sx,sy,box};
}
function line(c:Ctx,x1:number,y1:number,x2:number,y2:number,color:string,width=1.5,dash:number[]=[]) {
  c.save();c.strokeStyle=color;c.lineWidth=width;c.setLineDash(dash);c.lineCap='round';c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();c.restore();
}
function arrow(c:Ctx,x1:number,y1:number,x2:number,y2:number,color:string,width=2.5) {
  const length=Math.hypot(x2-x1,y2-y1);if(length<1.5)return;
  const head=Math.min(10,length*.6),angle=Math.atan2(y2-y1,x2-x1);
  line(c,x1,y1,x2-Math.cos(angle)*head*.7,y2-Math.sin(angle)*head*.7,color,width);
  c.save();c.fillStyle=color;c.beginPath();c.moveTo(x2,y2);c.lineTo(x2-head*Math.cos(angle-.42),y2-head*Math.sin(angle-.42));c.lineTo(x2-head*Math.cos(angle+.42),y2-head*Math.sin(angle+.42));c.closePath();c.fill();c.restore();
}
function dot(c:Ctx,x:number,y:number,r:number,color:string,hollow=false) {
  c.save();c.beginPath();c.arc(x,y,r,0,Math.PI*2);
  if(hollow){c.strokeStyle=color;c.lineWidth=1.5;c.stroke()}else{c.fillStyle=color;c.fill()}
  c.restore();
}
function text(c:Ctx,value:string,x:number,y:number,color=C.muted,align:CanvasTextAlign='left',size=12,weight=500) {
  c.save();c.font=`${weight} ${size}px ${FONT}`;c.textAlign=align;c.textBaseline='middle';
  c.lineWidth=4;c.strokeStyle=C.panel;c.lineJoin='round';c.strokeText(value,x,y);c.fillStyle=color;c.fillText(value,x,y);c.restore();
}
function clip(c:Ctx,box:Box,draw:()=>void) {c.save();c.beginPath();c.rect(box.l,box.t,box.w,box.h);c.clip();draw();c.restore()}
function curve(c:Ctx,pl:Plane,f:(x:number)=>number,from:number,to:number,color:string,width=2,dash:number[]=[]) {
  if(to<=from)return;
  c.save();c.strokeStyle=color;c.lineWidth=width;c.setLineDash(dash);c.lineJoin='round';c.beginPath();
  const steps=Math.max(2,Math.ceil((to-from)*pl.sx/2));
  for(let i=0;i<=steps;i++){const x=from+(to-from)*i/steps;if(i)c.lineTo(pl.X(x),pl.Y(f(x)));else c.moveTo(pl.X(x),pl.Y(f(x)))}
  c.stroke();c.restore();
}
/** Grid lines, the two axes and tick numbers for a coordinate plane. */
function grid(c:Ctx,pl:Plane,x0:number,x1:number,y0:number,y1:number,stepX:number,stepY:number,labelEvery=1) {
  for(let x=Math.ceil(x0/stepX)*stepX;x<=x1+1e-9;x+=stepX)line(c,pl.X(x),pl.Y(y0),pl.X(x),pl.Y(y1),C.grid,1);
  for(let y=Math.ceil(y0/stepY)*stepY;y<=y1+1e-9;y+=stepY)line(c,pl.X(x0),pl.Y(y),pl.X(x1),pl.Y(y),C.grid,1);
  if(y0<=0&&y1>=0)line(c,pl.X(x0),pl.Y(0),pl.X(x1),pl.Y(0),C.axis,1.3);
  if(x0<=0&&x1>=0)line(c,pl.X(0),pl.Y(y0),pl.X(0),pl.Y(y1),C.axis,1.3);
  const ax=clamp(0,x0,x1),ay=clamp(0,y0,y1);
  for(let x=Math.ceil(x0/stepX)*stepX,i=0;x<=x1+1e-9;x+=stepX,i++){const v=Math.round(x*1e6)/1e6;if(v!==0&&Math.round(v/stepX)%labelEvery===0)text(c,String(v),pl.X(x),pl.Y(ay)+11,C.faint,'center',10)}
  for(let y=Math.ceil(y0/stepY)*stepY;y<=y1+1e-9;y+=stepY){const v=Math.round(y*1e6)/1e6;if(v!==0&&Math.round(v/stepY)%labelEvery===0)text(c,String(v),pl.X(ax)-7,pl.Y(y),C.faint,'right',10)}
}
function legend(c:Ctx,items:[string,string][],x:number,y:number) {
  let at=x;
  for(const [color,label] of items){line(c,at,y,at+14,y,color,3);text(c,label,at+19,y,C.muted,'left',11);c.save();c.font=`500 11px ${FONT}`;at+=27+c.measureText(label).width+8;c.restore()}
}
/** Arc marking the angle at (cx, cy) between the rays towards a and b (the smaller one). */
function angleArc(c:Ctx,cx:number,cy:number,ax:number,ay:number,bx:number,by:number,r:number,color:string) {
  const start=Math.atan2(ay-cy,ax-cx),end=Math.atan2(by-cy,bx-cx);
  const delta=((end-start)%(2*Math.PI)+3*Math.PI)%(2*Math.PI)-Math.PI;
  c.save();c.strokeStyle=color;c.lineWidth=2;c.beginPath();c.arc(cx,cy,r,start,start+delta,delta<0);c.stroke();c.restore();
}

const drawParabola:Scene=(c,W,H,q,t)=>{
  const pl=plane({l:14,t:10,w:W-28,h:H-20},-5,5,-6,6);
  const f=(x:number)=>parabola(q.a,q.h,q.k,x),x=parabolaX(t,8);
  grid(c,pl,-5,5,-6,6,1,1,2);
  clip(c,pl.box,()=>{
    line(c,pl.X(q.h),pl.Y(-6),pl.X(q.h),pl.Y(6),C.amber+'88',1.2,[5,5]);
    curve(c,pl,f,-5,5,C.faint,1.5);curve(c,pl,f,-5,x,C.purple,3);
    for(const root of parabolaRoots(q.a,q.h,q.k))dot(c,pl.X(root),pl.Y(0),5,C.mint);
    dot(c,pl.X(q.h),pl.Y(q.k),5.5,C.amber);dot(c,pl.X(x),pl.Y(f(x)),6,C.text);
  });
  text(c,'vertex',pl.X(q.h)+10,clamp(pl.Y(q.k)+(q.a<0?-14:14),18,H-18),C.amber,'left',11);
  legend(c,[[C.purple,'traced curve'],[C.mint,'x-intercepts']],18,18);
};

const drawUnitCircle:Scene=(c,W,H,q,t)=>{
  const theta=trigAngle(t),side=Math.min(H,W*.42),cx=side/2+6,cy=H/2,s=(side/2-6)/1.65;
  const point=circlePoint(q.r,theta),px=cx+point.x*s,py=cy-point.y*s;
  const left=side+22,right=W-16,X=(angle:number)=>left+angle/(2*Math.PI)*(right-left),Y=(y:number)=>cy-y*s;
  // circle
  line(c,cx-1.65*s,cy,cx+1.65*s,cy,C.axis,1.2);line(c,cx,cy-1.65*s,cx,cy+1.65*s,C.axis,1.2);
  c.save();c.strokeStyle=C.faint;c.lineWidth=1.6;c.beginPath();c.arc(cx,cy,q.r*s,0,Math.PI*2);c.stroke();
  c.strokeStyle=C.amber;c.lineWidth=2;c.beginPath();c.arc(cx,cy,Math.min(16,q.r*s*.4),0,-theta,true);c.stroke();c.restore();
  line(c,cx,cy,px,py,C.muted,1.5);line(c,cx,cy,px,cy,C.mint,3);line(c,px,cy,px,py,C.purple,3);
  // waves
  line(c,left,cy,right,cy,C.axis,1.2);line(c,left,Y(-1.65),left,Y(1.65),C.axis,1.2);
  const ticks:[number,string][]=[[.5,'π/2'],[1,'π'],[1.5,'3π/2'],[2,'2π']];
  for(const [m,label] of ticks){line(c,X(m*Math.PI),Y(-1.65),X(m*Math.PI),Y(1.65),C.grid,1);text(c,label,X(m*Math.PI),cy+12,C.faint,'center',10)}
  const wave:Plane={X,Y,sx:(right-left)/(2*Math.PI),sy:s,box:{l:left,t:0,w:right-left,h:H}};
  const sine=(a:number)=>q.r*Math.sin(a),cosine=(a:number)=>q.r*Math.cos(a);
  curve(c,wave,sine,0,2*Math.PI,C.purple+'44',1.5);curve(c,wave,cosine,0,2*Math.PI,C.mint+'44',1.5);
  curve(c,wave,sine,0,theta,C.purple,2.6);curve(c,wave,cosine,0,theta,C.mint,2.6);
  line(c,px,py,X(theta),py,C.purple+'99',1.2,[4,5]);
  dot(c,X(theta),Y(cosine(theta)),5,C.mint);dot(c,X(theta),py,5.5,C.purple);dot(c,px,py,6,C.text);
  legend(c,[[C.purple,'r sin θ'],[C.mint,'r cos θ']],left+8,16);
};

const drawDerivative:Scene=(c,W,H,q,t)=>{
  const x0=-2,x1=3.3,pl=plane({l:14,t:10,w:W-28,h:H-20},x0,x1,-1.5,9.5);
  const f=(x:number)=>x*x,h=secantGap(t),a=q.x0,b=q.x0+h,m=secantSlope(a,h);
  grid(c,pl,x0,x1,-1.5,9.5,1,1,2);
  clip(c,pl.box,()=>{
    curve(c,pl,f,x0,x1,C.muted,2);
    curve(c,pl,x=>f(a)+2*a*(x-a),x0,x1,C.amber,1.6,[6,5]);
    curve(c,pl,x=>f(a)+m*(x-a),x0,x1,C.purple,2.6);
    if(h>0){line(c,pl.X(a),pl.Y(f(a)),pl.X(b),pl.Y(f(a)),C.mint,2);line(c,pl.X(b),pl.Y(f(a)),pl.X(b),pl.Y(f(b)),C.mint,2)}
    if(h>0)dot(c,pl.X(b),pl.Y(f(b)),5.5,C.purple);
    dot(c,pl.X(a),pl.Y(f(a)),6,C.text);
  });
  if(h>.25)text(c,'h',pl.X(a+h/2),pl.Y(f(a))+12,C.mint,'center',12);
  legend(c,[[C.purple,'secant'],[C.amber,'tangent at x₀'],[C.mint,'run h and rise']],18,18);
};

const drawVectors:Scene=(c,W,H,q,t)=>{
  const pl=plane({l:8,t:8,w:W-16,h:H-16},-7.6,7.6,-1,7.6,true);
  const s=vectorSum(3,q.aAngle,q.bLength,q.bAngle),{slide,grow}=vectorPhase(t);
  const O={x:pl.X(0),y:pl.Y(0)},A={x:pl.X(s.a.x),y:pl.Y(s.a.y)};
  clip(c,pl.box,()=>{
    for(let x=-7;x<=7;x++)line(c,pl.X(x),pl.Y(-1),pl.X(x),pl.Y(7.6),C.grid,1);
    for(let y=-1;y<=7;y++)line(c,pl.X(-7.6),pl.Y(y),pl.X(7.6),pl.Y(y),C.grid,1);
    line(c,pl.X(-7.6),O.y,pl.X(7.6),O.y,C.axis,1.3);line(c,O.x,pl.Y(-1),O.x,pl.Y(7.6),C.axis,1.3);
  });
  if(slide>0)line(c,O.x,O.y,pl.X(s.b.x),pl.Y(s.b.y),C.mint+'66',1.5,[5,5]);
  const bx=s.a.x*slide,by=s.a.y*slide;
  arrow(c,O.x,O.y,A.x,A.y,C.purple,3);
  arrow(c,pl.X(bx),pl.Y(by),pl.X(bx+s.b.x),pl.Y(by+s.b.y),C.mint,3);
  if(grow>0)arrow(c,O.x,O.y,pl.X(s.x*grow),pl.Y(s.y*grow),C.amber,3.5);
  text(c,'a',(O.x+A.x)/2+9*Math.sin(rad(q.aAngle)),(O.y+A.y)/2+11*Math.cos(rad(q.aAngle)),C.purple,'center',14,650);
  text(c,'b',pl.X(bx+s.b.x/2)+11*Math.sin(rad(q.bAngle)),pl.Y(by+s.b.y/2)+11*Math.cos(rad(q.bAngle)),C.mint,'center',14,650);
  if(grow>.6&&s.length>.4)text(c,'a + b',pl.X(s.x/2)-14*Math.sin(rad(s.angle)),pl.Y(s.y/2)-14*Math.cos(rad(s.angle)),C.amber,'center',13,650);
  dot(c,O.x,O.y,3.5,C.text);
};

const drawInscribed:Scene=(c,W,H,q,t)=>{
  const pl=plane({l:8,t:8,w:W-16,h:H-16},-1.7,1.7,-1.28,1.28,true);
  const at=inscribedPoint(q.central,t),{A,B,P,angle}=inscribed(q.central,at);
  const S=(point:{x:number;y:number})=>({x:pl.X(point.x),y:pl.Y(point.y)});
  const a=S(A),b=S(B),p=S(P),o=S({x:0,y:0}),r=pl.sx;
  c.save();c.strokeStyle=C.faint;c.lineWidth=1.6;c.beginPath();c.arc(o.x,o.y,r,0,Math.PI*2);c.stroke();c.restore();
  line(c,a.x,a.y,b.x,b.y,C.faint,1.4,[5,5]);
  line(c,o.x,o.y,a.x,a.y,C.amber,2.2);line(c,o.x,o.y,b.x,b.y,C.amber,2.2);
  line(c,p.x,p.y,a.x,a.y,C.purple,2.6);line(c,p.x,p.y,b.x,b.y,C.purple,2.6);
  angleArc(c,o.x,o.y,a.x,a.y,b.x,b.y,r*.17,C.amber);angleArc(c,p.x,p.y,a.x,a.y,b.x,b.y,r*.2,C.purple);
  text(c,`${fmt(q.central,0)}°`,o.x,o.y+r*.3,C.amber,'center',13,650);
  const mx=(A.x+B.x)/2-P.x,my=(A.y+B.y)/2-P.y,ml=Math.hypot(mx,my);
  text(c,`${fmt(angle,1)}°`,p.x+mx/ml*r*.36,p.y-my/ml*r*.36,C.purple,'center',13,650);
  dot(c,a.x,a.y,4.5,C.text);dot(c,b.x,b.y,4.5,C.text);dot(c,o.x,o.y,3.5,C.amber);dot(c,p.x,p.y,6.5,C.purple);
  text(c,'A',a.x-12,a.y+10,C.text,'center',12);text(c,'B',b.x+12,b.y+10,C.text,'center',12);text(c,'O',o.x+11,o.y-9,C.muted,'center',12);
  text(c,'P',p.x+P.x*16,p.y-P.y*16,C.purple,'center',13,650);
};

const drawCoins:Scene=(c,W,H,q,t)=>{
  const pl=plane({l:40,t:16,w:W-58,h:H-84},0,COIN_FLIPS,0,1),run=coinRun(q.p,q.seed),n=coinCount(t);
  for(const y of [0,.25,.5,.75,1]){line(c,pl.X(0),pl.Y(y),pl.X(COIN_FLIPS),pl.Y(y),y?C.grid:C.axis,1);text(c,y.toFixed(2),pl.X(0)-7,pl.Y(y),C.faint,'right',10)}
  for(let x=0;x<=COIN_FLIPS;x+=100){line(c,pl.X(x),pl.Y(0),pl.X(x),pl.Y(1),x?C.grid:C.axis,1);text(c,String(x),pl.X(x),pl.Y(0)+12,C.faint,'center',10)}
  text(c,'number of flips',pl.X(COIN_FLIPS),pl.Y(0)+27,C.faint,'right',10);
  line(c,pl.X(0),pl.Y(q.p),pl.X(COIN_FLIPS),pl.Y(q.p),C.amber,1.6,[6,5]);
  text(c,`p = ${fmt(q.p,1)}`,pl.X(COIN_FLIPS)-4,pl.Y(q.p)+(q.p>.8?13:-11),C.amber,'right',11);
  if(n){
    c.save();c.strokeStyle=C.purple;c.lineWidth=2.2;c.lineJoin='round';c.beginPath();
    for(let i=1;i<=n;i++){if(i>1)c.lineTo(pl.X(i),pl.Y(run[i-1]));else c.moveTo(pl.X(i),pl.Y(run[i-1]))}
    c.stroke();c.restore();dot(c,pl.X(n),pl.Y(run[n-1]),5,C.text);
  }
  const shown=Math.min(n,24,Math.max(6,Math.floor((W-120)/15))),y=H-17;
  text(c,'Latest flips',14,y,C.muted,'left',11);
  for(let i=0;i<shown;i++){
    const flip=n-shown+i+1,heads=Math.round(run[flip-1]*flip)-(flip>1?Math.round(run[flip-2]*(flip-1)):0)===1;
    dot(c,96+i*15,y,4.5,heads?C.purple:C.faint,!heads);
  }
  legend(c,[[C.purple,'share of heads so far'],[C.amber,'true probability']],pl.X(0)+10,pl.Y(1)+12);
};

const drawProjectile:Scene=(c,W,H,q,t)=>{
  const pl=plane({l:8,t:8,w:W-16,h:H-30},-3,72,-2,37,true),s=projectile(q.speed,q.angle,t);
  const at=(time:number)=>projectile(q.speed,q.angle,time);
  line(c,pl.X(-3),pl.Y(0),pl.X(72),pl.Y(0),C.axis,1.6);
  for(let x=0;x<=60;x+=20){line(c,pl.X(x),pl.Y(0),pl.X(x),pl.Y(0)+5,C.axis,1.3);text(c,`${x} m`,pl.X(x),pl.Y(0)+15,C.faint,'center',10)}
  const path=(until:number,color:string,width:number,dash:number[])=>{c.save();c.strokeStyle=color;c.lineWidth=width;c.setLineDash(dash);c.lineJoin='round';c.beginPath();for(let i=0;i<=80;i++){const p=at(until*i/80);if(i)c.lineTo(pl.X(p.x),pl.Y(p.y));else c.moveTo(pl.X(p.x),pl.Y(p.y))}c.stroke();c.restore()};
  path(s.flight,C.faint,1.4,[5,6]);path(Math.min(t,s.flight),C.purple,2.8,[]);
  const peak=at(s.flight/2);dot(c,pl.X(peak.x),pl.Y(peak.y),3.5,C.amber);dot(c,pl.X(s.range),pl.Y(0),3.5,C.amber);
  c.save();c.strokeStyle=C.amber;c.lineWidth=1.8;c.beginPath();c.arc(pl.X(0),pl.Y(0),20,0,-rad(q.angle),true);c.stroke();c.restore();
  const x=pl.X(s.x),y=pl.Y(s.y),k=.5*pl.sx;
  arrow(c,x,y,x+s.vx*k,y,C.mint,2.6);arrow(c,x,y,x,y-s.vy*k,C.rose,2.6);
  dot(c,x,y,6.5,C.text);
  legend(c,[[C.mint,'horizontal velocity'],[C.rose,'vertical velocity']],16,16);
};

const drawIncline:Scene=(c,W,H,q,t)=>{
  const ramp=INCLINE_LENGTH+.9,theta=rad(q.angle),s=incline(q.angle,q.mu,t);
  const pl=plane({l:8,t:26,w:W-16,h:H-36},-.9,ramp*Math.cos(theta)+.7,-1,ramp*Math.sin(theta)+1.25,true);
  const top={x:0,y:ramp*Math.sin(theta)},d={x:Math.cos(theta),y:-Math.sin(theta)},n={x:Math.sin(theta),y:Math.cos(theta)};
  const P=(x:number,y:number):[number,number]=>[pl.X(x),pl.Y(y)];
  c.save();c.fillStyle=C.well;c.strokeStyle=C.axis;c.lineWidth=1.6;c.beginPath();c.moveTo(...P(0,0));c.lineTo(...P(top.x,top.y));c.lineTo(...P(ramp*Math.cos(theta),0));c.closePath();c.fill();c.stroke();
  c.strokeStyle=C.amber;c.lineWidth=1.8;c.beginPath();c.arc(pl.X(ramp*Math.cos(theta)),pl.Y(0),26,Math.PI,Math.PI+theta);c.stroke();c.restore();
  text(c,'θ',pl.X(ramp*Math.cos(theta))-38*Math.cos(theta/2),pl.Y(0)-38*Math.sin(theta/2),C.amber,'center',13,650);
  const side=.5,along=.45+s.distance,centre={x:top.x+d.x*along+n.x*side/2,y:top.y+d.y*along+n.y*side/2};
  c.save();c.translate(pl.X(centre.x),pl.Y(centre.y));c.rotate(theta);c.fillStyle=C.block;c.strokeStyle=C.purple;c.lineWidth=2;const half=side*pl.sx/2;c.beginPath();c.rect(-half,-half,2*half,2*half);c.fill();c.stroke();c.restore();
  const k=.062,cx=pl.X(centre.x),cy=pl.Y(centre.y),V=(vx:number,vy:number,newtons:number):[number,number]=>[pl.X(centre.x+vx*newtons*k),pl.Y(centre.y+vy*newtons*k)];
  line(c,cx,cy,...V(d.x,d.y,s.parallel),C.purple,1.8,[4,4]);
  arrow(c,cx,cy,...V(0,-1,s.weight),C.rose,2.6);arrow(c,cx,cy,...V(n.x,n.y,s.normal),C.mint,2.6);
  if(s.friction>.05)arrow(c,cx,cy,...V(-d.x,-d.y,s.friction),C.amber,2.6);
  dot(c,cx,cy,3,C.text);
  text(c,s.slides?'Sliding':'Held by static friction',W-14,H-14,s.slides?C.mint:C.amber,'right',12,650);
  legend(c,W<520?[[C.rose,'weight'],[C.mint,'normal'],[C.amber,'friction']]:[[C.rose,'weight'],[C.mint,'normal force'],[C.amber,'friction'],[C.purple,'pull along slope']],14,14);
};

const drawPendulum:Scene=(c,W,H,q,t)=>{
  const s=pendulum(q.length,q.release,t),split=W*.68;
  const pl=plane({l:6,t:8,w:split-10,h:H-16},-2.75,2.75,-2.95,.35,true);
  const px=pl.X(0),py=pl.Y(0),bx=pl.X(q.length*Math.sin(s.theta)),by=pl.Y(-q.length*Math.cos(s.theta)),low=pl.Y(-q.length);
  line(c,pl.X(-1.2),py,pl.X(1.2),py,C.axis,3);
  c.save();c.strokeStyle=C.faint;c.setLineDash([4,6]);c.lineWidth=1.4;c.beginPath();c.arc(px,py,q.length*pl.sx,Math.PI/2-rad(q.release),Math.PI/2+rad(q.release));c.stroke();c.restore();
  line(c,pl.X(-2.6),low,pl.X(2.6),low,C.grid,1.2);text(c,'h = 0',pl.X(-2.6)+4,low+12,C.faint,'left',10);
  if(Math.abs(by-low)>2){line(c,bx,by,bx,low,C.mint,2.4);text(c,'h',bx+(s.theta>=0?12:-12),(by+low)/2,C.mint,'center',12,650)}
  line(c,px,py,bx,by,C.muted,1.8);dot(c,px,py,3.5,C.muted);dot(c,bx,by,11,C.purple);
  const kv=.12*pl.sx*s.speed;arrow(c,bx,by,bx+kv*Math.cos(s.theta),by-kv*Math.sin(s.theta),C.text,2);
  const base=H-34,full=H-78,slot=(W-split-14)/3,bar=Math.min(34,slot*.6);
  const bars:[string,number,string][]=[['PE',s.potential,C.mint],['KE',s.kinetic,C.purple],['Total',s.potential+s.kinetic,C.amber]];
  line(c,split,base,W-10,base,C.axis,1.3);
  bars.forEach(([label,value,color],i)=>{
    const x=split+slot*(i+.5)+2,height=full*clamp(value/s.total,0,1.02);
    c.save();c.fillStyle=C.well;c.fillRect(x-bar/2,base-full,bar,full);c.fillStyle=color;c.fillRect(x-bar/2,base-height,bar,height);c.restore();
    text(c,label,x,base+14,color,'center',11,650);
  });
};

const drawCollision:Scene=(c,W,H,q,t)=>{
  const s=collision(q.m1,q.m2,q.u1,q.e,t),w1=cartWidth(q.m1),w2=cartWidth(q.m2);
  const pl=plane({l:10,t:0,w:W-20,h:H},COLLISION_TRACK[0]-2.4,COLLISION_TRACK[1]+.4,0,1);
  const track=H*.36,height=Math.min(46,H*.15);
  line(c,10,track,W-10,track,C.axis,2);
  const cart=(left:number,width:number,color:string,label:string,v:number)=>{
    const x=pl.X(left),w=width*pl.sx,mid=x+w/2;
    c.save();c.fillStyle=C.body;c.strokeStyle=color;c.lineWidth=2;c.beginPath();c.rect(x,track-height-6,w,height);c.fill();c.stroke();c.restore();
    dot(c,x+w*.25,track-4,4,color);dot(c,x+w*.75,track-4,4,color);
    text(c,label,mid,track+15,color,'center',11,650);
    arrow(c,mid,track-height-20,mid+v*.5*pl.sx,track-height-20,color,2.6);
    if(Math.abs(v)<.005)text(c,'at rest',mid,track-height-20,C.faint,'center',10);
  };
  clip(c,{l:0,t:0,w:W,h:track+26},()=>{cart(s.x1-w1,w1,C.purple,`${fmt(q.m1,1)} kg`,s.now1);cart(s.x2,w2,C.mint,`${fmt(q.m2,1)} kg`,s.now2)});
  text(c,s.before?'Before collision':'After collision',W-14,16,C.muted,'right',12,650);
  const total=q.m1*q.u1,labelW=70,zero=labelW+(W-labelW-18)/3,unit=(W-labelW-18)*2/3/(2*total),top=H*.56,row=(H-top-12)/3,thick=Math.min(18,row*.55);
  text(c,'Momentum (kg·m/s)',14,top-4,C.faint,'left',10);
  const rows:[string,number,string][]=[['Cart 1',q.m1*s.now1,C.purple],['Cart 2',q.m2*s.now2,C.mint],['Total',s.momentum,C.amber]];
  rows.forEach(([label,value,color],i)=>{
    const y=top+row*(i+.6);
    text(c,label,14,y,color,'left',11,650);
    c.save();c.fillStyle=color;c.fillRect(Math.min(zero,zero+value*unit),y-thick/2,Math.abs(value*unit),thick);c.restore();
    text(c,fmt(value),(value>=0?zero+value*unit+8:zero+value*unit-8),y,C.muted,value>=0?'left':'right',11);
  });
  line(c,zero,top+row*.15,zero,H-10,C.axis,1.3);
};

const drawWave:Scene=(c,W,H,q,t)=>{
  const pl=plane({l:26,t:34,w:W-52,h:H-58},0,STRING_LENGTH,-1.15,1.15),n=q.harmonic,A=q.amplitude;
  const at=(x:number)=>standingWave(n,A,x,t),k=Math.PI*n/STRING_LENGTH;
  line(c,pl.X(0),pl.Y(0),pl.X(STRING_LENGTH),pl.Y(0),C.grid,1.2);
  line(c,pl.X(0),pl.Y(-1.1),pl.X(0),pl.Y(1.1),C.axis,4);line(c,pl.X(STRING_LENGTH),pl.Y(-1.1),pl.X(STRING_LENGTH),pl.Y(1.1),C.axis,4);
  curve(c,pl,x=>A*Math.sin(k*x),0,STRING_LENGTH,C.faint,1.2,[4,6]);curve(c,pl,x=>-A*Math.sin(k*x),0,STRING_LENGTH,C.faint,1.2,[4,6]);
  curve(c,pl,x=>at(x).right,0,STRING_LENGTH,C.mint+'aa',1.5);curve(c,pl,x=>at(x).left,0,STRING_LENGTH,C.rose+'aa',1.5);
  curve(c,pl,x=>at(x).sum,0,STRING_LENGTH,C.purple,3.2);
  for(let i=0;i<=n;i++)dot(c,pl.X(i*STRING_LENGTH/n),pl.Y(0),5,C.amber);
  legend(c,W<520?[[C.mint,'→'],[C.rose,'←'],[C.purple,'sum'],[C.amber,'nodes']]:[[C.mint,'wave travelling right'],[C.rose,'wave travelling left'],[C.purple,'their sum'],[C.amber,'nodes']],14,16);
};

const drawCircuit:Scene=(c,W,H,q,t)=>{
  const s=ohm(q.voltage,q.resistance),l=W*.2,r=W*.8,top=H*.22,bottom=H*.82,w=r-l,h=bottom-top,perimeter=2*(w+h),mid=(top+bottom)/2;
  c.save();c.strokeStyle=C.axis;c.lineWidth=2.5;c.lineJoin='round';c.strokeRect(l,top,w,h);c.restore();
  const count=Math.max(8,Math.floor(perimeter/30)),spacing=perimeter/count,phase=(CIRCUIT_FLOW*s.current*t)%1;
  for(let i=0;i<count;i++){
    const at=(i+phase)*spacing%perimeter;
    const [x,y]=at<w?[l+at,top]:at<w+h?[r,top+at-w]:at<2*w+h?[r-(at-w-h),bottom]:[l,bottom-(at-2*w-h)];
    dot(c,x,y,3.6,C.purple);
  }
  // battery: long plate is the positive terminal
  c.save();c.fillStyle=C.panel;c.fillRect(l-14,mid-9,28,18);c.restore();
  line(c,l-16,mid-8,l+16,mid-8,C.amber,3);line(c,l-8,mid+8,l+8,mid+8,C.amber,3);
  text(c,'+',l-26,mid-9,C.amber,'center',13,650);text(c,'−',l-26,mid+9,C.amber,'center',13,650);
  text(c,`${fmt(q.voltage,1)} V`,l-38,mid,C.amber,'right',13,650);
  // resistor glows with dissipated power
  const glow=Math.sqrt(clamp(s.power/60,0,1)),rw=22,rh=Math.min(84,h*.5);
  c.save();c.shadowColor=C.rose;c.shadowBlur=6+40*glow;c.fillStyle=C.rose;c.strokeStyle=C.rose;c.lineWidth=2;c.beginPath();c.rect(r-rw/2,mid-rh/2,rw,rh);c.globalAlpha=.18+.82*glow;c.fill();c.globalAlpha=1;c.stroke();c.restore();
  text(c,`${fmt(q.resistance,0)} Ω`,r+rw/2+10,mid,C.rose,'left',13,650);
  arrow(c,l+w*.38,top-16,l+w*.62,top-16,C.purple,2.4);text(c,`I = ${fmt(s.current)} A`,l+w/2,top-32,C.purple,'center',12,650);
  text(c,`P = ${fmt(s.power)} W`,l+w/2,mid,C.muted,'center',12);
};

const SCENES:Record<string,Scene>={parabola:drawParabola,'unit-circle':drawUnitCircle,derivative:drawDerivative,'vector-addition':drawVectors,'inscribed-angle':drawInscribed,'law-of-large-numbers':drawCoins,projectile:drawProjectile,incline:drawIncline,'pendulum-energy':drawPendulum,collision:drawCollision,'standing-wave':drawWave,circuit:drawCircuit};

/** Draw one frame of an animation in the given theme. */
export function drawScene(id:string,theme:ThemeId,c:Ctx,W:number,H:number,q:Params,t:number) {C=palette(theme);SCENES[id](c,W,H,q,t)}
