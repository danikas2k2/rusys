# Monorepo migracijos planas

> Būsena: migracija ir deploy kelio validacija įgyvendintos. Griežtesnė common
> API riba yra pasirinktinė, ne migracijos reikalavimas.

## Tikslas

Padalinti esamą projektą į atskirus kliento, serverio ir bendro kodo
workspace paketus, išlaikant paprastą bei į dabartinę struktūrą panašų
išdėstymą. `pnpm` workspace ir Turborepo valdys bendras komandas,
priklausomybes bei cache.

## Siūloma struktūra

```text
src/
  client/                     # React + Vite klientas; @rusys/client
  server/                     # Express API; @rusys/server
  common/                     # Domeno logika, API DTO ir bendri tipai; @rusys/common
docker/                       # lieka dabartinėje vietoje
vite/                         # lieka dabartinėje vietoje, kol naudojama bendrai
```

Kiekvienas iš `src/client`, `src/server` ir `src/common` turi savo
`package.json`. `pnpm-workspace.yaml` juos įtraukia taip:

```yaml
packages:
    - '.'
    - 'src/*'
```

Tai yra workspace paketai, ne npm publikuojamos bibliotekos.

## Priklausomybių taisyklės

```text
client ──> common
server ──> common
```

- `client` ir `server` negali importuoti vienas kito.
- Abiejų `package.json` priklauso nuo `@rusys/common` per `workspace:*`.
- `common` neturi priklausyti nuo React, Express, DB arba naršyklės API.
- UI komponentai lieka `client`; atskiro UI paketo nekuriame, kol jis nėra
  reikalingas daugiau nei vienai aplikacijai.

## Dabartinių failų paskirstymas

| Dabartinė vieta                 | Nauja vieta                     |
| ------------------------------- | ------------------------------- |
| `src/client/**`                 | `src/client/**` (lieka vietoje) |
| `src/server/**`                 | `src/server/**` (lieka vietoje) |
| `src/common/**`, `src/types/**` | `src/common/**` (lieka vietoje) |

`dev.ts` lieka `src/server`, nes tai serverio runtime kodas, o ne bendra
domeno logika.

## Paketų API ir importai

Bendri paketai eksportuoja tik sąmoningai parinktus entry pointus:

```json
{
    "name": "@rusys/common",
    "private": true,
    "exports": {
        ".": "./index.ts",
        "./*": "./*.ts"
    }
}
```

`client` ir `server` nurodo vidines priklausomybes su `workspace:*`:

```json
{
    "dependencies": {
        "@rusys/common": "workspace:*"
    }
}
```

`client` ir `server` bendrą kodą importuoja tik per workspace paketo API:

```ts
import type { Product } from '@rusys/common/data';
import { getAmountTotals } from '@rusys/common/utils/amounts';
```

`~/client/*` ir `~/server/*` alias sintaksė lieka jų vidiniam kodui. Pats
`common` gali naudoti `~/common/*` savo vidiniams importams. `@rusys/common`
lieka workspace paketo vardas `package.json` priklausomybėse. Turbo iš jo mato
priklausomybių grafiką: pakeitus `common`, bus perskaičiuotos tik nuo jo
priklausomos kliento ir serverio užduotys.

## Versijavimas

Kol visi trys paketai gyvena šiame repozitorijoje, `common` yra `private: true`
ir gali turėti pastovią versiją, pvz. `0.0.0`. Jo versija nekeliama, nes jis
nėra publikuojamas į npm.

`client` ir `server` gali turėti atskiras versijas tik tada, kai jie
deploy'inami nepriklausomai. Kol produkcijoje surenkamas vienas Docker image,
galima palikti vieną bendrą produkto versiją šakniniame `package.json`.

Jei bendri paketai kada nors bus publikuojami ar naudojami kitame
repozitorijoje, tada galima įvesti nepriklausomą semver ir Changesets. Šiai
migracijai to nereikia.

