/* Leaflet is bundled locally. Only the visible basemap uses OpenStreetMap tiles. */
(function(){'use strict';
 const stage=document.getElementById('mapStage');
 if(!stage||!window.L)return;
 const status=document.getElementById('mapStatus'),retry=document.getElementById('mapRetry');
 const viewButtons=[...document.querySelectorAll('[data-map-view]')],placeButtons=[...document.querySelectorAll('[data-map-place]')];
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const places={
  tashkent:{lat:41.3111,lng:69.2797,label:'Taškenta',description:'Ierašanās pilsēta un sagatavošanās pirms kalniem.',source:'https://www.openstreetmap.org/#map=13/41.3111/69.2797',type:'city'},
  beldersay:{lat:41.502302,lng:69.977233,label:'Beldersay',description:'Apdzīvotā vieta un plānotais starta apvidus. Precīzs takas sākums vēl jāapstiprina.',source:'https://www.openstreetmap.org/way/224624989',type:'village'},
  chimgan:{lat:41.495,lng:70.05778,label:'Lielais Čimgans',description:'Virsotne un apvidus orientieris. Virsotnes sasniegšana nav mūsu apstiprinātais maršruts.',source:'https://commons.wikimedia.org/wiki/File:Kumbel_to_Chimgan.JPG',type:'peak'},
  village:{lat:41.56228,lng:70.02393,label:'Čimganas ciems',description:'Čimganas ciems kalnu ziemeļu pusē — atsevišķi no Lielā Čimgana virsotnes.',source:'https://www.openstreetmap.org/way/224137716',type:'village'}
 };
 let map,tiles,initialized=false,loaded=false,errors=0,failed=false,currentView='transfer',countryLayer;
 const markers={};
 const bounds={country:[[37.1,55.8],[45.7,73.4]],transfer:[[41.25,69.14],[41.69,70.18]],mountains:[[41.43,69.90],[41.63,70.16]]};
 function tell(message){if(status.textContent!==message)status.textContent=message}
 function fallback(){
  if(loaded||failed)return;failed=true;stage.classList.remove('map-ready');
  tell('Detalizēto karti neizdevās ielādēt. Redzams Uzbekistānas ģeogrāfiskais pārskats; interaktīvajai kartei vajadzīgs internets.');
  retry.hidden=false;document.getElementById('mapToolbar').hidden=true;
  document.getElementById('expeditionMap').inert=true;
 }
 function ready(){
  if(loaded)return;loaded=true;failed=false;stage.classList.add('map-ready');
  document.getElementById('expeditionMap').inert=false;
  document.getElementById('mapToolbar').hidden=false;retry.hidden=true;
  tell('Izvēlies skatu vai pieskaries vietai. Lapa ritinās brīvi; karti pietuvini ar + / −.');
 }
 function setView(name){
  if(!initialized)return;currentView=name;map.closePopup();
  viewButtons.forEach(button=>{const active=button.dataset.mapView===name;button.classList.toggle('selected',active);button.setAttribute('aria-pressed',String(active))});
  map.fitBounds(bounds[name],{padding:[32,32],animate:!reduced.matches,duration:.7,maxZoom:name==='country'?6:13});
  if(countryLayer){if(name==='country')countryLayer.addTo(map);else countryLayer.remove()}
 }
 function popup(place){
  const content=document.createElement('div');content.className='geo-popup';
  const title=document.createElement('strong');title.textContent=place.label;
  const text=document.createElement('p');text.textContent=place.description;
  const coordinates=document.createElement('small');coordinates.textContent=place.lat.toFixed(4)+'° N · '+place.lng.toFixed(4)+'° E';
  const link=document.createElement('a');link.href=place.source;link.target='_blank';link.rel='noopener';link.textContent='Vietas avots ↗';
  content.append(title,text,coordinates,link);return content;
 }
 function init(){
  if(initialized)return;initialized=true;
  map=L.map('expeditionMap',{scrollWheelZoom:false,dragging:!L.Browser.mobile,tapHold:false,zoomControl:false,attributionControl:true,zoomAnimation:!reduced.matches,fadeAnimation:!reduced.matches,preferCanvas:true,minZoom:4,maxZoom:16});
  L.control.zoom({position:'topright',zoomInTitle:'Pietuvināt',zoomOutTitle:'Attālināt'}).addTo(map);
  L.control.scale({position:'bottomleft',imperial:false,maxWidth:100}).addTo(map);
  map.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>');
  tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',keepBuffer:1,updateWhenIdle:true});
  tiles.on('tileload',ready);tiles.on('tileerror',()=>{errors++;if(errors>=3)fallback()});tiles.addTo(map);
  const area=L.circle([41.509,70.013],{radius:6500,color:'#326c4c',fillColor:'#72a657',fillOpacity:.1,weight:2,dashArray:'5 8',interactive:false}).addTo(map);
  for(const [key,place] of Object.entries(places)){
   const symbol=place.type==='peak'?'△':place.type==='city'?'●':'•';
   const icon=L.divIcon({className:'geo-marker '+place.type+' '+key,html:'<span aria-hidden="true">'+symbol+'</span>',iconSize:[32,32],iconAnchor:[16,16]});
   const marker=L.marker([place.lat,place.lng],{icon,title:place.label,alt:place.label,keyboard:true,riseOnHover:true}).addTo(map).bindPopup(popup(place),{maxWidth:260,minWidth:180});
   marker.bindTooltip(place.label,{permanent:true,direction:place.type==='peak'?'right':'top',offset:place.type==='peak'?[14,0]:[0,-16],className:'geo-label'});
   markers[key]=marker;
  }
  map.on('zoomend',()=>{const z=map.getZoom();stage.classList.toggle('geo-overview',z<8);stage.classList.toggle('geo-transfer',z>=8&&z<11);Object.entries(markers).forEach(([key,marker])=>{const show=z>=11||key==='tashkent'||(z>=8&&key==='beldersay');if(show)marker.openTooltip();else marker.closeTooltip()})});
  map.on('dragstart',()=>viewButtons.forEach(button=>{button.classList.remove('selected');button.setAttribute('aria-pressed','false')}));
  setView('transfer');
  // Local low-resolution country outline is used only in the country overview.
  fetch('assets/maps/central-asia.geojson').then(response=>{if(!response.ok)throw Error('map data');return response.json()}).then(data=>{
   countryLayer=L.geoJSON(data,{filter:feature=>feature.properties.name==='Uzbekistan',style:{color:'#244a39',weight:2,fillColor:'#86ac76',fillOpacity:.14},interactive:false});
   if(currentView==='country')countryLayer.addTo(map);
  }).catch(()=>{});
  new ResizeObserver(()=>map.invalidateSize({pan:false})).observe(stage);
  setTimeout(fallback,15000);
 }
 viewButtons.forEach(button=>button.addEventListener('click',()=>setView(button.dataset.mapView)));
 placeButtons.forEach(button=>button.addEventListener('click',()=>{
  init();const place=places[button.dataset.mapPlace];
  if(!loaded){tell('Detalizētā karte vēl nav pieejama. Vietas koordinātas un saite uz lielo karti ir redzamas šajā sadaļā.');return}
  currentView='place';if(countryLayer)countryLayer.remove();viewButtons.forEach(button=>{button.classList.remove('selected');button.setAttribute('aria-pressed','false')});
  map.setView([place.lat,place.lng],button.dataset.mapPlace==='tashkent'?11:13,{animate:!reduced.matches});
  markers[button.dataset.mapPlace].openPopup();
  stage.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'center'});
 }));
 retry.addEventListener('click',()=>{errors=0;loaded=false;failed=false;retry.hidden=true;tell('Mēģinām ielādēt detalizēto karti…');tiles.redraw();setTimeout(fallback,15000)});
 if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){init();observer.disconnect()}},{rootMargin:'100px'});observer.observe(stage)}else init();
})();
