// This folder contains options for both the bridge and networking adapter.
// Environment files and .env files are available here. Set the value of any config option to process.env.<ENV name>

import { Config } from "./launcher_types.js";

export const config: Config = {
  bridge: {
    enabled: false,
    motd: null,
  },
  adapter: {
    name: "EaglerProxy",
    bindHost: process.env.EAGLER_PROXY_HOST || "0.0.0.0",
    bindPort: Number(process.env.EAGLER_PROXY_PORT || process.env.PORT || 8080),
    maxConcurrentClients: 20,
    skinUrlWhitelist: undefined,
    motd: true
      ? "FORWARD"
      : {
          iconURL: "logo.png",
          l1: "yes",
          l2: "no",
        },
    origins: {
      allowOfflineDownloads: true,
      originWhitelist: null,
      originBlacklist: null,
    },
    server: {
      host: "yuji_itadori.aternos.me",
      port: 30119,
    },
    tls: undefined,
  },
};
