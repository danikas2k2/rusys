import { setup, startServers } from '~/server/app';

(async () => {
    startServers(setup());
})();
