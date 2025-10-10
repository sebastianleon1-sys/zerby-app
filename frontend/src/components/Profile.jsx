import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/users";

function Profile({ token }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
      } catch (err) {
        alert(err.response?.data?.error || "Error al obtener perfil");
      }
    };
    fetchProfile();
  }, [token]);

  if (!user) return <p>Cargando...</p>;

  return (
    <div>
      <h2>Perfil de Usuario</h2>
      <p>Email: {user.email}</p>
      <p>Rol: {user.role}</p>
      {user.cliente && (
        <>
          <p>Nombre: {user.cliente.nombre}</p>
          <p>Teléfono: {user.cliente.telefono}</p>
          <p>Dirección: {user.cliente.direccion}</p>
        </>
      )}
      {user.proveedor && (
        <>
          <p>Nombre: {user.proveedor.nombre}</p>
          <p>Servicios: {user.proveedor.servicios.join(", ")}</p>
        </>
      )}
    </div>
  );
}

export default Profile;
