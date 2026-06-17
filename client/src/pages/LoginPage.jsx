import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { ErrorState } from "../components/Status.jsx";
import { appRoutes } from "../routes/paths.js";

function LoginPage() {
  const { currentUser, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      username: "",
      password: ""
    }
  });

  if (currentUser) {
    return <Navigate to={appRoutes.userHome(currentUser.id)} replace />;
  }

  async function onSubmit(values) {
    setError("");

    try {
      const user = await login(values.username, values.password);
      navigate(location.state?.from || appRoutes.userHome(user.id), { replace: true });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-copy">
          <p className="eyebrow">Project 6</p>
          <h1>Sign in</h1>
          <p>Enter your username and password to access the app.</p>
        </div>

        <form className="form-stack" onSubmit={handleSubmit(onSubmit)}>
          <label>
            Username
            <input
              {...register("username", { required: "Username is required." })}
              autoComplete="username"
            />
            {errors.username && <span className="field-error">{errors.username.message}</span>}
          </label>

          <label>
            Password
            <input
              {...register("password", { required: "Password is required." })}
              type="password"
              autoComplete="current-password"
            />
            {errors.password && <span className="field-error">{errors.password.message}</span>}
          </label>

          <ErrorState message={error} />

          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="auth-switch">
          Need a new user? <Link to={appRoutes.register}>Register</Link>
        </p>
      </section>
    </main>
  );
}

export default LoginPage;
