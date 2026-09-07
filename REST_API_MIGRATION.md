# REST API migracijos planas

## Tikslas

Pakeisti dabartinę API, kurioje visi veiksmai kviečiami `POST` į veiksmažodžiu
pavadintus kelius, į versijuotą REST API. Naujoji API bus pasiekiama per
`/api/v1`, naudos HTTP metodų semantiką, resursų URL ir standartinius HTTP
statusus.

Migracija turi leisti serverį ir klientą deploy'inti atskirai. Kol klientas
neperjungtas, serveris palaiko senus maršrutus; galutinėje būsenoje jie
pašalinami.

## Dabartinė būsena

- `src/server/app.ts` registruoja kiekvieną `ApiUrlHandlers` įrašą tik per
  `app.post(...)`.
- `src/common/api.ts` aprašo 37 dabartinius URL ir jų DTO.
- `src/client/state/common/useApiRequest.ts` numatytasis metodas yra `POST`.
- Nginx ir Vite dev proxy šiuo metu išvardija kiekvieną API kelio pradžią.
- `ApiResult` klaidas perduoda per `{ ok: false, error }`, dažniausiai su HTTP
  `200`, todėl klientas negali remtis HTTP statusais.

## Principai

- Visos naujos užklausos prasideda `/api/v1`.
- Kolekcija yra daugiskaita: `/products`, `/groups`, `/variants`,
  `/user-profiles`.
- Skaitymui naudojamas `GET`, kūrimui `POST`, daliniam pakeitimui `PATCH`,
  pilnam idempotentiškam pakeitimui `PUT`, šalinimui `DELETE`.
- Vartotojo įvestos `group`, `name` ir `variant` reikšmės URI segmente visada
  koduojamos su `encodeURIComponent`; URL nekonstruojami ranka komponentuose.
- Kiekvienas klaidos atsakymas turi vienodą formą:

    ```json
    {
        "error": {
            "code": "VALIDATION_ERROR",
            "message": "year must be a number"
        }
    }
    ```

- `400` naudojamas netaisyklingai užklausai, `401` neprisijungusiam,
  `403` neleistinam vartotojui, `404` nerastam resursui, `409` konfliktui ir
  `422` semantiškai netinkamam, bet sintaksiškai galiojančiam pakeitimui.
- Sėkmingas `GET` atsako `200`, `POST` kuriantis resursą — `201`, sėkmingas
  `DELETE` — `204` arba `200`, jei reikia grąžinti atnaujintą agregatą.

## Cache politika

Pirmoje v1 versijoje visi `/api/v1` atsakymai, įskaitant `GET`, siunčia esamą
antraštę:

```http
Cache-Control: no-cache, no-store, must-revalidate
```

Ją reikia nustatyti viename `/api/v1` router middleware, o ne kartoti
kiekviename handleryje. Taip `GET /products`, `/groups`, `/summary`, profiliai,
istorija, exportas ir visi mutation atsakymai negali būti panaudoti iš
naršyklės, NAS Web Portal ar kito tarpinio cache. `GET` pasirenkamas dėl
semantikos, URL, observability ir HTTP įrankių suderinamumo, ne dėl cache.

Nereikia pasikliauti tuo, kad `PUT`, `PATCH` ar `DELETE` invalidaus cache:
HTTP cache privalo invaliduoti tik pačios mutation užklausos target URI, o ne
susijusias kolekcijas, suvestines ar istoriją. Tai neužtikrintų šviežių
`/products` ir `/summary` atsakymų.

Vėliau cache galima įjungti tik atskiram endpointui, turint testais padengtą
invalidation modelį:

- `GET /auth/google-client-id` gali turėti trumpą `public, max-age` laiką, jei
  atsakymas nėra susietas su vartotoju.
- Vartotojui ar leidimams priklausantys atsakymai turi likti `no-store` arba
  naudoti `private` ir atitinkamą `Vary` antraštę.
- Collections ir summary gali naudoti `ETag` bei `If-None-Match` tik tada, kai
  mutation atsakymai ir client state aiškiai invalidoja priklausomus resursus.
- `/images/` lieka atskira Nginx proxy taisyklė; jos cache politika sprendžiama
  atskirai, kai vaizdų URL tampa nekintami arba versijuoti.

## Siūlomas v1 resursų žemėlapis

