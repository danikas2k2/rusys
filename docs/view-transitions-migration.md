# React ViewTransition migracijos planas

## Tikslas

Nuosekliai pridėti prasmingus perėjimus tarp pagrindinių ekranų, kategorijų turinio ir įkėlimo būsenų. Esamų gestų, tempimo bei dialogų animacijų nekeisti vien dėl technologijos pakeitimo: jas vertinti pagal valdymo tikslumą ir gyvavimo ciklą.

## Dabartinė sandara

- Keturi matomi ekranai (`/`, `/summary`, `/variants`, `/categories`) parenkami kliento `AppRouter` viduje. Next puslapiai naudoja bendrą `[...path]` maršrutą.
- Kiekvienas ekranas kuria `Page` su `AppShell`, įskaitant įrankių juostą, slenkamą turinį ir apačią. Perėjimą reikia riboti slenkamu turiniu, kad navigacija nepajudintų viso apvalkalo.
- Kategorija laikoma `GroupFilterContext` būsenoje, o jos pasirinkimas dabar yra tiesioginis `setState`. `ViewTransition` aktyvuojamas tik React perėjime arba per `Suspense`.
- `LoadableContent` turi `Suspense` ribą. Mantine `Collapse`, `Modal` ir `Drawer`, braukimo valdikliai bei `dnd-kit` tempimas turi atskiras animacijas ir kai kur priklauso nuo jų pabaigos įvykių.

## Etapai

1. **Navigacijos bandymas ir pagrindas.** Įdėti `ViewTransition` aplink `Page` pagrindinį turinį, aprašyti trumpą įėjimo / išėjimo CSS animaciją ir patikrinti naršyklėje naviguojant tarp visų keturių ekranų. Jei bendras kliento maršrutas nesukelia įėjimo / išėjimo perėjimo, perkelti ribą į `AppRouter` ir atskirti pastovų apvalkalą nuo keičiamo ekrano.
2. **Kategorijos keitimas.** Kategorijos pasirinkimą vykdyti per `startTransition`, rezultatų sričiai pritaikyti `ViewTransition` atnaujinimo animaciją. Išlaikyti esamą komponentų būseną ir neleisti paieškos klavišų animacijoms kauptis.
3. **Įkėlimo būsena.** Pasirodant `LoadableContent` `Suspense` turiniui, taikyti trumpą įėjimo animaciją. Fiksuoto viso ekrano indikatoriaus išėjimą vertinti atskirai, nes jo padėtis skiriasi nuo rezultatų srities.
4. **Kiti pasikeitimai.** Atskirai išbandyti produkto / suvestinės elementų bendrą tapatybę ir sąrašo perrikiavimą. Naudoti vardus tik iš tiesų bendriems elementams, su unikaliais raktais. Palikti Mantine išskleidimą, dialogus, braukimą ir `dnd-kit`, kol bandymas įrodys lygiavertį valdymą.
5. **Patikra.** Vykdyti tipų, stiliaus ir tikslinius testus; „Playwright“ tikrinti perėjimų įvykius su įjungtu judesiu Chromium ir WebKit, mobilų valdymą, tiesioginį URL atidarymą, grįžimą atgal, lėtą įkėlimą ir `prefers-reduced-motion`. Vizualiniai testai su išjungtu judesiu animacijos nepatvirtina.

## Bendri kriterijai

- Animacija neturi keisti navigacijos, fokusavimo, slinkties ar dialogų uždarymo veikimo.
- Pagrindinis turinys pasikeičia aiškiai, o įrankių juosta ir apačia išlieka vizualiai stabilios.
- Esant `prefers-reduced-motion: reduce`, perėjimai išjungiami.
- Nepalaikant naršyklės API, programa lieka visiškai naudojama.
- Trumpas perėjimas neturi trukdyti greitai spausti kitą veiksmą.

## Įgyvendinimo būsena

