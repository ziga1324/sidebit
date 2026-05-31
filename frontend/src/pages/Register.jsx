import { useState } from "react"
import { supabase } from "../supabaseClient"
import { useNavigate } from "react-router-dom"

export default function Register() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const handleRegister = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      alert(error.message)
      return
    }

    const user = data?.user

    if (user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(
          {
            user_id: user.id,
            username: email,
            xp: 0,
          },
          {
            onConflict: "user_id",
          }
        )

      if (profileError) {
        console.log("PROFILE ERROR:", profileError)
        alert("User created but profile failed")
        return
      }
    }

    alert("Račun ustvarjen 👍")
    navigate("/login")
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
        <h1 style={styles.title}>Register</h1>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        <button
          onClick={handleRegister}
          style={styles.button}
        >
          Register
        </button>

        <p
          onClick={() => navigate("/login")}
          style={styles.link}
        >
          Že imam račun → Login
        </p>
      </div>
    </div>
  )
}