| Dabartinis kelias                                                                 | v1 metodas ir kelias                                                   | Pastaba                                                                                                                      |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `POST /clientId`                                                                  | `GET /api/v1/auth/client-id`                                           | Grąžina Google OAuth client ID.                                                                                              |
| `POST /checkUser`                                                                 | `GET /api/v1/access?email=`                                            | Pereinamasis kelias; vėliau autorizaciją perkelti į patvirtinto ID tokeno middleware.                                        |
| `POST /userProfiles`                                                              | `GET /api/v1/user-profiles?email=`                                     | Keli el. paštai perduodami pakartotais `email` query parametrais.                                                            |
| `POST /userProfile/upsert`                                                        | `PUT /api/v1/user-profiles/:email`                                     | Body turi `name` ir `picture`; `email` yra URI.                                                                              |
| `POST /groups`                                                                    | `GET /api/v1/groups`                                                   | Grąžina grupių kolekciją.                                                                                                    |
| `POST /groups/update`, `/groups/rename`                                           | `PATCH /api/v1/groups/:group`                                          | Body gali keisti `name`, `annual`, `review`, `image`.                                                                        |
| `POST /groups/delete`                                                             | `DELETE /api/v1/groups/:group`                                         |                                                                                                                              |
| `POST /groups/reorder`                                                            | `PUT /api/v1/groups/order`                                             | Tvarkos resursas, body — grupių tvarka.                                                                                      |
| `POST /variants`                                                                  | `GET /api/v1/variants`                                                 | Prireikus filtruojama `?group=`.                                                                                             |
| `POST /variants/update`, `/variants/rename`                                       | `PATCH /api/v1/groups/:group/variants/:variant`                        | Body gali keisti `name`, `order`, `suffix`, `count`, `units`.                                                                |
| `POST /variants/delete`                                                           | `DELETE /api/v1/groups/:group/variants/:variant`                       |                                                                                                                              |
| `POST /variants/copy`                                                             | `POST /api/v1/groups/:group/variants/:variant/copies`                  | Body nurodo paskirties grupę ir pavadinimą.                                                                                  |
| `POST /variants/reorder`                                                          | `PUT /api/v1/groups/:group/variants/order`                             | Tvarkos resursas.                                                                                                            |
| `POST /products`                                                                  | `GET /api/v1/products`                                                 | Tik produktų kolekcija; grupės, variantai ir metai gaunami per savo `GET` resursus.                                          |
| `POST /products/add`                                                              | `POST /api/v1/products`                                                | Kuria produktą.                                                                                                              |
| `POST /products/rename`, `/products/move`, `/products/parent`, `/products/expiry` | `PATCH /api/v1/groups/:group/products/:name`                           | Body keičia produkto laukus, įskaitant `group`, `name`, `parent`, `expiryToleranceDays`.                                     |
| `POST /products/delete`                                                           | `DELETE /api/v1/groups/:group/products/:name`                          |                                                                                                                              |
| `POST /products/missing`                                                          | `PATCH /api/v1/groups/:group/products/:name`                           | Body: `{ "missing": true }`.                                                                                                 |
| `POST /products/missing/bulk`                                                     | `PATCH /api/v1/groups/:group/products/review-statuses`                 | Batch pakeitimas vienoje grupėje; body `updates` masyve nurodo kiekvieno produkto `name` ir `missing`.                       |
| `POST /products/image`                                                            | `PUT /api/v1/groups/:group/products/:name/image`                       | Produkto vaizdo resursas.                                                                                                    |
| `POST /products/image/variant`                                                    | `PUT /api/v1/groups/:group/products/:name/variants/:variant/image`     | Varianto vaizdo resursas.                                                                                                    |
| `POST /products/amounts`                                                          | `PUT /api/v1/groups/:group/products/:name/years/:year/amounts`         | Body: amounts, user ir comment.                                                                                              |
| `POST /products/removing`                                                         | `PATCH /api/v1/groups/:group/products/:name/years/:year`               | Body: `{ "removing": true }`.                                                                                                |
| `POST /products/history`                                                          | `GET /api/v1/groups/:group/products/:name/years/:year/history`         | Produkto metų istorija.                                                                                                      |
| `POST /products/recycle`                                                          | `POST /api/v1/groups/:group/products/:name/years/:year/amount-history` | Sukuria produkto metų istorijos įrašą, perkeliantį sunaudotą kiekį į `recycled`; body nurodo `variant`, `amount` ir flag'us. |
| `POST /summary`                                                                   | `GET /api/v1/summary`                                                  | Suvestinė yra read-only resursas.                                                                                            |
| `POST /summary/history`                                                           | `GET /api/v1/groups/:group/products/:name/years/:year/summary-history` |                                                                                                                              |
| `POST /export`                                                                    | `GET /api/v1/exports/latest`                                           | Atsako ZIP failu.                                                                                                            |
| `POST /import`                                                                    | `POST /api/v1/imports`                                                 | Priima `multipart/form-data` su `import` failu.                                                                              |

### Amount undo ir redo

`/products/amounts/undo` bei `/products/amounts/redo` šiandien valdo vidinius
istorijos stack'us. Jų negalima tiesiog pervadinti į `POST /undo` ir vadinti
REST API. Prieš implementaciją reikia parinkti vieną modelį:

1. kiekvieną amount pakeitimą laikyti identifikuotu `amount-revision` resursu;
   `POST` kuria reviziją, `DELETE` ją atšaukia, o atšaukto resurso grąžinimas
   yra nauja revizija;
2. palikti aiškiai dokumentuotą operacijų subresursą
   `POST .../amount-history/undo` ir `POST .../amount-history/redo`.

Pirmenybė teikiama pirmajam variantui, nes jis suteikia stabilų istorijos ID,
auditą ir natūralią HTTP semantiką. Sprendimą reikia priimti prieš keičiant
esamą `handleUndoProduct` ir `handleRedoProduct` elgesį.

