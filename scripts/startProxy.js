#!/usr/bin/env node
import net from "net";
import { spawn } from "child_process";

function testPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => {
      resolve(false);
    });
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port, "127.0.0.1");
  });
}

async function choosePort(preferred, fallbacks) {
  if (await testPort(preferred)) return preferred;
  for (const port of fallbacks) {
    if (await testPort(port)) return port;
  }
  throw new Error(`No available port found for preferred port ${preferred}`);
}

(async () => {
  const preferredProxyPort = Number(process.env.EAGLER_PROXY_PORT || process.env.PORT || 8080);
  const preferredInternalPort = Number(
    process.env.EAGLER_PROXY_INTERNAL_PORT || process.env.INTERNAL_PORT || 25569
  );

  const proxyPort = await choosePort(preferredProxyPort, [8081, 8082, 8083, 8084, 8085]);
  const internalPort = await choosePort(preferredInternalPort, [25570, 25571, 25572, 25573, 25574, 25575, 25576, 25577, 25578, 25579]);

  if (proxyPort !== preferredProxyPort) {
    console.log(`Preferred proxy port ${preferredProxyPort} was busy; using ${proxyPort} instead.`);
  }
  if (internalPort !== preferredInternalPort) {
    console.log(`Preferred internal port ${preferredInternalPort} was busy; using ${internalPort} instead.`);
  }

  const env = {
    ...process.env,
    EAGLER_PROXY_PORT: String(proxyPort),
    EAGLER_PROXY_INTERNAL_PORT: String(internalPort),
  };

  const proc = spawn("node", ["build/index.js"], {
    stdio: "inherit",
    env,
  });

  proc.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
    } else {
      process.exit(code ?? 0);
    }
  });
})();
