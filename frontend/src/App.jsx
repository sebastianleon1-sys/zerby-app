import React, { useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";

function App() {
  const [page, setPage] = useState("login"); // login, register, profile
  const [token, setToken] = useState("");

  return (
    <div style={{ padding: "20px" }}>
      <h1>App de Servicios</h1>
      <div>
        <button onClick={() => setPage("login")}>Login</button>
        <button onClick={() => setPage("register")}>Registro</button>
        {token && <button onClick={() => setPage("profile")}>Perfil</button>}
      </div>
      {page === "login" && <Login setToken={setToken} />}
      {page === "register" && <Register setToken={setToken} />}
      {page === "profile" && <Profile token={token} />}
    </div>
  );
}

export default App;
