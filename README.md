# RUSIO PROGRAMELE

## Diegimo grąžinimas

Kiekvienas `pnpm deploy` prieš įkeldamas naujus failus serveryje išsaugo šiuo metu veikiančią versiją į `.deploy-backup` (arba `BACKUP_PATH`). Pirmas monorepo deploy taip pat išsaugo ankstesnę vieno containerio struktūrą. Jei diegimą reikia atšaukti, vykdykite:

```sh
pnpm deploy:rollback
```

Komanda atstato ankstesnio release struktūrą ir perstato jos containerius. Ji veikia tik po bent vieno diegimo su šia atsarginių kopijų logika.
