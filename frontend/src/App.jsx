import { Routes, Route, Navigate } from "react-router-dom"

import Landing from "./pages/Landing"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Home from "./pages/Home"

export default function App() {
  const user = localStorage.getItem("user")
  const isLoggedIn = user && user !== "null" && user !== "undefined"

  return (
    <Routes>

      {/* START PAGE */}
      <Route path="/" element={<Landing />} />

      {/* AUTH */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* PROTECTED APP */}
      <Route
        path="/app"
        element={
          isLoggedIn ? (
            <Home />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}