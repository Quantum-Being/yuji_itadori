export const config = {
  bindInternalServerPort: Number(
    process.env.EAGLER_PROXY_INTERNAL_PORT || process.env.INTERNAL_PORT || 25569
  ),
  bindInternalServerIp: process.env.EAGLER_PROXY_INTERNAL_IP || "127.0.0.1",
  allowCustomPorts: true,
};
