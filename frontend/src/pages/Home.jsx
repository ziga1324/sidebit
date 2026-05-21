import { useEffect, useState } from "react"
import "./hom_e.css"

const API_URL = "http://127.0.0.1:5000"

// Za testiranje mora biti UUID, ne številka 1.
const CURRENT_USER = {
  id: "550e8400-e29b-41d4-a716-446655440000",
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    naloziUserStat()
  }, [])

  async function naloziUserStat() {
    try {
      setError("")

      const res = await fetch(
        `${API_URL}/api/user-stats?user_id=${CURRENT_USER.id}`
      )

      const data = await res.json()

      if (!res.ok) {
        console.log("Napaka pri statistiki:", data)
        setError(data.error || "Napaka pri nalaganju statistike.")
        return
      }

      setStats({
        xp: data.xp || 0,
        streak: data.streak || 0,
        opravljeni: data.opravljeni || 0,
      })
    } catch (err) {
      console.log("Fetch error user-stats:", err)
      setError("Backend ni dosegljiv.")
    }
  }

  async function poisciQuest() {
    try {
      setLoading(true)
      setError("")
      setQuest(null)

      const res = await fetch(`${API_URL}/api/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: CURRENT_USER.id,
          ...form,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        console.log("Backend error:", data)
        setError(data.error || "Napaka pri iskanju questa.")
        return
      }

      const q = data.quest

      if (!q) {
        console.log("Ni quest podatkov:", data)
        setError("Backend ni vrnil questa.")
        return
      }

      setQuest({
        id: q.id,
        naslov: q.naslov || "Brez naslova",
        opis: q.opis || "Brez opisa",
        xp: q.xp || 0,
        cas_min: q.cas_min || 0,
        kat: q.kat || "",
      })

      console.log("Prejeto quest:", data)
    } catch (err) {
      console.log("Fetch error predict:", err)
      setError("Backend ni dosegljiv.")
    } finally {
      setLoading(false)
    }
  }

  async function opraviQuest() {
    if (!quest) return

    try {
      setLoading(true)
      setError("")

      const res = await fetch(`${API_URL}/api/opravi`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: CURRENT_USER.id,
          quest_id: quest.id,
          xp: quest.xp || 0,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        console.log("Napaka pri shranjevanju:", data)
        setError(data.error || "Napaka pri shranjevanju questa.")
        return
      }

      setStats({
        xp: data.stats?.xp || 0,
        streak: data.stats?.streak || 0,
        opravljeni: data.stats?.opravljeni || 0,
      })

      setQuest(null)
    } catch (err) {
      console.log("Fetch error opraviQuest:", err)
      setError("Backend ni dosegljiv.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header>
        <div className="logo">ZestQuest</div>

        <div className="stats">
          <div>XP {stats.xp}</div>
          <div>🔥 {stats.streak}</div>
          <div>✓ {stats.opravljeni}</div>
        </div>
      </header>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      <div className="form-card">
        <select
          value={form.razpolozenje}
          onChange={(e) =>
            setForm({ ...form, razpolozenje: e.target.value })
          }
        >
          <option value="dolgcas">Dolgčas</option>
          <option value="vesel">Vesel</option>
          <option value="utrujen">Utrujen</option>
          <option value="motiviran">Motiviran</option>
        </select>

        <select
          value={form.energija}
          onChange={(e) =>
            setForm({ ...form, energija: e.target.value })
          }
        >
          <option value="nizka">Nizka</option>
          <option value="srednja">Srednja</option>
          <option value="visoka">Visoka</option>
        </select>

        <select
          value={form.lokacija}
          onChange={(e) =>
            setForm({ ...form, lokacija: e.target.value })
          }
        >
          <option value="doma">Doma</option>
          <option value="zunaj">Zunaj</option>
          <option value="sluzba">Služba</option>
        </select>

        <select
          value={form.skupina}
          onChange={(e) =>
            setForm({ ...form, skupina: e.target.value })
          }
        >
          <option value="sam">Sam</option>
          <option value="prijatelji">Prijatelji</option>
          <option value="druzina">Družina</option>
        </select>

        <select
          value={form.cas_razpolozljiv}
          onChange={(e) =>
            setForm({ ...form, cas_razpolozljiv: e.target.value })
          }
        >
          <option value="0_5min">0–5 min</option>
          <option value="5_15min">5–15 min</option>
          <option value="15_30min">15–30 min</option>
          <option value="30plus">30+ min</option>
        </select>

        <select
          value={form.osebnost}
          onChange={(e) =>
            setForm({ ...form, osebnost: e.target.value })
          }
        >
          <option value="introvert">Introvert</option>
          <option value="ambivert">Ambivert</option>
          <option value="ekstrovert">Ekstrovert</option>
        </select>

        <select
          value={form.vreme}
          onChange={(e) =>
            setForm({ ...form, vreme: e.target.value })
          }
        >
          <option value="soncno">Sončno</option>
          <option value="oblacno">Oblačno</option>
          <option value="dezevno">Deževno</option>
        </select>

        <select
          value={form.cas_dneva}
          onChange={(e) =>
            setForm({ ...form, cas_dneva: e.target.value })
          }
        >
          <option value="jutro">Jutro</option>
          <option value="popoldne">Popoldne</option>
          <option value="vecer">Večer</option>
        </select>

        <button onClick={poisciQuest} disabled={loading}>
          {loading ? "Nalagam..." : "Najdi quest"}
        </button>
      </div>

      {quest && (
        <div className="quest-card">
          <h2>{quest.naslov}</h2>
          <p>{quest.opis}</p>

          <div>XP: {quest.xp}</div>
          <div>Čas: {quest.cas_min} min</div>

          {quest.kat && <div>Kategorija: {quest.kat}</div>}

          <button onClick={opraviQuest} disabled={loading}>
            Opravljeno
          </button>
        </div>
      )}
    </div>
  )
}