import { invoke, realtime, view, requestJira } from '@forge/bridge';
const root = document.querySelector('#app');
const stages = ['PLAN','LOCK','VERIFY','ACTIVE','RELEASE','CLOSED'];
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uiSource = typeof __PERMITGUARD_BUILD__ === 'string' ? __PERMITGUARD_BUILD__ : 'local source';
const startupStartedAt=Date.now();
// This iframe's document clock is accessible; the cross-origin Jira navigation clock is not.
const iframeNavigationAt=typeof performance!=='undefined'&&Number.isFinite(performance.timeOrigin)&&performance.timeOrigin>0&&performance.timeOrigin<=startupStartedAt?performance.timeOrigin:null;
let liveRequestStartedAt=0,liveRequestFinishedAt=0,contextReceivedAt=0;
let previewStatus='Waiting for issue context',previewReceivedAt=0,previewShownAt=0,liveLoadedAt=0;
let preview = null;
let state = null, busy = false, stale = true, error = '', notice = '', sync = 'Not subscribed; use Refresh', subscription, refreshing, adminResult = null, rules = [], playingCrewB = false, snapshotIssue = '', pendingInvalidation = false, pendingRevision = null, initializing = true, saveStartedAt = 0, saveStage = '', saveTimer = null;
const call = (operation, payload = {}) => invoke('permitguard', {operation, payload});
const button = (label, action, primary = false, attrs = '') => '<button type="button" class="'+(primary?'primary':'secondary')+'" data-action="'+action+'" '+(busy||stale?'disabled ':'')+attrs+'>'+escape(label)+'</button>';
const field = (id, label, value = '', attrs = '') => '<label for="'+id+'">'+label+'</label><input id="'+id+'" name="'+id+'" value="'+escape(value)+'" '+attrs+'>';
const check = (id, text) => '<label class="check"><input type="checkbox" id="'+id+'" name="'+id+'" required> '+text+'</label>';
const options = (values, getId = x => x, getName = x => x) => values.map(x => '<option value="'+escape(getId(x))+'">'+escape(getName(x))+'</option>').join('');
const points = () => (state?.permit?.equipment || []).flatMap(e => (e.isolationPoints || []).map(p => ({...p,equipmentId:e.id})));
const person = id => id===state?.actorId?(state.actorDisplayName||'You'):(state?.permit?.locks||[]).find(l=>l.actorId===id)?.name||'Another named participant';
const when = value => value&&Number.isFinite(Date.parse(value))?new Date(value).toLocaleString():'Not recorded';
const reasons = result => '<ul class="reasons">'+(result?.reasons || []).map(r => '<li>'+escape(typeof r === 'string' ? r : r.message || r.code)+'</li>').join('')+'</ul>';
const qrFields = (prefix,target) => field(prefix+'-qr','QR text — expected: '+escape('permitguard:'+target),'', 'required autocomplete="off"')+'<p class="subtle">Manual entry is your assertion, not hardware or location proof. A scanned QR also does not prove safe isolation.</p><label for="'+prefix+'-scan">Read QR from camera / image (supported browsers)</label><input id="'+prefix+'-scan" type="file" accept="image/*" capture="environment" data-qr-target="'+prefix+'-qr">'+check(prefix+'-onsite','I am at the equipment and have followed the site verification procedure.');
function emptySetup() {
 const unavailable=state?.assets?.status==='UNAVAILABLE';
 const title=unavailable?'Equipment register unconfirmed':'No equipment registered yet';
 const guidance=unavailable?'The connected register is unavailable or has changed. Planning is blocked; do not replace it with sample data to bypass the problem.':'No permit has been created. Configure Equipment and Isolation points before entering workers or creating a permit.';
 const next=state?.isProjectAdmin?(unavailable?'Open Project administration to review the connection. Restore access and reconcile changed records before retrying; do not reset an active project.':'For an entirely empty synthetic demo project, an administrator can load six demo equipment items below after confirmation. This stays Warn-only and creates no permits or locks. Dedicated PGSAMPLE Enforce setup remains separate. Real work needs a site-approved register.'):'Ask a project administrator to configure or reconcile this project’s equipment register. No API token or paid plan change is needed in this panel.';
 return '<section class="empty-setup" role="status" aria-labelledby="equipment-setup-title"><h3 id="equipment-setup-title">'+title+'</h3><p>'+guidance+'</p><p>'+next+'</p>'+(state?.isProjectAdmin&&state?.capabilities?.seedEmptyDemo===true?button('Load six demo equipment items (Warn-only)','seed_empty_demo_register'):'')+(state?.isProjectAdmin?'<p><a href="#project-administration">Open project administration below</a></p>':'')+'<p class="subtle">No setup action has run automatically. Refresh only rereads current state.</p></section>';
}
function connectionHelp() {
 return '<section class="connection-help" aria-label="Reconnect safely"><h2>Reconnect safely</h2><ol><li>Check that you are signed in and can open this Jira work item. Reopen View app actions → PermitGuard if necessary.</li><li>Choose Refresh to reread current state. Do not repeat a save whose result is uncertain; no save is retried automatically.</li><li>If access still fails, ask an administrator to check the app installation and your issue permissions. Never paste an API token into this panel or change billing to troubleshoot.</li></ol></section>';
}
function plan() {
 if (state.permit) return '<h2>Review the isolation plan</h2><p>Confirm the equipment, workers and named verifiers against the site procedure before applying locks.</p>'+equipmentList(state.permit.equipment)+'<p><b>Crew:</b> '+escape(state.permit.crewId)+'</p><p><b>Workers:</b> '+escape(state.permit.workers?.map(person).join(', '))+'</p><p><b>Verifiers:</b> '+escape(state.permit.verifierIds?.map(person).join(', '))+'</p><div class="action-bar">'+button('Begin locking','begin_lock',true)+'</div>';
 if(!state.equipment?.length)return '<h2>Plan an isolation permit</h2>'+emptySetup();
 return '<h2>Plan an isolation permit</h2><p>'+(state.syntheticDemoRegister?'Synthetic demo equipment only · Warn-only. No real-site register or isolation proof. ':'')+'Select registered equipment. Account IDs must belong to the actual people performing and verifying this work.</p><form data-operation="create_permit"><fieldset><legend>Equipment</legend>'+((state.equipment || []).map(e => '<label class="check"><input type="checkbox" name="equipmentIds" value="'+escape(e.id)+'"> '+escape(e.name)+' <span class="equipment-id">'+escape(e.id)+'</span></label>').join('') || '<p>No equipment available. Ask a project administrator to configure the register.</p>')+'</fieldset>'+field('crewId','Crew name','','required')+field('workers','Worker account IDs (comma-separated)',state.actorId,'required')+field('verifierIds','Named verifier account IDs (comma-separated)',state.actorId,'required')+'<p class="note">High-energy isolation requires two distinct named human verifiers. You cannot act as another worker by entering their ID.</p><div class="action-bar"><button class="primary" '+(busy||stale?'disabled':'')+'>Create permit</button></div></form>'+(state.assets?.source==='SAMPLE'?'<details class="demo-tools"><summary>Second crew — real sample records</summary><p>Use a different existing signed-in person on a new issue in this dedicated sample project. Crew A must already have a recorded lock on Cooling-water pump. This creates only your PLAN permit; then Begin locking and record your own L-07 lock with photo through the normal controls. It does not impersonate anyone or apply a lock automatically. Synthetic demonstration, not physical isolation proof.</p>'+button('Create my Crew B sample permit','create_demo_crew_b')+'</details>':'');
}
function equipmentList(equipment) { return '<ul class="equipment-list">'+(equipment || []).map(e => '<li><b>'+escape(e.name)+'</b> <span class="equipment-id">'+escape(e.id)+'</span><div class="subtle">'+(e.isolationPoints || []).map(p => escape(p.id+' / '+p.energyType+(p.highEnergy?' / two verifiers required':''))).join('<br>')+'</div></li>').join('')+'</ul>'; }
function locking() { return '<h2>Apply your personal locks</h2><p>Every assigned worker locks every planned point. Isolation changes invalidate previous verification. Only your authenticated identity can apply your locks.</p>'+points().map((p,i) => '<details class="evidence" open><summary>'+escape(p.id)+' · '+escape(p.energyType)+(p.highEnergy?' · high energy':'')+'</summary><form data-operation="apply_lock"><input type="hidden" name="pointId" value="'+escape(p.id)+'">'+field('lockId-'+i,'Personal lock ID','','required')+field('name-'+i,'Your name','','required')+'<label for="photo-'+i+'">Lock photo (camera or file)</label><input id="photo-'+i+'" name="photo" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" '+(state.policy?.mode==='ENFORCE'?'required':'')+'><p class="subtle">Stored with the permit in Forge. Photos are resized locally to the bounded evidence limit; inspect legibility before submission. Maximum input 10 MB. Camera availability depends on this browser and iframe permissions.</p><button class="secondary" '+(busy||stale?'disabled':'')+'>Record my lock</button></form></details>').join('')+'<div class="action-bar">'+button('Begin verification','begin_verify',true)+'</div>'; }
function verification() {
 const pending = state.permit.activations?.find(a => a.status === 'PENDING');
 return '<h2>Verify zero-energy isolation</h2><p>Follow the physical test and stored-energy procedure. A checked box or QR is not a measurement of zero energy.</p>'+points().map((p,i) => '<details class="evidence"><summary>'+escape(p.id)+' · '+(p.highEnergy?'Two distinct verifiers':'One named verifier')+' · '+(state.permit.verifications || []).filter(v => v.pointId===p.id).length+' recorded</summary><form data-operation="verify_point"><input type="hidden" name="pointId" value="'+escape(p.id)+'">'+qrFields('point-'+i,p.id)+'<button class="secondary" '+(busy||stale?'disabled':'')+'>Record my verification</button></form></details>').join('')+'<section class="'+(state.readiness?.status==='CLEARED'?'notice':'blocked')+'"><b>'+escape(state.readiness?.status || 'Readiness unknown')+'</b>'+reasons(state.readiness)+'</section>'+(pending?'<h3>Pending human activation</h3><p>Assigned to '+escape(person(pending.verifierId))+'. An agent proposal cannot activate this permit.</p><form data-operation="confirm_activation"><input type="hidden" name="activationId" value="'+escape(pending.id)+'">'+'<label for="activation-equipment">Equipment to confirm (use its equipment QR, not V-3)</label><select id="activation-equipment" name="equipmentId">'+options(state.permit.equipment,e=>e.id,e=>e.name+' — permitguard:'+e.id)+'</select>'+qrFields('activation',state.permit.equipment[0]?.id)+'<div class="action-bar"><button class="primary" '+(busy||stale||pending.verifierId!==state.actorId?'disabled':'')+'>Confirm at equipment and activate</button></div></form>':'<form data-operation="request_activation"><label for="verifierId">Assign activation confirmation</label><select id="verifierId" name="verifierId">'+options(state.permit.verifierIds || [],id=>id,person)+'</select><div class="action-bar"><button class="primary" '+(busy||stale?'disabled':'')+'>Request human activation</button></div></form>');
}
function work() {
 if (!state.permit || state.permit.state==='PLAN') return plan();
 if (state.permit.state==='LOCK') return locking();
 if (state.permit.state==='VERIFY') return verification();
 if (state.permit.state==='ACTIVE') return '<h2>Work is active</h2><p>Maintain the isolation and all personal locks. Changes to the work scope require the site change-control procedure.</p>'+equipmentList(state.permit.equipment)+'<div class="notice">Permit state is not an instruction to energize equipment.</div><div class="action-bar">'+button('Begin release checks','begin_release',true)+'</div>';
 if (state.permit.state==='RELEASE') return '<h2>Account for every personal lock</h2><p>Each worker removes only their own lock. Another crew’s lock blocks release across shared equipment. Follow site inspection, personnel-clearance and notification procedures.</p><section class="'+(state.release?.status==='CLEARED'?'notice':'blocked')+'"><b>'+escape(state.release?.status || 'Release readiness unknown')+'</b>'+reasons(state.release)+'</section><div class="action-bar">'+button('Close permit','close_permit',true,state.release?.status!=='CLEARED'?'disabled':'')+'</div>';
 return (state.isProjectAdmin?button('Publish / retry monthly archive','archive_closed'): '')+'<h2>Permit closed</h2><p>Closed '+escape(when(state.permit.closedAt))+'. This record is not permission to energize. Complete your site’s restoration procedure.</p><details><summary>Audit record</summary><ol>'+ (state.permit.audit || []).map(a => '<li>'+escape(a.action)+' — '+escape(person(a.actorId))+' · '+escape(when(a.at))+'</li>').join('')+'</ol></details>';
}
function board() {
 const entries = Array.isArray(state.board) ? state.board : state.board?.permits || state.board?.locks || [];
 const aggregates = entries.filter(e => Number.isInteger(e.activeLockCount));
 const locks = entries.flatMap(p => p.locks ? p.locks.map(l => ({...l,crewId:l.crewId || p.crewId})) : p.lockId ? [p] : []);
 for (const l of state.sampleCrewB?.locks || []) locks.push(l);
 for (const l of state.permit?.locks || []) if (!locks.some(x => x.lockId===l.lockId&&x.actorId===l.actorId)) locks.push(l);
 return '<aside class="lock-board" aria-label="Shared lock board"><div class="board-title"><h2>Personal lock rail</h2></div><p class="subtle">Server-observed records. Active personal-lock records, including shared equipment. These records are not physical isolation proof.</p><div class="lock-rail">'+aggregates.map(e => '<p><b>'+escape(e.activeLockCount)+'</b> personal lock'+(e.activeLockCount===1?'':'s')+' recorded on '+escape((state.permit?.equipment||[]).find(x=>x.id===e.equipmentId)?.name||e.equipmentId)+'</p>').join('')+(locks.filter(l => !l.removedAt).map(l => '<article class="lock-tag '+(l.actorId!==state.actorId?'other':'')+'"><div><h3>'+escape(l.lockId)+'</h3><p>'+escape(l.name || person(l.actorId))+'</p><p>'+escape(l.crewId)+' · '+escape(l.pointId)+'</p><small>'+escape(when(l.appliedAt))+'</small>'+(!l.simulated&&l.actorId===state.actorId&&['LOCK','VERIFY','RELEASE'].includes(state.permit?.state)?button('Remove my lock','remove_lock',false,'data-lock-id="'+escape(l.lockId)+'"'):'')+'</div></article>').join('') || '<p class="empty-lock">No personal-lock details returned. Other crews may have locks shown only in aggregate; release readiness remains authoritative.</p>')+'</div>'+((state.capabilities?.sampleRoleplay===true||state.sampleCrewB?.active)?'<details class="demo-tools"><summary>Legacy single-person simulation</summary><p>This changes synthetic sample records only. Play Crew B is not real principal impersonation and cannot remove production locks.</p>'+button('Play Crew B (sample only)','play_crew_b')+((playingCrewB || state.sampleCrewB?.active)?button('Remove my simulated Crew B lock','remove_sample_lock'):'')+'</details>':'')+'</aside>';
}
function admin() { if (!state.isProjectAdmin) return '<p class="bottom-note">Project policy is managed by project administrators. Server permissions apply to every action.</p>';
 return '<details class="admin" '+(!state.equipment?.length?'open':'')+' id="project-administration"><summary>Project administration</summary><p>Changes apply to the current project only. Enforce is opt-in. Server checks are authoritative.</p><form data-operation="set_policy"><div class="fields"><div><label for="mode">Enforcement mode</label><select id="mode" name="mode">'+options(['WARN_ONLY','ENFORCE'],x=>x,x=>x==='ENFORCE'?'Enforce':'Warn only')+'</select></div><div><label for="failMode">Unavailable-register policy</label><select id="failMode" name="failMode">'+options(['FAIL_CLOSED','FAIL_OPEN_WITH_ALERT'],x=>x,x=>x==='FAIL_CLOSED'?'Block if register unavailable':'Explicit outage warning policy')+'</select></div></div><p class="subtle">Fail-open-with-alert is an explicit outage policy; it never converts NOT CLEARED into activation authority.</p><button class="secondary" '+(busy||stale?'disabled':'')+'>Save policy</button></form><details open><summary>Load a dedicated sample plant</summary><form data-operation="load_sample">'+check('confirmed','Create six sample equipment items and associated isolation points; enable Enforce only in the verified dedicated sample project (PGSAMPLE). Other projects stay unchanged. No instruments or calibration data.')+'<button class="secondary" '+(busy||stale?'disabled':'')+'>Load confirmed sample</button></form></details><h3>Equipment register</h3><p>Import only the approved Equipment and Isolation points schema. An unavailable or changed connected register blocks readiness; fallback remains explicit.</p>'+button('Import demo Assets equipment','import_assets')+'<details><summary>Connect this site’s Assets types</summary><form data-operation="connect_assets">'+field('workspaceId','Assets workspace UUID','','required')+field('schemaId','Schema ID','','required pattern="[0-9]+"')+field('equipmentTypeId','Equipment type ID (exact type name Equipment)','','required pattern="[0-9]+"')+field('pointTypeId','Isolation points type ID (exact type name Isolation points)','','required pattern="[0-9]+"')+check('assetsConfirmed','Read only these Equipment and Isolation points types and import their register into this project.')+'<button class="secondary">Connect confirmed Assets types</button></form></details><details><summary>Built-in register fallback</summary><form data-operation="register_equipment"><label for="equipmentJson">One to six Equipment records (JSON; Equipment and Isolation points only)</label><textarea id="equipmentJson" name="equipmentJson" required rows="8">[{&quot;id&quot;:&quot;PUMP-1&quot;,&quot;name&quot;:&quot;Pump 1&quot;,&quot;isolationPoints&quot;:[{&quot;id&quot;:&quot;V-3&quot;,&quot;energyType&quot;:&quot;HYDRAULIC&quot;,&quot;highEnergy&quot;:false}]}]</textarea><button class="secondary">Save built-in register</button></form></details><h3>Workflow recovery and dry-run</h3><p>List and disable only this app’s observed rules. No delete operation is claimed. Before uninstall, disable gates, verify recovery and retain/export records according to your policy; uninstall does not promise deletion of Jira or Confluence artifacts.</p>'+button('Run transition dry-run','dry_run')+' '+button('List app-owned rules','list_rules')+'<ul>'+rules.map((r,i) => '<li>'+escape(r.workflowName || r.workflowId || '')+' / '+escape(r.ruleId || r.id)+' '+escape(r.status || '')+' '+button('Disable observed rule','disable_rule',false,'data-rule-index="'+i+'"')+'</li>').join('')+'</ul><p class="subtle">Scope boundary: Equipment and Isolation points only. Jira context, app storage, owned workflow rules and configured Confluence archive are app footprint; actual consent scopes are shown during installation. No external runtime egress, LLM, Containers, instruments or Teamwork Graph.</p>'+(state.capabilities?.archiveConfig?'<form data-operation="set_archive_config">'+field('spaceId','Restricted monthly archive space ID','','required')+field('allowedUserIds','Approved reader account IDs (comma-separated; include yourself)',state.actorId,'required')+check('archiveConfirmed','Use this restricted space for monthly closed-permit metadata. Every space permission must be for an explicitly approved named user; groups and anonymous access are refused.')+'<p class="subtle">Server must verify access restrictions; no unrestricted fallback.</p><button class="secondary">Save monthly archive space</button></form>':'<p class="subtle">Monthly archive configuration is not advertised by this deployment.</p>')+(adminResult?'<pre class="result" tabindex="0">'+escape(JSON.stringify(adminResult,null,2))+'</pre>':'')+'</details>';
}
function mapping() { const map={PLAN:['(c)(4)','Document equipment-specific energy-control procedures.'],LOCK:['(d)(1)–(5)','Prepare, shut down, isolate, apply personal devices and address stored energy.'],VERIFY:['(d)(6), (f)(3)','Verify isolation; group work requires accountable personal protection.'],ACTIVE:['(d), (f)(3)','Maintain the site energy-control procedure throughout group work.'],RELEASE:['(e), (f)(3)','Inspect, account for personnel and devices, and notify affected employees.'],CLOSED:['(e)','Record closure only after site release checks; closure is not energization authority.']}; const m=map[state?.permit?.state || 'PLAN'] || map.PLAN;return '<details class="reference"><summary>OSHA 1910.147 · this step</summary><p><a href="https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.147" target="_blank" rel="noopener noreferrer">Official energy-control standard</a> '+m[0]+': '+m[1]+'</p><p class="subtle">Informational mapping, not certification, legal advice or a complete compliance checklist. Your site procedure remains authoritative.</p></details>'; }
function permissionsSummary(scopes={}) {
 const declared=Array.isArray(scopes.declared)?scopes.declared:[];
 const groups=[
  [['read:jira-work','write:jira-work','read:jira-user'],'Jira work items and people: read permitted issue details, validate named participants, and update the app’s derived issue property.'],
  [['read:cmdb-object:jira','read:cmdb-type:jira'],'Assets: read the configured Equipment and Isolation points types and objects, not instruments or calibration.'],
  [['read:servicedesk-request'],'Jira Service Management: read permitted request information.'],
  [['storage:app'],'Forge app storage: retain permit records, personal-lock evidence, photos and verification history.'],
  [['manage:jira-configuration'],'Workflow administration: inspect and disable app-owned rules; administrator checks still apply.'],
  [['read:space:confluence','read:space.permission:confluence','read:page:confluence','write:page:confluence'],'Confluence: inspect configured space restrictions and read/write authorized archive pages when an administrator configures the archive.']
 ];
 return '<p>Declared app permissions cover the following. Actual access also depends on installation consent and the signed-in person’s permissions; this page is not a live audit of granted access.</p><ul>'+groups.filter(([keys])=>keys.some(k=>declared.includes(k))).map(([,label])=>'<li>'+escape(label)+'</li>').join('')+'</ul><p>No external runtime, instruments, calibration or Teamwork Graph access. Review installed-app consent before changing access.</p>';
}
function savingLabel(){return 'Saving…'+(saveStartedAt?' '+Math.max(0,Math.floor((Date.now()-saveStartedAt)/1000))+' s':'');}
function updateSavingProgress(){
 if(!busy)return;
 const status=root.querySelector('#connection-status');
 if(status?.firstChild)status.firstChild.nodeValue=savingLabel();
 const detail=status?.querySelector?.('small');
 if(detail)detail.textContent=saveStage+'. Keep this panel open; do not resubmit.';
}
function startSaving(stage){busy=true;saveStage=stage;saveStartedAt=Date.now();if(saveTimer!==null)clearInterval(saveTimer);saveTimer=setInterval(updateSavingProgress,1000);render();}
function stopSaving(){busy=false;if(saveTimer!==null)clearInterval(saveTimer);saveTimer=null;saveStartedAt=0;saveStage='';}
function specialView() {
 if(state?.kind==='ADMINISTRATION') return '<h1>PermitGuard administration</h1><p role="status">Administration loaded. No live permit subscription is required on this page.</p><p>Open a Jira work item to manage its permit and project policy.</p><h2>What this app touches</h2>'+permissionsSummary(state.scopes)+'<h2>Before uninstall</h2><p>'+escape(state.uninstall?.instructions)+'</p>'+button('List app-owned workflow rules','list_rules')+(adminResult?'<pre>'+escape(JSON.stringify(adminResult,null,2))+'</pre>':'');
 if(state?.kind==='PERMITGUARD_LOCK_BOARD_SNAPSHOT') return '<h1>Lock-board snapshot</h1><p>'+escape(state.label)+'</p><p>Not live. Choose a work item you can access; no other issue records are disclosed.</p><label for="snapshotIssue">Jira work item key</label><input id="snapshotIssue" value="'+escape(snapshotIssue)+'"><button data-action="load_snapshot">Load authorized snapshot</button><pre>'+escape(JSON.stringify(state.permits || [],null,2))+'</pre>';
 return '';
}
function releaseSummary(){
 if(state?.kind)return '';
 if(state?.permit){
  const confirmed=!stale&&state.release?.status==='CLEARED';
  const title=stale?'Release unconfirmed — last server read':confirmed?'Release records CLEARED — not energization authority':'Release NOT CLEARED';
  const details=(state.release?.reasons||[]).slice(0,2).map(r=>r.message||'Inspect the current permit.').join(' ');
  return '<section class="release-summary '+(confirmed?'release-records':'release-blocked')+'" role="status" aria-live="polite"><strong>'+escape(title)+'</strong><span>'+escape(details||'Follow the site release procedure; this record is not permission to energize.')+'</span></section>';
 }
 if(state&&!state.permit)return '<section class="release-summary release-blocked" role="status"><strong>'+ (stale?'Release unconfirmed — last server read':'Release NOT CLEARED — no permit')+'</strong><span>No work-start or release clearance is established by an empty register or an empty lock rail.</span></section>';
 if(preview)return '<section class="release-summary projection-preview" role="status"><strong>Historical preview — not live or actionable</strong><span>Last recorded release: '+(preview.releaseBlocked?'NOT CLEARED':'unconfirmed')+'. Checking current permissions and app state.</span></section>';
 return '';
}
function buildMarker(){
 const version=state?.buildInfo?.version,validVersion=typeof version==='string'&&/^[0-9]+(?:\.[0-9]+){0,2}$/.test(version);
 const environment=typeof state?.buildInfo?.environment==='string'?state.buildInfo.environment.toUpperCase():'';
 const environmentLabel=({PRODUCTION:'Production',DEVELOPMENT:'Development',STAGING:'Staging'})[environment]||'environment unconfirmed';
 return (validVersion?escape(version):state?'— version unavailable':'— version pending live connection')+' · '+escape(environmentLabel)+' · UI '+escape(uiSource);
}
function buildFooter(){
 const timing=(at,origin=startupStartedAt)=>at&&origin?((at-origin)/1000).toFixed(1)+' s':'not recorded';
 const iframeLive=iframeNavigationAt?timing(liveLoadedAt,iframeNavigationAt):'unavailable';
 return '<footer class="build-footer"><small>PermitGuard '+buildMarker()+'</small><details><summary>Startup details — not total Jira navigation time</summary><p><strong>Jira navigation → live: not measured here. Use the navigation stopwatch.</strong></p><p>Iframe document navigation → panel code: '+timing(startupStartedAt,iframeNavigationAt)+'. Iframe document navigation → live: '+iframeLive+'. This iframe clock still excludes Jira waiting to create or navigate the frame.</p><p>Panel-code clock only: context received '+timing(contextReceivedAt)+'; snapshot received '+timing(previewReceivedAt)+'; first historical preview '+timing(previewShownAt)+'; first live state '+timing(liveLoadedAt)+'. First state-request round trip (including a failed attempt): '+(liveRequestFinishedAt&&liveRequestStartedAt?((liveRequestFinishedAt-liveRequestStartedAt)/1000).toFixed(1)+' s':'not recorded')+'.</p><p>Preview: '+escape(previewStatus)+'. Do not compare panel-only seconds with a Jira-navigation stopwatch. Preview is optional and never actionable; live state is never delayed to display it.</p></details></footer>';
}
function updateBuildFooter(){const footer=root.querySelector('.build-footer');if(footer)footer.outerHTML=buildFooter();}
async function loadPreview(context){
 const issue=context?.extension?.issue||{},ref=String(issue.id||issue.key||'');
 const numeric=/^[1-9][0-9]*$/.test(ref),key=/^[A-Z][A-Z0-9_]*-[1-9][0-9]*$/.test(ref);
 if(!numeric&&!key){previewStatus='No issue reference available';updateBuildFooter();return false;}
 if(typeof requestJira!=='function'){previewStatus='Snapshot bridge unavailable';updateBuildFooter();return false;}
 previewStatus='Requesting historical snapshot';updateBuildFooter();
 try{
  const response=await requestJira('/rest/api/3/issue/'+ref+'/properties/permitguard.snapshot');
  if(!response.ok){previewStatus='Snapshot unavailable'+(Number.isInteger(response.status)?' (HTTP '+response.status+')':'');return false;}
  const p=(await response.json()).value;previewReceivedAt=Date.now();
  if(p?.schemaVersion!==1||p.authoritative!==false||! /^[1-9][0-9]*$/.test(String(p.permitId||''))||(numeric&&p.permitId!==ref)||!stages.includes(p.state)||!Number.isSafeInteger(p.revision)||p.revision<0||!Number.isSafeInteger(p.activeLockCount)||p.activeLockCount<0||!Number.isFinite(Date.parse(p.updatedAt))||Date.parse(p.updatedAt)>Date.now()+60000){previewStatus='Snapshot metadata rejected';return false;}
  if(state||!initializing){previewStatus='Snapshot arrived after live state or connection attempts; not displayed';return false;}
  // Only bounded metadata from this user's current issue property; never action authority.
  preview={phase:p.state,locks:p.activeLockCount,permitRevision:p.revision,updatedAt:p.updatedAt,releaseBlocked:p.release?.cleared===false};
  previewShownAt=previewShownAt||Date.now();previewStatus='Historical preview rendered';render();return true;
 }catch{previewStatus='Snapshot request failed';return false;}
 finally{updateBuildFooter();}
}
function render() {
 // Keep the actual form nodes (including file inputs, QR and checkbox) while saving.
 const connection=root.querySelector('#connection-status'),feedback=root.querySelector('#feedback');
 if(busy&&connection&&feedback){
  updateSavingProgress();
  feedback.innerHTML=error?'<div class="blocked">'+escape(error)+'</div>':notice?'<div class="notice">'+escape(notice)+'</div>':'';
  root.querySelectorAll('input,select,textarea,button').forEach(el=>{el.disabled=true;});
  return;
 }

 if(state?.kind) { root.innerHTML='<main><div class="safety">Decision support only; site procedure authoritative.</div><div role="status">'+escape(error || notice)+'</div>'+specialView()+'<button data-action="refresh">Refresh snapshot</button></main>'+buildFooter(); return; }
 root.innerHTML='<header class="masthead"><div class="brand"><span class="brand-mark" aria-hidden="true">P<span></span></span><b>PermitGuard</b></div><span class="prototype">Connected isolation clipboard<small class="build-marker" aria-label="Build and environment">'+buildMarker()+'</small></span></header><div class="safety">Decision support only. Follow your site permit procedure. No offline mode or safety certification.</div><main>'+releaseSummary()+'<div id="feedback" role="'+(error?'alert':'status')+'" aria-live="polite">'+(error?'<div class="blocked">'+escape(error)+'</div>':'')+(notice?'<div class="notice">'+escape(notice)+'</div>':'')+'</div><div class="connection"><span id="connection-status">'+escape(busy?'Saving…':initializing?'Loading authenticated state…':stale?'State unconfirmed — refresh before acting':'Server read '+new Date(state?.observedAt || Date.now()).toLocaleTimeString())+'<small>'+escape(initializing?'Connecting automatically…':stale&&sync==='Live updates connected'?'Updates subscribed; current state unconfirmed':sync)+'</small></span><button type="button" class="secondary" data-action="refresh" '+(busy?'disabled':'')+'>Refresh</button></div>'+(state?'<div class="permit-head"><div><p class="issue">'+escape(state.projectName || state.projectKey || 'Current project')+' · '+escape(state.issueKey || 'Current work item')+'</p><h1>'+(state.permit?'Isolation permit':'Prepare the work')+'</h1><p class="subtle">Signed-in account: '+escape(state.actorDisplayName || 'Signed-in worker')+' · revision '+escape(state.revision ?? state.permit?.revision ?? 'not created')+'</p></div><div class="mode"><strong>'+escape(state.policy?.mode==='ENFORCE'?'Enforce':'Warn-only')+'</strong><span>'+escape(state.policy?.failMode==='FAIL_OPEN_WITH_ALERT'?'Warn during register outages':'Block while the register is unavailable')+'</span><small>Advisory workflow allowance never means safe activation.</small></div></div><ol class="steps" aria-label="Permit progress">'+stages.map((s,i) => '<li '+(s===(state.permit?.state || 'PLAN')?'aria-current="step"':'')+'><span>'+(i+1)+'</span>'+s.charAt(0)+s.slice(1).toLowerCase()+'</li>').join('')+'</ol>'+'<div class="workspace"><section id="work" tabindex="-1" class="work-sheet" aria-label="Current permit step">'+work()+'</section>'+board()+'</div>'+admin()+mapping():'<section id="work" class="work-sheet" tabindex="-1"><h1>'+(preview?(initializing?'Checking live permit':'Live permit unavailable'):initializing?'Loading PermitGuard':'App state unavailable')+'</h1>'+(preview?'<p>Last recorded phase: <b>'+escape(preview.phase)+'</b> · '+escape(preview.locks)+' lock record(s) · permit revision '+escape(preview.permitRevision)+'</p><p class="subtle">Projection recorded '+escape(when(preview.updatedAt))+'. It may be stale; no actions or live clearance are available from this preview.</p>':'')+'<p>'+(initializing?'Reading authenticated app state automatically.':'Unable to confirm app state after automatic connection attempts. Use Refresh to reconnect.')+' No action is available until the server confirms it.</p>'+(!initializing?connectionHelp():'')+'</section>')+'</main>'+buildFooter();
 if (state?.isProjectAdmin) { const mode=root.querySelector('#mode'), fail=root.querySelector('#failMode'); if(mode) mode.value=state.policy?.mode || 'WARN_ONLY'; if(fail) fail.value=state.policy?.failMode || 'FAIL_CLOSED'; }
 root.querySelectorAll('form').forEach(form => { for(const el of form.elements) if(busy || stale) el.disabled=true; });
}
async function refresh(contextReady=null) {
 if(refreshing)return refreshing;
 // Defer invocation until after assigning refreshing, including synchronous bridge failures.
 refreshing=Promise.resolve().then(async()=>{
  try {
   if(!liveRequestStartedAt)liveRequestStartedAt=Date.now();
   let result;try{result=await call(snapshotIssue?'get_snapshot':'get_state',snapshotIssue?{issueKey:snapshotIssue}:{});}finally{if(!liveRequestFinishedAt)liveRequestFinishedAt=Date.now();}
   // A trusted issue DTO already has server authorization. Frontend context is only
   // needed to reject an early administration fallback, not to gate valid live state.
   if(result?.kind==='ADMINISTRATION'&&contextReady){const context=await contextReady;if(context?.extension?.issue?.id||context?.moduleKey==='permitguard-panel')throw new Error('Waiting for the issue context to become available.');}
   if(!result||(!('permit' in result)&&!['ADMINISTRATION','PERMITGUARD_LOCK_BOARD_SNAPSHOT'].includes(result.kind))||(!result.actorId&&result.kind!=='PERMITGUARD_LOCK_BOARD_SNAPSHOT'))throw new Error(result?.message||result?.error||'Server did not return an authenticated app state.');
   state={...result,observedAt:new Date().toISOString()};preview=null;liveLoadedAt=liveLoadedAt||Date.now();stale=false;error='';
   if(subscription&&sync==='Update received; checking saved state…')sync='Live updates connected';
   return true;
  }catch{stale=true;error='Cannot confirm current app state. No live clearance or action is available. Check sign-in and work-item access, then use Refresh.';return false;}
 }).finally(()=>{refreshing=null;render();});
 return refreshing;
}
async function initialize() {
 initializing=true;render();
 try {
  for(let attempt=0;attempt<3;attempt++){
   // Context/preview and the cold Forge resolver start together, never serially.
   const contextReady=Promise.resolve().then(()=>typeof view!=='undefined'&&view?.getContext?view.getContext():null);
   void contextReady.then(context=>{contextReceivedAt=contextReceivedAt||Date.now();return loadPreview(context);}).catch(()=>{previewStatus='Issue context unavailable';updateBuildFooter();});
   if(await refresh(contextReady))break;
   if(attempt<2)await new Promise(resolve=>setTimeout(resolve,350*(attempt+1)));
  }
 }finally{initializing=false;render();}
 // Paint usable authorized state first. Realtime is not part of bootstrap readiness.
 if(state&&!stale&&!state.kind){sync='Current state loaded; connecting live updates…';render();setTimeout(()=>{if(state&&!stale&&!state.kind&&!subscription)void subscribe();},0);}
}
async function mutate(operation,payload={}) {
 if(busy || stale) return; const revision=state.revision ?? state.permit?.revision;
 error='';notice='';startSaving('Waiting for Forge to check permissions, save records and update connected views');
 try { const result=await call(operation,{...payload,expectedRevision:Object.hasOwn(payload,'expectedRevision')?payload.expectedRevision:revision ?? null}); if(result?.error || result?.ok===false || result?.status==='DENIED' || result?.status==='ERROR') {const e=new Error(result.message || result.error || result.code || 'Operation denied.');e.requiresRefresh=result.requiresRefresh!==false;e.safeResponse=true;throw e;}
 if(['dry_run','list_rules','disable_rule','set_archive_config','archive_closed'].includes(operation)) adminResult=result;
 if(operation==='list_rules') rules=(Array.isArray(result)?result:(result?.rules || result?.values || [])).flatMap(w => w.validators ? w.validators.map(r=>({...r,workflowName:w.workflowId?.name,ruleId:r.id})) : [w]);
 if(operation==='play_crew_b') playingCrewB=true;
 const labels={seed_empty_demo_register:'Six synthetic demo equipment items loaded. Warn-only; no permits or locks were created.',create_demo_crew_b:'Your Crew B PLAN permit was created. Begin locking and record your own lock with photo; no lock was applied automatically.',create_permit:'Permit created.',begin_lock:'Locking started.',apply_lock:'Your lock was recorded.',begin_verify:'Ready for verification.',verify_point:'Your verification was recorded.',request_activation:'Activation proposed; assigned human confirmation required.',confirm_activation:'Human activation confirmed.',begin_release:'Release checks started.',remove_lock:'Your lock removal was recorded.',play_crew_b:'Simulated Crew B lock added.',remove_sample_lock:'Your simulated Crew B lock was removed.',close_permit:'Permit closed.'};
 notice=labels[operation]||'Saved.';
 if(result&&Object.hasOwn(result,'permit')&&result.actorId){state={...result,observedAt:new Date().toISOString()};stale=false;
  if(pendingInvalidation&&Number.isSafeInteger(pendingRevision)&&pendingRevision<=result.revision){pendingInvalidation=false;pendingRevision=null;}
  if(sync==='Update received; checking saved state…')sync='Live updates connected';
 }else await refresh();
 }catch(e){error=(e.safeResponse?String(e.message):'The operation result could not be confirmed; it may already have completed.')+ ' Refresh before retrying; no operation was automatically resubmitted.';stale=e.requiresRefresh!==false||pendingInvalidation;} finally{stopSaving();if(pendingInvalidation){pendingInvalidation=false;pendingRevision=null;if(!error)await refresh();}render();}
}
async function photoData(file) {
 if(!file || !file.size) return null;
 if(file.size>10*1024*1024 || !['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Use a JPEG, PNG or WebP photo under 10 MB.');
 if(file.size<=45*1024) return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(new Error('Could not read photo.'));r.readAsDataURL(file);});
 let image;try { image=await createImageBitmap(file);const canvas=document.createElement('canvas');const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Photo resizing unavailable.');
 for(const width of [960,720,480]) { const scale=Math.min(1,width/image.width);canvas.width=Math.round(image.width*scale);canvas.height=Math.round(image.height*scale);ctx.drawImage(image,0,0,canvas.width,canvas.height);for(const quality of [.75,.55,.35]){const data=canvas.toDataURL('image/jpeg',quality);if(data.length<=63000)return data;} }
 throw new Error('Photo exceeds the evidence limit. Choose a smaller image; make sure the lock tag remains legible.');
 }finally{image?.close();}
}

