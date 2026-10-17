# UZBEKISTĀNA ’27 — Puišu ekspedīcija

Interaktīvs ceļojuma stāsts latviešu valodā: Ieteikums: 2027. gada 4.–11. septembris (8 dienas); 4.–12. septembris ir 9 dienu alternatīva, četras pārgājiena dienas Rietumu Tjanšanā, trīs naktis teltīs. Maršruts, atļaujas, nometnes, piekļuve un izmaksas ir provizoriskas un pirms ceļojuma jāpārbauda. Šī vietne nav navigācijas rīks.

## Vietnes faili

- `index.html` — 13 satura sadaļas vienā nepārtraukti ritināmā lapā.
- `assets/css/style.css` — gaišs, minimālistisks dizains, lielas fotogrāfijas, adaptīvs izkārtojums un ritināšanas animācijas ar `prefers-reduced-motion` atbalstu.
- `assets/js/app.js` — dabīga ritināšana, Intersection Observer animācijas, četru dienu cilnes, budžets, ekipējums, lokālā balsošana un fotogalerija.
- `assets/images/` — desmit autentiski Wikimedia Commons foto WebP formātā; [autori un licences](assets/images/CREDITS.md), izcelsmes dati un oriģinālu kontrolsummas `manifest.json` failā.
- `assets/js/photos.js` — foto metadati galerijas parakstiem, lai arī tie neprasītu ārējus pieprasījumus.
- `uzbekistana_piedzivojums_bildes_labotas.html` — nemainīts sākotnējais fails salīdzināšanai; netiek publicēts kā vietnes ieeja.

Nav būvēšanas soļa, API atslēgu, fontu CDN vai servera datubāzes. Interaktīvā karte izmanto repozitorijā saglabātu Leaflet 1.9.4 bibliotēku; detalizētās OpenStreetMap kartes flīzes tiek ielādētas internetā tikai kartes apskatei. Foto un visi pamata resursi tiek pasniegti lokāli. Pēc sākotnējās lapas ielādes nav nepieciešami ārēji attēlu serveri; pilnīga jauna ielāde bez interneta nav garantēta, jo vietne neizmanto service worker. Ekipējuma saraksts glabājas tikai konkrētā pārlūka `localStorage`. Balsojums darbojas tikai pašreizējā lapā un neapkopo draugu atbildes.

## Lokālais priekšskatījums

Projekta mapē palaid:

```sh
python3 -m http.server 4173
```

Atver `http://localhost:4173`. Ritini lapu vai izmanto augšējās navigācijas enkursaites. Visa informācija ir vienā dokumentā; nav iekšēju slaidu ritināšanas konteineru. Dienu cilnēs bultiņas maina dienu. Galerijā ← / → maina foto, Escape to aizver. Tab paliek atvērtā galerijas dialogā. Budžetu, trūkstošo ekipējumu un uzaicinājumu var kopēt čatam.

## Publicēšana GitHub Pages

