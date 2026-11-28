const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'app.js'),'utf8');
function harness(overrides={}){
 const handlers={}, calls=[]; const root={innerHTML:'',addEventListener:(n,f)=>handlers[n]=f,querySelector:()=>null,querySelectorAll:()=>[]};
 const context={console,Date,Promise,setTimeout:f=>Promise.resolve().then(f),setInterval:()=>1,clearInterval:()=>{},FileReader:class {},document:{querySelector:()=>root,addEventListener:()=>{}},window:{addEventListener:()=>{},confirm:()=>true},invoke:async(method,args)=>{calls.push({method,...args});return {permit:null,actorId:'human',revision:8,policy:{mode:'WARN_ONLY',failMode:'FAIL_CLOSED'},equipment:[],board:[]};},realtime:{subscribe:async()=>({unsubscribe(){}})}};
 Object.assign(context,overrides);vm.createContext(context);vm.runInContext(source.split(String.fromCharCode(10)).slice(1,-2).join(String.fromCharCode(10)),context);vm.runInContext('initializing=false',context);return {context,root,calls,handlers,run:s=>vm.runInContext(s,context)};
}
test('all six stages render one primary action, closed none',()=>{const h=harness();for(const stage of ['PLAN','LOCK','VERIFY','ACTIVE','RELEASE','CLOSED']){h.run('state={actorId:"human",revision:8,policy:{mode:"WARN_ONLY"},permit:{state:'+JSON.stringify(stage)+',id:"P",equipment:[{id:"EQ",name:"Pump",isolationPoints:[{id:"V-3",energyType:"hydraulic",highEnergy:true}]}],workers:["human"],verifierIds:["human"],locks:[],activations:[],verifications:[],audit:[]},board:[],release:{status:"NOT CLEARED"}};stale=false;render()');assert.equal((h.root.innerHTML.match(/class="primary"/g)||[]).length,stage==='CLOSED'?0:1);assert.match(h.root.innerHTML,/OSHA 1910.147/);}});
test('bridge mutations carry store revision rather than permit revision',async()=>{const h=harness();h.run('state={actorId:"human",revision:8,permit:{revision:2}};stale=false');await h.run('mutate("begin_lock")');assert.equal(h.calls[0].method,'permitguard');assert.equal(h.calls[0].operation,'begin_lock');assert.equal(h.calls[0].payload.expectedRevision,8);assert.equal(h.calls.length,1);assert.equal(h.run('state.revision'),8);});
test('stale and busy mutations are not submitted',async()=>{const h=harness();await h.run('mutate("begin_lock")');assert.equal(h.calls.length,0);h.run('stale=false;busy=true');await h.run('mutate("begin_lock")');assert.equal(h.calls.length,0);});
test('remote strings escaped, non-admin cannot see controls',()=>{const h=harness();h.run('state={actorId:"human",actorDisplayName:"<script>bad</script>",revision:1,policy:{},permit:null,equipment:[],board:[]};stale=false;render()');assert.doesNotMatch(h.root.innerHTML,/<script>bad/);assert.match(h.root.innerHTML,/&lt;script&gt;/);assert.doesNotMatch(h.root.innerHTML,/Load confirmed sample/);});
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
 assert.match(h.root.innerHTML,/expected: permitguard:V-3/);assert.match(h.root.innerHTML,/expected: permitguard:register:10202:EQ-1/);assert.match(h.root.innerHTML,/Assigned to You/);
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

