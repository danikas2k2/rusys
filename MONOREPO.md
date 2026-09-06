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

`client` ir `server` dabar deploy'inami nepriklausomai, todėl jų release'ai
atskirti pagal artefaktą ir Docker servisą. Paketai išlieka `private`, taigi
`0.0.0` nėra vieša semver sutartis; Docker image etiketę kol kas žymi bendra
šakninio produkto versija. Jei reikės atskirų vartotojui matomų versijų,
kitame etape galima įvesti Changesets arba du nepriklausomus release numerius.

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

`build` cache paliekamas išjungtas, nes abiejų build artefaktai rašomi į bendrą
šakninį `dist/`, tik į atskirus `client/` ir `server/` katalogus. Klientas ir
serveris nebepriklauso vienas nuo kito: kiekvienas gali būti surenkamas ir
deploy'inamas atskirai.

## Deploy ir Docker sprendimas

Produkcinį leidimą sudaro du vidiniai Docker containeriai, be išorinio CDN:

```text
naršyklė ──HTTPS──> rusys-client (Nginx) ──vidinis Docker tinklas──> rusys-server (Express)
                          │                                              │
                          └─ dist/client                                 └─ dist/server + images volume
```

Compose faile nurodytas `name: rusys-app`, todėl Docker ir Synology Container
Manager visus servisus rodo tame pačiame `rusys-app` projekte, nepriklausomai
nuo to, kad Compose failas laikomas `docker/` kataloge.

- `rusys-client` pateikia `dist/client` statinius failus, TLS ir saugumo
  antraštes; jis išorėje išlaiko esamus `3000` (HTTP) bei `4000` (HTTPS) portus.
  Jo certifikatų volume turi turėti `cert.pem` ir `privkey.pem` failus.
- Nginx persiunčia API ir `/images/` užklausas į vidinį `rusys-server:3000`.
  Naršyklei tai lieka tas pats origin, todėl CORS ir kliento URL keisti nereikia.
- `rusys-server` nėra publikuojamas per host portą. Jis turi tik API ir
  read-write `/app/data/images` volume.
- Kliento build sugeneruoja `dist/client/csp-hashes.conf`; Nginx jį įtraukia į
  CSP, todėl serverio build nebeskaito kliento artefaktų.

Release komandos:

```sh
pnpm deploy                         # vienas pilnas abiejų servisų release
pnpm --filter @rusys/client deploy  # tik client release
pnpm --filter @rusys/server deploy  # tik server release
pnpm --filter @rusys/client deploy:rollback # tik client rollback
pnpm --filter @rusys/server deploy:rollback # tik server rollback
pnpm deploy:rollback                        # pilnas abiejų servisų rollback
```

`deploy` yra pačių `@rusys/client` ir `@rusys/server` paketų komanda: ji
pirmiausia vykdo to paketo `check` bei `build`, tada per savo Vite deploy
konfigūraciją įkelia tik savo artefaktą ir perkrauna tik savo containerį.
Šakninis `deploy` yra atskiras pilno release kelias: jis patikrina bei surenka
visą repo, vienu veiksmu pakeičia visus artefaktus ir perkrauna visą Compose
aplikaciją.

Pilnas release sinchronizuoja visą `dist/`, kad pašalintų senos vieno
containerio schemos likučius. Dalinis release sinchronizuoja tik savo
`dist/client` arba `dist/server` katalogą ir nepakeičia kito serviso.

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
- [x] Atskirti build artefaktus į `dist/client` ir `dist/server`; serverio
      build nebepriklauso nuo client build.
- [x] Pataisyti serverio dev paveikslėlių kelią: `IMAGES_DIR` nustatomas per
      `.env`, o Docker Compose perduoda `/app/data/images`.
- [x] Priverstinai, be Turbo cache, patikrinti root `pnpm build` ir
      `pnpm check`.
- [x] Susiaurinti root `version` hook'ą: jis stage'ina tik
      `docker/compose.yaml`.
- [x] Sukurti atskirus Nginx client ir Node server Docker image; lokaliai
      patikrinti HTTPS, CSP ir `/images/` proxy tarp jų izoliuotame tinkle.
- [x] Įvesti common package ribą: client ir server importuoja bendrą kodą per
      `@rusys/common/*`, o ne per `~/common/*` alias.
- [x] Atnaujinti GitHub Actions CI: jis naudoja užrakintą dependency diegimą
      ir vykdo root `pnpm build` bei `pnpm check`.

## Likę darbai

- Prieš pirmą produkcinį release patikrinti nuotolinio serverio certifikatų ir
  `/volume1/docker/rusys-app/images` volume kelius.
- Jei reikės nepriklausomų matomų client/server versijų, įvesti Changesets arba
  atskirus release numerius. Tai nėra būtina nepriklausomam deploy.
- Ateityje `@rusys/common` galima dar susiaurinti iki kelių ranka parinktų
  entry pointų, jei reikės paslėpti dalį `utils/*` modulių.

## Priėmimo kriterijai

| Kriterijus                                                           | Būsena                                                 |
| -------------------------------------------------------------------- | ------------------------------------------------------ |
| Root `pnpm lint`, `pnpm lint:ts`, `pnpm format:check`                | Įgyvendinta ir patikrinta                              |
| Client, server ir common paketų `lint:ts`, `lint:ox`, `format:check` | Įgyvendinta ir patikrinta                              |
| `@rusys/common` testai be MongoDB                                    | Įgyvendinta ir patikrinta                              |
| Client ir server dev/build/check atskirai                            | Įgyvendinta ir patikrinta                              |
| Root `pnpm build` ir `pnpm check`                                    | Įgyvendinta ir priverstinai patikrinta be Turbo cache  |
| Atskiri client/server Docker image, HTTPS, `/images/` ir CSP         | Įgyvendinta ir patikrinta lokaliame Docker tinkle      |
| Client/server common importų package riba                            | Įgyvendinta ir patikrinta su client bei server testais |