## Aplikacijų komandos

`client` ir `server` turi vienodą aukšto lygio sąsają:

```json
{
    "scripts": {
        "dev": "...",
        "build": "...",
        "lint": "...",
        "lint:ts": "...",
        "test": "...",
        "check": "pnpm lint && pnpm test"
    }
}
```

Šakninės komandos:

```json
{
    "scripts": {
        "dev": "turbo run dev --parallel --filter='!rusys'",
        "build": "turbo run build --filter='!rusys'",
        "check": "turbo run check --filter='!rusys'",
        "lint": "turbo run lint --filter='!rusys'",
        "test": "turbo run test --filter='!rusys'"
    }
}
```

Naudojimo pavyzdžiai:

```sh
pnpm --filter @rusys/client check
pnpm --filter @rusys/server build
pnpm turbo test --filter=@rusys/server
```

### Darbas iš paketo direktorijos

`--filter` reikalingas tik vykdant komandą iš repozitorijos šaknies. Būnant
konkretaus paketo kataloge, `pnpm` randa jo `package.json` ir vykdo jo
skriptą:

```sh
cd src/client
pnpm run build
pnpm run check

cd ../server
pnpm run build
```

Patogumo dėlei galima naudoti ir trumpesnę `pnpm build` formą, tačiau
`pnpm run build` aiškiau parodo, kad paleidžiamas `package.json` skriptas.

### WebStorm

WebStorm NPM įrankio lange kiekvienas `package.json` turi atskirą skriptų
medį. Atidarius arba pažymėjus `src/client/package.json` ir pasirinkus
**Show npm Scripts**, bus matomos `client` komandos; tą patį reikia padaryti
su `src/server/package.json` ir, jei reikia, šakniniu `package.json`.

Rekomenduojamos nuolatinės Run Configuration konfigūracijos:

| Pavadinimas       | `package.json`            | Skriptas |
| ----------------- | ------------------------- | -------- |
| Client dev        | `src/client/package.json` | `dev`    |
| Server dev        | `src/server/package.json` | `dev`    |
| Client check      | `src/client/package.json` | `check`  |
| Server check      | `src/server/package.json` | `check`  |
| Entire repo check | šakninis `package.json`   | `check`  |

Kiekvienai konfigūracijai pasirinkiamas projekto `pnpm` package manager.
WebStorm leidžia tokias komandas paleisti ir tiesiai iš `package.json` gutter
mygtuko arba NPM įrankio lango.

## Turbo užduotys

Dabartinis `turbo.json`:

```json
{
    "$schema": "https://turbo.build/schema.json",
    "tasks": {
        "build": {
            "dependsOn": ["^build"],
            "cache": false
        },
        "@rusys/server#build": {
            "dependsOn": ["@rusys/client#build", "^build"],
            "outputs": []
        },
        "check": {
            "dependsOn": ["^check"],
            "outputs": []
        },
        "lint": {
            "dependsOn": ["^lint"],
            "outputs": []
        },
        "lint:ts": {
            "dependsOn": ["^lint:ts"],
            "outputs": []
        },
        "test": {
            "dependsOn": ["^build"],
            "outputs": ["coverage/**"]
        },
        "dev": {
            "cache": false,
            "persistent": true
        }
    }
}
```

Kol klientas ir serveris sąmoningai dalijasi šakniniu `dist/`, `build` cache
paliekamas išjungtas: Turbo teisingai sudėlioja kliento → serverio eigą, bet
neatkuria bendro artefakto į netinkamą paketo katalogą. `check` ir kitos
užduotys išlieka cache'inamos.

## Deploy ir Docker sprendimas

Dabartinė `docker/` struktūra lieka vietoje. Šiandien serverio build naudoja
kliento sugeneruotą `dist/public/index.html`, kad sukurtų CSP hash'us, ir
serveris pateikia kliento statinius failus. Pereinamuoju laikotarpiu:

