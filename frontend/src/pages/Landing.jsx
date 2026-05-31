import { useNavigate } from "react-router-dom"

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Sidebit</h1>
        <p style={styles.subtitle}>
          Dobrodošel v tvojem personaliziranem quest sistemu.
        </p>

        <div style={styles.buttons}>
          <button style={styles.login} onClick={() => navigate("/login")}>
            Login
          </button>

          <button style={styles.register} onClick={() => navigate("/register")}>
            Register
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "linear-gradient(180deg, #c8d2cf 0%, #8ca39d 45%, #4b5a56 100%)",
    color: "#e8e6df",
    fontFamily: "Georgia, serif",
    padding: "30px",
  },

  card: {
    width: "420px",
    textAlign: "center",
    padding: "48px",
    borderRadius: "18px",
    background: "rgba(18, 28, 27, 0.82)",
    border: "1px solid rgba(200,220,210,0.18)",
    boxShadow: "0 0 40px rgba(0,0,0,0.45)",
    backdropFilter: "blur(8px)",
  },

  title: {
    fontSize: "52px",
    letterSpacing: "4px",
    textTransform: "uppercase",
    color: "#edf1ea",
    marginBottom: "12px",
    fontWeight: "700",
  },

  subtitle: {
    fontSize: "15px",
    letterSpacing: "2px",
    color: "#b8c6bf",
    marginBottom: "34px",
    textTransform: "uppercase",
  },

  buttons: {
    display: "flex",
    gap: "14px",
    justifyContent: "center",
  },

  login: {
    padding: "12px 26px",
    background: "#d9ddd5",
    color: "#18211f",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    letterSpacing: "1px",
  },

  register: {
    padding: "12px 26px",
    background: "transparent",
    color: "#e7ede8",
    border: "1px solid rgba(220,230,225,0.35)",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    letterSpacing: "1px",
  },
}
