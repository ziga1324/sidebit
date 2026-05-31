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
      password
    })

    console.log("DATA:", data)
    console.log("ERROR:", error)

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
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Register</h1>

      <input
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          display: "block",
          marginBottom: 10,
          padding: 10
        }}
      />

      <input
        placeholder="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          display: "block",
          marginBottom: 10,
          padding: 10
        }}
      />

      <button onClick={handleRegister}>
        Register
      </button>

      <p
        onClick={() => navigate("/login")}
        style={{
          cursor: "pointer",
          marginTop: 20
        }}
      >
        Že imam račun → Login
      </p>
    </div>
  )
}