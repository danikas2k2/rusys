# RUSIO PROGRAMELE

## Diegimo grąžinimas

Kiekvienas `pnpm deploy` prieš įkeldamas naujus failus serveryje išsaugo šiuo metu veikiančią versiją į `.deploy-backup`. Jei diegimą reikia atšaukti, vykdykite:

```sh
pnpm deploy:rollback
```

Komanda atstato ankstesnius `dist/`, `compose.yaml` ir `Dockerfile` failus bei perstato konteinerį. Ji veikia tik po bent vieno diegimo su šia atsarginių kopijų logika.
