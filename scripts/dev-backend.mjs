import http from "node:http";

const PORT = Number(process.env.PORT || 8955);
const HOST = process.env.HOST || "0.0.0.0";

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  if (req.url === "/health") {
    res.writeHead(200);
    res.end(
      JSON.stringify({
        ok: true,
        service: "backend",
        port: PORT,
      }),
    );
    return;
  }

  res.writeHead(200);
  res.end(
    JSON.stringify({
      message: "Backend dev server is running",
      health: "/health",
    }),
  );
});

server.listen(PORT, HOST, () => {
  console.log(`Backend listening on http://${HOST}:${PORT}`);
});
