const REDMINE_URL = "http://127.0.0.1:3000";
const REDMINE_PROJECT = "gti-tickets";
const REDMINE_API_KEY = "c9e85cc5ea585dc5614d752613c4d3bd2964d813";

export default async function handler(req, res) {
  const headers = {
    "X-Redmine-API-Key": REDMINE_API_KEY,
    "Content-Type": "application/json",
  };

  // ── LISTAR TICKETS ──────────────────────────────────────────────────────────
  if (req.method === "GET" && !req.query.id) {
    try {
      const r = await fetch(
        `${REDMINE_URL}/projects/${REDMINE_PROJECT}/issues.json`,
        { headers }
      );
      const data = await r.json();
      return res.status(r.status).json(data);
    } catch {
      return res.status(500).json({ error: "No se pudo conectar con Redmine" });
    }
  }

  // ── VER UN TICKET ESPECÍFICO ────────────────────────────────────────────────
  if (req.method === "GET" && req.query.id) {
    try {
      const r = await fetch(
        `${REDMINE_URL}/issues/${req.query.id}.json`,
        { headers }
      );
      const data = await r.json();
      return res.status(r.status).json(data);
    } catch {
      return res.status(500).json({ error: "No se pudo conectar con Redmine" });
    }
  }

  // ── CREAR TICKET ────────────────────────────────────────────────────────────
  if (req.method === "POST") {
    const { subject, description, priority_id } = req.body;

    if (!subject || !subject.trim()) {
      return res.status(400).json({ error: "El asunto es obligatorio" });
    }

    try {
      const r = await fetch(
        `${REDMINE_URL}/projects/${REDMINE_PROJECT}/issues.json`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            issue: {
              subject: subject.trim(),
              description: description || "",
              priority_id: priority_id || 2,
            },
          }),
        }
      );
      const data = await r.json();
      return res.status(r.status).json(data);
    } catch {
      return res.status(500).json({ error: "No se pudo conectar con Redmine" });
    }
  }

  // ── ACTUALIZAR TICKET ───────────────────────────────────────────────────────
  if (req.method === "PUT") {
    const { id, subject, description, priority_id, status_id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Se requiere el ID del ticket" });
    }

    const issue = {};
    if (subject)     issue.subject     = subject;
    if (description) issue.description = description;
    if (priority_id) issue.priority_id = priority_id;
    if (status_id)   issue.status_id   = status_id;

    try {
      const r = await fetch(`${REDMINE_URL}/issues/${id}.json`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ issue }),
      });
      // Redmine responde 200 sin body en PUT exitoso
      if (r.status === 200 || r.status === 204) {
        return res.status(200).json({ ok: true });
      }
      const data = await r.json();
      return res.status(r.status).json(data);
    } catch {
      return res.status(500).json({ error: "No se pudo conectar con Redmine" });
    }
  }

  // ── ELIMINAR TICKET ─────────────────────────────────────────────────────────
  if (req.method === "DELETE") {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "Se requiere el ID del ticket" });
    }

    try {
      const r = await fetch(`${REDMINE_URL}/issues/${id}.json`, {
        method: "DELETE",
        headers,
      });
      if (r.status === 200 || r.status === 204) {
        return res.status(200).json({ ok: true });
      }
      return res.status(r.status).json({ error: "No se pudo eliminar" });
    } catch {
      return res.status(500).json({ error: "No se pudo conectar con Redmine" });
    }
  }

  return res.status(405).json({ error: "Método no permitido" });
}
