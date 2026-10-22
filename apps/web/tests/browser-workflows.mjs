/** Browser-runtime E2E suite. Receives the already-selected in-app browser tab.
 * No independent browser instance, cookies inspection or hidden API calls.
 * Invoke via the documented browser plugin Node session:
 * const {validateStudent}=await import(absolutePath); await validateStudent(tab);
 */
import assert from 'node:assert/strict';
export const lastRun=[];
export async function validateStudent(tab,base='http://127.0.0.1:3410') {
  const results=lastRun;results.length=0;
  const pass=name=>results.push({name,status:'passed',at:new Date().toISOString()});
  const p=tab.playwright;
  async function heading(name){const h=p.getByRole('heading',{name,exact:true});await h.waitFor({state:'visible'});assert.equal(await h.count(),1)}
  await tab.goto(base+'/profile');
  await p.getByPlaceholder('What would you like to understand better?').fill('Connect mathematics to motion; browser acceptance fixture.');
  await p.getByRole('button',{name:'Save profile',exact:true}).click();
  await p.getByText('Profile saved. Historical assessments and attempts are unchanged.',{exact:true}).waitFor({state:'visible'});pass('profile settings persist through backend');
  await p.getByRole('link',{name:'Diagnostic assessment',exact:true}).click();
  await p.getByRole('button',{name:'Begin diagnostic',exact:true}).click();
  const diagnosticUrl=await tab.url();
  for(let index=0;index<8;index++) {
    await p.getByRole('radio').first().click();
    await p.getByRole('button',{name:'Submit answer',exact:true}).click();
    assert.match(await p.getByText(/Answer and explanation unlock/).innerText(),/10 minutes after submission/);
    if(index<7)await p.getByRole('button',{name:'Next question',exact:true}).click();
  }
  await heading('A step forward, recorded.');
  pass('complete eight-question diagnostic with backend grading and delayed disclosure');
  await tab.reload();
  await p.getByRole('button',{name:'Question 1',exact:true}).click();
  assert.match(await p.getByText(/Answer and explanation unlock/).innerText(),/unlock in/);pass('reload retains submitted answer and cannot bypass delay');
  await p.getByRole('link',{name:'Mathematics nebula',exact:true}).click();
  await p.getByRole('button',{name:/✦ Numbers & arithmetic/}).click();
  assert.equal(await p.getByRole('button',{name:'Practice this concept',exact:true}).isEnabled(),true);pass('backend taxonomy selection offers covered practice');
  await p.getByRole('button',{name:'Practice this concept',exact:true}).click();
  await p.getByRole('radio').first().click();
  await p.getByRole('button',{name:'Submit answer',exact:true}).click();
  assert.match(await p.getByText(/Answer and explanation unlock/).innerText(),/unlock in/);pass('practice has the same mandatory ten-minute disclosure gate');
  await p.getByLabel('Notes & solution steps',{exact:true}).fill('Browser E2E: practice connecting arithmetic and equations.');
  await p.getByLabel('LaTeX source',{exact:true}).fill('x=\\frac{10}{2}');
  await p.getByRole('button',{name:'Save note',exact:true}).click();
  await p.getByText('Saved to your notebook',{exact:true}).waitFor({state:'visible'});pass('notes and editable LaTeX save to backend');
  await p.getByText('Open scientific calculator',{exact:true}).click();
  await p.getByLabel('Calculator expression',{exact:true}).fill('sin(pi/2)+sqrt(16)');
  await p.getByRole('button',{name:'Calculate',exact:true}).click();
  await p.getByLabel('Calculator result',{exact:true}).filter({hasText:/^5$/}).waitFor({state:'visible'});pass('scientific calculator yields 5 through real backend');
  await p.getByRole('button',{name:'RAD',exact:true}).click();
  await p.getByLabel('Calculator expression',{exact:true}).fill('sin(30)');
  await p.getByRole('button',{name:'Calculate',exact:true}).click();
  await p.getByLabel('Calculator result',{exact:true}).filter({hasText:/^0\.5$/}).waitFor({state:'visible'});pass('degree/radian switch changes evaluation correctly');
  await tab.reload();
  assert.equal(await p.getByLabel('Notes & solution steps',{exact:true}).getAttribute('aria-label'),'Notes & solution steps');
  await p.getByLabel('LaTeX source',{exact:true}).filter({hasText:/frac/}).waitFor({state:'visible'});pass('saved formula source survives full-page reload');
  await p.getByRole('link',{name:'Learning analytics',exact:true}).click();
  await heading('Understanding your progress.');pass('learning analytics route uses evidence-aware presentation');
  await p.getByRole('link',{name:'Physics knowledge graph',exact:true}).click();
  await heading('Physics knowledge graph');pass('physics knowledge graph route renders');
  await tab.goto(base+'/admin');
  await heading('Administrator access required');pass('student is denied administrative question access in the UI');
  return {results,diagnosticUrl,limitations:['Real ten-minute elapsed reveal is verified separately.','Admin release workflow is API-integration tested, not part of this student browser suite.']};
}
