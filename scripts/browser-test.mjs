// npm install --prefix /tmp/after-hours-qa playwright
// PLAYWRIGHT_MODULE=/tmp/after-hours-qa/node_modules/playwright/index.mjs node scripts/browser-test.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:8016/after-hours/';
const out = process.env.QA_OUT || 'qa';
fs.mkdirSync(out, {recursive:true});
const browser = await chromium.launch({channel:'chrome', headless:true});
const report = {base, images:[], checks:[]};
const check = name => report.checks.push(name);
async function route(page, hash) { await page.goto(base + hash); await page.waitForTimeout(300); }
async function imageInfo(locator, label) {
  await locator.evaluate(i => i.parentElement.scrollIntoView({block:'center', behavior:'instant'}));
  await locator.evaluate(i => i.decode());
  const info = await locator.evaluate(i => ({src:i.currentSrc, complete:i.complete, naturalWidth:i.naturalWidth, naturalHeight:i.naturalHeight, hidden:i.hidden, fallbackHidden:i.nextElementSibling.hidden, svgVisible:[...i.parentElement.querySelectorAll('svg')].some(s=>s.getBoundingClientRect().width>0)}));
  assert.ok(info.complete && info.naturalWidth>0 && !info.hidden && info.fallbackHidden && !info.svgVisible, label);
  assert.ok(info.src.startsWith(new URL('assets/cocktails/', base).href));
  report.images.push({label,...info});
}
try {
 for (const [device,width,height] of [['desktop',1440,1000],['mobile',390,844]]) {
  const context=await browser.newContext({viewport:{width,height}});
  const page=await context.newPage(); const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error') errors.push(m.text())});
  page.on('response',r=>{if(r.url().startsWith(base) && r.status()>=400) errors.push(`${r.status()} ${r.url()}`)});
  await route(page,'#/'); await page.locator('.hero-bg img').evaluate(i=>i.decode()); await page.screenshot({animations:'disabled',path:`${out}/hero-${device}.png`});
  const initial=await page.locator('.hero-bg').evaluate(e=>getComputedStyle(e).transform);
  await page.evaluate(()=>scrollTo(0,250)); await page.waitForTimeout(150);
  assert.notEqual(await page.locator('.hero-bg').evaluate(e=>getComputedStyle(e).transform),initial);
  const motion=await page.evaluate(()=>({bg:getComputedStyle(document.querySelector('.hero-bg')).transform,copy:getComputedStyle(document.querySelector('.hero-content')).transform}));
  report.checks.push(`${device} parallax ${JSON.stringify(motion)}`);
  assert.ok(Math.abs(await page.locator('.topbar').evaluate(e=>e.getBoundingClientRect().top))<1, 'topbar actually sticks');
  await page.locator('#recipe-search').fill('Gin Fizz');
  assert.equal(await page.locator('#cards-grid .cocktail-card').count(),1);
  await imageInfo(page.locator('#cards-grid img'),'search '+device);
  await page.locator('#cards-grid').screenshot({animations:'disabled',path:`${out}/gin-card-${device}.png`});
  await page.locator('[data-action="clear"]').click();
  await page.locator('[data-filter="base"][data-value="琴酒"]').click();
  await page.locator('[data-filter="flavor"][data-value="氣泡"]').click();
  assert.equal(await page.locator('#cards-grid .cocktail-card').count(),1);
  await imageInfo(page.locator('#cards-grid img'),'filters '+device);
  await page.locator('#cards-grid [data-favorite="gin-fizz"]').click();
  await route(page,'#/favorites');
  await imageInfo(page.locator('.favorites-content img'),'favorites '+device);
  await page.reload(); await page.waitForTimeout(200);
  assert.equal(await page.locator('[data-favorite="gin-fizz"]').getAttribute('aria-pressed'),'true');
  await page.locator('.cocktail-card-link').click();
  await page.waitForURL('**/#/cocktail/gin-fizz');
  await imageInfo(page.locator('.detail-painting'),'detail '+device);
  for (const artwork of await page.locator('.related-grid img').all()) {await artwork.evaluate(i=>{i.loading='eager'});await artwork.evaluate(i=>i.decode());}
  await page.evaluate(()=>scrollTo(0,0)); await page.screenshot({animations:'disabled',path:`${out}/gin-detail-${device}.png`,fullPage:true});
  for (const [n,value] of [[2,'90'],[4,'180'],[1,'45']]) {await page.locator(`[data-servings="${n}"]`).click();assert.match(await page.locator('#ingredient-list').innerText(),new RegExp(value));}
  await page.locator('#ingredient-list a').first().click();
  await page.waitForURL('**/#/ingredient/gin');assert.ok(await page.locator('.ingredient-history').innerText());
  await route(page,'#/cocktail/gin-fizz');
  await page.locator('.related-grid .cocktail-card-link').first().click();
  await page.waitForURL('**/#/cocktail/daiquiri');
  await page.locator('.detail-painting[data-fallback-id="daiquiri"]').waitFor();
  await imageInfo(page.locator('.detail-painting'),'related '+device);
  await route(page,'#/stories');await page.locator('.story-card').first().click();
  await page.waitForURL('**/#/story/story-gin-fizz');
  if(width>820) {
    await page.locator('.story-reader').evaluate(e=>scrollTo({top:e.offsetTop+250,behavior:'instant'})); await page.waitForTimeout(150);
    assert.ok(Math.abs(await page.locator('.story-stage').evaluate(e=>e.getBoundingClientRect().top)-105)<2,'story stage actually sticks');
  }
  await page.locator('[data-story-chapter="2"]').focus();
  assert.equal(await page.locator('#story-stage-title').innerText(),await page.locator('[data-story-chapter="2"] h2').innerText());
  if(width<820){await page.locator('.menu-toggle').click();assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');await page.locator('.menu-toggle').focus();await page.keyboard.press('Enter');await page.locator('.nav a[href="#/ingredients"]').click();assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');}
  else {await page.locator('.nav a[href="#/ingredients"]').click();await page.waitForURL('**/#/ingredients');}
  for (const hash of ['#/','#/favorites','#/cocktail/gin-fizz','#/stories','#/story/story-gin-fizz','#/ingredients','#/ingredient/gin','#/guide','#/about']) {
    await route(page,hash);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),device+' overflow '+hash);
  }
  await context.close();assert.deepEqual(errors,[]);check(`${device}: search, base/flavor filters, persisted favorites, servings 1/2/4, ingredient/recommendation/story links, keyboard chapters, menu, no overflow, no JS errors`);
 }
 // Every original painting still decodes; screenshot the full collection.
 const page=await browser.newPage({viewport:{width:1440,height:1000}});await route(page,'#/');
 for(const img of await page.locator('#cards-grid img').all()) await imageInfo(img,'collection');
 await page.locator('#cards-grid').screenshot({animations:'disabled',path:`${out}/collection-desktop.png`});
 const data=await page.evaluate(()=>({recipes:window.COCKTAIL_CATALOG,stories:window.STORY_CATALOG,ingredients:window.INGREDIENT_CATALOG}));
 for(const recipe of data.recipes) {
   await route(page,'#/cocktail/'+recipe.id); await imageInfo(page.locator('.detail-painting'),'all details '+recipe.id);
   const links=await page.locator('#ingredient-list li').evaluateAll(rows=>rows.map(r=>r.querySelector('a')?.getAttribute('href')||null));
   if(recipe.id==='spritz') assert.deepEqual(links,[null,null,'#/ingredient/club-soda']);
   if(recipe.id==='daiquiri') assert.equal(links[2],null);
   if(recipe.id==='cosmopolitan') assert.equal(links[3],'#/ingredient/cranberry-juice');
 }
 for(const story of data.stories) {await route(page,'#/story/'+story.id);await imageInfo(page.locator('.story-stage-art img'),'all stories '+story.id);}
 for(const ingredient of data.ingredients) {await route(page,'#/ingredient/'+ingredient.id);assert.ok(await page.locator('.ingredient-history').innerText());}
 check('all 11 detail paintings, 4 story paintings, 17 ingredient pages and corrected material links');
 await route(page,'#/');

 // A real failed request must produce fallback, then a later load must recover the SAME node.
 await page.route('**/assets/cocktails/gin-fizz.jpg',r=>r.abort());
 await page.locator('#recipe-search').fill('Gin Fizz');const img=page.locator('#cards-grid img');await page.locator('#cards-grid').scrollIntoViewIfNeeded();await page.waitForTimeout(400);
 assert.equal(await img.evaluate(i=>i.hidden),true);assert.equal(await img.evaluate(i=>i.nextElementSibling.hidden),false);
 await page.unroute('**/assets/cocktails/gin-fizz.jpg');await img.evaluate(i=>{i.src=i.src+'?recovery-test=1'});await imageInfo(img,'recovered after request failure');
 await route(page,'#/cocktail/gin-fizz');await page.route('**/assets/cocktails/gin-fizz.jpg',r=>r.abort());await page.reload();await page.waitForTimeout(300);assert.equal(await page.locator('.detail-painting').evaluate(i=>i.hidden),true);await page.unroute('**/assets/cocktails/gin-fizz.jpg');await page.locator('.detail-painting').evaluate(i=>i.src+='?recovery-test=2');await imageInfo(page.locator('.detail-painting'),'detail recovered');
 check('real request failure and successful recovery: card and detail');
 await page.emulateMedia({reducedMotion:'reduce'});await route(page,'#/');await page.evaluate(()=>scrollTo(0,250));await page.waitForTimeout(150);
 assert.equal(await page.locator('.hero-bg').evaluate(e=>getComputedStyle(e).transform),'none');assert.equal(await page.locator('.hero-content').evaluate(e=>getComputedStyle(e).opacity),'1');
 await route(page,'#/story/story-gin-fizz');await page.evaluate(()=>scrollTo(0,650));await page.waitForTimeout(150);assert.equal(await page.locator('.story-stage-art').evaluate(e=>getComputedStyle(e).transform),'none');
 check('reduced motion: no hero/story transforms or hero scroll fading');
 fs.writeFileSync(`${out}/browser-report.json`,JSON.stringify(report,null,2));console.log(JSON.stringify({checks:report.checks,images:report.images.length},null,2));
} finally {await browser.close()}
