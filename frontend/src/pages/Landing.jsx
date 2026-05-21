import { useNavigate } from "react-router-dom"

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>ZestQuest</h1>
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
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0a0a0f",
    color: "#fff",
    fontFamily: "sans-serif",
  },
  card: {
    textAlign: "center",
    padding: "40px",
    border: "1px solid #222",
    borderRadius: "16px",
    background: "#111118",
  },
  title: {
    fontSize: "40px",
    marginBottom: "10px",
  },
  subtitle: {
    color: "#aaa",
    marginBottom: "30px",
  },
  buttons: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
  },
  login: {
    padding: "10px 20px",
    cursor: "pointer",
  },
  register: {
    padding: "10px 20px",
    cursor: "pointer",
  },
}