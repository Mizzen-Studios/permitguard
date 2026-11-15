// Optional developer check: requires Playwright locally; no runtime dependency.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1024,height:900}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.join(__dirname,'index.html')).href);
 await page.getByRole('button',{name:'Review isolation plan'}).click();
 await page.getByRole('button',{name:'Record my sample lock'}).click();
 await page.getByRole('button',{name:'Record simulated verification'}).click();
 assert.match(await page.locator('#notice').innerText(),/Not cleared/);
 await page.locator('#confirm').check();
 await page.getByRole('button',{name:'Record simulated verification'}).click();
 await page.getByRole('button',{name:'Begin release checks'}).click();
 await page.getByRole('button',{name:'Record removal of my lock L-01'}).click();
 await page.getByRole('button',{name:'Close sample permit'}).click();
 assert.match(await page.locator('#notice').innerText(),/Crew B’s lock L-07 is still on V-3/);
 await page.getByLabel('Play Crew B').check();
 await page.getByRole('button',{name:'Remove my seeded lock L-07'}).click();
 await page.getByRole('button',{name:'Close sample permit'}).click();
 assert.match(await page.locator('.work-sheet h2').innerText(),/Sample permit closed/);
 await page.getByRole('button',{name:'Restart sample'}).click();
 await page.getByRole('button',{name:'Simulate Assets unavailable'}).click();
 assert.equal(await page.locator('#primary').isDisabled(),true);
 await page.getByRole('button',{name:'Retry sample connection'}).click();
 assert.equal(await page.locator('#primary').isEnabled(),true);
 for(const width of [1024,768,520,360]){
  await page.setViewportSize({width,height:900});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'body overflow at '+width);
 }
 assert.deepEqual(errors,[]);console.log('PASS: local judge path, verification/release blockers, sample-role removal, failure/retry, 1024/768/520/360 body widths; no browser errors.');
 await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1;});