test('valid authorized live state does not wait for failed frontend context',async()=>{
 const h=harness();let contexts=0,reads=0,subscriptions=0;h.context.view={getContext:async()=>{contexts++;if(contexts===1)throw new Error('bridge not ready');return {};}};h.context.invoke=async(_m,args)=>{assert.equal(args.operation,'get_state');reads++;return {actorId:'human',permit:null,revision:13,policy:{},equipment:[],board:[]};};h.context.realtime.subscribe=async()=>{subscriptions++;return {unsubscribe(){}};};
 await h.run('initialize()');assert.equal(contexts,1);assert.equal(reads,1);assert.equal(subscriptions,1);assert.equal(h.run('stale'),false);assert.equal(h.run('initializing'),false);assert.doesNotMatch(h.root.innerHTML,/Connect to your permit|Open PermitGuard inside|Loading authenticated state/);
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

test('administration describes permission groups in words without raw consent metadata',()=>{
 const h=harness();h.run('state={kind:"ADMINISTRATION",actorId:"human",scopes:{declared:["read:jira-work","storage:app","read:cmdb-object:jira","read:space:confluence"],source:"manifest-and-installation-consent",verifyActualConsent:true},uninstall:{}};stale=false;render()');assert.match(h.root.innerHTML,/Jira work items and people/);assert.match(h.root.innerHTML,/Forge app storage/);assert.match(h.root.innerHTML,/Equipment and Isolation points/);assert.match(h.root.innerHTML,/not a live audit/);assert.doesNotMatch(h.root.innerHTML,/verifyActualConsent|manifest-and-installation-consent|read:jira-work/);
});
test('permit header uses canonical friendly labels and fail-closed wording',()=>{
 const h=harness();h.run('state={actorId:"human",issueKey:"PGSAMPLE-2",projectName:"PermitGuard Sample Plant",revision:22,policy:{mode:"ENFORCE",failMode:"FAIL_CLOSED"},permit:{id:"66400",projectId:"10202",state:"ACTIVE",equipment:[],locks:[],activations:[],verifications:[]},equipment:[],board:[]};stale=false;render()');assert.match(h.root.innerHTML,/PermitGuard Sample Plant.*PGSAMPLE-2/);assert.match(h.root.innerHTML,/Block while the register is unavailable/);assert.doesNotMatch(h.root.innerHTML,/10202[^<]*66400|>FAIL_CLOSED</);
});
test('save progress shows observed elapsed seconds and no-resubmission guidance without replacing forms',()=>{
 const h=harness(),detail={textContent:''},status={firstChild:{nodeValue:''},querySelector:()=>detail};h.root.querySelector=selector=>selector==='#connection-status'?status:null;h.run('busy=true;saveStartedAt=Date.now()-11000;saveStage="Waiting for Forge to save and update connected views";updateSavingProgress()');assert.match(status.firstChild.nodeValue,/Saving… 11 s/);assert.match(detail.textContent,/Keep this panel open; do not resubmit/);
});
test('save timer is stopped even after an uncertain mutation failure; no retry is submitted',async()=>{
 const h=harness();let calls=0;h.context.invoke=async()=>{calls++;throw new Error('uncertain response');};h.run('state={actorId:"human",revision:22,policy:{},permit:null,equipment:[],board:[]};stale=false');await h.run('mutate("begin_release")');assert.equal(calls,1);assert.equal(h.run('saveTimer'),null);assert.equal(h.run('busy'),false);assert.equal(h.run('stale'),true);
});

const previewContext={extension:{issue:{id:'66401'}},moduleKey:'permitguard-panel'};
const previewValue=()=>({schemaVersion:1,permitId:'66401',state:'ACTIVE',revision:6,activeLockCount:1,updatedAt:'2026-11-21T09:10:00Z',authoritative:false,release:{cleared:false},start:{cleared:true}});
test('historical preview paints while the authenticated resolver is pending and never enables actions',async()=>{
 const h=harness();let finish;h.context.view={getContext:async()=>previewContext};h.context.requestJira=async path=>{assert.equal(path,'/rest/api/3/issue/66401/properties/permitguard.snapshot');return {ok:true,json:async()=>({value:previewValue()})};};h.context.invoke=()=>new Promise(r=>finish=r);
 const loading=h.run('initialize()');await new Promise(r=>setImmediate(r));assert.match(h.root.innerHTML,/Historical preview — not live or actionable/);assert.match(h.root.innerHTML,/Last recorded phase/);assert.match(h.root.innerHTML,/NOT CLEARED/);assert.equal(h.run('state'),null);assert.equal(h.run('stale'),true);await h.run('mutate("begin_release")');assert.equal(h.calls.length,0);
 finish({actorId:'human',permit:{state:'ACTIVE',locks:[],equipment:[]},revision:22,policy:{},release:{status:'NOT CLEARED',reasons:[{message:'A personal lock remains.'}]},equipment:[],board:[]});await loading;assert.equal(h.run('preview'),null);assert.doesNotMatch(h.root.innerHTML,/Historical preview — not live or actionable/);
});
test('context and live resolver begin in parallel, not as serial bridge requests',async()=>{
 const h=harness();let finishContext,started=false;h.context.view={getContext:()=>new Promise(r=>finishContext=r)};h.context.invoke=async()=>{started=true;return {actorId:'human',permit:null,revision:22,policy:{},equipment:[],board:[]};};const loading=h.run('initialize()');await new Promise(r=>setImmediate(r));assert.equal(started,true);finishContext(previewContext);await loading;assert.equal(h.run('stale'),false);
});
test('a hanging realtime connection cannot delay usable authenticated state or initialization',async()=>{
 const h=harness();h.context.realtime.subscribe=()=>new Promise(()=>{});await h.run('initialize()');assert.equal(h.run('initializing'),false);assert.equal(h.run('stale'),false);assert.match(h.root.innerHTML,/connecting live updates/);assert.doesNotMatch(h.root.innerHTML,/Loading PermitGuard/);
});
test('preview refuses other issues, invalid metadata and denied property access',async()=>{
 for(const patch of [{permitId:'999'},{authoritative:true},{schemaVersion:9},{state:'FAKE'},{revision:-1},{activeLockCount:-1},{updatedAt:'bad'},{updatedAt:'2999-01-01T00:00:00Z'}]){
  const h=harness();h.run('initializing=true');h.context.requestJira=async()=>({ok:true,json:async()=>({value:{...previewValue(),...patch}})});assert.equal(await h.run('loadPreview('+JSON.stringify(previewContext)+')'),false);assert.equal(h.run('preview'),null);
 }
 const h=harness();h.run('initializing=true');h.context.requestJira=async()=>({ok:false});assert.equal(await h.run('loadPreview('+JSON.stringify(previewContext)+')'),false);
});
test('positive property flags never become live clearance; failed live reads keep actions closed',async()=>{
 const h=harness();h.context.view={getContext:async()=>previewContext};h.context.requestJira=async()=>({ok:true,json:async()=>({value:{...previewValue(),release:{cleared:true}}})});h.context.invoke=async()=>{throw new Error('permission unavailable');};await h.run('initialize()');assert.equal(h.run('stale'),true);assert.equal(h.run('state'),null);assert.doesNotMatch(h.root.innerHTML,/Release records CLEARED/);assert.match(h.root.innerHTML,/no actions or live clearance/);
});
test('top release blocker precedes permit header and tall work/lock board in live HTML',()=>{
 const h=harness();h.run('state={actorId:"human",revision:22,policy:{},permit:{state:"ACTIVE",equipment:[],locks:[]},release:{status:"NOT CLEARED",reasons:[{message:"A personal lock remains on shared equipment."}]},equipment:[],board:[]};stale=false;render()');assert.ok(h.root.innerHTML.indexOf('Release NOT CLEARED')<h.root.innerHTML.indexOf('class="permit-head"'));assert.match(h.root.innerHTML,/A personal lock remains on shared equipment/);assert.match(fs.readFileSync(path.join(__dirname,'styles.css'),'utf8'),/position:sticky/);
});
test('late property response cannot replace already loaded live state',async()=>{
 const h=harness();let finish;h.run('initializing=true');h.context.requestJira=()=>new Promise(r=>finish=r);const pending=h.run('loadPreview('+JSON.stringify(previewContext)+')');await h.run('refresh()');finish({ok:true,json:async()=>({value:previewValue()})});assert.equal(await pending,false);assert.equal(h.run('preview'),null);
});

test('footer identifies UI source while loading and actual Forge version after live confirmation',()=>{
 const h=harness({__PERMITGUARD_BUILD__:'abc123def456'});h.run('render()');assert.match(h.root.innerHTML,/UI abc123def456/);assert.match(h.root.innerHTML,/version pending live connection/);
 h.run('state={actorId:"human",permit:null,revision:22,policy:{},equipment:[],board:[],buildInfo:{version:"5.14.0"}};stale=false;render()');assert.match(h.root.innerHTML,/PermitGuard 5.14.0/);assert.match(h.root.innerHTML,/Startup details/);
 h.run('state.buildInfo.version="<script>bad</script>";render()');assert.doesNotMatch(h.root.innerHTML,/<script>bad/);
});
test('preview timing records a real render instead of forcing a flash after live state',async()=>{
 const h=harness();h.run('initializing=true');h.context.requestJira=async()=>({ok:true,json:async()=>({value:previewValue()})});assert.equal(await h.run('loadPreview('+JSON.stringify(previewContext)+')'),true);assert.ok(h.run('previewShownAt')>0);assert.match(h.run('buildFooter()'),/Historical preview rendered/);
});
test('late preview diagnostics update only footer, never rebuild an edited form',async()=>{
 const h=harness();h.run('initializing=true');let finish;h.context.requestJira=()=>new Promise(r=>finish=r);const pending=h.run('loadPreview('+JSON.stringify(previewContext)+')');await h.run('refresh()');const before=h.root.innerHTML;finish({ok:true,json:async()=>({value:previewValue()})});assert.equal(await pending,false);assert.equal(h.root.innerHTML,before);assert.equal(h.run('previewShownAt'),0);assert.match(h.run('buildFooter()'),/arrived after live state/);
});
test('preview supports key-only native context and records unavailable/denied results',async()=>{
 const h=harness();h.run('initializing=true');h.context.requestJira=async path=>{assert.equal(path,'/rest/api/3/issue/PGSAMPLE-2/properties/permitguard.snapshot');return {ok:true,json:async()=>({value:previewValue()})};};assert.equal(await h.run('loadPreview({extension:{issue:{key:"PGSAMPLE-2"}}})'),true);
 const denied=harness();denied.context.requestJira=async()=>({ok:false,status:403});assert.equal(await denied.run('loadPreview('+JSON.stringify(previewContext)+')'),false);assert.match(denied.run('buildFooter()'),/HTTP 403/);
 const missing=harness();await missing.run('loadPreview({})');assert.match(missing.run('buildFooter()'),/No issue reference/);
});
test('build footer is present on admin/snapshot states and failed bootstrap',()=>{
 for(const value of [{kind:'ADMINISTRATION',scopes:[],capabilities:{},uninstall:{}},{kind:'SNAPSHOT',permits:[],limitations:[],capturedAt:'2026-11-22'}]){const h=harness();h.run('state='+JSON.stringify(value)+';render()');assert.match(h.root.innerHTML,/class="build-footer"/);}
 const h=harness();h.run('preview={phase:"ACTIVE",locks:1,permitRevision:6,updatedAt:"2026-11-21"};initializing=false;render()');assert.match(h.root.innerHTML,/Live permit unavailable/);assert.match(h.root.innerHTML,/class="build-footer"/);
});

test('a hanging frontend context cannot delay a valid server-authorized issue DTO',async()=>{
 const h=harness();h.context.view={getContext:()=>new Promise(()=>{})};await h.run('initialize()');assert.equal(h.run('stale'),false);assert.equal(h.run('initializing'),false);assert.equal(h.calls.length,1);assert.match(h.root.innerHTML,/Current state loaded/);
});
test('timing footer distinguishes iframe, panel code and unmeasured Jira navigation',()=>{
 const FakeDate=class extends Date{static now(){return 100000;}};const h=harness({Date:FakeDate,performance:{timeOrigin:74000}});h.run('liveLoadedAt=104000');const f=h.run('buildFooter()');assert.match(f,/Jira navigation → live: not measured here/);assert.match(f,/navigation → panel code: 26.0 s/);assert.match(f,/navigation → live: 30.0 s/);assert.match(f,/first live state 4.0 s/);assert.match(f,/Do not compare panel-only seconds/);
});
test('missing iframe timing is unavailable, never invented as full navigation time',()=>{
 const h=harness();h.run('liveLoadedAt=Date.now()');const f=h.run('buildFooter()');assert.match(f,/document navigation → live: unavailable/);assert.match(f,/not total Jira navigation time/);
});
test('static HTML shows only an unconfirmed loading shell before bridge evaluation',()=>{
 const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');assert.match(html,/Release unconfirmed/);assert.match(html,/not a permit preview or clearance/);assert.doesNotMatch(html,/<button|<form/);assert.match(html,/rel="preload" href="app.js" as="script"/);
});


test('fresh empty register gives role-specific guidance without an inert create form or fake clearance',()=>{
 for(const admin of [true,false]){
  const h=harness();h.run('state={actorId:"human",isProjectAdmin:'+admin+',permit:null,equipment:[],policy:{},board:[],assets:{status:"NOT_CONNECTED"}};stale=false;render()');
  assert.match(h.root.innerHTML,/Release NOT CLEARED — no permit/);assert.match(h.root.innerHTML,/No equipment registered yet/);
  assert.doesNotMatch(h.root.innerHTML,/data-operation="create_permit"/);assert.equal(h.calls.length,0);
  assert.match(h.root.innerHTML,admin?/entirely empty synthetic demo project/:/Ask a project administrator/);
 }
});
test('connected register outage is not presented as an empty sample setup opportunity',()=>{
 const h=harness();h.run('state={actorId:"human",isProjectAdmin:true,permit:null,equipment:[],policy:{},board:[],assets:{status:"UNAVAILABLE"}};stale=false;render()');
 assert.match(h.root.innerHTML,/Equipment register unconfirmed/);assert.match(h.root.innerHTML,/do not replace it with sample data/);assert.doesNotMatch(h.run('plan()'),/new synthetic demo only/);assert.equal(h.calls.length,0);
});
test('configured first-run register still offers the real create form without automatic writes',()=>{
 const h=harness();h.run('state={actorId:"human",permit:null,equipment:[{id:"EQ",name:"Pump"}],policy:{},board:[]};stale=false;render()');
 assert.match(h.root.innerHTML,/data-operation="create_permit"/);assert.match(h.root.innerHTML,/Worker account IDs/);assert.equal(h.calls.length,0);
});
test('failed read has actionable reconnect guidance and never echoes bridge exception details',async()=>{
 const h=harness();h.context.invoke=async()=>{throw new Error('PRIVATE_BRIDGE_CANARY');};await h.run('initialize()');
 assert.match(h.root.innerHTML,/Reconnect safely/);assert.match(h.root.innerHTML,/issue permissions/);assert.match(h.root.innerHTML,/Never paste an API token/);assert.doesNotMatch(h.root.innerHTML,/PRIVATE_BRIDGE_CANARY/);assert.equal(h.calls.length,0);assert.equal(h.run('stale'),true);
});
test('uncertain save neither echoes opaque exceptions nor retries the write',async()=>{
 const h=harness();let writes=0;h.context.invoke=async()=>{writes++;throw new Error('PRIVATE_WRITE_CANARY');};h.run('state={actorId:"human",permit:null,equipment:[],policy:{},board:[],revision:1};stale=false');await h.run('mutate("create_permit")');
 assert.equal(writes,1);assert.match(h.root.innerHTML,/may already have completed/);assert.match(h.root.innerHTML,/no operation was automatically resubmitted/);assert.doesNotMatch(h.root.innerHTML,/PRIVATE_WRITE_CANARY/);assert.equal(h.run('stale'),true);
});

test('sample roleplay is absent on fresh/real projects and requires a server-owned capability or active own sample',()=>{
 const h=harness();h.run('state={actorId:"human",permit:null,equipment:[],policy:{},board:[],capabilities:{sampleRoleplay:false}};stale=false;render()');assert.doesNotMatch(h.root.innerHTML,/Legacy single-person simulation/);
 h.run('state.capabilities.sampleRoleplay=true;render()');assert.match(h.root.innerHTML,/Legacy single-person simulation/);assert.equal(h.calls.length,0);
});

test('fresh guidance precedes advanced administration and links to a unique target',()=>{
 const h=harness();h.run('state={actorId:"human",isProjectAdmin:true,permit:null,equipment:[],policy:{},board:[]};stale=false;render()');
 assert.ok(h.root.innerHTML.indexOf('No equipment registered yet')<h.root.innerHTML.indexOf('id="project-administration"'));
 assert.equal((h.root.innerHTML.match(/id="project-administration"/g)||[]).length,1);assert.match(h.root.innerHTML,/href="#project-administration"/);
});

test('second-crew helper is offered only for empty seeded sample state, separate from legacy simulation',()=>{
 const h=harness();h.run('state={actorId:"human",revision:8,policy:{mode:"ENFORCE"},permit:null,assets:{source:"SAMPLE"},equipment:[{id:"register:10:EQ-1",name:"Cooling-water pump",isolationPoints:[]}]}');
 const html=h.run('plan()');assert.match(html,/Second crew — real sample records/);assert.match(html,/Create my Crew B sample permit/);assert.match(html,/different existing signed-in person/);assert.match(html,/does not impersonate anyone or apply a lock automatically/);
 h.run('state.assets.source="BUILT_IN_REGISTER"');assert.doesNotMatch(h.run('plan()'),/Create my Crew B sample permit/);
 assert.ok(source.includes("if(action==='create_demo_crew_b')"));assert.ok(source.includes('No lock or verification is created automatically.'));
});

test('build marker is above the fold and footer includes truthful environment without hardcoded release',()=>{
 const h=harness({__PERMITGUARD_BUILD__:'judge-build'});
 for(const [version,environment,label] of [['2.2.0','PRODUCTION','Production'],['5.16.0','development','Development'],['2','STAGING','Staging']]){
  h.run('state={actorId:"human",permit:null,revision:1,policy:{},equipment:[],board:[],buildInfo:'+JSON.stringify({version,environment})+'};stale=false;render()');
  const expected=version+' · '+label+' · UI judge-build';assert.ok(h.root.innerHTML.includes(expected));assert.ok(h.root.innerHTML.indexOf(expected)<h.root.innerHTML.indexOf('Release NOT CLEARED'));assert.ok(h.run('buildFooter()').includes(expected));
 }
 h.run('state.buildInfo={version:"<bad>",environment:"<script>"};render()');assert.match(h.root.innerHTML,/version unavailable · environment unconfirmed/);assert.doesNotMatch(h.root.innerHTML,/<script>|<bad>/);
});

test('empty demo button uses admin/server capability and cannot replace an unavailable register',()=>{const h=harness();h.run('state={actorId:"alice",isProjectAdmin:true,equipment:[],assets:{status:"NOT_CONNECTED"},capabilities:{seedEmptyDemo:true}}');assert.match(h.run('emptySetup()'),/Load six demo equipment items \(Warn-only\)/);h.run('state.capabilities.seedEmptyDemo=false;state.assets.status="UNAVAILABLE"');assert.doesNotMatch(h.run('emptySetup()'),/data-action="seed_empty_demo_register"/);h.run('state.capabilities.seedEmptyDemo=true;state.isProjectAdmin=false');assert.doesNotMatch(h.run('emptySetup()'),/data-action="seed_empty_demo_register"/);});

async function seedBridgeFixture({role='project-admin',canEdit=true,history=false}={}){
 const {createService}=await import('../../src/server/service.mjs');const {emptySite}=await import('../../src/server/store.mjs');const {jiraAdapters}=await import('../../src/server/jira.mjs');const {createForgeWiring}=await import('../../src/forge/actions.mjs');
 let row={revision:null,data:emptySite()},writes=0;const calls=[];
 if(history)row.data.permits.other={id:'other',projectId:'20',state:'CLOSED',locks:[]};
 const route=(strings,...values)=>strings.reduce((s,x,i)=>s+x+(i<values.length?values[i]:''),'');
 const api={asUser:()=>({requestJira:async url=>{calls.push(url);let data;if(url.startsWith('/rest/api/3/issue/'))data={id:'10001',key:'KAN-1',fields:{project:{id:'20',key:'KAN',name:'Synthetic fixture'}}};else if(url.startsWith('/rest/api/3/mypermissions?'))data={permissions:{ADMINISTER_PROJECTS:{havePermission:role==='project-admin'},ADMINISTER:{havePermission:role==='site-admin'},EDIT_ISSUES:{havePermission:canEdit}}};else if(url==='/rest/api/3/myself')data={accountId:'fixture-person',displayName:'Fixture only'};else throw Error('Unexpected API route: '+url);return {ok:true,status:200,json:async()=>data};}})};
 const adapters=jiraAdapters(api,route),store={atomic:true,read:async()=>structuredClone(row),commit:async(expected,data)=>{assert.equal(expected,row.revision);row={revision:(row.revision??-1)+1,data:structuredClone(data)};writes++;return row.revision;}};
 const dispatch=createService({store,...adapters});const wiring=createForgeWiring({dispatch,requestJira:async()=>{throw Error('Unexpected workflow API')}});const context={accountId:'fixture-person',extension:{issue:{id:'10001'}}};
 const invoke=async(_method,args)=>wiring.resolver({context,payload:args});return {invoke,calls,get writes(){return writes},get row(){return structuredClone(row)}};
}
for(const role of ['project-admin','site-admin'])test('real native permission adapter → service → Forge resolver → UI renders seed for '+role,async()=>{
 const fixture=await seedBridgeFixture({role}),h=harness({invoke:fixture.invoke});await h.run('refresh()');assert.equal(h.run('state.isProjectAdmin'),true);assert.equal(h.run('state.capabilities.seedEmptyDemo'),true);assert.match(h.root.innerHTML,/data-action="seed_empty_demo_register"/);assert.equal(fixture.writes,0);
 const target={dataset:{action:'seed_empty_demo_register'}};const click=()=>h.handlers.click({target:{closest:()=>target}});
 h.context.window.confirm=()=>false;await click();assert.equal(fixture.writes,0);assert.equal(h.run('state.equipment.length'),0);
 h.context.window.confirm=()=>true;await click();assert.equal(fixture.writes,1);assert.equal(h.run('state.equipment.length'),6);assert.equal(h.run('state.policy.mode'),'WARN_ONLY');assert.equal(h.run('state.permit'),null);assert.equal(h.run('state.capabilities.seedEmptyDemo'),false);assert.doesNotMatch(h.root.innerHTML,/data-action="seed_empty_demo_register"/);assert.match(h.root.innerHTML,/Synthetic demo equipment only/);
 await h.run('refresh()');assert.equal(fixture.writes,1);assert.equal(h.run('state.equipment.length'),6);assert.equal(h.run('state.release.status'),'NOT CLEARED');assert.deepEqual(fixture.row.data.permits,{});assert.ok(!fixture.calls.some(url=>url.includes('/search')),'ordinary Jira issues are never enumerated');
});
for(const setup of [{role:'member'},{role:'site-admin',canEdit:false},{role:'project-admin',history:true}])test('real resolver keeps demo seed hidden and nonwriting for '+JSON.stringify(setup),async()=>{
 const fixture=await seedBridgeFixture(setup),h=harness({invoke:fixture.invoke});await h.run('refresh()');assert.equal(h.run('state.capabilities.seedEmptyDemo'),false);assert.doesNotMatch(h.root.innerHTML,/data-action="seed_empty_demo_register"/);assert.equal(fixture.writes,0);
});

test('missing or false eligibility never promises a nonexistent demo button',()=>{const h=harness();h.run('state={isProjectAdmin:true,equipment:[],capabilities:{},assets:{status:"NOT_CONNECTED"}}');assert.match(h.run('emptySetup()'),/eligibility.*was not returned/);assert.doesNotMatch(h.run('emptySetup()'),/use the button below/);h.run('state.capabilities.seedEmptyDemo=false');assert.match(h.run('emptySetup()'),/not eligible/);assert.match(h.run('emptySetup()'),/Ordinary Jira issues alone do not block it/);});

test('every permit has uppercase phase badge and matching active step, absent permit has neither',()=>{
 const h=harness();
 for(const stage of ['PLAN','LOCK','VERIFY','ACTIVE','RELEASE','CLOSED']){
  h.run('state={actorId:"human",revision:1,policy:{},permit:{state:'+JSON.stringify(stage)+',equipment:[],locks:[],activations:[],verifications:[],audit:[]},board:[]};stale=false;render()');
  assert.ok(h.root.innerHTML.includes('Current phase: <strong>'+stage+'</strong>'));
  assert.equal((h.root.innerHTML.match(/aria-current="step"/g)||[]).length,1);
  assert.ok(h.root.innerHTML.includes('<li aria-current="step"><span>'+(['PLAN','LOCK','VERIFY','ACTIVE','RELEASE','CLOSED'].indexOf(stage)+1)+'</span>'+stage+'</li>'));
 }
 h.run('stale=true;render()');assert.match(h.root.innerHTML,/Last recorded phase: <strong>CLOSED/);assert.doesNotMatch(h.root.innerHTML,/Current phase:/);
 for(const equipment of [[],[{id:'EQ',name:'Pump'}]]){
  h.run('state.permit=null;state.equipment='+JSON.stringify(equipment)+';stale=false;render()');
  assert.match(h.root.innerHTML,/No permit created/);assert.match(h.root.innerHTML,/no current permit phase/);
  assert.doesNotMatch(h.root.innerHTML,/aria-current="step"|Current phase:/);assert.match(h.root.innerHTML,/Release NOT CLEARED — no permit/);
 }
 assert.equal(h.calls.length,0);
});
test('current workers and verifiers stay You across DTO reload without profile reads or identity changes',async()=>{
 const h=harness();
 const permit={state:'PLAN',equipment:[],workers:['human','other'],verifierIds:['human','other'],locks:[{actorId:'other',name:'Other worker <named>',lockId:'L-2',pointId:'V-3',crewId:'B'},{actorId:'human',name:'My personal-lock name',lockId:'L-1',pointId:'V-3',crewId:'A'}]};
 const dto={actorId:'human',revision:1,permit,policy:{},board:[]};
 h.run('state='+JSON.stringify(dto)+';stale=false;render()');
 for(const name of [undefined,'Authenticated display name']){
  h.context.invoke=async(_m,args)=>{assert.equal(args.operation,'get_state');return {...dto,actorDisplayName:name};};
  await h.run('refresh()');
  assert.ok(h.root.innerHTML.includes('<b>Workers:</b> You, Other worker &lt;named&gt;'));
  assert.ok(h.root.innerHTML.includes('<b>Verifiers:</b> You, Other worker &lt;named&gt;'));
  assert.match(h.root.innerHTML,/My personal-lock name/);assert.match(h.root.innerHTML,/Other worker &lt;named&gt;/);
  assert.equal(h.run('state.actorId'),'human');assert.equal(h.run('state.permit.workers[0]'),'human');
 }
 h.run('state.permit=null;state.equipment=[{id:"EQ",name:"Pump"}];render()');
 assert.match(h.root.innerHTML,/id="workers" name="workers" value="human"/);assert.match(h.root.innerHTML,/id="verifierIds" name="verifierIds" value="human"/);
});


test('create immediately shows pending, preserves uncreated state and prevents duplicate submits',async()=>{
 let now=1000,resolve,calls=0;const h=harness({Date:class extends Date{static now(){return now;}}});
 h.context.invoke=()=>{calls++;return new Promise(r=>resolve=r);};
 h.run('state={actorId:"human",revision:0,policy:{},permit:null,equipment:[],board:[]};stale=false;render()');
 const pending=h.run('mutate("create_permit")');
 assert.equal(h.run('busy'),true);assert.equal(h.run('state.permit'),null);
 assert.match(h.root.innerHTML,/Creating permit… Awaiting server confirmation. Not saved yet/);
 assert.doesNotMatch(h.root.innerHTML,/Permit created./);
 await h.run('mutate("create_permit")');assert.equal(calls,1);
 now=4300;resolve({actorId:'human',revision:1,policy:{},permit:{state:'PLAN',equipment:[],locks:[],workers:['human'],verifierIds:['human']},equipment:[],board:[]});
 await pending;assert.equal(h.run('busy'),false);assert.equal(h.run('state.revision'),1);
 assert.match(h.root.innerHTML,/Permit created./);assert.match(h.root.innerHTML,/Last save attempt: 3.3 s panel round-trip/);
 assert.match(h.root.innerHTML,/Current phase: <strong>PLAN/);assert.equal(calls,1);
});
test('uncertain create clears pending copy, never creates local permit or automatically retries',async()=>{
 const h=harness();let reject,calls=0;h.context.invoke=()=>{calls++;return new Promise((_r,j)=>reject=j);};
 h.run('state={actorId:"human",revision:0,policy:{},permit:null,equipment:[],board:[]};stale=false');
 const pending=h.run('mutate("create_permit")');reject(new Error('transport uncertain'));await pending;
 assert.equal(calls,1);assert.equal(h.run('state.permit'),null);assert.equal(h.run('stale'),true);
 assert.doesNotMatch(h.root.innerHTML,/Creating permit…/);assert.match(h.root.innerHTML,/Refresh before retrying/);
 assert.match(h.root.innerHTML,/outcome unconfirmed/);
});


test('data-free useful orientation and build placeholder exist before any bridge evaluation',()=>{
 const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
 for(const copy of ['UI __PERMITGUARD_HTML_BUILD__','version and environment pending','While the authenticated read runs','Every worker controls their own','named human must confirm','No current permit, phase, people or lock counts are known yet'])assert.ok(html.includes(copy),copy);
 assert.doesNotMatch(html,/<button|<form|aria-current|Current phase:|CLEARED — no permit/);
 const build=fs.readFileSync(path.join(__dirname,'../../src/ui-build.cjs'),'utf8');assert.ok(build.includes(".replace('__PERMITGUARD_HTML_BUILD__',buildLabel)"));
});
test('pending live resolver retains useful orientation; hanging preview never blocks live',async()=>{
 const h=harness();let finish,previewReads=0;h.context.view={getContext:async()=>previewContext};h.context.requestJira=()=>{previewReads++;return new Promise(()=>{});};h.context.invoke=()=>new Promise(r=>finish=r);
 const loading=h.run('initialize()');await new Promise(r=>setImmediate(r));assert.equal(previewReads,1);assert.match(h.root.innerHTML,/While the authenticated read runs/);assert.match(h.root.innerHTML,/Release unconfirmed/);assert.equal(h.run('stale'),true);assert.doesNotMatch(h.root.innerHTML,/data-operation=|Current phase:|No permit created/);
 finish({actorId:'human',permit:null,revision:1,policy:{},equipment:[],board:[]});await loading;assert.equal(h.run('stale'),false);assert.equal(h.run('initializing'),false);assert.doesNotMatch(h.root.innerHTML,/While the authenticated read runs/);
});
test('404 optional preview is explicit absence and never a failed live connection',async()=>{
 const h=harness();h.context.view={getContext:async()=>previewContext};let reads=0;h.context.requestJira=async()=>{reads++;return {ok:false,status:404};};await h.run('initialize()');await new Promise(r=>setImmediate(r));assert.equal(reads,1);assert.equal(h.run('stale'),false);assert.equal(h.run('preview'),null);assert.match(h.run('buildFooter()'),/No historical snapshot available.*live read continues/);assert.equal(h.run('error'),'');
});
test('browser first-content timing is independent of live data and unavailable without Paint Timing',()=>{
 const FakeDate=class extends Date{static now(){return 100000;}};
 const h=harness({Date:FakeDate,performance:{timeOrigin:74000,getEntriesByName:n=>{assert.equal(n,'first-contentful-paint');return [{startTime:1234}];}}});h.run('liveLoadedAt=104000');const footer=h.run('buildFooter()');assert.match(footer,/first content \(browser FCP\): 1.2 s/);assert.match(footer,/data-free loading shell, not live state/);assert.match(footer,/navigation → live: 30.0 s/);
 assert.match(harness().run('buildFooter()'),/first content \(browser FCP\): not recorded/);
});
