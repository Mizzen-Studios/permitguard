const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'app.js'),'utf8');
function harness(){
 const handlers={}, calls=[]; const root={innerHTML:'',addEventListener:(n,f)=>handlers[n]=f,querySelector:()=>null,querySelectorAll:()=>[]};
 const context={console,Date,Promise,setTimeout:f=>Promise.resolve().then(f),FileReader:class {},document:{querySelector:()=>root,addEventListener:()=>{}},window:{addEventListener:()=>{},confirm:()=>true},invoke:async(method,args)=>{calls.push({method,...args});return {permit:null,actorId:'human',revision:8,policy:{mode:'WARN_ONLY',failMode:'FAIL_CLOSED'},equipment:[],board:[]};},realtime:{subscribe:async()=>({unsubscribe(){}})}};
 vm.createContext(context);vm.runInContext(source.split(String.fromCharCode(10)).slice(1,-2).join(String.fromCharCode(10)),context);vm.runInContext('initializing=false',context);return {context,root,calls,handlers,run:s=>vm.runInContext(s,context)};
}
test('all six stages render one primary action, closed none',()=>{const h=harness();for(const stage of ['PLAN','LOCK','VERIFY','ACTIVE','RELEASE','CLOSED']){h.run('state={actorId:"human",revision:8,policy:{mode:"WARN_ONLY"},permit:{state:'+JSON.stringify(stage)+',id:"P",equipment:[{id:"EQ",name:"Pump",isolationPoints:[{id:"V-3",energyType:"hydraulic",highEnergy:true}]}],workers:["human"],verifierIds:["human"],locks:[],activations:[],verifications:[],audit:[]},board:[],release:{status:"NOT CLEARED"}};stale=false;render()');assert.equal((h.root.innerHTML.match(/class="primary"/g)||[]).length,stage==='CLOSED'?0:1);assert.match(h.root.innerHTML,/OSHA 1910.147/);}});
test('bridge mutations carry store revision rather than permit revision',async()=>{const h=harness();h.run('state={actorId:"human",revision:8,permit:{revision:2}};stale=false');await h.run('mutate("begin_lock")');assert.equal(h.calls[0].method,'permitguard');assert.equal(h.calls[0].operation,'begin_lock');assert.equal(h.calls[0].payload.expectedRevision,8);assert.equal(h.calls.length,1);assert.equal(h.run('state.revision'),8);});
test('stale and busy mutations are not submitted',async()=>{const h=harness();await h.run('mutate("begin_lock")');assert.equal(h.calls.length,0);h.run('stale=false;busy=true');await h.run('mutate("begin_lock")');assert.equal(h.calls.length,0);});
test('remote strings escaped, non-admin cannot see controls',()=>{const h=harness();h.run('state={actorId:"<script>bad</script>",revision:1,policy:{},permit:null,equipment:[],board:[]};stale=false;render()');assert.doesNotMatch(h.root.innerHTML,/<script>bad/);assert.match(h.root.innerHTML,/&lt;script&gt;/);assert.doesNotMatch(h.root.innerHTML,/Load confirmed sample/);});
test('aggregate locks are explicit, never mistaken for zero',()=>{const h=harness();h.run('state={actorId:"human",permit:null,board:[{equipmentId:"EQ",activeLockCount:3}]};render()');assert.ok(h.root.innerHTML.includes('3</b> personal locks recorded'));});
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

