/** Canvas scenes for the eight expansion topics. No timers or mutable model
 * state: each scene is derived from (parameters, elapsed time, canvas size). */
import {fractionSum,fractionPosition,areaTiles,equationBalance,induction,boyle,photoelectric,riemannRight,refraction,ease,GAS_VOLUME,GAS_DURATION,RIEMANN_DURATION} from '../lib/animation-expansion';

type Ctx=CanvasRenderingContext2D;
export type Palette={text:string;muted:string;faint:string;grid:string;axis:string;purple:string;mint:string;amber:string;rose:string;panel:string;well:string;body:string;block:string};
export type AdditionalScene=(c:Ctx,w:number,h:number,q:Record<string,number>,t:number,k:Palette)=>void;
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const fmt=(n:number,d=2)=>n.toFixed(d);
const font='Inter,"Segoe UI",Arial,sans-serif';
function line(c:Ctx,x:number,y:number,X:number,Y:number,color:string,width=2,dash:number[]=[]) {
  c.save();c.strokeStyle=color;c.lineWidth=width;c.setLineDash(dash);c.lineCap='round';
  c.beginPath();c.moveTo(x,y);c.lineTo(X,Y);c.stroke();c.restore();
}
function dot(c:Ctx,x:number,y:number,r:number,color:string){
  c.save();c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();c.restore();
}
function label(c:Ctx,value:string,x:number,y:number,color:string,align:CanvasTextAlign='center',size=12){
  c.save();c.font='600 '+size+'px '+font;c.textAlign=align;c.textBaseline='middle';c.fillStyle=color;c.fillText(value,x,y);c.restore();
}
function rect(c:Ctx,x:number,y:number,w:number,h:number,fill:string,stroke:string,alpha=1){
  c.save();c.globalAlpha=alpha;c.fillStyle=fill;c.strokeStyle=stroke;c.lineWidth=1.7;c.fillRect(x,y,w,h);c.strokeRect(x,y,w,h);c.restore();
}
function arrow(c:Ctx,x:number,y:number,X:number,Y:number,color:string,width=2.5) {
  const a=Math.atan2(Y-y,X-x),r=9;
  line(c,x,y,X,Y,color,width);
  c.save();c.fillStyle=color;c.beginPath();c.moveTo(X,Y);c.lineTo(X-r*Math.cos(a-.42),Y-r*Math.sin(a-.42));c.lineTo(X-r*Math.cos(a+.42),Y-r*Math.sin(a+.42));c.closePath();c.fill();c.restore();
}
const fractions:AdditionalScene=(c,w,h,q,t,k)=>{
  const s=fractionSum(q.a,q.b,q.c,q.d),max=Math.max(2,Math.ceil(s.sum+.25)),l=30,r=w-26,y=h*.63,X=(v:number)=>l+v/max*(r-l);
  line(c,l,y,r,y,k.axis,2);
  for(let i=0;i<=max;i++){line(c,X(i),y-7,X(i),y+7,k.axis);label(c,String(i),X(i),y+19,k.muted)}
  const first=ease(t/3)*s.first,second=ease((t-4)/4)*s.second;
  if(first>0){c.save();c.strokeStyle=k.purple;c.lineWidth=3;c.beginPath();c.moveTo(X(0),y-6);c.quadraticCurveTo(X(first/2),y-70,X(first),y-6);c.stroke();c.restore()}
  if(second>0){c.save();c.strokeStyle=k.mint;c.lineWidth=3;c.beginPath();c.moveTo(X(s.first),y-6);c.quadraticCurveTo(X(s.first+second/2),y-80,X(s.first+second),y-6);c.stroke();c.restore()}
  dot(c,X(fractionPosition(s.first,s.second,t)),y,7,k.amber);
  label(c,q.a+'/'+q.b+'  +  '+q.c+'/'+q.d+'  =  '+s.numerator+'/'+s.denominator,w/2,35,k.text,'center',17);
  label(c,'First hop',w*.24,h-28,k.purple);label(c,'Second hop',w*.71,h-28,k.mint);
};
const algebra:AdditionalScene=(c,w,h,q,t,k)=>{
  const s=areaTiles(q.x,q.a,q.b),unit=Math.min(w*.73/(q.x+q.a),h*.65/(q.x+q.b)),left=(w-(q.x+q.a)*unit)/2,top=h*.18;
  const items=[
    {x:0,y:0,w:q.x,h:q.x,text:'x²',color:k.purple},
    {x:q.x,y:0,w:q.a,h:q.x,text:'ax',color:k.mint},
    {x:0,y:q.x,w:q.x,h:q.b,text:'bx',color:k.amber},
    {x:q.x,y:q.x,w:q.a,h:q.b,text:'ab',color:k.rose}
  ];
  items.forEach((item,i)=>{const x=left+item.x*unit,y=top+item.y*unit,W=item.w*unit,H=item.h*unit;
    rect(c,x,y,W,H,item.color,k.panel,.12+.38*ease((t-i*1.45)/.8));
    if(t>=i*1.45)label(c,item.text,x+W/2,y+H/2,item.color,'center',W<48?11:17)
  });
  label(c,'x + a',w/2,top-22,k.muted);label(c,'x + b',Math.max(20,left-13),top+(q.x+q.b)*unit/2,k.muted,'right',11);
  label(c,'Total area = '+fmt(s.total,0),w/2,h-22,k.text,'center',15);
};
const equations:AdditionalScene=(c,w,h,q,t,k)=>{
  const s=equationBalance(q.a,q.b,q.x,t),x1=w*.27,x2=w*.73,base=h*.66;
  line(c,w*.17,base-40,w*.83,base-40,k.axis,4);line(c,w/2,base-40,w/2,base+40,k.axis,3);
  line(c,w*.37,base-40,x1,base+10,k.axis);line(c,w*.63,base-40,x2,base+10,k.axis);
  line(c,x1-65,base+10,x1+65,base+10,k.purple,4);line(c,x2-65,base+10,x2+65,base+10,k.mint,4);
  const left=fmt(s.coefficient,2)+'x + '+fmt(s.constant,2),right=fmt(s.right,2);
  label(c,left,x1,base-2,k.purple,'center',w<430?13:17);
  label(c,right,x2,base-2,k.mint,'center',w<430?13:17);
  label(c,fmt(q.a,0)+'x + '+fmt(q.b,0)+' = '+fmt(s.rhs,0),w/2,h*.16,k.text,'center',19);
  label(c,t<4?'Subtract '+fmt(q.b,0)+' from both sides':t<7.5?'Divide both sides by '+fmt(q.a,0):'x = '+fmt(s.solution,0),w/2,h-29,k.amber,'center',14);
  dot(c,w/2,base-40,7,k.amber);
};
const coil:AdditionalScene=(c,w,h,q,t,k)=>{
  const s=induction(q.field,q.turns,q.hz,t),cx=w*.47,cy=h*.44,r=Math.min(w*.16,h*.23);
  for(let i=-2;i<=2;i++){const y=cy+i*r*.55;arrow(c,w*.13,y,w*.82,y,k.faint,1.5)}
  rect(c,w*.04,h*.27,w*.12,h*.34,k.body,k.rose,.85);
  rect(c,w*.83,h*.27,w*.12,h*.34,k.body,k.mint,.85);
  label(c,'N',w*.1,cy,k.rose,'center',18);label(c,'S',w*.89,cy,k.mint,'center',18);
  c.save();c.strokeStyle=k.purple;c.lineWidth=4;c.beginPath();c.ellipse(cx,cy,Math.max(2,r*Math.abs(Math.cos(s.theta))),r,0,0,2*Math.PI);c.stroke();c.restore();
  line(c,cx,cy-r-9,cx,cy+r+9,k.amber,1.5,[5,4]);
  label(c,'Rotating coil',cx,cy-r-23,k.text);
  const meterY=h*.83,mid=w*.49,full=w*.32,scaled=full*s.emf/Math.max(.00001,s.peak);
  line(c,w*.13,meterY,w*.84,meterY,k.axis,2);line(c,mid,meterY-23,mid,meterY+22,k.muted,1.5);
  rect(c,Math.min(mid,mid+scaled),meterY-10,Math.abs(scaled),20,s.emf>=0?k.mint:k.rose,k.panel,.9);
  label(c,'EMF '+fmt(s.emf,2)+' V',mid,meterY-35,k.text,'center',13);
};
const gas:AdditionalScene=(c,w,h,q,t,k)=>{
  const s=boyle(q.pressure,q.compression,t),left=w*.11,right=w*.89,top=h*.24,gh=h*.47,piston=left+(right-left)*s.volume/GAS_VOLUME;
  rect(c,left,top,piston-left,gh,k.mint,k.axis,.23);
  for(let i=0;i<8;i++)for(let j=0;j<3;j++){const x=left+(i+.65)*(piston-left)/9,y=top+(j+.6)*gh/3.6;dot(c,x,y,3.2,k.purple)}
  line(c,left,top,right,top,k.axis,3);line(c,left,top+gh,right,top+gh,k.axis,3);
  rect(c,piston-6,top-8,12,gh+16,k.body,k.amber,1);
  arrow(c,Math.min(right-10,piston+7),top+gh/2,Math.max(piston+10,Math.min(right-7,piston+40)),top+gh/2,k.amber);
  label(c,'Isothermal gas: T constant',w/2,top-32,k.text,'center',14);
  label(c,'Volume '+fmt(s.volume,2)+' L',w*.32,h-28,k.mint,'center',13);
  label(c,'Pressure '+fmt(s.pressure,1)+' kPa',w*.74,h-28,k.amber,'center',13);
};
const photons:AdditionalScene=(c,w,h,q,t,k)=>{
  const s=photoelectric(q.frequency,q.work),surface=w*.59,top=h*.16,bottom=h*.79;
  rect(c,surface,top,w*.22,bottom-top,k.body,k.axis,.85);
  for(let i=0;i<7;i++)line(c,surface+8,top+12+i*(bottom-top-24)/6,surface+50,top+12+i*(bottom-top-24)/6,k.faint,1.2);
  const period=1.3,phase=(t%period)/period;
  for(let j=0;j<3;j++){
    const fraction=(phase+j/3)%1,x=w*.08+(surface-w*.08)*fraction,y=h*(.3+j*.14);
    dot(c,x,y,7,k.amber);line(c,x-13,y,x-8,y,k.amber,1.8);
    if(s.emitted&&fraction>.5){const out=(fraction-.5)*2;dot(c,surface+out*w*.22,y,5,k.mint)}
  }
  arrow(c,w*.17,h*.12,w*.43,h*.12,k.amber);
  label(c,'Photons: '+fmt(s.energy,2)+' eV',w*.23,h*.12-15,k.amber,'center',12);
  label(c,'Metal W = '+fmt(q.work,2)+' eV',surface+w*.12,h*.86,k.muted,'center',12);
  label(c,s.emitted?'Electrons escape · KE '+fmt(s.kinetic,2)+' eV':'Below threshold · no electrons',w/2,h-22,s.emitted?k.mint:k.rose,'center',13);
};
const riemann:AdditionalScene=(c,w,h,q,t,k)=>{
  const l=w*.12,top=h*.13,chartW=w*.77,chartH=h*.68,bottom=top+chartH,n=q.n,height=(x:number)=>x**q.power;
  line(c,l,bottom,l+chartW,bottom,k.axis);line(c,l,top,l,bottom,k.axis);
  const shown=Math.min(n,Math.floor(n*ease(t/RIEMANN_DURATION)));
  for(let i=1;i<=shown;i++){
    const width=chartW/n,high=height(i/n)*chartH;
    rect(c,l+(i-1)*width,bottom-high,width,high,k.purple,k.mint,.2);
  }
  c.save();c.strokeStyle=k.amber;c.lineWidth=3;c.beginPath();
  for(let i=0;i<=100;i++){const x=i/100,X=l+x*chartW,Y=bottom-height(x)*chartH;if(i)c.lineTo(X,Y);else c.moveTo(X,Y)}
  c.stroke();c.restore();
  label(c,'0',l,bottom+17,k.muted);label(c,'1',l+chartW,bottom+17,k.muted);
  const s=riemannRight(q.n,q.power);
  label(c,'Right sum '+fmt(s.estimate,4)+'  ·  Exact '+fmt(s.exact,4),w/2,h-16,k.text,'center',12);
};
const light:AdditionalScene=(c,w,h,q,t,k)=>{
  const y=h*.51,cx=w*.5,travel=Math.min(w*.29,h*.32),s=refraction(q.n1,q.n2,q.angle),angle=q.angle*Math.PI/180;
  rect(c,0,y,w,h-y,k.mint,k.mint,.1);
  line(c,0,y,w,y,k.axis,2.2);line(c,cx,14,cx,h-14,k.muted,1,[5,5]);
  const start={x:cx-travel*Math.sin(angle),y:y-travel*Math.cos(angle)};
  const factor=ease(t/3);
  arrow(c,start.x,start.y,start.x+(cx-start.x)*factor,start.y+(y-start.y)*factor,k.amber);
  if(t>3){
    const progress=ease((t-3)/4);
    const outbound=(s.totalInternalReflection?q.angle:s.transmitted as number)*Math.PI/180;
    const x=cx+travel*Math.sin(outbound)*progress,Y=y+(s.totalInternalReflection?-1:1)*travel*Math.cos(outbound)*progress;
    arrow(c,cx,y,x,Y,s.totalInternalReflection?k.rose:k.purple);
  }
  dot(c,cx,y,5,k.text);
  label(c,'n₁ = '+fmt(q.n1,1),24,21,k.amber,'left',13);
  label(c,'n₂ = '+fmt(q.n2,1),24,h-23,k.mint,'left',13);
  label(c,s.totalInternalReflection?'Total internal reflection':s.transmitted===null?'No transmission':'Refracted '+fmt(s.transmitted,1)+'°',w-14,h-23,k.text,'right',12);
};
export const ADDITIONAL_SCENES:Record<string,AdditionalScene>={
  'fraction-addition':fractions,'area-model':algebra,'equation-balance':equations,'coil-induction':coil,
  'boyles-law':gas,'photoelectric-effect':photons,'riemann-sum':riemann,'refraction':light
};
