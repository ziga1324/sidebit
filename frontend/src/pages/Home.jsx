import { useEffect, useState } from "react"
import "./hom_e.css"

const STATIC_QUESTS = [
  { naslov: "Pojdi 10 min na sprehod", xp: 10, ikona: "🚶" },
  { naslov: "Napiši 5 stvari za katere si hvaležen", xp: 15, ikona: "🧠" },
  { naslov: "Pospravi mizo", xp: 8, ikona: "🧹" },
]

const CURRENT_USER = {
  id: 1,
  username: "Guest",
}

export default function Home() {
  const [stats, setStats] = useState({
    xp: 0,
    streak: 0,
    opravljeni: 0,
  })

  const [form, setForm] = useState({
    razpolozenje: "dolgcas",
    energija: "srednja",
    lokacija: "doma",
    skupina: "sam",
    cas_razpolozljiv: "5_15min",
    osebnost: "ambivert",
    vreme: "oblacno",
    cas_dneva: "popoldne",
  })

  const [quest, setQuest] = useState(null)

  useEffect(() => {
    naloziUserStat()
  }, [])

  async function naloziUserStat() {
    const res = await fetch("/api/user-stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: CURRENT_USER.id }),
    })

    const data = await res.json()
    if (!res.ok) return

    setStats({
      xp: data.xp,
      streak: data.streak,
      opravljeni: data.opravljeni,
    })
  }

  async function najdiQuest() {
    const res = await fetch("/api/napovej", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: CURRENT_USER.id,
        ...form,
      }),
    })

    const data = await res.json()
    if (!data.ok) return

    setQuest(data)
  }

  async function opraviQuest() {
    const xp = quest.quest.xp

    const res = await fetch("/api/opravi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: CURRENT_USER.id,
        xp,
      }),
    })

    const data = await res.json()

    setStats({
      xp: data.xp_skupaj,
      streak: data.streak,
      opravljeni: data.opravljeni,
    })

    setQuest(null)
  }

  async function preskoci() {
    await fetch("/api/preskoci", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: CURRENT_USER.id }),
    })

    setQuest(null)
  }

  async function quickComplete(xp) {
    await fetch("/api/opravi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: CURRENT_USER.id, xp }),
    })

    setStats((s) => ({
      ...s,
      xp: s.xp + xp,
      opravljeni: s.opravljeni + 1,
    }))
  }

  return (
    <div className="app">

      {/* HEADER */}
      <header>
        <div className="logo">
          <span className="logo-dot" />
          ZestQuest
        </div>

        <div className="stats">
          <div className="stat">XP {stats.xp}</div>
          <div className="stat">🔥 {stats.streak}</div>
          <div className="stat">✓ {stats.opravljeni}</div>
        </div>
      </header>

      {/* FORM */}
      <div className="form-card">

        <div className="form-grid">

          <select value={form.razpolozenje}
            onChange={(e) => setForm({ ...form, razpolozenje: e.target.value })}>
            <option value="dolgcas">Dolgčas</option>
            <option value="vesel">Vesel</option>
          </select>

          <select value={form.energija}
            onChange={(e) => setForm({ ...form, energija: e.target.value })}>
            <option value="nizka">Nizka</option>
            <option value="srednja">Srednja</option>
          </select>

        </div>

        <button className="btn-quest" onClick={najdiQuest}>
          Najdi quest
        </button>
      </div>

      {/* QUEST */}
      {quest && (
        <div className="quest-card">

          <h2>{quest.quest.naslov}</h2>
          <p>{quest.quest.opis}</p>

          <div className="quest-actions">
            <button className="btn-opravi" onClick={opraviQuest}>
              Opravljeno
            </button>

            <button className="btn-preskoci" onClick={preskoci}>
              Preskoči
            </button>
          </div>
        </div>
      )}

      {/* STATIC QUESTS */}
      <div className="form-card">
        {STATIC_QUESTS.map((q, i) => (
          <div key={i}>
            {q.ikona} {q.naslov}
            <button onClick={() => quickComplete(q.xp)}>
              +{q.xp} XP
            </button>
          </div>
        ))}
      </div>

    </div>
  )
}