## Įgyvendinimo etapai

### 1. Kontraktas ir bazinė infrastruktūra

1. Sukurti `src/common/api/v1/` su endpoint builderiais, request/response DTO
   ir vienodu `ApiError` tipu.
2. Parašyti OpenAPI 3.1 dokumentą `docs/openapi/v1.yaml`; jis yra vienintelis
   viešo HTTP kontrakto šaltinis.
3. Pakeisti `run()` arba sukurti HTTP klaidų middleware, kad handleriai grąžintų
   teisingus HTTP statusus, o ne `ok: false` su `200`.
4. Įvesti Express `Router` po `/api/v1`; suskirstyti į `auth`, `profiles`,
   `groups`, `variants`, `products`, `summary`, `imports` ir `exports` modulius.
5. Router lygyje nustatyti `Cache-Control: no-cache, no-store, must-revalidate`
   visiems v1 atsakymams, įskaitant klaidas ir failų export.
6. Pridėti parametrų ir body validaciją prieš kviečiant data sluoksnį. Esamas
   `ajv` naudojamas bendroms schemoms, o klaidos verčiamos į `400` arba `422`.

### 2. Read-only maršrutai

1. Įgyvendinti `GET` auth metaduomenų, groups, variants, products, summary,
   history ir export maršrutus.
2. Išskaidyti dabartinį `getProductsWithGroups()` agregatą: klientas pradiniam
   state įkėlimui lygiagrečiai prašo `/products`, `/groups` ir `/variants`.
   Produktams skirti metai lieka `/products` atsakyme, o suvestinės metai —
   `/summary` atsakyme, nes jų skaičiavimo taisyklės skiriasi.
3. Pakeisti `useApiRequest` į aiškų klientą, kuriam kiekvienas endpoint
   perduoda metodą, path parametrus, query ir body atskirai; `GET` body
   nesiunčiamas.
4. Pridėti Supertest kontrakto testus kiekvienam read-only maršrutui, įskaitant
   statusus, query validaciją ir `Cache-Control` elgesį.

### 3. Grupės, variantai ir profiliai

1. Pridėti `PUT`, `PATCH` ir `DELETE` maršrutus groups, variants ir
   user-profiles resursams.
2. Perkelti esamus handlerius į mažus adapterius: router iš URI ir body sukuria
   dabartinį data sluoksnio kvietimą; data logika iš pradžių nekeičiama.
3. Client hooks perrašyti po vieną resursų šeimą ir kartu atnaujinti jų testus.

### 4. Produktai, media ir istorija

1. Įgyvendinti produkto CRUD, product patch, metų amounts, review būsenas,
   image resursus ir history maršrutus.
2. Priimti amount revision sprendimą ir perkelti undo/redo semantiką.
3. Užtikrinti, kad `group` arba `name` pervadinimas/move yra atominis ir
   konfliktams grąžina `409`.

### 5. Importas, eksportas ir autorizacija

1. Perkelti ZIP export į `GET /exports/latest` ir importą į `POST /imports`.
2. Google ID tokeną tikrinti serveryje; `GET /access?email=` po migracijos
   pašalinti arba palikti tik administraciniam diagnostikos tikslui.
3. Nustatyti autorizacijos middleware pagal resurso veiksmą: read, write,
   import ir export.

### 6. Proxy, suderinamumas ir pašalinimas

1. Nginx production konfigūracijoje vietoje atskirų API regex kelių proxy'inti
   vieną `location ^~ /api/` į `rusys-server:3000`.
2. Vite dev proxy pakeisti į `/api` ir palikti `/images/` atskirai.
3. Serverį deploy'inti pirmą: jis laikinai priima tiek legacy `POST` kelius,
   tiek `/api/v1`.
4. Client perjungti į v1 ir deploy'inti atskirai. Stebėti 4xx/5xx, importą,
   eksportą, upload, image prieigą ir undo/redo.
5. Po sutarto bent vieno pilno release ciklo pašalinti `ApiUrl`, senus handler
   registravimus, legacy DTO bei senų URL testus. Tada Nginx ir Vite palieka
   tik `/api/` proxy taisyklę.

## Testavimas ir priėmimo kriterijai

- OpenAPI dokumentas aprašo kiekvieną viešą v1 maršrutą, metodą, parametrą,
  body, atsakymą ir klaidą.
- Kiekvienas maršrutas turi Supertest testus sėkmei, validation klaidai,
  neegzistuojančiam resursui ir neleistinam vartotojui.
- Kiekvienas v1 `GET` ir mutation atsakymas turi
  `Cache-Control: no-cache, no-store, must-revalidate`; testas patvirtina, kad
  Nginx šios antraštės nekeičia.
- Client hook testai tikrina metodą, URL, URL-encoded parametrus, query ir body.
- Integracinis testas patvirtina Nginx `/api/` ir `/images/` proxy.
- `pnpm build`, `pnpm check`, client ir server testai praeina be legacy URL.
- Paskutinis deploymentas nebeturi jokių užklausų į senus root lygio API kelius.
