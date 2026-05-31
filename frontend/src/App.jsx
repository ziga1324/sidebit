import { Routes, Route, Navigate } from "react-router-dom"

import Landing from "./pages/Landing"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Home from "./pages/Home"
import About from "./About"

export default function App() {
  const user = localStorage.getItem("user")
  const isLoggedIn = user && user !== "null" && user !== "undefined"

  return (
    <Routes>


      <Route path="/" element={<Landing />} />

      <Route path="/about" element={<About />} />


      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

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


      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}