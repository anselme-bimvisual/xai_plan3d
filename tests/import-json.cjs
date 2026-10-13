const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
const scripts=[...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)];
for(const [i,m] of scripts.entries()) if(!m[1].includes('importmap')) {fs.writeFileSync('/tmp/plan-script-'+i+'.mjs',m[2]);require('node:child_process').execFileSync(process.execPath,['--check','/tmp/plan-script-'+i+'.mjs']);}
const core=html.slice(html.indexOf('let WALLS ='),html.indexOf('const PX_MM'));
const ctx={console,assert,example:JSON.parse(fs.readFileSync('example-plan.json')),localStorage:{getItem(){return null}}};vm.createContext(ctx);
vm.runInContext(core+`
let state = readProject(example); const BOUNDS={}; applyPlan();
assert.equal(ROOMS.length,1);assert.equal(WALLS.length,6);assert.equal(state.plan.height,3000);assert.equal(BOUNDS.w,8400);
const saved=JSON.stringify(state);state=readProject(JSON.parse(saved));applyPlan();assert.equal(ROOMS[0].name,'Salon');
const legacy=defaultState();state=readProject(legacy);applyPlan();assert.equal(ROOMS.length,13);assert.equal(state.furniture.length,legacy.furniture.length);
state=readProject(JSON.parse(saved));applyPlan();assert.equal(ROOMS.length,1);
for(const change of [s=>s.plan.height=-1,s=>s.plan.rooms[0].id='bad"id',s=>s.plan.windows[0][5]=800,s=>s.plan.walls[0][2]=s.plan.walls[0][0],s=>s.plan.rooms[0].mat='unknown',s=>s.units='m']){
const s=JSON.parse(saved);change(s);assert.throws(()=>readProject(s));}
const measured=JSON.parse(saved);measured.measures=[{a:{x:0,y:0},b:{x:5000,y:0}}];assert.equal(readProject(measured).measures.length,1);
console.log('PASS: syntax, full import, persistence, geometry switching/undo state, legacy furniture, measurements, six invalid-input cases');
`,ctx);