- [x] Pagrindinių ekranų turinio įėjimo ir išėjimo perėjimas. Įrankių juosta ir apačia lieka už šios ribos.
- [x] Kategorijos rezultatų atnaujinimo perėjimas be turinio permontavimo.
- [x] Trumpas `Suspense` turinio pasirodymas po įkėlimo.
- [x] Naršyklės bandymas patvirtina API iškvietimą naviguojant ir keičiant kategoriją Chromium.
- [x] WebKit mobilios navigacijos ir dialogo naudojimo patikra.
- [x] `prefers-reduced-motion: reduce` patikra Chromium: naviguojant sukurtų perėjimo animacijų trukmės yra `0`.
- [x] Patikrinta navigacija be naršyklės `startViewTransition` API ir grįžimas atgal, taip pat lėtas Suvestinės duomenų įkėlimas.
- [x] Bendrų produkto / suvestinės kortelių bandymas. Net antrą kartą pereinant tarp jau atvertų ekranų naršyklė nesukūrė bendros kortelės animacijos. Tikėtina priežastis: `Suspense` duomenų gavimas išskaido pakeitimą į atskirus kadrus. Bandomas kortelių kodas atšauktas; lieka puslapio ir įkėlimo perėjimai.
- [x] Sąrašų perrikiavimo įvertinimas. `dnd-kit` valdo tempimą realiu laiku, o `useReorderHandler` naudoja `flushSync` būsenai užfiksuoti; React tokio atnaujinimo `ViewTransition` neanimuoja. Palikti esamą tempimo animaciją.
- [x] Grupuoto produkto atvėrimas ir suskleidimas: `ViewTransition` animuoja tėvinės kortelės turinio pasikeitimą, Mantine `Collapse` išlaiko vaikų aukščio animaciją.
- [x] Produkto dialogo tabai: kiekio ir istorijos turinys įeina / išeina per `ViewTransition`, Mantine `Activity` išlaiko neaktyvaus tabo būseną.
- [x] Produkto variantų atvėrimas ir suskleidimas: `ViewTransition` animuoja eilutės pasikeitimą, Mantine `Accordion` išlaiko panelės aukščio animaciją.
- [x] Variantų perkėlimo režimas: varnelės pasirodo / dingsta per `ViewTransition`.
- [x] Produkto formos „Papildomi laukai“: `ViewTransition` animuoja punkto pokytį, `Mantine Accordion` palieka aukščio animaciją. Naršyklėje patikrintas atvėrimas, suskleidimas ir įvesties išsaugojimas.
- [x] Produkto dialogo metų perjungimas: pasirinkimas pasikeičia iškart, o kiekio / istorijos turinys atnaujinamas per `useDeferredValue` ir `ViewTransition`. Patikrinta naršyklėje abiem kryptimis.
- [x] „Tik trūkstami“ filtras: jo vienkartinį būsenos pokytį vykdyti per `startTransition`, rezultatų tinklelį animuoti per `ViewTransition`. Patikrintas filtro įjungimas ir išjungimas.
- [x] Produkto kortelės pridėjimas ir pašalinimas: po asinchroninio Redux atnaujinimo narystės pokytis palaukia modalinio dialogo išėjimo, tada React perėjimas animuoja kortelės įėjimą / išėjimą. Kiekių atnaujinimai nelaukia. Patikrintos konkrečios naršyklės CSS animacijos.

## Likusių animacijų inventorius

Šis sąrašas apima programoje aiškiai aprašytas animacijas ir naudojamus „Mantine“ komponentų perėjimus. „Mantine“ vidinių `hover`, fokusavimo, įkėlimo indikatorių bei kitų smulkių būsenų animacijos nėra atskiri ekranų perėjimai.

