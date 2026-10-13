const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'); const {JSDOM}=require(require.resolve('jsdom',{paths:[process.env.TEST_NODE_MODULES || process.cwd()]}));
const html=fs.readFileSync('index.html','utf8');const dom=new JSDOM(html,{url:'https://test.local',runScripts:'outside-only',pretendToBeVisual:true});const w=dom.window;
w.matchMedia=()=>({matches:false,addEventListener(){}});w.ResizeObserver=class{observe(){}};w.confirm=()=>true;w.HTMLElement.prototype.getBoundingClientRect=()=>({width:1000,height:700,left:0,top:0});
const scripts=[...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)];const core=scripts.find(x=>!x[1].includes('type='))[2];vm.runInContext(core,dom.getInternalVMContext());
w.example=JSON.parse(fs.readFileSync('example-levels.json'));w.assert=assert;
vm.runInContext(`state=readProject(example);renderAll();assert.equal(ROOMS.length,1);assert.equal(state.activeLevel,'rdc');
mutate(()=>state.furniture.push({id:'chair',type:'chair',name:'Chaise',cx:4000,cy:4000,w:450,d:480,rot:0,color:'#aaaaaa'}));
switchLevel('r1');assert.equal(state.furniture.length,0);assert.equal(document.querySelectorAll('#gRooms polygon').length,2);assert.equal(roomArea(ROOMS[0]),30.96);
switchLevel('rdc');assert.equal(state.furniture.length,1);undo();assert.equal(state.furniture.length,0);redo();assert.equal(state.furniture.length,1);
const saved=snap();state=readProject(JSON.parse(saved));renderAll();assert.equal(state.levels.length,2);assert.equal(state.furniture.length,1);
const bad=JSON.parse(saved);bad.levels[1].elevation=2000;assert.throws(()=>readProject(bad));
console.log('PASS DOM: initial rendering, level switches, isolated furniture, holes and area, undo/redo, export/reload, overlapping level rejection');`,dom.getInternalVMContext());

// Test actual Three.js geometry builders without a WebGL context.
w.THREE=require(require('path').join(require('path').dirname(require.resolve('three',{paths:[process.env.TEST_NODE_MODULES || process.cwd()]})),'three.cjs'));
let moduleCode=scripts.find(x=>x[1].includes('type="module"'))[2].replace(/^import .*;\s*$/mg,'');
moduleCode=moduleCode.replace(/window.View3D = .*;/,'');
vm.runInContext(`(function(){${moduleCode}\nfloorMat=()=>new THREE.MeshStandardMaterial();applyLight=()=>{};applyGrow=()=>{};\nscene=new THREE.Scene();archFloor=new THREE.Group();archUp=new THREE.Group();furnG=new THREE.Group();lampG=new THREE.Group();labelG=new THREE.Group();otherLevels=new THREE.Group();wallMat=capMat=frameMat=glassMat=new THREE.MeshStandardMaterial();\nstate.furniture=[];packedProject();H=2.8;OX=3000;OY=3000;buildArch();assert(archUp.children.length>16);const tallest=new THREE.Box3().setFromObject(archUp).max.y;assert(Math.abs(tallest-3)<.0001);\nshowAllLevels=true;syncOtherLevels();assert.equal(otherLevels.children.length,1);assert.equal(otherLevels.children[0].position.y,3);assert.equal(state.activeLevel,'rdc');\nconst slab=otherLevels.children[0].children[0].children[0];slab.geometry.computeBoundingBox();assert(Math.abs(slab.geometry.boundingBox.max.y-.2)<.00001);\nslab.material.side=THREE.DoubleSide;slab.updateMatrixWorld(true);const testRay=new THREE.Raycaster(new THREE.Vector3(-1.5,10,0),new THREE.Vector3(0,-1,0));assert.equal(testRay.intersectObject(slab).length,0);testRay.set(new THREE.Vector3(1,10,0),new THREE.Vector3(0,-1,0));assert(testRay.intersectObject(slab).length>0);\nconsole.log('PASS THREE: staircase and slab geometry, level elevation, original state restored');})();`,dom.getInternalVMContext());
