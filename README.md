# EUC ROVER · pradinė kodo versija 0.1

Individualus tamsus Astro svetainės pagrindas pagal EUC ROVER brandbook 1.2 ir Svetainės gaires v1.0. Tai pirmas programavimo etapas: paleidžiamas kodas ir bandomoji peržiūra. Paskyros nesukurtos, svetainė viešai nepaskelbta.

## Greitas paleidimas

Reikia Node.js 24 LTS ir npm. Paketų versijos užfiksuotos `package-lock.json`.

```bash
npm ci
npm run dev
```

Terminalas parodys vietinės peržiūros adresą. Naršyklėje atverk `/lt/` arba `/en/`. Bendras `/` adresas parenka pirmą palaikomą naršyklės kalbą; rankinis LT/EN pasirinkimas turi pirmenybę. Tiesioginės straipsnių nuorodos neperadresuojamos pagal anksčiau pasirinktą kalbą.

Vietinė peržiūra pagal nutylėjimą rodo du **aiškiai pažymėtus bandomuosius straipsnius**. Jų datos, tekstai ir skaičiai yra pavyzdiniai. Tikros kelionės analizė ir savininko biografija nekuriamos iš prielaidų.

Pagefind indeksui parengti:

```bash
npm run build:demo
npm run dev
```

Jau sugeneruotą bandomąją svetainę galima peržiūrėti komanda `npm run preview:demo`.