1. `@rusys/server#build` priklauso nuo `@rusys/client#build`.
2. Esamas Docker image surenkamas iš abiejų artefaktų.
3. Lokalūs `dev`, `test`, `lint` ir `lint:ts` lieka nepriklausomi.

Vėliau klientą galima deploy'inti į CDN arba nginx, o serverį palikti tik API.
Tai leistų visiškai nepriklausomus release'us, bet nėra pirmos migracijos
reikalavimas.

## Migracijos eiga

- [x] Įtraukti `pnpm` workspace ir Turborepo; workspace apima root bei `src/*`.
- [x] Sukurti `@rusys/client`, `@rusys/server` ir `@rusys/common` privačius
      paketus su atskiromis `dev`, `build`, `lint`, `test` ir `check` komandomis.
- [x] Perkelti client ir server Vite bei TypeScript konfigūracijas į jų paketų
      katalogus; client Stylelint konfigūracija taip pat yra `src/client`.
- [x] Sujungti buvusį `src/types` su `src/common`; importai išlaikyti kaip
      `~/common/*`, o package grafike client ir server priklauso nuo
      `@rusys/common`.
- [x] Atnaujinti Vitest projektus: common testai vykdomi vieną kartą, be
      MongoDB; client ir server testai yra atskiri projektai.
- [x] Atnaujinti root Turbo užduotis (`build`, `dev`, `lint`, `lint:ts`,
      `test`, `check`) bei package-local formatavimo ir lint komandas.
- [x] Išlaikyti bendrą `dist/`: serverio build priklauso nuo client build,
      kad CSP hash'ai būtų generuojami iš kliento artefaktų.
- [x] Pataisyti serverio dev paveikslėlių kelią: `IMAGES_DIR` nustatomas per
      `.env`, o Docker Compose perduoda `/app/data/images`.
- [x] Priverstinai, be Turbo cache, patikrinti root `pnpm build` ir
      `pnpm check`.
- [x] Susiaurinti root `version` hook'ą: jis stage'ina tik
      `docker/compose.yaml`.
- [x] Sukurti ir paleisti production Docker image su read-only paveikslėlių
      volume; patikrinti `/images` ir CSP inline-script hash'ą.
- [x] Įvesti common package ribą: client ir server importuoja bendrą kodą per
      `@rusys/common/*`, o ne per `~/common/*` alias.
- [x] Atnaujinti GitHub Actions CI: jis naudoja užrakintą dependency diegimą
      ir vykdo root `pnpm build` bei `pnpm check`.

## Likę darbai

Privalomų migracijos darbų nebeliko. Ateityje `@rusys/common` galima dar
susiaurinti iki kelių ranka parinktų entry pointų, jei reikės paslėpti dalį
`utils/*` modulių. Šiandien visi bendro kodo moduliai yra sąmoningai prieinami
per `@rusys/common/*`.

## Priėmimo kriterijai

| Kriterijus                                                           | Būsena                                                 |
| -------------------------------------------------------------------- | ------------------------------------------------------ |
| Root `pnpm lint`, `pnpm lint:ts`, `pnpm format:check`                | Įgyvendinta ir patikrinta                              |
| Client, server ir common paketų `lint:ts`, `lint:ox`, `format:check` | Įgyvendinta ir patikrinta                              |
| `@rusys/common` testai be MongoDB                                    | Įgyvendinta ir patikrinta                              |
| Client ir server dev/build/check atskirai                            | Įgyvendinta ir patikrinta                              |
| Root `pnpm build` ir `pnpm check`                                    | Įgyvendinta ir priverstinai patikrinta be Turbo cache  |
| Produkcinis Docker image, statiniai failai ir CSP                    | Įgyvendinta ir patikrinta su lokaliu production image  |
| Client/server common importų package riba                            | Įgyvendinta ir patikrinta su client bei server testais |
