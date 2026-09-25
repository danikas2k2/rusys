# RUSIO PROGRAMELE

## Kūrimas

```sh
pnpm dev
```

Programa veikia adresu `http://localhost:3021`. Prieš siūlant pakeitimą verta
paleisti visą patikrą:

```sh
pnpm check
```

## Kodo struktūra

- `src/app` — Next.js maršrutai, šakninis išdėstymas ir `route.ts` API įėjimo taškai.
- `src/components` — pakartotinai naudojami sąsajos elementai.
- `src/features` — konkrečių sričių sąsajos funkcijos, pavyzdžiui, produktų ar grupių valdymas.
- `src/store` — kliento būsena ir API užklausų hook'ai.
- `src/common` — bendri tipai ir grynos funkcijos; tai atskiras `@rusys/common` workspace paketas, kurį gali importuoti ir klientas, ir serveris.
- `src/server` — tik Node.js pusėje veikiantis kodas: MongoDB, duomenų operacijos ir API handleriai.

`src/server/data/products.ts` yra viešas produktų duomenų API fasadas. Jo realizacija suskirstyta į
`products/read.ts`, `products/stock.ts`, `products/images.ts` ir `products/mutations.ts`, kad skaitymo
užklausos, likučių transakcijos, paveikslėliai ir metaduomenų pakeitimai neliktų viename faile.

PWA paveikslėliai ir jų metaduomenys generuojami taip:

```sh
pnpm assets
```

## Diegimo grąžinimas

Kiekvienas `pnpm deploy` prieš įkeldamas naujus failus serveryje išsaugo šiuo metu veikiančią versiją į `.deploy-backup` (arba `BACKUP_PATH`). Pirmas monorepo deploy taip pat išsaugo ankstesnę vieno containerio struktūrą. Jei diegimą reikia atšaukti, vykdykite:

```sh
pnpm deploy:rollback
```

Komanda atstato ankstesnio release struktūrą ir perstato jos containerius. Ji veikia tik po bent vieno diegimo su šia atsarginių kopijų logika.
