/** Authenticated browser E2E for the Canvas animation lab.
 * Reuses the already-selected in-app browser tab; does not open a second browser
 * or bypass login. Run after validateStudent has authenticated its fixture. */
import assert from 'node:assert/strict';

export const animationCases=[
  ['parabola','Shaping a parabola'],
  ['unit-circle','From circle to sine wave'],
  ['derivative','Secant becomes tangent'],
  ['vector-addition','Adding vectors head to tail'],
  ['inscribed-angle','The inscribed angle theorem'],
  ['law-of-large-numbers','The law of large numbers'],
  ['projectile','Projectile motion'],
  ['incline','Forces on an incline'],
  ['pendulum-energy','Energy in a pendulum'],
  ['collision','Collisions and momentum'],
  ['standing-wave','Standing waves on a string'],
  ['circuit','Ohm’s law in a circuit'],
  ['fraction-addition','Adding fractions on a number line'],
  ['area-model','Multiplying binomials with area'],
  ['equation-balance','Keeping an equation balanced'],
  ['coil-induction','Induction in a rotating coil'],
  ['boyles-law','Compressing an ideal gas'],
  ['photoelectric-effect','The photoelectric effect'],
  ['riemann-sum','Estimating area with rectangles'],
  ['refraction','Bending light at a boundary'],
];
export const lastAnimationRun=[];

export async function validateAnimations(tab,base='http://127.0.0.1:3410') {
  const p=tab.playwright,results=lastAnimationRun;results.length=0;
  const pass=name=>results.push({name,status:'passed',at:new Date().toISOString()});
  await tab.goto(base+'/animations');
  await p.getByRole('heading',{name:'Animation lab',exact:true}).waitFor({state:'visible'});
  assert.equal(await p.locator('.anim-card').count(),20);
  assert.equal(await p.getByText('20 animations · mathematics & physics').count(),1);
  pass('catalogue exposes exactly 20 animation cards');

  await p.getByRole('button',{name:'Mathematics',exact:true}).click();
  assert.equal(await p.locator('.anim-card').count(),10);
  await p.getByRole('button',{name:'Physics',exact:true}).click();
  assert.equal(await p.locator('.anim-card').count(),10);
  await p.getByRole('button',{name:'All',exact:true}).click();
  assert.equal(await p.locator('.anim-card').count(),20);
  pass('subject filters show 10 math, 10 physics and 20 overall');

  for(const [id,title] of animationCases) {
    await tab.goto(base+'/animations?topic='+id);
    await p.getByRole('heading',{name:title,exact:true}).waitFor({state:'visible'});
    const canvas=p.locator('canvas[role="img"]');
    assert.equal(await canvas.count(),1);
    assert.equal((await canvas.getAttribute('aria-label')).includes(title),true);
    assert.equal(await p.locator('.anim-slider').count()>0,true);
    assert.equal(await p.locator('.anim-readings dt').count()>0,true);
  }
  pass('all 20 deep links render a titled Canvas, sliders and live readings');

  await tab.goto(base+'/animations?topic=fraction-addition');
  await p.getByRole('heading',{name:'Adding fractions on a number line',exact:true}).waitFor({state:'visible'});
  const pause=p.getByRole('button',{name:'Pause',exact:true});
  if(await pause.count())await pause.click();
  const numerator=p.getByRole('slider',{name:'First numerator'});
  const before=await p.locator('.anim-readings').innerText();
  await numerator.press('End');
  const after=await p.locator('.anim-readings').innerText();
  assert.notEqual(after,before);
  await p.getByRole('button',{name:'Reset values',exact:true}).click();
  assert.equal(await p.getByRole('slider',{name:'First numerator'}).getAttribute('max'),'4');
  pass('parameter slider updates the deterministic live-values panel');

  await p.getByRole('slider',{name:'Animation time'}).press('End');
  await p.getByRole('button',{name:'Replay',exact:true}).waitFor({state:'visible'});
  await p.getByRole('button',{name:'Replay',exact:true}).click();
  await p.getByRole('button',{name:'Pause',exact:true}).waitFor({state:'visible'});
  await p.getByRole('button',{name:'Pause',exact:true}).click();
  await p.getByRole('button',{name:'Restart animation from the beginning',exact:true}).click();
  const scrubText=await p.locator('.anim-scrub output').innerText();
  assert.equal(scrubText,'0.0 s');
  pass('time scrubber, replay, pause and restart work');

  await p.getByRole('combobox',{name:'Playback speed'}).selectOption('0.25');
  assert.equal(await p.getByRole('combobox',{name:'Playback speed'}).inputValue(),'0.25');
  pass('quarter-speed playback setting can be selected');
  return {results};
}