Mērķa repozitorijs: [koskalns/uzbekistana27](https://github.com/koskalns/uzbekistana27).

1. Nosūti projekta failus uz repozitorija `main` zaru.
2. GitHub repozitorijā atver **Settings → Pages → Build and deployment → Source → GitHub Actions**. Ja repozitorijs ir privāts, pārbaudi, vai tavs GitHub plāns atbalsta Pages.
3. Atver **Actions → Deploy to GitHub Pages → Run workflow → main → Run workflow**, ja sākotnējā palaišana notika pirms Pages ieslēgšanas. Turpmāk katrs `push` uz `main` publicē automātiski.
4. Sagaidi zaļu `deploy` rezultātu. Vietnes adrese būs **https://koskalns.github.io/uzbekistana27/**.

`.github/workflows/deploy.yml` publicē tikai `index.html` un vietnes resursus, nevis sākotnējo HTML, skriptus vai testus. Visas funkcionālās resursu adreses ir relatīvas un darbojas repozitorija apakšceļā. Sociālās kopīgošanas metadatos ir norādīta mērķa publiskā adrese; mainot repozitoriju vai domēnu, atjauno `og:url` un `og:image`.

## Pārbaudes

`scripts/test-browser.cjs` izmanto Node.js, Playwright un Chromium. Tas pats palaiž lokālu serveri ar tieši `/uzbekistana27/` apakšceļu un bloķē visus ārējos tīkla pieprasījumus. Pārbauda dabīgu lapas ritināšanu un enkursaites, visu 13 sadaļu pieejamību, ritināšanas animācijas un satura pieejamību bez JavaScript. 320–1440 pikseļu platumos pārbauda izkārtojumu, lielo foto izmērus un parakstu nepārklāšanos, desmit foto ielādi, četras pārgājiena dienas, budžetu, kopēšanu, ekipējuma saglabāšanu pēc pārlādes, galeriju un tās tastatūru, lokālo balsošanu, attēlu kļūdu aizstājēju un samazinātas kustības režīmu.

Ar uzstādītu Playwright:

```sh
node scripts/test-browser.cjs
```

Ja nepieciešams, ar `CHROME_PATH` norādi Chrome izpildāmo failu un ar `PLAYWRIGHT_MODULE` — Playwright moduļa ceļu. Ekrānattēli saglabājas `/tmp/uzbekistana-desktop.png` un `/tmp/uzbekistana-mobile.png`.

`scripts/download-images.py` dokumentē foto iegūšanu un optimizāciju (Python + Pillow). Ikdienas lietošanai to palaist nevajag: optimizētie foto jau ir repozitorijā. Katram foto saglabāta tā sākotnējā licence; attēlu atvasinājumi saglabā tās pašas licences. Avotu nodaļā un pilnekrāna galerijā ir autoru un licenču saites.

## Tehnoloģiju izvēle

Lapa izmanto semantisku HTML, adaptīvu CSS (Grid, Flexbox) un parastu JavaScript. Intersection Observer aktivizē elementu parādīšanos, kad tie ienāk skatā; CSS animē tikai caurspīdīgumu un transformācijas. Ritināšana paliek pārlūka pārziņā. `prefers-reduced-motion` izslēdz kustības, un saturs pēc noklusējuma ir redzams arī bez JavaScript. Šim statiskajam GitHub Pages projektam React, būvēšanas sistēma un animāciju bibliotēka nav nepieciešama; ģeogrāfiskajai kartei pievienota tikai lokāla Leaflet bibliotēka.

## Ģeogrāfiskā karte

`assets/js/map.js` vada trīs kartes skatus (valsts, Taškenta–kalni, kalnu apvidus), vietu marķierus, koordinātu logus un tīkla kļūdu stāvokli. `assets/vendor/leaflet/` satur Leaflet 1.9.4 un tā BSD licenci. `assets/maps/` satur Natural Earth valstu kontūras, lokālo SVG pārskatu un datu izcelsmes aprakstu. OpenStreetMap flīzes tiek izmantotas tikai redzamajai interaktīvajai kartei, nevis lejupielādētas bezsaistes arhīvā. Lapas ritināšana ar peles riteni nemaina kartes mērogu; telefonā viena pirksta vilciens paliek lapai. Kartes aplis ir vispārīgs apvidus, nevis verificēta taka, nometne, robeža vai atļauja.

Kartes automatizētās pārbaudes: `node scripts/test-map.cjs`. Tās imitē flīžu atbildes, lai nepārvietotu un nemērogotu karti automatizēti pret kopienas flīžu serveri. Pārbaudīti trīs skati, marķieri, pietuvināšana, koordinātu logi, tālruņu izkārtojums, bezsaistes aizstājējs un saturs bez JavaScript.

## Ilgums, klimats un lasāmība

8 dienas ir redakcionāls plānošanas ieteikums (1 ierašanās + 4 pārgājienam + 1 rezervei + 1 Taškentai + 1 mājupceļam), nevis apstiprināts lidojumu piedāvājums. 7 dienu variantā nav atsevišķas pilsētas dienas; 9 dienas noder papildu apskatei vai lidojumu grafika dēļ. Pārgājiena datumi paliek 5.–8. septembris, kamēr maršruts tiek pārbaudīts.

Septembra Taškentas vēsturiskie vidējie iegūti no WMO WWIS / Uzhydromet. Avots nenorāda vidējošanas periodu; 2027. gada prognoze netiek solīta. Saglabātā avota informācija: `assets/maps/tashkent-september-climate.json`. Kalnu sadaļa nošķir augstuma un vēja ietekmi no pilsētas klimata datiem. Divi jauni Taškentas foto glabājas lokāli, ar autoru un CC BY-SA 4.0 licences norādēm. Pamatteksta izmērs vienāds — 18 px uz datora un telefonā; palīgmarķējumiem ir atsevišķa 14 px hierarhija.
