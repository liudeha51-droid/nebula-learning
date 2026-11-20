/** Real Chromium E2E using an isolated demo learner and seeded development API.
 * No credentials or production data. The browser session remains local to CI. */
import {test,expect} from '@playwright/test';
import {validateAnimations} from './animation-lab.mjs';

async function signInDemo(page) {
  await page.goto('/');
  await page.getByRole('button',{name:'Try a development learner'}).click();
  await page.getByRole('link',{name:'Animation lab'}).waitFor({state:'visible'});
}
async function drawn(canvas) {
  return canvas.evaluate(node=>{
    if(!node.width||!node.height)return false;
    const pixels=node.getContext('2d').getImageData(0,0,node.width,node.height).data;
    for(let i=3;i<pixels.length;i+=4)if(pixels[i]!==0)return true;
    return false;
  });
}

test('all 20 animated concepts, controls and nonempty Canvas frames',async ({page})=>{
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await signInDemo(page);
  const tab={goto:url=>page.goto(url),playwright:page};
  const result=await validateAnimations(tab);
  expect(result.results).toHaveLength(6);
  expect(result.results.every(row=>row.status==='passed')).toBe(true);

  for(const id of ['fraction-addition','area-model','equation-balance','coil-induction','boyles-law','photoelectric-effect','riemann-sum','refraction']){
    await page.goto('/animations?topic='+id);
    await expect.poll(()=>drawn(page.locator('.anim-canvas canvas')),{timeout:10_000}).toBe(true);
  }
  expect(errors).toEqual([]);
});

test.describe('reduced-motion browser preference',()=>{
  test.use({reducedMotion:'reduce'});
  test('starts paused but remains interactive',async ({page})=>{
    await signInDemo(page);
    await page.goto('/animations?topic=coil-induction');
    await expect(page.getByRole('note')).toContainText('Reduced motion is on');
    await expect(page.getByRole('button',{name:'Play',exact:true})).toBeVisible();
    await page.getByRole('button',{name:'Play',exact:true}).click();
    await expect(page.getByRole('button',{name:'Pause',exact:true})).toBeVisible();
    await expect.poll(()=>drawn(page.locator('.anim-canvas canvas'))).toBe(true);
  });
});
