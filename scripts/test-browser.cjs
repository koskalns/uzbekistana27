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
  const base='http://127.0.0.1:4174/uzbekistana27/';await page.goto(base);await page.waitForTimeout(1000);
  const visit=async id=>{await page.locator('#'+id).scrollIntoViewIfNeeded();await page.waitForTimeout(1100)};
  assert.equal(await page.locator('main > section').count(),13,'all sections in one document');
  assert.equal(await page.locator('section[inert],section[aria-hidden=true]').count(),0);
  assert.equal(await page.locator('#dots').count(),0);
  assert(await page.evaluate(()=>document.documentElement.scrollHeight>innerHeight*6));
  assert(await page.locator('#pargajiens h2').evaluate(el=>el.classList.contains('reveal')&&!el.classList.contains('is-visible')),'offscreen heading prepared for scroll reveal');
  assert.equal(await page.locator('#devinas-dienas .duration-option').count(),3);
  assert.match(await page.locator('#devinas-dienas-title').textContent(),/8 dienas/);
  assert.equal(await page.locator('#taskenta img').count(),2);
  assert.match(await page.locator('#laikapstakli').textContent(),/28,7/);
  assert.match(await page.locator('#laikapstakli').textContent(),/12,4/);
  for(const selector of ['#kapec .subtitle','#devinas-dienas .tday p','#laikapstakli .weather-city p','#budzets .small','#avoti .credits p']){assert.equal(await page.locator(selector).first().evaluate(el=>getComputedStyle(el).fontSize),'18px','consistent prose '+selector)}
  await page.screenshot({path:'/tmp/uzbekistana-desktop.png'});
  await page.locator('.hero-actions a').click();await page.waitForTimeout(1400);assert(await page.evaluate(()=>scrollY>500));
  await visit('kapec');await page.locator('.visual-card').first().scrollIntoViewIfNeeded();await page.waitForTimeout(1000);await page.screenshot({path:'/tmp/uzbekistana-gallery-desktop.png'});
  for(const width of [1440,820,390,320]){
   await page.setViewportSize({width,height:900});
   for(const section of await page.locator('main > section').all()){
    await section.scrollIntoViewIfNeeded();await page.waitForTimeout(160);
    assert(await section.evaluate(el=>el.scrollWidth<=el.clientWidth+1),'section overflow at '+width+' '+await section.getAttribute('id'));
    assert.equal(await section.evaluate(el=>getComputedStyle(el).position),'relative');
   }
   await visit('kapec');await page.locator('.visual-card').first().scrollIntoViewIfNeeded();await page.waitForTimeout(1000);
   const geometry=await page.locator('#kapec .visual-gallery').evaluate(el=>({width:el.clientWidth,cards:[...el.children].map(card=>{const r=card.getBoundingClientRect(),b=card.querySelector('b').getBoundingClientRect(),s=card.querySelector('span').getBoundingClientRect();return {width:r.width,height:r.height,titleBottom:b.bottom,captionTop:s.top}})}));
   for(const card of geometry.cards){assert(card.width>=270,'large photo at '+width);assert(card.height>=190);assert(card.titleBottom<=card.captionTop,'caption overlap at '+width)}
   if(width===390){await visit('taskenta');await page.locator('#taskenta img').evaluateAll(photos=>Promise.all(photos.map(photo=>photo.decode())));await page.screenshot({path:'/tmp/uzbekistana-city-mobile.png'});await visit('laikapstakli');await page.screenshot({path:'/tmp/uzbekistana-weather-mobile.png'});await page.screenshot({path:'/tmp/uzbekistana-gallery-mobile.png'});await visit('sakums');await page.screenshot({path:'/tmp/uzbekistana-mobile.png'})}
   assert(await page.locator('.nav-cta').isVisible());assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  }
  await page.setViewportSize({width:1440,height:1000});
  const images=JSON.parse(fs.readFileSync(path.join(root,'assets/images/manifest.json')));
  for(const image of images)assert(await page.evaluate(async src=>{const im=new Image();im.src=src;await im.decode();return im.naturalWidth>0},image.path));
  await page.locator('main img:not(.leaflet-tile)').evaluateAll(images=>Promise.all(images.map(im=>{im.loading='eager';return im.decode()})));
  await visit('pargajiens');assert(await page.locator('#pargajiens h2').evaluate(el=>el.classList.contains('is-visible')));
  for(let i=0;i<4;i++){await page.locator('[data-trail]').nth(i).click();assert.equal(await page.locator('[data-trail]').nth(i).getAttribute('aria-selected'),'true');await page.locator('#trailPhoto').evaluate(async el=>{const im=new Image();im.src=el.style.backgroundImage.match(/url\(["']?([^"')]+)/)[1];await im.decode()})}
  await page.locator('[data-trail]').nth(3).press('ArrowLeft');assert.equal(await page.locator('[data-trail]').nth(2).getAttribute('aria-selected'),'true');
  await visit('budzets');
  for(const [id,value] of [['people','8'],['flight','500'],['food','100']])await page.locator('#'+id).fill(value);
  await page.waitForTimeout(400);assert.equal(await page.locator('#total').textContent(),'818 €');assert.match(await page.locator('#groupTotal').textContent(),/6540/);
  await page.locator('#copyBudget').click();assert.match(await page.evaluate(()=>navigator.clipboard.readText()),/6540/);
  await visit('ekipejums');await page.locator('#gearList input').first().check();await page.reload();await visit('ekipejums');assert(await page.locator('#gearList input').first().isChecked());assert.equal(await page.locator('#gearPercent').textContent(),'8%');
  await page.locator('#copyGear').click();assert(!(await page.evaluate(()=>navigator.clipboard.readText())).includes('Telts + mietiņi'));
  await visit('kapec');await page.locator('.visual-card').first().click();assert.equal(await page.locator('#photoLightbox').getAttribute('aria-hidden'),'false');assert(await page.locator('#shell').evaluate(el=>el.inert));
  const first=await page.locator('#lightboxImage').getAttribute('src');await page.keyboard.press('ArrowRight');assert.notEqual(await page.locator('#lightboxImage').getAttribute('src'),first);await page.locator('#lightboxPrev').click();assert.equal(await page.locator('#lightboxImage').getAttribute('src'),first);
  await page.locator('#lightboxClose').focus();await page.keyboard.press('Shift+Tab');assert(await page.locator('#lightboxCredit a').last().evaluate(el=>el===document.activeElement));await page.keyboard.press('Escape');assert.equal(await page.locator('#photoLightbox').getAttribute('aria-hidden'),'true');assert(!(await page.locator('#shell').evaluate(el=>el.inert)));
  await visit('drosiba');await page.locator('.accordion button').nth(1).click();assert.equal(await page.locator('.accordion button').nth(1).getAttribute('aria-expanded'),'true');
  await visit('braucam');await page.locator('[data-vote]').first().click();assert.match(await page.locator('[data-vote]').first().getAttribute('class'),/selected/);await page.locator('#copyInvite').click();assert.match(await page.evaluate(()=>navigator.clipboard.readText()),/Mana atbilde/);assert.match(await page.evaluate(()=>navigator.clipboard.readText()),/8 dienas/);assert.match(await page.evaluate(()=>navigator.clipboard.readText()),/4.–11./);
  await visit('kapec');await page.locator('.visual-card img').first().evaluate(im=>im.src='assets/images/missing-test.webp');await page.waitForTimeout(300);assert.equal(await page.locator('.visual-card img').first().getAttribute('data-failed'),'true');assert(await page.locator('.visual-card img').first().evaluate(im=>im.naturalWidth>0));
  await page.emulateMedia({reducedMotion:'reduce'});assert(await page.locator('.reveal').evaluateAll(elements=>elements.every(el=>getComputedStyle(el).opacity==='1')));
  await page.locator('.topbar nav a[href="#budzets"]').click();await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>location.hash),'#budzets');
  await visit('avoti');await page.waitForTimeout(100);assert(await page.locator('#chapterLine').evaluate(el=>parseFloat(getComputedStyle(el).transform.split(',')[0].replace('matrix(',''))>.9));
  const before=await page.evaluate(()=>scrollY);await page.locator('body').click({position:{x:10,y:10}});await page.keyboard.press('PageUp');await page.waitForTimeout(500);assert(await page.evaluate(()=>scrollY)<before,'native PageUp scrolls normally');
  const noJs=await browser.newContext({javaScriptEnabled:false});const fallbackPage=await noJs.newPage();await fallbackPage.goto(base);assert.equal(await fallbackPage.locator('main > section').count(),13);assert.equal(await fallbackPage.locator('#pargajiens h2').evaluate(el=>getComputedStyle(el).opacity),'1');await noJs.close();
  assert.deepEqual(errors,[]);assert.deepEqual(failed.filter(url=>!url.includes('missing-test')),[]);
  console.log('PASS: continuous native scrolling, 13 accessible sections, scroll reveals, 320–1440px layouts, large gallery and captions, local photos with remote requests blocked, itinerary, budget/clipboard, checklist persistence, lightbox/focus trap, accordion, local voting, fallbacks, reduced motion, anchor links, progress and no-JavaScript content.');
 } finally {await browser.close();server.close()}
})().catch(error=>{console.error(error);server.close();process.exitCode=1});
