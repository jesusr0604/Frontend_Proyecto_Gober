import Head from "next/head";
import { useState } from "react";
import styles from "@/styles/Ticket.module.css";

export default function Home() {
  const [asunto, setAsunto]   = useState("");
  const [imagen, setImagen]   = useState(null);
  const [preview, setPreview] = useState(null);
  const [estado, setEstado]   = useState(null); // { tipo: "exito"|"error", mensaje: "" }
  const [enviando, setEnviando] = useState(false);

  function handleImagen(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImagen(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setEstado(null);

    if (!asunto.trim()) {
      setEstado({ tipo: "error", mensaje: "El asunto es obligatorio." });
      return;
    }

    setEnviando(true);

    try {
      const res = await fetch("/api/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: asunto.trim(),
          description: imagen ? `Adjunto: ${imagen.name}` : "",
          priority_id: 2,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al enviar");
      }

      const data = await res.json();
      const id = data?.issue?.id ? ` (ID #${data.issue.id})` : "";
      setEstado({ tipo: "exito", mensaje: `Ticket enviado correctamente${id}.` });
      setAsunto("");
      setImagen(null);
      setPreview(null);
    } catch (err) {
      setEstado({ tipo: "error", mensaje: err.message || "No se pudo enviar el ticket. Intenta de nuevo." });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <Head>
        <title>Sistema de Tickets</title>
        <meta name="description" content="Envío de tickets a Redmine" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.header}>
            <span className={styles.headerTitle}>Nuevo Ticket</span>
            <span className={styles.badge}>Redmine</span>
          </div>

          <form className={styles.body} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="asunto">
                Asunto <span className={styles.required}>*</span>
              </label>
              <input
                id="asunto"
                type="text"
                className={styles.input}
                placeholder="Describe brevemente el problema…"
                value={asunto}
                onChange={(e) => setAsunto(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Captura de pantalla</label>
              <label className={styles.dropZone} htmlFor="imagen">
                {preview ? (
                  <img src={preview} alt="Vista previa" className={styles.preview} />
                ) : (
                  <>
                    <span className={styles.dropIcon}>📎</span>
                    <span className={styles.dropText}>Haz clic para seleccionar una imagen</span>
                    <span className={styles.dropHint}>PNG, JPG, GIF — máximo 5 MB</span>
                  </>
                )}
                {imagen && <span className={styles.fileName}>{imagen.name}</span>}
              </label>
              <input
                id="imagen"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImagen}
              />
            </div>

            {estado && (
              <p className={estado.tipo === "exito" ? styles.msgExito : styles.msgError}>
                {estado.mensaje}
              </p>
            )}

            <button type="submit" className={styles.btn} disabled={enviando}>
              {enviando ? "Enviando…" : "Enviar Ticket"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