function qrForm(h,op,qr){
 h.context.FormData=class{constructor(form){this.data=form.data;}get(k){return this.data[k];}*[Symbol.iterator](){for(const pair of Object.entries(this.data))yield pair;}};
 return {dataset:{operation:op},data:{pointId:'V-3',equipmentId:'register:10202:EQ-1',activationId:'a1'},reportValidity:()=>true,querySelector:q=>q.includes('-qr')?{value:qr}:{checked:true}};
}
test('point/equipment QR hints are explicit; wrong point QR cannot invoke activation or advance revision',async()=>{
 const h=harness();h.run('state={actorId:"human",actorDisplayName:"Olly",revision:9,policy:{},permit:{state:"VERIFY",equipment:[{id:"register:10202:EQ-1",name:"EQ-1",isolationPoints:[{id:"V-3"}]}],activations:[{id:"a1",status:"PENDING",verifierId:"human"}],verifications:[]},board:[]};stale=false;render()');
 assert.match(h.root.innerHTML,/expected: permitguard:V-3/);assert.match(h.root.innerHTML,/expected: permitguard:register:10202:EQ-1/);assert.match(h.root.innerHTML,/Assigned to Olly/);
 await h.handlers.submit({preventDefault(){},target:qrForm(h,'confirm_activation','permitguard:V-3')});assert.equal(h.calls.length,0);assert.equal(h.run('state.revision'),9);assert.match(h.root.innerHTML,/Wrong equipment QR/);assert.equal(h.run('stale'),false);
});
test('valid activation uses only challenge + mutation with unchanged site revision; no preliminary refresh',async()=>{
 const h=harness();const calls=[];h.context.invoke=async(_m,args)=>{calls.push(args);if(args.operation==='qr_challenge')return {challengeToken:'bound',revision:9};return {actorId:'human',revision:10,permit:{state:'ACTIVE',equipment:[],locks:[],activations:[]},policy:{},board:[]};};
 h.run('state={actorId:"human",revision:9,policy:{},permit:{state:"VERIFY",equipment:[],activations:[]},board:[]};stale=false');
 await h.handlers.submit({preventDefault(){},target:qrForm(h,'confirm_activation','permitguard:register:10202:EQ-1')});assert.equal(calls.length,2);assert.equal(calls[0].operation,'qr_challenge');assert.equal(calls[1].operation,'confirm_activation');assert.equal(calls[0].payload.expectedRevision,9);assert.equal(calls[1].payload.expectedRevision,9);assert.equal(calls[1].payload.challengeToken,'bound');assert.equal(h.run('state.permit.state'),'ACTIVE');assert.doesNotMatch(h.root.innerHTML,/Server processed/);
});
test('same-revision own invalidation is reconciled from mutation response without extra read',async()=>{
 const h=harness();let callback,reads=0;h.context.realtime.subscribe=async(_c,cb)=>{callback=cb;return {unsubscribe(){}};};h.run('state={actorId:"human",revision:8,policy:{},permit:null,equipment:[],board:[]};stale=false');await h.run('subscribe()');
 h.context.invoke=async(_m,args)=>{if(args.operation==='get_state')reads++;callback({revision:9});return {actorId:'human',revision:9,permit:null,equipment:[],policy:{},board:[]};};await h.run('mutate("apply_lock")');assert.equal(reads,0);assert.equal(h.run('stale'),false);assert.equal(h.run('pendingInvalidation'),false);
});
test('known non-writing validation errors stay correctable; stale state never claims live confirmed state',async()=>{
 const h=harness();h.context.invoke=async()=>({ok:false,code:'QR_VALUE_MISMATCH',message:'Wrong equipment QR.',requiresRefresh:false});h.run('state={actorId:"human",revision:9,policy:{},permit:null,equipment:[],board:[]};stale=false');await h.run('mutate("confirm_activation")');assert.equal(h.run('stale'),false);assert.match(h.root.innerHTML,/Wrong equipment QR/);h.run('stale=true;sync="Live updates connected";render()');assert.doesNotMatch(h.root.innerHTML,/Live updates connected/);assert.match(h.root.innerHTML,/current state unconfirmed/);
});
test('lock rail uses singular labels and shows authorized synthetic Crew B details without real-lock removal',()=>{
 const h=harness();h.run('state={actorId:"human",actorDisplayName:"Olly",revision:9,policy:{},permit:{state:"VERIFY",equipment:[{id:"EQ",name:"Pump",isolationPoints:[]}],locks:[],activations:[],verifications:[]},board:[{equipmentId:"EQ",activeLockCount:1}],sampleCrewB:{active:true,locks:[{lockId:"L-07",pointId:"V-3",actorId:"human",name:"Crew B (simulated)",crewId:"Crew B",simulated:true,appliedAt:"2026-11-20T17:05:00Z"}]}};stale=false;render()');assert.match(h.root.innerHTML,/1<[^>]+> personal lock recorded/);assert.match(h.root.innerHTML,/L-07/);assert.match(h.root.innerHTML,/V-3/);assert.doesNotMatch(h.root.innerHTML,/data-lock-id="L-07"/);assert.doesNotMatch(h.root.innerHTML,/2026-11-20T17:05:00Z/);
});

test('newer or unversioned Realtime invalidation requires one authoritative read after save',async()=>{
 for(const unknownFirst of [false,true]){
  const h=harness();let callback,reads=0;h.context.realtime.subscribe=async(_c,cb)=>{callback=cb;return {unsubscribe(){}};};h.run('state={actorId:"human",revision:8,policy:{},permit:null,equipment:[],board:[]};stale=false');await h.run('subscribe()');
  h.context.invoke=async(_m,args)=>{if(args.operation==='get_state'){reads++;return {actorId:'human',revision:10,permit:null,equipment:[],policy:{},board:[]};}if(unknownFirst)callback({});callback({revision:unknownFirst?9:10});return {actorId:'human',revision:9,permit:null,equipment:[],policy:{},board:[]};};
  await h.run('mutate("apply_lock")');assert.equal(reads,1);assert.equal(h.run('state.revision'),10);assert.equal(h.run('stale'),false);
 }
});

