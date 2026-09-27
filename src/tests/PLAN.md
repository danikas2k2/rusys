# E2E testų planas ir būsena

## Tikslas

Playwright saugo svarbiausias naudotojo grandines per naršyklę, Next API ir MongoDB, kad būtų saugiau refaktorizuoti sąsają bei duomenų srautus. Tai nėra kiekvienos kodo eilutės padengimas: skaičiavimų, validavimo ir retų duomenų operacijų detalės lieka Vitest testuose.

**Būsena:** funkciniai Playwright testai vykdomi per `pnpm test:e2e:functional`, vaizdiniai — per `pnpm test:visual`, o 6 kritiniai scenarijai pažymėti `@critical`. CI paleidžia funkcinį Chromium ir vaizdinį Chromium bei WebKit rinkinius. Toliau pateikti punktai skiria išbandytus scenarijus nuo dar nepadengtų šakų.

## Testų pagrindas — padaryta

- [x] `src/tests/fixtures/data.ts` aprašo tipizuotus `empty`, `basic`, `annual`, `review`, `history`, `images` scenarijus. Metai saugomi programos dviejų skaitmenų formatu; istorijos pavyzdys susietas su rugsėjo suvestinės riba.
- [x] `src/tests/fixtures/test.ts` prieš **kiekvieną** testą atkuria laikiną `mongodb-memory-server` bazę ir paveikslėlių katalogą. URI, DB vardas ir katalogo kelias tikrinami prieš valymą; gyva DB nenaudojama. Bendrą DB naudojantys testai vykdomi vienu darbuotoju.
- [x] Testuose naudojami matomi pavadinimai, prieinamumo vaidmenys ir stabilios `data-*` atramos. Po svarbių mutacijų tikrinamas MongoDB įrašas ir, kur aktualu, puslapio perkrovimas.
- [x] Visų keturių puslapių meniu bei tiesioginis atidarymas tikrina turinį, ne vien URL; yra tuščios bazės scenarijus. Nesėkmės atveju saugomi `trace` ir ekrano vaizdas.
- [ ] `images` scenarijų papildyti tikrais paveikslėlių failais. Dabar paveikslėliai sukuriami per atskirus įkėlimo testus, o pats scenarijus turi bazinius duomenis.
- [ ] Jei prireiks lygiagretumo, izoliuoti DB ir Next procesą kiekvienam Playwright darbuotojui. Dabartinis `workers: 1` yra sąmoningas apribojimas.

## Kritinės naudotojo grandinės

| Sritis               | Jau padengta                                                                                                                                                                                                             | Dar liko                                                                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kategorijos          | Sukūrimas su `Annual`/`Review`, juodraščio atmetimas, pervadinimas ir susijusių produktų bei variantų perkėlimas, šalinimo patvirtinimas, tvarkos keitimas vilkimu; patikrinimas po perkrovimo.                          | Pakeisti `Annual` ir `Review` **esamai** kategorijai ir patikrinti poveikį sąrašams.                                                                     |
| Variantai            | Sukūrimas su kiekiu ir žyma, pervadinimas bei likučių atnaujinimas, kopijavimas į kitą kategoriją, šalinimas su patvirtinimu, perrikiavimas ir išlikimas po perkrovimo.                                                  | Atskirai keisti vienetus ir kiekį redaguojant variantą; tikrinti kopijos konfliktą.                                                                      |
| Produktai            | Sukūrimas per „+“ ir perėjimas į kiekių dialogą, pervadinimas, perkėlimas tarp kategorijų, tėvinio produkto nustatymas ir išskleidimas, šalinimo atšaukimas bei patvirtinimas, neįrašyto produkto atmetimas su `Escape`. | Tėvinio produkto suskleidimas, tėvinio ryšio pakeitimas ir ribojimas perkelti produktą su vaikais.                                                       |
| Likučiai ir istorija | Papildymas, vartojimas su komentaru, išmetimas, viso varianto perkėlimas kitam produktui, dalies suvartoto kiekio perklasifikavimas į išmestą, istorija, `Undo`/`Redo`, rezultatas kortelėje ir suvestinėje.             | Atskira paprasto likučio sumažinimo šaka, perkėlimas į **kitą kategoriją** su varianto kopijavimu, kelios variantų rūšys viename veiksme.                |
| Metai ir suvestinė   | Metinių metų perjungimas, metų pažymėjimas šalinimui ir išlikimas DB, vartojimo bei išmetimo atvaizdavimas suvestinėje, suvestinės istorija ir filtrai.                                                                  | Nemetinio produkto elgesys keliuose metuose, istoriniai metai meniu, laikotarpio ribos prieš ir po rugsėjo, metų perjungimas su neįrašytais pakeitimais. |
| Peržiūra             | Produkto `missing` keitimas kortelėje ir dialoge, „tik trūkstami“ filtras, pasirinkti visus, grąžinti kategoriją į nepaliestą būseną; neliečiama kita kategorija.                                                        | Kelių kategorijų pakeitimų taikymas vienu metu ir peržiūros dialogo atšaukimas su neįrašytais pakeitimais.                                               |

Kritinis šešių testų rinkinys apima kategorijos, varianto ir produkto sukūrimą, vartojimą su istorija bei `Undo`/`Redo`, suvestinę ir peržiūrą. Visas rinkinys paleidžiamas prieš didelius refaktoringus.

## Filtrai ir sąveika

