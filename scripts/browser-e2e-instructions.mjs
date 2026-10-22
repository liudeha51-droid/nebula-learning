console.log('The live E2E suite intentionally reuses the selected in-app browser.');
console.log('In the Browser plugin Node session, import apps/web/tests/browser-workflows.mjs');
console.log('and call validateStudent(tab). It returns named assertions without inspecting cookies.');
console.log('See qa/browser-results.json for the recorded execution. This command is not a test pass.');
process.exitCode=2;