test('initialization waits for bridge context and auto-loads without Refresh; retries reads only',async()=>{
 const h=harness();let contexts=0,reads=0,subscriptions=0;h.context.view={getContext:async()=>{contexts++;if(contexts===1)throw new Error('bridge not ready');return {};}};h.context.invoke=async(_m,args)=>{assert.equal(args.operation,'get_state');reads++;return {actorId:'human',permit:null,revision:13,policy:{},equipment:[],board:[]};};h.context.realtime.subscribe=async()=>{subscriptions++;return {unsubscribe(){}};};
 await h.run('initialize()');assert.equal(contexts,2);assert.equal(reads,1);assert.equal(subscriptions,1);assert.equal(h.run('stale'),false);assert.equal(h.run('initializing'),false);assert.doesNotMatch(h.root.innerHTML,/Connect to your permit|Open PermitGuard inside|Loading authenticated state/);
});
test('read-only bootstrap is bounded and a synchronous first bridge failure does not wedge Refresh',async()=>{
 const h=harness();let calls=0;h.context.invoke=()=>{calls++;throw new Error('unavailable');};await h.run('initialize()');assert.equal(calls,3);assert.equal(h.run('stale'),true);h.context.invoke=async()=>({actorId:'human',permit:null,revision:13,policy:{},equipment:[],board:[]});await h.run('refresh()');assert.equal(h.run('stale'),false);
});
test('administration loads automatically and never subscribes to a missing issue stream',async()=>{
 const h=harness();let subscriptions=0;h.context.invoke=async()=>({kind:'ADMINISTRATION',actorId:'human',scopes:{},uninstall:{instructions:'Review workflow rules'}});h.context.realtime.subscribe=async()=>{subscriptions++;throw new Error('not issue-scoped');};await h.run('initialize()');assert.equal(subscriptions,0);assert.match(h.root.innerHTML,/Administration loaded/);assert.doesNotMatch(h.root.innerHTML,/State unconfirmed|Not subscribed|Disconnected/);
});
test('Saving preserves actual QR, checkbox, select and file DOM nodes while disabling them',()=>{
 const h=harness();h.run('state={actorId:"human",revision:13,policy:{},permit:null,equipment:[],board:[]};stale=false;render()');
 const connection={firstChild:{nodeValue:'Ready'}},feedback={innerHTML:''};const controls=[{value:'permitguard:register:10202:EQ-1',disabled:false},{checked:true,disabled:false},{value:'register:10202:EQ-1',disabled:false},{files:[{name:'lock.png'}],disabled:false}];const html=h.root.innerHTML;h.root.querySelector=selector=>selector==='#connection-status'?connection:selector==='#feedback'?feedback:null;h.root.querySelectorAll=()=>controls;
 h.run('busy=true;render()');assert.equal(h.root.innerHTML,html);assert.equal(connection.firstChild.nodeValue,'Saving…');assert.equal(controls[0].value,'permitguard:register:10202:EQ-1');assert.equal(controls[1].checked,true);assert.equal(controls[2].value,'register:10202:EQ-1');assert.equal(controls[3].files[0].name,'lock.png');assert.ok(controls.every(c=>c.disabled));
});

test('delayed issue resolver context is retried instead of misrendering issue as administration',async()=>{
 const h=harness();let reads=0;h.context.view={getContext:async()=>({moduleKey:'permitguard-panel',extension:{issue:{id:'66400'}}})};h.context.invoke=async()=>++reads===1?{kind:'ADMINISTRATION',actorId:'human'}:{actorId:'human',permit:null,revision:13,policy:{},equipment:[],board:[]};await h.run('initialize()');assert.equal(reads,2);assert.equal(h.run('state.kind'),undefined);assert.equal(h.run('stale'),false);assert.doesNotMatch(h.root.innerHTML,/PermitGuard administration/);
});

test('external update during challenge preparation reconciles and never submits a stale confirmation',async()=>{
 const h=harness(),calls=[];h.context.invoke=async(_m,args)=>{calls.push(args.operation);if(args.operation==='qr_challenge'){h.run('stale=true;pendingInvalidation=true;pendingRevision=14');return {challengeToken:'old',revision:13};}return {actorId:'human',revision:14,permit:{state:'VERIFY',equipment:[],activations:[],verifications:[]},policy:{},board:[]};};h.run('state={actorId:"human",revision:13,policy:{},permit:{state:"VERIFY",equipment:[],activations:[]},board:[]};stale=false');await h.handlers.submit({preventDefault(){},target:qrForm(h,'confirm_activation','permitguard:register:10202:EQ-1')});assert.deepEqual(calls,['qr_challenge','get_state']);assert.equal(h.run('state.revision'),14);assert.equal(h.run('busy'),false);assert.equal(h.run('stale'),false);assert.match(h.root.innerHTML,/No confirmation was submitted/);
});
