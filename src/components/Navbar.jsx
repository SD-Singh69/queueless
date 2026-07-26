import { Link, NavLink, useNavigate } from "react-router-dom";
import { FiLogOut, FiMoon, FiSun, FiUser } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
export default function Navbar() {
  const { user, logout } = useAuth(),
    nav = useNavigate(),
    [dark, setDark] = useState(() => localStorage.getItem("ql_theme") === "dark");
  useEffect(() => { document.documentElement.classList.toggle("dark", dark); localStorage.setItem("ql_theme", dark ? "dark" : "light"); }, [dark]);
  const toggle = () => {
    document.documentElement.classList.toggle("dark");
    setDark(!dark);
  };
  return (
    <header className="nav">
      <Link className="brand" to="/">
        <span>Q</span>QueueLess
      </Link>
      <nav>
        <NavLink to="/">Discover</NavLink>
        {user ? (
          <>
            <NavLink to={user.role === "owner" ? "/owner" : "/dashboard"}>
              Dashboard
            </NavLink>
            <NavLink aria-label="Profile" to="/profile" className="icon">
              <FiUser />
            </NavLink>
            <button aria-label="Toggle theme" className="icon" onClick={toggle}>
              {dark ? <FiSun /> : <FiMoon />}
            </button>
            <button
              className="avatar"
              onClick={() => {
                logout();
                nav("/");
              }}
              title="Sign out"
            >
              <FiLogOut />
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Sign in</Link>
            <Link className="button small" to="/register">
              Get started
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