- [x] Greita paieška produktuose, kategorijose, variantuose ir suvestinėje; paieškos išvalymas, kategorijos filtras ir URL parametrų išsaugojimas keičiant puslapį.
- [x] Kategorijų bei variantų perrikiavimas vilkimu ir išlikimas po perkrovimo.
- [x] Neįrašytų kategorijos pakeitimų atšaukimas, produkto atmetimas su `Escape`, produkto ir šalinimo dialogų patvirtinimas.
- [x] Temos perjungimas išlieka po perkrovimo. Mobilus Chromium tikrina meniu, navigaciją ir kiekių dialogą per `touch`.
- [ ] Patikrinti vilkimo draudimą, kai aktyvus paieškos filtras; tėvinio produkto suskleidimą.
- [ ] Patikrinti paspaudimą už neįrašyto dialogo, kai vienas ant kito atidaryti kiekių, produkto redagavimo ir šalinimo dialogai.
- [ ] Pridėti tikrų mobilių gestų scenarijus: braukimą ir „pull to refresh“, jei tie veiksmai vis dar naudojami programoje.

## Failai, importas ir klaidos

- [x] Kategorijos paveikslėlio įkėlimas bei šalinimas; produkto ir varianto paveikslėlių įkėlimas, varianto paveikslėlio šalinimas; neleistino formato atmetimas.
- [x] ZIP eksportas su `data.json`, importas į išvalytą **laikiną** DB, netinkamas ZIP, netinkama schema ir importo atšaukimas nekeičiant duomenų.
- [x] Produkto paveikslėlio įkėlimas, `images/` įrašo patikra ZIP archyve ir paveikslėlio atkūrimas iš archyvo po jo pašalinimo iš laikino failų katalogo.
- [x] `LoadableContent` API klaida ir sėkmingas pakartotinis bandymas po jos.
- [x] Kategorijos redagavimo API klaida išsaugo juodraštį ir nekeičia DB; pakartotinis bandymas pavyksta ir išlieka po perkrovimo.
- [ ] Patikrinti produkto paveikslėlio šalinimą, didelės nuotraukos miniatiūrą bei pilną peržiūrą ir fizinio failo išvalymą.
- [ ] Patikrinti per didelio failo klaidą, failo įkėlimo API nesėkmę ir pakartotinį bandymą bei lėto atsakymo UI scenarijų. Įprasti CRUD testai ir toliau turi naudoti tikrą API, o klaidų scenarijai — Playwright tinklo maršrutizavimą.
- [ ] Pridėti atskirą valdomą prisijungimo bei leidimų režimą su deterministine testine tapatybe arba OAuth atsakymų pakaitalu. `next dev` autentifikaciją apeina, todėl dabartiniai E2E testai **nepatikrina produkcinio prisijungimo**.

## Paleidimas ir refaktoringo vartai

- [x] `pnpm test:e2e:critical` skirtas greitam patikrinimui; `pnpm test:e2e` vykdo visą rinkinį, įskaitant mobilų Chromium projektą. Testai nepriklauso nuo eilės ir nenaudoja fiksuotų `sleep`.
- [x] `src/**/*.snap.ts` lygina puslapių, kortelių, lentelių, meniu, dialogų, nuotraukų, metinių likučių ir įvesties būsenų ekrano vaizdus visuose penkiuose įrenginių projektuose su šviesia ir tamsia temomis. Testai laikomi šalia savo komponenčių, o etalonai – tos pačios srities `__snapshots__/<komponentas>/` kataloge. `pnpm test:visual` lygina vaizdus su etalonais; `pnpm test:visual:update` juos atnaujina. Prieš priimant pakeistas nuotraukas, reikia jas vizualiai peržiūrėti.
- [x] `.github/workflows/ci.yml` funkcinius testus paleidžia atskirame Node 26 Linux darbe (`pnpm test:e2e:functional`), o vizualinius — `xcode-27` macOS 27 arm64 darbe, kad sutaptų su etalonų aplinka. Kiekvienam vaizdui saugomas vienas `-chromium.png` etalonas. Nesėkmės atveju CI išsaugo Playwright artefaktus.
- [x] Pagrindiniams puslapiams ir dialogams pridėti iPhone 17 bei iPad mini WebKit vaizdiniai scenarijai.
- [ ] Prireikus naršyklių suderinamumo, pridėti tikslinius Firefox kritinius scenarijus. Viso rinkinio kiekvienoje naršyklėje dubliuoti nereikia.
- [ ] Refaktorizuojant dar nepadengtą modulį, pridėti bent vieną teigiamą naudotojo scenarijų, svarbią atšaukimo arba klaidos šaką ir patikrinimą po perkrovimo, jei keičiasi saugomi duomenys.

`pnpm test:visual:update` atnaujina vienintelius etalonus. Juos generuoti ir lyginti `macOS 27` arm64 aplinkoje, kaip CI `xcode-27` darbe; skirtingų OS naršyklių vaizdai gali skirtis.

Vienetiniai testai yra `src/**/*.test.ts` arba `src/**/*.test.tsx`, funkciniai E2E — `src/**/*.spec.ts`, vizualiniai — `src/**/*.snap.ts`, šalia atitinkamų komponentų ir funkcijų. Bendros pradinės būsenos lieka `src/tests/fixtures/`, UI veiksmai — `src/tests/helpers/`, o laikino serverio paleidimas bei sutvarkymas — `src/tests/playwright/`. Šį dokumentą atnaujinti kartu su naujais scenarijais, kad „padengta“ reikštų realiai veikiantį Playwright testą.
