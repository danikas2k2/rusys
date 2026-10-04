# RUSIO PROGRAMELE

## Kūrimas

```sh
pnpm dev
```

Programa veikia adresu `http://localhost:3021`. Prieš siūlant pakeitimą verta
paleisti kodo stiliaus ir vienetinių testų patikrą:

```sh
pnpm check
```

Visą patikrą, įskaitant padengimą ir naršyklės testus, paleidžia `pnpm check:all`.

`pnpm test` paleidžia visus vienetinius ir serverio duomenų testus be MongoDB serverio.
`pnpm test:coverage` papildomai patikrina testų padengimą.

Naršyklės navigacijos testai paleidžiami su atskira laikina MongoDB ir testiniais duomenimis:

```sh
pnpm exec playwright install chromium
pnpm test:e2e
```

Greitam svarbiausių grandinių patikrinimui naudok `pnpm test:e2e:critical`. Jei nori matyti veiksmus naršyklėje, naudok `pnpm test:e2e:headed`. `pnpm test:e2e:ui`
atidaro interaktyvią Playwright sąsają, kurioje testus reikia paleisti paspaudus „Run“.

Visos `test:e2e` komandos vykdo tik `*.spec.ts` testus. Vaizdinius `*.snap.ts` testus paleidžia `pnpm test:visual`, o etalonus atnaujina `pnpm test:visual:update`. Vaizdiniai testai naudoja vieną Next serverį ir testinius duomenis be MongoDB. E2E testai naudoja vieną Next serverį ir laikiną MongoDB. Visi Playwright testai vykdomi viename workeryje.

## Kodo struktūra

- `src/app` — Next.js maršrutai, šakninis išdėstymas ir `route.ts` API įėjimo taškai.
- `src/components` — pakartotinai naudojami sąsajos elementai.
- `src/features` — konkrečių sričių sąsajos funkcijos, pavyzdžiui, produktų ar grupių valdymas.
- `src/store` — kliento būsena ir API užklausų hook'ai.
- `src/common` — bendri tipai ir grynos funkcijos, pasiekiamos per `~/common` importų alias'ą tiek klientui, tiek serveriui.
- `src/server` — tik Node.js pusėje veikiantis kodas: MongoDB, duomenų operacijos ir API handleriai.

`src/server/data/products.ts` yra viešas produktų duomenų API fasadas. Jo realizacija suskirstyta į
`products/read.ts`, `products/stock.ts`, `products/images.ts` ir `products/mutations.ts`, kad skaitymo
užklausos, likučių transakcijos, paveikslėliai ir metaduomenų pakeitimai neliktų viename faile.

PWA paveikslėliai ir jų metaduomenys generuojami taip:

```sh
pnpm assets
```

## Diegimas ir grąžinimas

`pnpm deploy` patikrina projektą ir į serverį tiesiai iš projekto įkelia tik
„Docker“ build reikalingus šaltinio failus. Ten surenkama neaktyvi mėlyna arba
žalia programos vieta; ją paleidus ir patikrinus, „Nginx“ perjungia srautą. Ankstesnė
vieta lieka veikianti, todėl ją galima greitai grąžinti:

```sh
pnpm deploy:rollback
```

`pnpm deploy:rollback` perjungia srautą į ankstesnę sveiką vietą be pakartotinio
surinkimo. Diegimui ir rollback reikia veikiančio `rusys-gateway`; rollback taip
pat reikia sveiko ankstesnės spalvos konteinerio.
