const http = require("http");
const { WebSocketServer } = require("ws");

const PORT = process.env.PORT || 3001;

// เก็บ session ผู้เข้าชม: socketId -> { page, connectedAt }
const viewers = new Map();
// เก็บ history 30 นาที (อัปเดตทุก 1 นาที)
const history = Array(30).fill(0);
let historyTimer = null;

// --- HTTP server (สำหรับ /viewers REST fallback) ---
const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  if (req.url === "/viewers" && req.method === "GET") {
    res.end(JSON.stringify(buildPayload()));
  } else if (req.url === "/health") {
    res.end(JSON.stringify({ ok: true }));
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: "not found" }));
  }
});

// --- WebSocket server ---
const wss = new WebSocketServer({ server });

let idCounter = 0;
function nextId() { return `v_${++idCounter}`; }

function buildPayload() {
  return {
    count: viewers.size,
    history: [...history],
    updatedAt: Date.now(),
  };
}

function broadcast() {
  const msg = JSON.stringify({ type: "update", data: buildPayload() });
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(msg);
  });
}

wss.on("connection", (ws, req) => {
  const id = nextId();
  const page = new URL(req.url || "/", `http://localhost`).searchParams.get("page") || "/";

  viewers.set(id, { page, connectedAt: Date.now() });
  broadcast();

  // ส่งข้อมูลเริ่มต้นให้ client ใหม่
  ws.send(JSON.stringify({ type: "init", id, data: buildPayload() }));

  ws.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw);
      // client อาจส่ง { type: "ping" } เพื่อ keep-alive
      if (msg.type === "ping") ws.send(JSON.stringify({ type: "pong" }));
    } catch (_) {}
  });

  ws.on("close", () => {
    viewers.delete(id);
    broadcast();
  });

  ws.on("error", () => {
    viewers.delete(id);
  });
});

// อัปเดต history ทุก 1 นาที
historyTimer = setInterval(() => {
  history.shift();
  history.push(viewers.size);
  broadcast();
}, 60 * 1000);

server.listen(PORT, () => {
  console.log(`✅ Viewer server running on http://localhost:${PORT}`);
  console.log(`   WebSocket: ws://localhost:${PORT}`);
  console.log(`   REST:      GET http://localhost:${PORT}/viewers`);
});