Astro peržiūroje naudojamas paskutinis bandomasis Pagefind indeksas. Po tekstų pakeitimų jį atnaujink ta pačia `build:demo` komanda. Kol indekso nėra, vietinė peržiūra ieško tekstuose paprastu žodžių sutapimu. Viešos versijos surinkimas naudoja Pagefind. [Oficiali Pagefind API](https://pagefind.app/docs/api/).

## Kas jau sukurta

| Dalis | Įgyvendinta v0.1 |
|---|---|
| Dizainas | Tamsus antracitas, oranžiniai akcentai, šiltas tekstas, pateikti originalūs SVG ir padangos tekstūra, Montserrat WOFF2 |
| Kalbos | LT/EN sąsaja ir vienas abiejų kalbų publikacijos ID; kalbos perjungimas į tą patį straipsnį |
| Puslapiai | Pradžia, įrašai, kelionės, bendras straipsnio ir kelionės maketas, paieška, skaityti vėliau, „Apie mane“ ruošinys, pradinis privatumo tekstas ir 404 |
| Pradžia | Iki penkių naujausių publikacijų; viena išskirta kortelė; trūkstami vaizdai ir rodikliai neimituojami |
| Straipsnis | Atskiros datos, skaitomas teksto plotis, bendri rodikliai, automatiškai sudaromas esamų skyrių turinys |
| Skaityti vėliau | Vietinis sąrašas pagal stabilų ID, išsaugojimas ir pašalinimas, vienas įrašas abiem kalboms |
| Paieška ir sąrašai | Pavadinimai, įvadai, tekstai ir žymos; tipo, kategorijos ir žymos filtrai; iki 12 rezultatų puslapyje; URL išsaugo būseną |
| Duomenų modelis | Griežta versijuota schema, abiejų kalbų reikalavimas, datos ir bendri skaitiniai rodikliai |
| Turinio atskyrimas | Viešas surinkimas skaito tik `content/published/`; CMS juodraščiai ir bandomasis turinys į jį nepatenka |
| Pages CMS | Pradinė `.pages.yml` laukų konfigūracija įrašams, kelionėms, „Apie mane“, nuostatoms ir taksonomijai; paskyra dar neprijungta |
| Techniniai puslapiai | LT/EN RSS, sitemap, robots, bazinės SEO žymos ir ER SVG ikona |
| Patikros | TypeScript, tiksliniai turinio testai, sugeneruotų nuorodų tikrintuvas ir GitHub Actions patikrų darbo eiga |

## Surinkimas ir projekto adresas

```bash
npm run check
npm test
npm run build
npm run preview
```

`build` sukuria **viešam turiniui skirtą `dist/`**, o `build:demo` — **atskirą `dist-demo/`**. Šiuo metu tikrų patvirtintų publikacijų nėra, todėl `dist/` sąrašai tušti. Tuščiam turiniui paieškos indeksas nekuriamas. Bandomosios publikacijos niekada nepatenka į RSS.

Galutinę GitHub Pages kilmę ir kelią nustatyk `.env` faile pagal `.env.example`. Pavyzdyje numatytas `https://79mas.github.io` ir `/euc-rover/`; tai būsimo adreso pasiūlymas. Nuosavam domenui paprastai būtų naudojamas `/`. Be nustatytos kilmės naudojama nepublikuojama `example.invalid` reikšmė ir išjungiamas indeksavimas. [Astro diegimas GitHub Pages](https://docs.astro.build/en/guides/deploy/github/).

Viešam surinkimui nenaudok `dist-demo/`. Sugeneruotus failus aptarnauk HTTP serveriu; vien `index.html` atvėrimas kaip vietinio failo nepakeičia svetainės peržiūros.

## Kur ką keisti

| Kelias | Paskirtis |
|---|---|
| `src/styles/global.css` | Spalvos, tipografija, išdėstymas ir prisitaikymas |
| `src/components/` | Navigacija, kortelė, sąrašas, straipsnis ir kiti komponentai |
| `src/i18n/ui.ts` | LT/EN sąsajos tekstai ir pagrindinių puslapių keliai |
| `content/editorial/` | CMS redaguojami juodraščiai ir būsimų pataisų failai |
| `content/published/` | Viešą surinkimą maitinantys patvirtinti turinio failai |
| `content/demo/` | Du maketavimo pavyzdžiai, leidžiami tik bandomuoju režimu |
| `src/lib/content-core.mjs` | Vykdomos publikacijų validavimo taisyklės |
| `schemas/publication.schema.json` | JSON schemos struktūra integracijoms |
| `public/brand/`, `public/fonts/` | Patvirtinti ženklai, tekstūra ir licencijuoti šriftai |
| `assets/media/` | Būsimos paruoštos medijos; automatiškai į viešą aplanką nekopijuojamos |
| `docs/` | Darbų būsena, bandymų rezultatai ir resursų kilmė |

`public/` yra tiesiogiai kopijuojamas į svetainę. Ten laikomi tik svetainės stiliaus resursai. Juodraščių medijų ten nekelk.

## Pages CMS ir publikavimas

Sukūrus GitHub saugyklą, įkeliamas visas projektas su `.pages.yml`. Pages CMS prisijungia per GitHub App ir skaito šią konfigūraciją. Paskyros patvirtinimas ir tikras įrašymas per CMS dar nebandyti. [Pages CMS konfigūracija](https://pagescms.org/docs/configuration/).

CMS išsaugo į `content/editorial/`. Šioje versijoje nėra mygtuko, kuris automatiškai paskelbtų darbinę kopiją. Sąmoningai nepateikta automatinio diegimo darbo eiga: kitas etapas turi įgyvendinti pasirinktos redakcijos patikrą, peržiūrą, nekintamą publikavimo kandidatą ir ankstesnės versijos atkūrimą. GitHub Actions failas dabar atlieka tik patikras.

Kategorijų, jų grupių ir žymų sąrašai bei kalbiniai pavadinimai laikomi viename registre. Publikacijoje pradinė CMS konfigūracija naudoja stabilių kategorijų ir žymų ID laukus; patogų susietų įrašų pasirinkimą užbaigsime kartu su tikra CMS integracijos patikra. Viešai naudojama patvirtinta taksonomijos kopija; darbinis kategorijos ar žymos pakeitimas jos nekeičia. Du pradiniai žymų įrašai skirti bandomiesiems straipsniams.

## Kas laukia kito etapo

- [ ] GitHub saugykla ir tikras Pages CMS prisijungimas.
- [ ] Savininko patvirtintas įvadinis sakinys, „Apie mane“ tekstas, tikri straipsniai ir nuotraukos.
- [ ] Versijuotas medijų registras, EXIF valymas ir tik reikalingų patvirtintų failų įtraukimas.
- [ ] Pilna kelionės blokų schema, ECharts grafikai, Leaflet žemėlapiai ir PUB failų parengimas bei tikrinimas.
- [ ] Pasirinktos redakcijos peržiūros, publikavimo ir atkūrimo procesas.
- [ ] Brevo prenumerata, abiejų kalbų patvirtinimo ir pranešimų bandymai.
- [ ] Privaloma tikrų Android, iOS ir sutartų kompiuterinių naršyklių patikra.

RAW, RED, neapdoroti CSV ir privatus analizės auditas laikomi **visiškai už šio projekto ribų**. V0.1 dar neturi PUB importo, todėl failų patikra sustabdo visus GPX/CSV/FIT/TCX failus. Vėlesniame etape GPX išimtis bus suteikta tik griežtai patikrintam PUB importui.

Išsamesnės patikros ir ribos: [docs/QA.md](docs/QA.md). Ši versija nėra galutinio priėmimo ar leidimo viešinti patvirtinimas.
