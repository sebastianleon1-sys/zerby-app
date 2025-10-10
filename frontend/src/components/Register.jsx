import React, { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/auth";

function Register({ setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CLIENTE");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [servicios, setServicios] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    const data = { email, password, role };
    if (role === "CLIENTE") {
      data.nombre = nombre;
      data.telefono = telefono;
      data.direccion = direccion;
    } else if (role === "PROVEEDOR") {
      data.nombre = nombre;
      data.servicios = servicios.split(",");
    }

    try {
      const res = await axios.post(`${API_URL}/register`, data);
      alert(res.data.message);
      setToken(res.data.token);
    } catch (err) {
      alert(err.response?.data?.error || "Error en registro");
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>Registro</h2>
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
      <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required />
      <select value={role} onChange={e => setRole(e.target.value)}>
        <option value="CLIENTE">Cliente</option>
        <option value="PROVEEDOR">Proveedor</option>
      </select>
      <input type="text" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} required />
      {role === "CLIENTE" && (
        <>
          <input type="text" placeholder="Teléfono" value={telefono} onChange={e => setTelefono(e.target.value)} required />
          <input type="text" placeholder="Dirección" value={direccion} onChange={e => setDireccion(e.target.value)} required />
        </>
      )}
      {role === "PROVEEDOR" && (
        <input type="text" placeholder="Servicios (separados por coma)" value={servicios} onChange={e => setServicios(e.target.value)} required />
      )}
      <button type="submit">Registrarse</button>
    </form>
  );
}

export default Register;