| Vieta                                                                                                                                                  | Dabar animuoja                                                                                   | Sprendimas                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Produkto kūrimo / redagavimo dialogo „Papildomi laukai“ (`ProductBox.tsx`)                                                                             | `ViewTransition` animuoja punkto pokytį, `Mantine Accordion` — panelės aukštį                    | **Atlikta.**                                                                                                                                                                                                                                                                                                                                                |
| Greitoji paieška kategorijų, variantų ir peržiūros lentelėse (`globals.css`, `GroupsRow.tsx`, `VariantsRow.tsx`, `ReviewProductRow.tsx`)               | CSS keičia `height`, `opacity`, `visibility`; „Safari“ naudoja `display: none` atsarginį kelią   | **Palikti:** paieškos įvesties būsenos negalima žymėti `startTransition`. Atskiras atidėtas rezultatų atnaujinimas pridėtų atsilikimą ir konkuruotų su jau veikiančia 100 ms eilutės aukščio animacija. Produktų ir suvestinės kortelės slepiamos be animacijos (`GridTile.css`); jų pasikeitimą verta vertinti tik kaip atskirą, ribotos apimties bandymą. |
| Pridėjimo mygtuko paslėpimas atidarius veiksmą (`AddAction.css`)                                                                                       | 100 ms CSS `opacity`                                                                             | **Žemas prioritetas:** trumpas, nepriklausomas būsenos pokytis; `ViewTransition` būtų prasmingas tik jei būtų derinamas su atidaromu turiniu.                                                                                                                                                                                                               |
| Dialogai: produktas, kiekiai, variantas, kategorija, peržiūra, istorija, patvirtinimai ir nuotrauka (`theme.ts`, atitinkami `*Box.tsx`, `*Dialog.tsx`) | „Mantine Modal“ 200 ms `fade-down`; keli dialogai naudoja `onExitTransitionEnd` būsenai išvalyti | **Palikti:** išėjimo pabaiga susieta su būsena, fokusu, sluoksniais ir kartais virš kito dialogo atidaromu dialogu. Galimą kortelės → dialogo bendrą perėjimą tirti atskirai, nekeičiant modalinio ciklo. Galiojimo datos kalendoriaus dialogui animacija sąmoningai išjungta (`AmountExpanded.tsx`).                                                       |
| Šoninis meniu (`ToolbarMenu.tsx`, `ToolbarMenu.css`)                                                                                                   | „Mantine Drawer“ atsidarymas; CSS burgerio linijų `transform` / spalvos pokytis                  | **Palikti:** uždarymo pabaiga grąžina burgerio sluoksnio tvarką (`onExitTransitionEnd`), o linijų pokytis yra valdiklio būsena.                                                                                                                                                                                                                             |
| Variantų / kategorijų eilučių tempimas (`SortableRow.tsx`, `useReorderHandler.ts`)                                                                     | `dnd-kit` `transform` ir `transition`                                                            | **Palikti:** judėjimas seka rodyklę, o pabaigos atnaujinimas naudoja `flushSync`; jau įvertinta ankstesniame etape.                                                                                                                                                                                                                                         |
| Eilučių braukimas ir veiksmų skydelio atvėrimas (`SwipeableRow.tsx`, `SwipePanel.tsx`, `SwipePanel.css`)                                               | Tiesiogiai valdomas `transform`, po paleidimo 200 ms CSS perėjimas ir `transitionend`            | **Palikti:** animacija seka pirštą, o pabaigos įvykis šalina skydelį.                                                                                                                                                                                                                                                                                       |
| Patraukimas atnaujinti (`PullToRefreshIndicator.css`)                                                                                                  | Indikatorius seka gestą, grįžimas trunka 200 ms CSS                                              | **Palikti:** turinio atsiradimas po įkėlimo jau naudoja `ViewTransition`; patį gestą valdo CSS.                                                                                                                                                                                                                                                             |
| Įrankių užuominos ir metų meniu (`IconButtonTooltip.tsx`, `ProductYearBar.tsx`)                                                                        | „Mantine Tooltip“ 150 ms `fade-up` / `fade-down`, „Menu“ savo perėjimas                          | **Palikti:** tai trumpalaikiai popover sluoksniai, kuriuos valdo jų komponentai.                                                                                                                                                                                                                                                                            |
| Kortelės rėmelis užvedus pelę (`GridTile.css`)                                                                                                         | 150 ms CSS `border-color`                                                                        | **Palikti:** sąveikos grįžtamasis ryšys, ne turinio pakeitimas.                                                                                                                                                                                                                                                                                             |

Toliau verta atskirai tirti produktų ir suvestinės paieškos kortelių pasikeitimą bei kortelės → dialogo bendrą perėjimą. Tam reikės naršyklėje patvirtinti, kad perėjimą sukuria tas pats React atnaujinimas ir jis netrukdo greitai paieškai ar modaliniam fokusui.
