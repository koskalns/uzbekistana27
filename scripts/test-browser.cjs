/* Run with Node and Playwright installed. CHROME_PATH can select a local browser. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const root = path.resolve(__dirname, '..');
const types = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml','.jpg':'image/jpeg','.json':'application/json'};
const server = http.createServer((req,res)=>{
 const url = new URL(req.url,'http://localhost');
 if(!url.pathname.startsWith('/uzbekistana27/')){res.writeHead(404);return res.end()}
 const file=path.resolve(root,decodeURIComponent(url.pathname.slice('/uzbekistana27/'.length)||'index.html'));
 if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
 fs.readFile(file,(error,data)=>{res.writeHead(error?404:200,{'Content-Type':types[path.extname(file)]||'text/plain'});res.end(error?'Missing':data)});
});
(async()=>{
 await new Promise(resolve=>server.listen(4174,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 try {
  const errors=[],failed=[];
  const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write']});
  await context.route('**/*',route=>route.request().url().startsWith('http://127.0.0.1:4174/')?route.continue():route.abort());
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push(r.url())});
  const base='http://127.0.0.1:4174/uzbekistana27/';await page.goto(base);await page.waitForTimeout(1100);
  await page.locator('.hero-strip img').evaluateAll(images=>Promise.all(images.map(im=>im.decode())));await page.screenshot({path:'/tmp/uzbekistana-desktop.png'});
  const count=await page.locator('.scene').count();assert.equal(count,11);
  for(let i=0;i<count;i++){
   await page.locator('.dot').nth(i).click();await page.waitForTimeout(750);
   assert.equal(await page.locator('.scene.active').count(),1);
   assert.equal(await page.locator('.scene.active').getAttribute('data-name'),await page.locator('.scene').nth(i).getAttribute('data-name'));
   assert.equal(await page.locator('.scene.active').evaluate(s=>s.scrollWidth<=s.clientWidth),true,'chapter overflow '+i);
   const heading=page.locator('.scene.active h1,.scene.active h2');assert.equal(await heading.evaluate(e=>e.scrollWidth<=e.closest('.content').clientWidth),true,'heading overflow '+i);
   await page.locator('.scene.active img').evaluateAll(images=>Promise.all(images.map(im=>{im.loading='eager';return im.decode()})));
  }
  // Decode every local photo with all remote requests blocked.
  const images=JSON.parse(fs.readFileSync(path.join(root,'assets/images/manifest.json')));
  for(const image of images){assert(await page.evaluate(async src=>{const im=new Image();im.src=src;await im.decode();return im.naturalWidth>0},image.path))}
  await page.locator('.dot').nth(4).click();await page.waitForTimeout(800);
  for(let i=0;i<4;i++){await page.locator('[data-trail]').nth(i).click();assert.equal(await page.locator('[data-trail]').nth(i).getAttribute('aria-selected'),'true');await page.locator('#trailPhoto').evaluate(async el=>{const im=new Image();im.src=el.style.backgroundImage.match(/url\(["']?([^"')]+)/)[1];await im.decode()})}
  await page.locator('[data-trail]').nth(3).press('ArrowLeft');assert.equal(await page.locator('[data-trail]').nth(2).getAttribute('aria-selected'),'true');
  await page.locator('.dot').nth(6).click();await page.waitForTimeout(800);
  for(const [id,value] of [['people','8'],['flight','500'],['food','100']])await page.locator('#'+id).fill(value);
  await page.waitForTimeout(400);assert.equal(await page.locator('#total').textContent(),'818 €');assert.match(await page.locator('#groupTotal').textContent(),/6540/);
  await page.locator('#copyBudget').click();assert.match(await page.evaluate(()=>navigator.clipboard.readText()),/818/);
  await page.locator('.dot').nth(7).click();await page.waitForTimeout(800);await page.locator('#gearList input').first().check();await page.reload();await page.locator('.dot').nth(7).click();await page.waitForTimeout(800);assert(await page.locator('#gearList input').first().isChecked());assert.equal(await page.locator('#gearPercent').textContent(),'8%');
  await page.locator('#copyGear').click();assert(!(await page.evaluate(()=>navigator.clipboard.readText())).includes('Telts + mietiņi'));
  await page.locator('.dot').nth(1).click();await page.waitForTimeout(800);await page.locator('.visual-card').first().click();assert.equal(await page.locator('#photoLightbox').getAttribute('aria-hidden'),'false');const first=await page.locator('#lightboxImage').getAttribute('src');await page.keyboard.press('ArrowRight');assert.notEqual(await page.locator('#lightboxImage').getAttribute('src'),first);await page.locator('#lightboxPrev').click();assert.equal(await page.locator('#lightboxImage').getAttribute('src'),first);await page.keyboard.press('Escape');assert.equal(await page.locator('#photoLightbox').getAttribute('aria-hidden'),'true');
  await page.locator('.dot').nth(8).click();await page.waitForTimeout(800);await page.locator('.accordion button').nth(1).click();assert.equal(await page.locator('.accordion button').nth(1).getAttribute('aria-expanded'),'true');
  await page.locator('.dot').nth(9).click();await page.waitForTimeout(800);await page.locator('[data-vote]').first().click();assert.match(await page.locator('[data-vote]').first().getAttribute('class'),/selected/);await page.locator('#copyInvite').click();assert.match(await page.evaluate(()=>navigator.clipboard.readText()),/Mana atbilde/);
  await page.locator('.dot').nth(0).click();await page.waitForTimeout(800);await page.locator('.scene.active h1').click();await page.keyboard.press('ArrowRight');assert.equal(await page.locator('.scene.active').getAttribute('data-name'),'Kāpēc tur');await page.keyboard.press('ArrowLeft');assert.equal(await page.locator('.scene.active').getAttribute('data-name'),'Sākums');
  // Real file failure must show a labeled illustration, not a broken image.
  await page.locator('.hero-strip img').first().evaluate(im=>im.src='assets/images/missing-test.webp');await page.waitForTimeout(300);assert.equal(await page.locator('.hero-strip img').first().getAttribute('data-failed'),'true');assert(await page.locator('.hero-strip img').first().evaluate(im=>im.naturalWidth>0));
  // Mobile layout and chapter controls, still with remote networking disabled.
  await page.setViewportSize({width:390,height:844});await page.reload();await page.waitForTimeout(900);await page.screenshot({path:'/tmp/uzbekistana-mobile.png'});
  for(let i=0;i<count;i++){await page.locator('.dot').nth(i).click();await page.waitForTimeout(750);assert.equal(await page.locator('.scene.active').evaluate(s=>s.scrollWidth<=s.clientWidth),true,'mobile overflow '+i);assert(await page.locator('#next').isVisible())}
  await page.emulateMedia({reducedMotion:'reduce'});await page.locator('.dot').first().click();assert.equal(await page.locator('.scene.active').evaluate(el=>getComputedStyle(el).animationName),'none');
  assert.deepEqual(errors,[]);assert.deepEqual(failed.filter(url=>!url.includes('missing-test')),[]);
  console.log('PASS: 11 chapters on desktop/mobile; 8 local photographs without external network; 4 hiking days and arrow tabs; budget and clipboard; checklist persistence; lightbox arrows/Escape; safety accordion; local vote; keyboard navigation; image fallback; reduced motion; repository subpath. No JavaScript errors or unexpected HTTP failures.');
 } finally {await browser.close();server.close()}
})().catch(error=>{console.error(error);server.close();process.exitCode=1});
