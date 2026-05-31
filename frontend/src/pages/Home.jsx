import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import "./hom_e.css"

const API_URL = import.meta.env.VITE_API_URL || ""

export default function Home() {
  const navigate = useNavigate()

  const [stats, setStats] = useState({
    xp: 0,
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
  const [alternativni, setAlternativni] = useState([])
  const [loading, setLoading] = useState(false)
  const [gifVisible, setGifVisible] = useState(false)
  const [error, setError] = useState("")

  const user_id = localStorage.getItem("user")

  useEffect(() => {
    if (!user_id || user_id === "null" || user_id === "undefined") {
      navigate("/login", { replace: true })
      return
    }

    naloziUserStat()
  }, [])

  useEffect(() => {
    let timer

    if (loading) {
      timer = setTimeout(() => {
        setGifVisible(true)
      }, 2000)
    } else {
      setGifVisible(false)
    }

    return () => clearTimeout(timer)
  }, [loading])

  function logout() {
    localStorage.removeItem("user")
    navigate("/login", { replace: true })
  }

  async function naloziUserStat() {
    try {
      setError("")

      const res = await fetch(
        `${API_URL}/api/user-stats?user_id=${user_id}`
      )

      const data = await res.json()

      if (!res.ok || data.success === false) {
        setError(data.error || "Napaka pri nalaganju statistike.")
        return
      }

      setStats({
        xp: data.xp || 0,
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
      setAlternativni([])

      const res = await fetch(`${API_URL}/api/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id,
          ...form,
        }),
      })

      const data = await res.json()

      if (!res.ok || data.success === false) {
        setError(data.error || "Napaka pri iskanju questa.")
        return
      }

      if (!data.quest) {
        setError("Backend ni vrnil questa.")
        return
      }

      setQuest({
        id: data.quest.id,
        naslov: data.quest.naslov || "Brez naslova",
        opis: data.quest.opis || "Brez opisa",
        xp: data.quest.xp || 0,
        cas_min: data.quest.cas_min || 0,
        kat: data.quest.kat || "",
      })

      setAlternativni(data.alternativni || [])
    } catch (err) {
      console.log("Fetch error predict:", err)
      setError("Backend ni dosegljiv.")
    } finally {
      setLoading(false)
    }
  }

  async function opraviQuest(izbraniQuest = quest) {
    if (!izbraniQuest) return

    try {
      setLoading(true)
      setError("")

      const res = await fetch(`${API_URL}/api/opravi`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id,
          quest_id: izbraniQuest.id,
          xp: izbraniQuest.xp || 0,
        }),
      })

      const data = await res.json()

      if (!res.ok || data.success === false) {
        setError(data.error || "Napaka pri shranjevanju questa.")
        return
      }

      setStats({
        xp: data.stats?.xp || 0,
        opravljeni: data.stats?.opravljeni || 0,
      })

      setQuest(null)
      setAlternativni([])
    } catch (err) {
      console.log("Fetch error opraviQuest:", err)
      setError("Backend ni dosegljiv.")
    } finally {
      setLoading(false)
    }
  }

  function zavrniQuest() {
    setQuest(null)
  }

  return (
    <div className="app">
      <header>
        <div className="logo">Sidebit</div>

        <div className="stats">
          <div>XP {stats.xp}</div>
          <div>✓ {stats.opravljeni}</div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Link to="/about">
            <button>About us</button>
          </Link>

          <button onClick={logout}>Logout</button>
        </div>
      </header>

      {error && <div className="error">{error}</div>}

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
            setForm({
              ...form,
              cas_razpolozljiv: e.target.value,
            })
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

      {gifVisible && !quest && (
        <div className="quest-card">
          <h1>Se opravičujemo za počasnost aplikacije, tukaj je uradno opravičilo.</h1>
          <img
            src="/sonic-fortnite-dance.gif"
            alt="Loading..."
            style={{
              width: "220px",
              display: "block",
              margin: "0 auto",
              borderRadius: "16px",
            }}
          />
        </div>
      )}

      {quest && (
        <div className="quest-card">
          <h2>{quest.naslov}</h2>
          <p>{quest.opis}</p>

          <div>XP: {quest.xp}</div>
          <div>Čas: {quest.cas_min} min</div>

          {quest.kat && <div>Kategorija: {quest.kat}</div>}

          <button
            onClick={() => opraviQuest(quest)}
            disabled={loading}
          >
            Opravljeno
          </button>

          <button
            onClick={zavrniQuest}
            disabled={loading}
          >
            Zavrni
          </button>
        </div>
      )}

      {alternativni.length > 0 && (
        <div className="quest-card">
          <h3>Alternative</h3>

          {alternativni.map((q) => (
            <div key={q.id}>
              <strong>{q.naslov}</strong>
              <div>{q.opis}</div>

              <small>
                XP: {q.xp} | Čas: {q.cas_min} min
              </small>

              <br />

              <button
                onClick={() => opraviQuest(q)}
                disabled={loading}
              >
                Opravi ta quest
              </button>

              <hr />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}