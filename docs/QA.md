# Pradinės versijos patikra

Data: 2026-09-03. Versija: 0.1.0.

Tai programavimo etapo patikra. Galutinis svetainės priėmimas ir viešas publikavimas dar neatlikti.

## Atlikta

| Patikra | Rezultatas ir apimtis |
|---|---|
| TypeScript / Astro | `npm run check`; klaidų ir perspėjimų nėra |
| Turinio taisyklės | 7 Node testai: juodraštis, neužbaigta EN versija, neleistinas laukas, demo draudimas, atskirti juodraščiai ir paskelbtos kopijos, datos, ID, kalbos pasirinkimas, bazinis kelias ir neigiamos reikšmės |
| Bandomasis surinkimas | Du pavyzdžiai abiem kalbomis; 20 HTML puslapių; Pagefind indekse tik keturios straipsnių kalbinės versijos |
| Viešo turinio surinkimas | 16 HTML puslapių; tikrų patvirtintų publikacijų kol kas nėra; juodraščiai ir pavyzdžiai neįtraukiami |
| GitHub Pages kelias | Patikrintos vietinės nuorodos ir failai su `/euc-rover/` baze; 404 kalbos nuorodos taip pat patikrintos |
| Ekranų plotis | 320, 390, 568, 768, 1024, 1280 ir 1440 CSS px; LT ir EN pradžia bei kelionės straipsnis |
| Teksto didinimas | Tie patys keturi puslapiai su 100 % ir 200 % šrifto dydžiu; iš viso 56 kombinacijos; horizontalus dokumento perpildymas neaptiktas |
| Meniu | 320 px angliškame straipsnyje meniu atveriamas klaviatūra; matomi visi keturi skyriai; Escape uždaro meniu |
| Paieška | Užklausa „miško“ randa bandomąją kelionę; „zzzzzzzzzz“ rodo tikrą tuščią būseną; išvalymas grąžina abu rezultatus |
| Skaityti vėliau | Straipsnis išsaugomas LT; EN išlieka tas pats ID ir viena sąrašo pozicija; galima pašalinti ir gauti tuščią būseną |

Tikslūs išdėstymo matavimai pateikti `layout-checks.json`. `viewport` yra stendo pasirinktas rėmelio plotis, o `width` — dokumentui likęs plotis, atėmus naršyklės slinkties juostą. Visiems 56 įrašams `scroll <= width`.

Matavimams naudota valdoma Chrome naršyklė su to paties domeno `iframe` stendu. Šrifto padidinimas stende keičia šakninį šrifto dydį. Tai atskiria realų dokumento persidėliojimą nuo vien paveikslėlio sumažinimo, bet **nepakeičia tikro telefono, Safari, lietimo ar 400 % naršyklės mastelio patikros**. Tiksli Chrome versija šiame patikros kanale nefiksuota, todėl šie įrašai nepakeičia gairėse reikalaujamos galutinės naršyklių versijų matricos.

Meniu perpildymas, aptiktas ties 320 px ir 200 % tekstu, ištaisytas naudojant pagal turinio šrifto dydį prisitaikančias konteinerio taisykles. Aptikta 404 kalbos nuoroda pataisyta. Tuščiam viešam turiniui Pagefind nebekuriamas iš navigacijos ir poraštės tekstų.

## Privalomi tolesni bandymai

- [ ] Tikri Android ir iOS įrenginiai, abi orientacijos, lietimas ir telefono klaviatūra.
- [ ] Chrome, Edge, Firefox, Safari; Android Chrome, Firefox ir Samsung Internet; konkrečios versijos ir įrenginiai užregistruoti.
- [ ] 400 % naršyklės mastelis, tekstas su tikru ilgu LT/EN turiniu, ilgi nepertraukiami pavadinimai, nuotraukos.
- [ ] Daugiau kaip 12 publikacijų, visos puslapiavimo ribos ir grįžimo į slinkties vietą scenarijai.
- [ ] Uždraustas ir sugadintas naršyklės saugojimas; skaitymo sąrašo suderinimas tarp skirtukų.
- [ ] Tikri Pages CMS įrašymai ir puslapių peržiūra, susietų kategorijų ir žymų pasirinkimas.
- [ ] Galutinė publikavimo proceso A/B redakcijų, lygiagrečių pakeitimų ir atkūrimo patikra.
- [ ] Grafikai, žemėlapiai, galerijos, PUB failai ir prenumerata, kai šios dalys bus įgyvendintos.
- [ ] Prieinamumo ir greičio matavimai su tikru turiniu, tinklo sąlygomis bei medijomis.

Nustatyta atvaizdavimo ar valdymo klaida turi būti ištaisyta prieš atitinkamą viešą leidimą. Šiame etape nėra diegimo darbo eigos ir nėra išsiųstų prenumeratos pranešimų.
