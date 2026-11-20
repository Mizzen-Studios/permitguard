const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'app.js'),'utf8');
function harness(){
 const handlers={}, calls=[]; const root={innerHTML:'',addEventListener:(n,f)=>handlers[n]=f,querySelector:()=>null,querySelectorAll:()=>[]};
 const context={console,Date,Promise,FileReader:class {},document:{querySelector:()=>root,addEventListener:()=>{}},window:{addEventListener:()=>{},confirm:()=>true},invoke:async(method,args)=>{calls.push({method,...args});return {permit:null,actorId:'human',revision:8,policy:{mode:'WARN_ONLY',failMode:'FAIL_CLOSED'},equipment:[],board:[]};},realtime:{subscribe:async()=>({unsubscribe(){}})}};
 vm.createContext(context);vm.runInContext(source.split(String.fromCharCode(10)).slice(1,-2).join(String.fromCharCode(10)),context);return {context,root,calls,handlers,run:s=>vm.runInContext(s,context)};
}
test('all six stages render one primary action, closed none',()=>{const h=harness();for(const stage of ['PLAN','LOCK','VERIFY','ACTIVE','RELEASE','CLOSED']){h.run('state={actorId:"human",revision:8,policy:{mode:"WARN_ONLY"},permit:{state:'+JSON.stringify(stage)+',id:"P",equipment:[{id:"EQ",name:"Pump",isolationPoints:[{id:"V-3",energyType:"hydraulic",highEnergy:true}]}],workers:["human"],verifierIds:["human"],locks:[],activations:[],verifications:[],audit:[]},board:[],release:{status:"NOT CLEARED"}};stale=false;render()');assert.equal((h.root.innerHTML.match(/class="primary"/g)||[]).length,stage==='CLOSED'?0:1);assert.match(h.root.innerHTML,/OSHA 1910.147/);}});
test('bridge mutations carry store revision rather than permit revision',async()=>{const h=harness();h.run('state={actorId:"human",revision:8,permit:{revision:2}};stale=false');await h.run('mutate("begin_lock")');assert.equal(h.calls[0].method,'permitguard');assert.equal(h.calls[0].operation,'begin_lock');assert.equal(h.calls[0].payload.expectedRevision,8);assert.equal(h.calls[1].operation,'get_state');});
test('stale and busy mutations are not submitted',async()=>{const h=harness();await h.run('mutate("begin_lock")');assert.equal(h.calls.length,0);h.run('stale=false;busy=true');await h.run('mutate("begin_lock")');assert.equal(h.calls.length,0);});
test('remote strings escaped, non-admin cannot see controls',()=>{const h=harness();h.run('state={actorId:"<script>bad</script>",revision:1,policy:{},permit:null,equipment:[],board:[]};stale=false;render()');assert.doesNotMatch(h.root.innerHTML,/<script>bad/);assert.match(h.root.innerHTML,/&lt;script&gt;/);assert.doesNotMatch(h.root.innerHTML,/Load confirmed sample/);});
test('aggregate locks are explicit, never mistaken for zero',()=>{const h=harness();h.run('state={actorId:"human",permit:null,board:[{equipmentId:"EQ",activeLockCount:3}]};render()');assert.ok(h.root.innerHTML.includes('3</b> remaining locks'));});
test('no app egress or local fake permit, accessible structure',()=>{assert.ok(!['fetch(', 'XMLHttpRequest','localStorage','sessionStorage','subscribeGlobal','publishGlobal'].some(x=>source.includes(x)));for(const text of ['aria-current="step"',"setAttribute('role','status')","setAttribute('role','alert')",'expectedRevision','BarcodeDetector','challengeToken','physical procedure','No offline mode'])assert.ok(source.includes(text),text);const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');assert.match(html,/lang="en"/);assert.match(html,/Skip to permit/);});
test('bounded photo accepts only permitted types',async()=>{const h=harness();await assert.rejects(h.run('photoData({size:11000000,type:"image/jpeg"})'),/10 MB/);await assert.rejects(h.run('photoData({size:12,type:"image/svg+xml"})'),/10 MB/);});

test('empty admin state exposes sample setup and names without acceptance-test copy',()=>{const h=harness();h.run('state={actorId:"human",actorDisplayName:"Olly Admin",isProjectAdmin:true,revision:1,policy:{},equipment:[],board:[]};stale=false;render()');assert.match(h.root.innerHTML,/details class="admin" open/);assert.match(h.root.innerHTML,/Load confirmed sample/);assert.match(h.root.innerHTML,/Signed-in account: Olly Admin/);assert.doesNotMatch(h.root.innerHTML,/acceptance have not been run|cross-browser delivery unverified/);});

test('Realtime invalidation during successful sample save is reconciled, not a false refresh warning',async()=>{
 const h=harness();let onEvent;h.context.realtime.subscribe=async(_channel,callback)=>{onEvent=callback;return {unsubscribe(){}};};
 h.run('state={actorId:"human",revision:null,policy:{},equipment:[],board:[]};stale=false');await h.run('subscribe()');
 h.context.invoke=async(_method,args)=>{if(args.operation==='load_sample'){onEvent({revision:0});return {revision:0};}return {permit:null,actorId:'human',revision:0,policy:{mode:'ENFORCE'},equipment:[],board:[]};};
 await h.run('mutate("load_sample",{confirmed:true})');
 assert.equal(h.run('stale'),false);assert.equal(h.run('busy'),false);assert.equal(h.run('pendingInvalidation'),false);
 assert.match(h.root.innerHTML,/Live updates connected/);assert.doesNotMatch(h.root.innerHTML,/Update received during save; refresh required|Disconnected/);
});
test('Realtime invalidation never hides an uncertain mutation failure or resubmits it',async()=>{
 const h=harness();let onEvent;let mutations=0,reads=0;h.context.realtime.subscribe=async(_c,cb)=>{onEvent=cb;return {unsubscribe(){}};};
 h.run('state={actorId:"human",revision:0,policy:{},equipment:[],board:[]};stale=false');await h.run('subscribe()');
 h.context.invoke=async(_m,args)=>{if(args.operation==='create_permit'){mutations++;onEvent({revision:1});return {ok:false,error:'UNAVAILABLE'};}reads++;};
 await h.run('mutate("create_permit")');assert.equal(mutations,1);assert.equal(reads,0);assert.equal(h.run('stale'),true);assert.match(h.root.innerHTML,/no operation was automatically resubmitted/);
});

test('state refresh after genuine Realtime error does not falsely claim connected subscription',async()=>{
 const h=harness();let onEvent;h.context.realtime.subscribe=async(_c,cb)=>{onEvent=cb;return {unsubscribe(){}};};
 h.run('state={actorId:"human",revision:0,policy:{},equipment:[],board:[]};stale=false');await h.run('subscribe()');onEvent(null,new Error('disconnect'));await h.run('refresh()');assert.match(h.root.innerHTML,/Realtime disconnected; use Refresh/);assert.doesNotMatch(h.root.innerHTML,/Live updates connected/);
});
