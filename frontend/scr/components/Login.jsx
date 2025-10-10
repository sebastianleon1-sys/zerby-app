import React, { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/auth"; // cambia al puerto de tu backend

function Login({ setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });
      alert(res.data.message);
      setToken(res.data.token);
    } catch (err) {
      alert(err.response?.data?.error || "Error en login");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
      <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required />
      <button type="submit">Ingresar</button>
    </form>
  );
}

export default Login;