root.addEventListener('submit',async event=>{event.preventDefault();const form=event.target; if(!form.reportValidity() || busy || stale) return; const op=form.dataset.operation, data=new FormData(form),payload=Object.fromEntries(data);try{
 if(op==='create_permit'){payload.equipmentIds=data.getAll('equipmentIds');payload.workers=String(payload.workers).split(',').map(s=>s.trim()).filter(Boolean);payload.verifierIds=String(payload.verifierIds).split(',').map(s=>s.trim()).filter(Boolean);if(!payload.equipmentIds.length) throw new Error('Select at least one equipment item.');}
 if(op==='apply_lock'){payload.lockId=form.querySelector('[id^="lockId-"]').value;payload.name=form.querySelector('[id^="name-"]').value;payload.photoData=await photoData(data.get('photo'));delete payload.photo;}
 if(op==='verify_point'||op==='confirm_activation'){
  const qr=form.querySelector('[id$="-qr"]').value.trim(),target=op==='verify_point'?payload.pointId:payload.equipmentId;
  if(qr!=='permitguard:'+target)throw new Error('Wrong '+(op==='verify_point'?'isolation-point':'equipment')+' QR. Expected permitguard:'+target+'.');
  payload.confirmedAtEquipment=form.querySelector('[id$="-onsite"]').checked;
  if(!payload.confirmedAtEquipment)throw new Error('Confirm the at-equipment site procedure before submitting.');
  payload.qrValue=qr;startSaving('Preparing a short-lived QR confirmation');
  try{const challenge=await call('qr_challenge',{target,expectedRevision:state.revision});if(!challenge?.challengeToken)throw new Error(challenge?.message||'Fresh QR challenge unavailable; refresh and try again.');payload.challengeToken=challenge.challengeToken;}finally{stopSaving();}
  if(stale){pendingInvalidation=false;pendingRevision=null;await refresh();throw new Error('Permit state changed while preparing the QR confirmation. No confirmation was submitted. Review the refreshed state before retrying.');}
 }

 if(op==='set_archive_config'){const config=await call('get_archive_config');if(config.error)throw new Error(config.message);payload.expectedRevision=config.revision;payload.confirmed=data.get('archiveConfirmed')==='on';payload.allowedUserIds=String(payload.allowedUserIds).split(',').map(x=>x.trim()).filter(Boolean);}
 if(op==='connect_assets'){payload.config=Object.fromEntries(['workspaceId','schemaId','equipmentTypeId','pointTypeId'].map(k=>[k,String(data.get(k)).trim()]));payload.confirmed=data.get('assetsConfirmed')==='on';}
 if(op==='register_equipment'){payload.equipment=JSON.parse(String(data.get('equipmentJson')));delete payload.equipmentJson;}
 if(op==='load_sample')payload.confirmed=data.get('confirmed')==='on';
 await mutate(op,payload);
 }catch(e){error=String(e.message||e);busy=false;render();}});
