import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../supabaseClient"

export default function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      alert("Vnesi email in geslo")
      return
    }

    setLoading(true)

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      })

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    if (!data?.user?.id) {
      alert("Login ni uspel")
      return
    }

    localStorage.setItem("user", data.user.id)

    navigate("/app", { replace: true })
  }

  const styles = {
    container: {
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background:
        "linear-gradient(180deg, #d5dfdc 0%, #90a59f 45%, #52625d 100%)",
      padding: "24px",
      fontFamily: "Georgia, serif",
    },

    card: {
      width: "100%",
      maxWidth: "420px",
      background: "rgba(24, 36, 34, 0.88)",
      padding: "42px",
      borderRadius: "18px",
      backdropFilter: "blur(10px)",
      boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
      border: "1px solid rgba(220,235,228,0.14)",
      textAlign: "center",
    },

    title: {
      color: "#f1f3ec",
      fontSize: "42px",
      marginBottom: "24px",
      letterSpacing: "2px",
    },

    input: {
      width: "100%",
      padding: "14px",
      marginBottom: "12px",
      borderRadius: "12px",
      border: "1px solid rgba(220,235,228,0.14)",
      background: "rgba(38,56,53,0.95)",
      color: "#edf2ed",
      outline: "none",
      boxSizing: "border-box",
    },

    button: {
      width: "100%",
      padding: "14px",
      border: "none",
      borderRadius: "12px",
      background: "#dfe6d8",
      color: "#17201d",
      fontWeight: "700",
      cursor: "pointer",
      marginTop: "8px",
      fontSize: "15px",
    },

    link: {
      cursor: "pointer",
      marginTop: "20px",
      color: "#dbe3dc",
      fontSize: "14px",
    },
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Login</h1>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            autoComplete="email"
            onChange={(e) =>
              setEmail(e.target.value)
            }
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            autoComplete="current-password"
            onChange={(e) =>
              setPassword(e.target.value)
            }
            style={styles.input}
          />

          <button
            type="submit"
            disabled={loading}
            style={styles.button}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>
        </form>

        <p
          onClick={() => navigate("/register")}
          style={styles.link}
        >
          Nimam računa → Register
        </p>
      </div>
    </div>
  )
}