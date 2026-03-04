import RPC from "bare-rpc";
import { connect } from "@algosail/bare-app/client";

import "./style.css";

const stream = connect();
const rpc = new RPC(stream);

const app = document.getElementById("app");

const title = document.createElement("h1");
title.textContent = "BARE APP!!";
app.appendChild(title);

const stats = document.createElement("div");
stats.className = "stats";
stats.innerHTML = `
  <div class="stat">
    <span class="label">session</span>
    <span class="value" id="session">—</span>
  </div>
  <div class="stat">
    <span class="label">total</span>
    <span class="value" id="total">—</span>
  </div>
  <div class="stat">
    <span class="label">uptime</span>
    <span class="value" id="uptime">—</span>
  </div>
`;
app.appendChild(stats);

const btn = document.createElement("button");
btn.textContent = "click";
btn.className = "btn";
btn.disabled = true;
app.appendChild(btn);

const log = document.createElement("div");
log.className = "log";
app.appendChild(log);

function setError(msg) {
  btn.disabled = true;
  const entry = document.createElement("div");
  entry.className = "log-entry";
  entry.style.color = "red";
  entry.textContent = msg;
  log.prepend(entry);
}

// Enable button once WebSocket/RPC is open
stream.once("open", () => {
  btn.disabled = false;
});
stream.once("error", (err) => {
  setError("WebSocket error: " + err.message);
});
stream.once("close", () => {
  setError("WebSocket closed");
});

btn.addEventListener("click", async () => {
  btn.disabled = true;
  try {
    const req = rpc.request(1);
    req.send("click");
    const raw = await req.reply();
    const data = JSON.parse(new TextDecoder().decode(raw));

    document.getElementById("session").textContent = data.session;
    document.getElementById("total").textContent = data.total;
    document.getElementById("uptime").textContent = `${data.uptime}s`;

    const entry = document.createElement("div");
    entry.className = "log-entry";
    entry.textContent = `→ bare replied: session=${data.session} total=${data.total} uptime=${data.uptime}s`;
    log.prepend(entry);
  } catch (e) {
    setError("RPC error: " + (e?.message || e));
  }
  btn.disabled = false;
});