root.addEventListener('click', async event=>{const el=event.target.closest('[data-action]');if(!el)return;const action=el.dataset.action;if(action==='refresh'){await refresh();return;}if(action==='load_snapshot'){snapshotIssue=document.getElementById('snapshotIssue').value.trim();await refresh();return;}let payload={};if(action==='dry_run')payload.action=state.permit?.state==='RELEASE'?'RELEASE':'START';if(action==='remove_lock') {if(!window.confirm('Record removal of your personal lock '+el.dataset.lockId+'? Follow the site procedure first.'))return;payload.lockId=el.dataset.lockId;}
 if(action==='disable_rule'){const r=rules[Number(el.dataset.ruleIndex)];if(!r || !window.confirm('Disable this observed app-owned workflow rule? Verify recovery before uninstall.'))return;payload={...r,expectedRuleId:r.ruleId || r.id,expectedWorkflowId:r.workflowId || r.workflowName};}
 if(action==='seed_empty_demo_register'){if(!window.confirm('Synthetic demonstration only: add six equipment items to this completely empty project? It stays Warn-only; no permit, lock, verifier, activation or workflow rule is created. Existing data is never overwritten.'))return;payload.confirmed=true;}
 if(action==='import_assets'){if(!window.confirm('Import Equipment and Isolation points from the approved PermitGuard Assets schema into this project? No instruments or calibration data are read.'))return;payload.confirmed=true;}
 if(action==='create_demo_crew_b'){if(!window.confirm('Dedicated synthetic project only: create a Crew B PLAN permit as your signed-in account? No lock or verification is created automatically.'))return;payload.confirmed=true;}
 if(action==='play_crew_b'||action==='remove_sample_lock'){if(!window.confirm('Confirmed sample roleplay only: change your simulated Crew B lock?'))return;payload.confirmed=true;}
 await mutate(action,payload);
});
root.addEventListener('change',async event=>{const target=event.target.dataset.qrTarget;if(!target)return;const file=event.target.files?.[0];if(!file)return;let image;try{if(!('BarcodeDetector' in window))throw new Error('QR decoder unavailable. Enter the QR text manually; this is a user assertion, not hardware proof.');if(file.size>10*1024*1024)throw new Error('QR image must be under 10 MB.');image=await createImageBitmap(file);const results=await new BarcodeDetector({formats:['qr_code']}).detect(image);if(results.length!==1)throw new Error('Use an image containing exactly one readable QR code, or enter the text manually.');document.getElementById(target).value=results[0].rawValue;const status=document.createElement('p');status.className='subtle';status.setAttribute('role','status');status.textContent='QR text read from selected image. Confirm the tag and physical procedure before submitting.';event.target.after(status);}catch(e){const status=document.createElement('p');status.setAttribute('role','alert');status.textContent=e.message;event.target.after(status);}finally{image?.close();}});
async function subscribe() {try{if(!realtime?.subscribe)throw new Error('API unavailable');subscription=await realtime.subscribe(state?.realtime?.channel || 'permitguard',(_payload,subscriptionError)=>{const eventRevision=_payload?.revision??_payload?.data?.revision;if(!subscriptionError&&Number.isSafeInteger(eventRevision)&&Number.isSafeInteger(state?.revision)&&eventRevision<=state.revision)return;stale=true;if(subscriptionError){sync='Realtime disconnected; use Refresh';render();return;}if(busy){pendingRevision=pendingInvalidation&&pendingRevision===null?null:(Number.isSafeInteger(eventRevision)?Math.max(pendingRevision??-1,eventRevision):null);pendingInvalidation=true;sync='Update received; checking saved state…';return;}refresh();});sync='Live updates connected';}catch{sync='Realtime unavailable; use Refresh';}render();}
window.addEventListener('pagehide',()=>subscription?.unsubscribe());
window.addEventListener('offline',()=>{stale=true;error='Connection lost. Refresh after reconnecting before acting.';render();});
window.addEventListener('online',()=>refresh());
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&!busy)refresh();});
render();initialize();
