# Monorepo migracijos planas

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
    - 'src/*'
```

Tai yra workspace paketai, ne npm publikuojamos bibliotekos.

## Priklausomybių taisyklės

```text
client ──> common
server ──> common
```

- `client` ir `server` negali importuoti vienas kito.
- Abu priklauso nuo viešo `@rusys/common` API.
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
        ".": "./index.ts"
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

Šaltinio kodas išlaiko esamą alias sintaksę:

```ts
import type { Product } from '~/common/data';
import { getAmountTotals } from '~/common/utils/amounts';
```

`@rusys/common` lieka workspace paketo vardas `package.json`
priklausomybėse. Turbo iš jo mato priklausomybių grafiką: pakeitus `common`,
bus perskaičiuotos tik nuo jo priklausomos kliento ir serverio užduotys.

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
        "typecheck": "...",
        "test": "...",
        "check": "pnpm lint && pnpm typecheck && pnpm test"
    }
}
```

Šakninės komandos:

```json
{
    "scripts": {
        "dev": "turbo dev --parallel",
        "build": "turbo build",
        "check": "turbo check",
        "check:client": "turbo check --filter=@rusys/client",
        "check:server": "turbo check --filter=@rusys/server"
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

Pradinis `turbo.json`:

```json
{
    "$schema": "https://turbo.build/schema.json",
    "tasks": {
        "build": {
            "dependsOn": ["^build"],
            "cache": false
        },
        "check": {
            "dependsOn": ["^build"],
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
3. Lokalūs `dev`, `test`, `lint` ir `typecheck` lieka nepriklausomi.

Vėliau klientą galima deploy'inti į CDN arba nginx, o serverį palikti tik API.
Tai leistų visiškai nepriklausomus release'us, bet nėra pirmos migracijos
reikalavimas.

## Migracijos etapai

1. Įtraukti Turborepo ir `pnpm-workspace.yaml` nurodyti `src/*`, nekeičiant
   esamų šaltinių, Docker ar infrastruktūros vietos.
2. Pridėti `package.json` ir paketo kataloge esančius Vite, Vitest, Stylelint bei
   TypeScript nustatymus `src/client`; paketo `tsconfig.json` išlaiko tik tam paketui reikalingą
   TypeScript konfigūraciją; patikrinti kliento `dev`, `build`, `check`.
3. Pridėti `package.json` ir atskirus serverio nustatymus `src/server`;
   išlaikyti dabartinį Docker image ir CSP generavimą bei patikrinti serverio
   `dev`, `build`, `check`.
4. Pridėti `package.json` į `src/common`, perkelti į jį API DTO ir bendrus
   tipus bei apibrėžti jo viešus eksportus.
5. Atnaujinti šakninius lint, format, test ir deploy skriptus bei Docker build
   context'us.

## Priėmimo kriterijai

- `pnpm build` ir `pnpm check` veikia iš šaknies.
- `pnpm --filter @rusys/client {build,check}` veikia be serverio paleidimo.
- `pnpm --filter @rusys/server {build,check}` veikia be kliento dev serverio.
- `pnpm --filter @rusys/common test` vykdo bendro kodo testus be MongoDB.
- Pakeitus `common` arba `types`, Turbo perskaičiuoja tik nuo jų priklausomas
  užduotis.
- Produkcinis Docker build išlieka funkcinis ir turi galiojančią CSP politiką.
