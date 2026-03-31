import { useState, useEffect } from "react";

const STORAGE_KEY = "brunch-liste-2026";

const KATEGORIEN = [
  { label: "🥐 Backwaren", value: "backwaren" },
  { label: "🧀 Käse & Aufschnitt", value: "kase" },
  { label: "🥗 Salate & Gemüse", value: "salat" },
  { label: "🍓 Früchte", value: "fruchte" },
  { label: "🍳 Warmes", value: "warmes" },
  { label: "🥂 Getränke", value: "getranke" },
  { label: "🍰 Süsses", value: "susses" },
  { label: "🎁 Sonstiges", value: "sonstiges" },
];

const KAT_COLORS = {
  backwaren: "#c8956c",
  kase: "#d4a843",
  salat: "#7a9e7e",
  fruchte: "#d4706a",
  warmes: "#c0784a",
  getranke: "#6a8fad",
  susses: "#b87ab0",
  sonstiges: "#8a8a8a",
};

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function BrunchApp() {
  const [eintraege, setEintraege] = useState([]);
  const [name, setName] = useState("");
  const [was, setWas] = useState("");
  const [kat, setKat] = useState("backwaren");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [adminTap, setAdminTap] = useState(0);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const result = await window.storage.get(STORAGE_KEY, true);
      if (result?.value) {
        setEintraege(JSON.parse(result.value));
      }
    } catch {
      // leer
    }
    setLoading(false);
  }

  async function handleSubmit() {
    if (!name.trim() || !was.trim()) return;
    setSaving(true);
    const neuer = { id: generateId(), name: name.trim(), was: was.trim(), kat, zeit: Date.now() };
    const aktuell = [...eintraege, neuer];
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify(aktuell), true);
      setEintraege(aktuell);
      setWas("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (e) {
      alert("Fehler beim Speichern.");
    }
    setSaving(false);
  }

  async function handleDelete(id) {
    const neu = eintraege.filter(e => e.id !== id);
    await window.storage.set(STORAGE_KEY, JSON.stringify(neu), true);
    setEintraege(neu);
  }

  function handleTitleTap() {
    const n = adminTap + 1;
    setAdminTap(n);
    if (n >= 5) { setAdminMode(true); setAdminTap(0); }
  }

  const grouped = KATEGORIEN.map(k => ({
    ...k,
    items: eintraege.filter(e => e.kat === k.value),
  })).filter(k => k.items.length > 0);

  return (
    <div style={styles.body}>
      <div style={styles.grain} />

      <div style={styles.container}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.emojiRow} onClick={handleTitleTap}>
            🥐 ☕ 🍓 🧀 🥂
          </div>
          <h1 style={styles.h1}>Unser Brunch</h1>
          <p style={styles.subtitle}>Trag ein, was du mitbringst — damit wir alles haben! 🎉</p>
        </header>

        {/* Formular */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>✍️ Ich bringe mit…</h2>

          <div style={styles.formGroup}>
            <label style={styles.label}>Dein Name</label>
            <input
              style={styles.input}
              placeholder="z.B. Urs"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Was bringst du?</label>
            <input
              style={styles.input}
              placeholder="z.B. Gipfeli vom Bäcker"
              value={was}
              onChange={e => setWas(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Kategorie</label>
            <select
              style={styles.select}
              value={kat}
              onChange={e => setKat(e.target.value)}
            >
              {KATEGORIEN.map(k => (
                <option key={k.value} value={k.value}>{k.label}</option>
              ))}
            </select>
          </div>

          <button
            style={{
              ...styles.btn,
              opacity: (!name.trim() || !was.trim() || saving) ? 0.5 : 1,
              background: success ? "#7a9e7e" : "#8b5e3c",
            }}
            onClick={handleSubmit}
            disabled={!name.trim() || !was.trim() || saving}
          >
            {success ? "✓ Eingetragen!" : saving ? "Speichern…" : "Eintragen"}
          </button>
        </div>

        {/* Liste */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            🧺 Was kommt alles
            <span style={styles.badge}>{eintraege.length}</span>
          </h2>

          {loading && <p style={styles.hint}>Lädt…</p>}
          {!loading && eintraege.length === 0 && (
            <p style={styles.hint}>Noch nichts eingetragen — sei der Erste! 🙌</p>
          )}

          {grouped.map(gruppe => (
            <div key={gruppe.value} style={styles.gruppe}>
              <div style={{ ...styles.gruppeHeader, borderColor: KAT_COLORS[gruppe.value] }}>
                <span style={{ color: KAT_COLORS[gruppe.value], fontWeight: 700 }}>
                  {gruppe.label}
                </span>
              </div>
              {gruppe.items.map(item => (
                <div key={item.id} style={styles.eintrag}>
                  <div>
                    <span style={styles.eintragName}>{item.name}</span>
                    <span style={styles.eintragWas}>{item.was}</span>
                  </div>
                  {adminMode && (
                    <button style={styles.deleteBtn} onClick={() => handleDelete(item.id)}>✕</button>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        <p style={styles.footer}>🔄 Aktualisiert automatisch alle 8 Sekunden</p>
      </div>
    </div>
  );
}

const styles = {
  body: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #fdf6ec 0%, #f5e6d0 100%)",
    fontFamily: "'Nunito', 'Segoe UI', sans-serif",
    color: "#3a2a1a",
    position: "relative",
    overflowX: "hidden",
  },
  grain: {
    position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
    backgroundRepeat: "repeat", backgroundSize: "128px",
  },
  container: { maxWidth: 600, margin: "0 auto", padding: "2rem 1rem 4rem", position: "relative", zIndex: 1 },
  header: { textAlign: "center", marginBottom: "2rem" },
  emojiRow: { fontSize: "1.8rem", marginBottom: "0.5rem", cursor: "default", userSelect: "none" },
  h1: { fontFamily: "Georgia, serif", fontSize: "2.2rem", color: "#5c3d20", fontWeight: 600, lineHeight: 1.2 },
  subtitle: { marginTop: "0.5rem", color: "#c49a6c", fontSize: "1rem" },
  card: {
    background: "#fff9f2",
    borderRadius: 18,
    boxShadow: "0 4px 24px rgba(90,60,20,0.10), 0 1px 4px rgba(0,0,0,0.04)",
    padding: "1.6rem",
    marginBottom: "1.2rem",
  },
  cardTitle: { fontFamily: "Georgia, serif", fontSize: "1.15rem", color: "#5c3d20", marginBottom: "1.2rem", display: "flex", alignItems: "center", gap: "0.5rem" },
  formGroup: { marginBottom: "0.9rem" },
  label: { display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#8b5e3c", marginBottom: "0.3rem", textTransform: "uppercase", letterSpacing: "0.05em" },
  input: {
    width: "100%", padding: "0.7rem 1rem", border: "2px solid #f0dfc8", borderRadius: 10,
    fontFamily: "inherit", fontSize: "1rem", color: "#3a2a1a", background: "#fdf6ec",
    outline: "none", transition: "border-color 0.2s",
  },
  select: {
    width: "100%", padding: "0.7rem 1rem", border: "2px solid #f0dfc8", borderRadius: 10,
    fontFamily: "inherit", fontSize: "1rem", color: "#3a2a1a", background: "#fdf6ec",
    outline: "none", cursor: "pointer",
  },
  btn: {
    width: "100%", padding: "0.85rem", border: "none", borderRadius: 12,
    color: "#fff", fontFamily: "inherit", fontSize: "1rem", fontWeight: 700,
    cursor: "pointer", transition: "all 0.2s", marginTop: "0.3rem",
  },
  badge: {
    marginLeft: "auto", background: "#f0dfc8", color: "#8b5e3c",
    borderRadius: 20, padding: "0.1rem 0.6rem", fontSize: "0.85rem", fontWeight: 700,
  },
  hint: { color: "#c49a6c", textAlign: "center", padding: "1rem 0", fontSize: "0.95rem" },
  gruppe: { marginBottom: "1rem" },
  gruppeHeader: { borderLeft: "3px solid", paddingLeft: "0.6rem", marginBottom: "0.4rem", fontSize: "0.9rem" },
  eintrag: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "0.5rem 0.75rem", background: "#fdf6ec", borderRadius: 8, marginBottom: "0.3rem",
  },
  eintragName: { fontWeight: 700, marginRight: "0.5rem", color: "#5c3d20" },
  eintragWas: { color: "#7a6050", fontSize: "0.95rem" },
  deleteBtn: {
    background: "none", border: "none", color: "#c0615a", cursor: "pointer",
    fontSize: "0.85rem", padding: "0.2rem 0.4rem", borderRadius: 4,
  },
  footer: { textAlign: "center", color: "#c49a6c", fontSize: "0.8rem", marginTop: "0.5rem" },
};
