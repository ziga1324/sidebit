import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../supabaseClient"
import "./hom_e.css"

const API_URL = "http://127.0.0.1:5000"

const KAT_EMOJI = {
  kreativno: "🎨",
  gibanje: "🏃",
  socialno: "💬",
  ucenje: "📚",
  sprostitev: "🌿",
  pustolovscina: "🧭",
}

export default function Home() {
  const navigate = useNavigate()

  const [currentUser, setCurrentUser] = useState(null)
  const [stats, setStats] = useState({
    xp: 0,
    streak: 0,
    opravljeni: 0,
  })

  const [form, setForm] = useState({
    razpolozenje: "vesel",
    energija: "srednja",
    lokacija: "doma",
    skupina: "sam",
    cas_razpolozljiv: "5_15min",
    osebnost: "ambivert",
    vreme: "oblacno",
    cas_dneva: "popoldne",
  })

  const [quest, setQuest] = useState(null)
  const [alternativni, setAlternativni] = useState([])
  const [loading, setLoading] = useState(false)
  const [napaka, setNapaka] = useState(null)

  useEffect(() => {
    preveriUserja()
  }, [])

  async function preveriUserja() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      navigate("/login", { replace: true })
      return
    }

    setCurrentUser(session.user)
    naloziUserStat(session.user.id)
  }

  async function naloziUserStat(userId) {
    try {
      const res = await fetch(
        `${API_URL}/api/user-stats?user_id=${userId}`
      )

      if (!res.ok) {
        console.log(await res.text())
        return
      }

      const data = await res.json()

      setStats({
        xp: data.xp ?? 0,
        streak: data.streak ?? 0,
        opravljeni: data.opravljeni ?? 0,
      })
    } catch (err) {
      console.log("Stats error:", err)
    }
  }

  async function poisciQuest() {
    if (!currentUser) {
      setNapaka("User ni prijavljen.")
      return
    }

    setLoading(true)
    setNapaka(null)
    setQuest(null)
    setAlternativni([])

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    try {
      const res = await fetch(`${API_URL}/api/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          user_id: currentUser.id,
          ...form,
        }),
      })

      clearTimeout(timeoutId)

      const text = await res.text()
      console.log("BACKEND RESPONSE:", text)

      let data

      try {
        data = JSON.parse(text)
      } catch {
        setNapaka("Backend ni vrnil pravilnega JSON odgovora.")
        return
      }

      if (!res.ok) {
        setNapaka(data.error || "Napaka na strežniku.")
        return
      }

      setQuest(data.quest)
      setAlternativni(data.alternativni ?? [])
    } catch (err) {
      console.log("Fetch error:", err)

      if (err.name === "AbortError") {
        setNapaka("Backend se ne odzove. Poglej Flask terminal.")
      } else {
        setNapaka("Ne morem se povezati s strežnikom.")
      }
    } finally {
      clearTimeout(timeoutId)
      setLoading(false)
    }
  }

  async function opraviQuest() {
    if (!currentUser || !quest) return

    try {
      const res = await fetch(`${API_URL}/api/opravi`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: currentUser.id,
          quest_id: quest.id,
          xp: quest.xp,
        }),
      })

      const text = await res.text()

      let data

      try {
        data = JSON.parse(text)
      } catch {
        setNapaka("Backend ni vrnil pravilnega JSON odgovora.")
        return
      }

      if (!res.ok) {
        setNapaka(data.error || "Quest ni bil shranjen.")
        return
      }

      setStats({
        xp: data.xp ?? 0,
        streak: data.streak ?? 0,
        opravljeni: data.opravljeni ?? 0,
      })

      setQuest(null)
      setAlternativni([])
    } catch (err) {
      console.log("Opravi error:", err)
      setNapaka("Ne morem shraniti opravljenega questa.")
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    localStorage.removeItem("user")
    navigate("/login", { replace: true })
  }

  function izberiAlternativo(alt) {
    setQuest({
      id: alt.id,
      naslov: alt.naslov,
      opis: alt.opis ?? "",
      xp: alt.xp,
      kat: alt.kat,
      cas_min: alt.cas_min,
    })

    setAlternativni([])
  }

  const set = (key) => (e) => {
    setForm({
      ...form,
      [key]: e.target.value,
    })
  }

  return (
    <div className="app">
      <header>
        <div className="logo">ZestQuest</div>

        <div className="stats">
          <div>⚡ {stats.xp} XP</div>
          <div>🔥 {stats.streak}</div>
          <div>✓ {stats.opravljeni}</div>

          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <div className="form-card">
        <label>
          Razpoloženje
          <select value={form.razpolozenje} onChange={set("razpolozenje")}>
            <option value="dolgcas">😑 Dolgčas</option>
            <option value="vesel">😊 Vesel/a</option>
            <option value="utrujen">😴 Utrujen/a</option>
            <option value="motiviran">🔥 Motiviran/a</option>
          </select>
        </label>

        <label>
          Energija
          <select value={form.energija} onChange={set("energija")}>
            <option value="nizka">🪫 Nizka</option>
            <option value="srednja">⚡ Srednja</option>
            <option value="visoka">🚀 Visoka</option>
          </select>
        </label>

        <label>
          Lokacija
          <select value={form.lokacija} onChange={set("lokacija")}>
            <option value="doma">🏠 Doma</option>
            <option value="zunaj">🌳 Zunaj</option>
            <option value="sluzba">💼 Služba</option>
          </select>
        </label>

        <label>
          S kom si?
          <select value={form.skupina} onChange={set("skupina")}>
            <option value="sam">🧍 Sam/a</option>
            <option value="prijatelji">👥 Prijatelji</option>
            <option value="druzina">👨‍👩‍👧 Družina</option>
          </select>
        </label>

        <label>
          Čas na voljo
          <select
            value={form.cas_razpolozljiv}
            onChange={set("cas_razpolozljiv")}
          >
            <option value="0_5min">⚡ 0–5 min</option>
            <option value="5_15min">🕐 5–15 min</option>
            <option value="15_30min">🕑 15–30 min</option>
            <option value="30plus">🕒 30+ min</option>
          </select>
        </label>

        <label>
          Osebnost
          <select value={form.osebnost} onChange={set("osebnost")}>
            <option value="introvert">🔋 Introvert</option>
            <option value="ambivert">⚖️ Ambivert</option>
            <option value="ekstrovert">🌐 Ekstrovert</option>
          </select>
        </label>

        <label>
          Vreme
          <select value={form.vreme} onChange={set("vreme")}>
            <option value="soncno">☀️ Sončno</option>
            <option value="oblacno">⛅ Oblačno</option>
            <option value="dezevno">🌧 Deževno</option>
          </select>
        </label>

        <label>
          Del dneva
          <select value={form.cas_dneva} onChange={set("cas_dneva")}>
            <option value="jutro">🌅 Jutro</option>
            <option value="popoldne">☀️ Popoldne</option>
            <option value="vecer">🌆 Večer</option>
          </select>
        </label>

        <button onClick={poisciQuest} disabled={loading}>
          {loading ? "Iščem..." : "Najdi quest →"}
        </button>

        {napaka && <p className="napaka">{napaka}</p>}
      </div>

      {quest && (
        <div className="quest-card">
          {quest.kat && (
            <div className="quest-kat">
              {KAT_EMOJI[quest.kat] ?? "✨"} {quest.kat}
            </div>
          )}

          <h2>{quest.naslov}</h2>

          {quest.opis && <p className="quest-opis">{quest.opis}</p>}

          <div className="quest-meta">
            {quest.cas_min && <span>⏱ {quest.cas_min} min</span>}
            <span>⚡ {quest.xp} XP</span>
          </div>

          <button onClick={opraviQuest} className="btn-opravi">
            ✓ Opravljeno
          </button>
        </div>
      )}

      {alternativni.length > 0 && (
        <div className="alt-section">
          <p className="alt-title">Alternativni predlogi</p>

          {alternativni.map((alt) => (
            <div
              key={alt.id}
              className="alt-card"
              onClick={() => izberiAlternativo(alt)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && izberiAlternativo(alt)}
            >
              <span className="alt-naslov">{alt.naslov}</span>
              <span className="alt-xp">⚡ {alt.xp} XP</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}