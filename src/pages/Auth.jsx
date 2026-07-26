import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
export default function Auth({ mode }) {
  const register = mode === "register",
    [form, setForm] = useState({
      name: "",
      email: register ? "" : "demo@queueless.app",
      password: register ? "" : "demo1234",
      role: "customer",
    }),
    [loading, setLoading] = useState(false),
    { login } = useAuth(),
    nav = useNavigate();
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login({ ...form, mode });
      toast.success(register ? "Welcome to QueueLess!" : "Welcome back!");
      nav(user.role === "owner" ? "/owner" : "/dashboard");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <Link className="brand" to="/">
          <span>Q</span>QueueLess
        </Link>
        <h1>{register ? "Make waiting better." : "Welcome back."}</h1>
        <p>
          {register
            ? "Create your account in under a minute."
            : "Sign in to manage your time."}
        </p>
        {register && (
          <label>
            Full name
            <input
              required
              minLength="2"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
        )}
        <label>
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            minLength="8"
            autoComplete={register ? "new-password" : "current-password"}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </label>
        {register && (
          <div className="role-select">
            <button
              type="button"
              className={form.role === "customer" ? "selected" : ""}
              onClick={() => setForm({ ...form, role: "customer" })}
            >
              I’m a customer
            </button>
            <button
              type="button"
              className={form.role === "owner" ? "selected" : ""}
              onClick={() => setForm({ ...form, role: "owner" })}
            >
              I run a shop
            </button>
          </div>
        )}
        <button className="button full" disabled={loading}>
          {loading ? "Please wait…" : register ? "Create account" : "Sign in"}
        </button>
        {!register && <button type="button" className="demo-login" onClick={() => { setForm({ ...form, email: "demo@queueless.app", password: "demo1234" }); }}>Use customer demo credentials</button>}
        <p className="auth-switch">
          {register ? "Already have an account?" : "New to QueueLess?"}{" "}
          <Link to={register ? "/login" : "/register"}>
            {register ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </form>
    </section>
  );
}
