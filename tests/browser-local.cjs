// Optional development-only synthetic UI harness; no installation or live-site access.
const {chromium}=require(process.env.PERMITGUARD_PLAYWRIGHT_PATH || 'playwright-core');
const fs=require('node:fs'),assert=require('node:assert/strict');
const path=require('node:path');
const root=fs.realpathSync(path.resolve(__dirname,'..'));
if(!process.env.PERMITGUARD_BROWSER_QA_OUT)throw new Error('Set PERMITGUARD_BROWSER_QA_OUT to a private directory outside this repository.');
const output=path.resolve(process.env.PERMITGUARD_BROWSER_QA_OUT);fs.mkdirSync(output,{recursive:true});
const actualOutput=fs.realpathSync(output);
if(actualOutput===root||actualOutput.startsWith(root+path.sep))throw new Error('Browser QA output must stay outside this public repository.');
const source=fs.readFileSync(root+'/static/permit-app/app.js','utf8').split(String.fromCharCode(10)).slice(1,-2).join(String.fromCharCode(10));
const css=fs.readFileSync(root+'/static/permit-app/styles.css','utf8');
(async()=>{let browser,context;const report=[];try{
 browser=await chromium.launch({executablePath:process.env.PERMITGUARD_CHROMIUM_PATH,headless:true,args:['--no-sandbox']});context=await browser.newContext();await context.route('**/*',r=>r.abort());let page;const errors=[];
 for(const width of [320,390,768,1280]){
 page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width,height:900});await page.setContent('<html lang="en"><head><style>'+css+'</style></head><body><p>LOCAL SYNTHETIC FIXTURE — not Jira/site acceptance</p><a class="skip" href="#work">Skip to permit</a><div id="app"></div></body></html>');
 await page.addScriptTag({content:'window.__calls=[];window.invoke=async(_m,a)=>{__calls.push(a);return state;};window.realtime={};window.view={};'+source});
 for(const scenario of ['emptyAdmin','emptyWorker','assetsOutage','readFailure','configuredPlan','active','staleActive']){
 await page.evaluate(s=>{state={actorId:'local-human',actorDisplayName:'Synthetic reviewer',revision:1,projectName:'Synthetic project',issueKey:'LOCAL-1',permit:null,equipment:[],board:[],policy:{mode:'WARN_ONLY',failMode:'FAIL_CLOSED'},capabilities:{sampleRoleplay:false},assets:{status:'NOT_CONNECTED'}};stale=false;initializing=false;error='';preview=null;
 if(s==='emptyAdmin'||s==='assetsOutage')state.isProjectAdmin=true;
 if(s==='assetsOutage')state.assets.status='UNAVAILABLE';
 if(s==='configuredPlan')state.equipment=[{id:'EQ',name:'Synthetic pump',isolationPoints:[]}];
 if(s==='active'||s==='staleActive'){state.permit={state:'ACTIVE',equipment:[{id:'EQ',name:'Synthetic pump',isolationPoints:[]}],locks:[]};state.release={status:'NOT CLEARED',reasons:[]};}
 if(s==='staleActive')stale=true;
 if(s==='readFailure'){state=null;stale=true;error='Cannot confirm current app state.';}
 render();},scenario);
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert.equal(overflow,false,scenario+' width '+width+' overflow');
 const refresh=page.locator('button[data-action="refresh"]').first();assert.ok((await refresh.boundingBox()).height>=44);
 if(scenario.startsWith('empty')||scenario==='assetsOutage'){assert.equal(await page.locator('form[data-operation="create_permit"]').count(),0);assert.equal(await page.getByText('Judge sample roleplay',{exact:true}).count(),0);}
 if(scenario==='configuredPlan')assert.equal(await page.locator('form[data-operation="create_permit"]').count(),1);
 if(scenario==='readFailure')assert.equal(await page.getByRole('heading',{name:'Reconnect safely'}).count(),1);
 await page.screenshot({path:path.join(output,'pg-ux-'+width+'-'+scenario+'.png'),fullPage:true});report.push({width,scenario,overflow,touchTarget:true});
 }
 await page.locator('.skip').focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.id),'work');await page.close();
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'pg-ux-browser-report.json'),JSON.stringify({classification:'LOCAL_SYNTHETIC_BROWSER_ONLY',cases:report,keyboardSkip:true,pageErrors:errors,networkBlocked:true},null,2));console.log(JSON.stringify({cases:report.length,widths:[320,390,768,1280],keyboardSkip:true,pageErrors:errors,networkBlocked:true}));
 }finally{if(context)await context.close();if(browser)await browser.close();console.log('Task-owned browser/context closed');}})().catch(e=>{console.error(e.message);process.exitCode=1;});
