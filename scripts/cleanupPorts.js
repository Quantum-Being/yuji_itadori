#!/usr/bin/env node
import { execSync } from "child_process";
import net from "net";
import os from "os";

const ports = [
  Number(process.env.EAGLER_PROXY_PORT || process.env.PORT || 8080),
  Number(process.env.EAGLER_PROXY_INTERNAL_PORT || process.env.INTERNAL_PORT || 25569),
].filter((port) => Number.isInteger(port) && port > 0 && port < 65536);

function isPortOpen(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", (err) => {
      server.close();
      resolve(err.code !== "EADDRINUSE");
    });
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port, "127.0.0.1");
  });
}

function killPort(port) {
  const platform = os.platform();
  try {
    if (platform === "win32") {
      const result = execSync(`netstat -ano | findstr ":${port} ";`, {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "ignore"],
      });
      const lines = result.split(/\r?\n/).filter(Boolean);
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== "0") {
          execSync(`taskkill /PID ${pid} /F`, { stdio: ["ignore", "ignore", "ignore"] });
        }
      }
    } else {
      try {
        const pidList = execSync(`lsof -ti tcp:${port}`, {
          encoding: "utf8",
          stdio: ["pipe", "pipe", "ignore"],
        })
          .trim()
          .split(/\r?\n/)
          .filter(Boolean);
        for (const pid of pidList) {
          if (pid) execSync(`kill -9 ${pid}`, { stdio: ["ignore", "ignore", "ignore"] });
        }
      } catch (_err) {
        try {
          execSync(`fuser -k ${port}/tcp`, { stdio: ["ignore", "ignore", "ignore"] });
        } catch (_) {
          // ignore errors; this is a best-effort cleanup
        }
      }
    }
  } catch (_err) {
    // ignore errors; this is a best-effort cleanup
  }
}

(async () => {
  for (const port of ports) {
    try {
      const free = await isPortOpen(port);
      if (!free) {
        console.log(`Port ${port} is busy; attempting to clear it before proxy startup...`);
        killPort(port);
        const stillFree = await isPortOpen(port);
        if (!stillFree) {
          console.warn(`Port ${port} is still busy after cleanup attempt. This may prevent startup.`);
        } else {
          console.log(`Port ${port} is now free.`);
        }
      }
    } catch (err) {
      console.warn(`Could not verify port ${port}: ${err}`);
    }
  }
})();
