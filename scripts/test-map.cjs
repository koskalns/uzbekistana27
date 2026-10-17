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
  const errors=[];
  const base='http://127.0.0.1:4174/uzbekistana27/';
  // Tile requests are mocked: tests never pan/zoom against community tile servers.
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  await context.route('https://tile.openstreetmap.org/**',route=>route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#e4eadc"/><path d="M0 180Q90 40 256 160M0 80Q150 220 256 50" fill="none" stroke="#c8d6b9" stroke-width="30"/><path d="M0 100L256 170" stroke="#fff" stroke-width="5"/></svg>'}));
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base);
  await page.locator('#mapStage').scrollIntoViewIfNeeded();await page.waitForSelector('.map-ready');
  assert.equal(await page.locator('.geo-marker').count(),4);
  assert(await page.locator('.leaflet-control-attribution').isVisible());
  for(const name of ['country','mountains','transfer']){await page.locator('[data-map-view='+name+']').click();assert.equal(await page.locator('[data-map-view='+name+']').getAttribute('aria-pressed'),'true')}
  await page.locator('[data-map-place=beldersay]').click();await page.waitForSelector('.leaflet-popup');assert.match(await page.locator('.leaflet-popup-content').textContent(),/41.5023/);await page.locator('.leaflet-popup-close-button').click();
  await page.locator('[data-map-place=chimgan]').click();assert.match(await page.locator('.leaflet-popup-content').textContent(),/Lielais Čimgans/);await page.locator('.leaflet-popup-close-button').click();
  const scale=await page.locator('.leaflet-control-scale-line').textContent();await page.locator('.leaflet-control-zoom-out').click();assert.notEqual(await page.locator('.leaflet-control-scale-line').textContent(),scale);
  const tileTransform=await page.locator('.leaflet-map-pane').getAttribute('style');await page.locator('#expeditionMap').hover();await page.mouse.wheel(0,250);await page.waitForTimeout(100);assert.equal(await page.locator('.leaflet-map-pane').getAttribute('style'),tileTransform,'wheel must scroll page, not zoom map');
  for(const width of [1440,820,390,320]){await page.setViewportSize({width,height:1000});await page.locator('#mapStage').scrollIntoViewIfNeeded();await page.waitForTimeout(200);assert(await page.locator('#marsruts').evaluate(el=>el.scrollWidth<=el.clientWidth+1),'map overflow '+width);assert.equal(await page.locator('.geo-places button').count(),3);await page.screenshot({path:'/tmp/uz-map-mocked-'+width+'.png'})}
  await context.close();
  const offline=await browser.newContext({viewport:{width:390,height:900},reducedMotion:'reduce'});await offline.route('https://tile.openstreetmap.org/**',route=>route.abort());const fallback=await offline.newPage();fallback.on('pageerror',e=>errors.push(e.message));await fallback.goto(base);await fallback.locator('#mapStage').scrollIntoViewIfNeeded();await fallback.waitForSelector('#mapRetry:not([hidden])');assert(!(await fallback.locator('#mapStage').evaluate(el=>el.classList.contains('map-ready'))));assert.match(await fallback.locator('#mapStatus').textContent(),/neizdevās/);assert(await fallback.locator('.geo-fallback').evaluate(im=>im.naturalWidth>0));await fallback.screenshot({path:'/tmp/uz-map-fallback.png'});await offline.close();
  const noJs=await browser.newContext({javaScriptEnabled:false});const staticPage=await noJs.newPage();await staticPage.goto(base);assert(await staticPage.locator('.geo-fallback').evaluate(im=>im.getAttribute('alt').includes('Uzbekistānas')));assert(await staticPage.locator('#mapToolbar').isHidden());assert.equal(await staticPage.locator('.geo-external').getAttribute('href'),'https://www.openstreetmap.org/#map=11/41.48/69.85');await noJs.close();
  assert.deepEqual(errors,[]);console.log('PASS: three geographic views, four markers, verified-coordinate popup, zoom controls, natural wheel scrolling, 320–1440px layouts, attribution, offline fallback and no-JavaScript map. Community tiles mocked, no server scraping.');
 } finally {await browser.close();server.close()}
})().catch(error=>{console.error(error);server.close();process.exitCode=1});
