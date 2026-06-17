import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { usersApi } from "../api/resources.js";
import { ErrorState } from "../components/Status.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { appRoutes } from "../routes/paths.js";

function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [credentials, setCredentials] = useState(null);
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      username: "",
      password: "",
      verifyPassword: "",
      name: "",
      email: "",
      phone: "",
      street: "",
      suite: "",
      city: "",
      zipcode: "",
      company: ""
    }
  });

  async function handleCredentials(values) {
    setError("");

    if (values.password !== values.verifyPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const existingUser = await usersApi.getByUsername(values.username.trim());
      if (existingUser) {
        setError("This username is already taken.");
        return;
      }

      setCredentials({
        username: values.username,
        password: values.password
      });
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleProfile(values) {
    setError("");

    try {
      const user = await registerUser(credentials, values);
      navigate(appRoutes.userHome(user.id), { replace: true });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel wide">
        <div className="auth-copy">
          <p className="eyebrow">Project 6</p>
          <h1>Register</h1>
          <p>{credentials ? "Complete the mandatory profile details." : "Choose unique credentials."}</p>
        </div>

        <form
          className="form-stack"
          onSubmit={handleSubmit(credentials ? handleProfile : handleCredentials)}
        >
          {!credentials && (
            <>
              <label>
                Username
                <input {...register("username", { required: "Username is required." })} />
                {errors.username && <span className="field-error">{errors.username.message}</span>}
              </label>
              <label>
                Password
                <input
                  {...register("password", {
                    required: "Password is required.",
                    minLength: { value: 4, message: "Use at least 4 characters." }
                  })}
                  type="password"
                />
                {errors.password && <span className="field-error">{errors.password.message}</span>}
              </label>
              <label>
                Verify password
                <input
                  {...register("verifyPassword", {
                    required: "Verify your password.",
                    validate: (value) => value === getValues("password") || "Passwords do not match."
                  })}
                  type="password"
                />
                {errors.verifyPassword && (
                  <span className="field-error">{errors.verifyPassword.message}</span>
                )}
              </label>
            </>
          )}

          {credentials && (
            <div className="form-grid">
              <label>
                Full name
                <input {...register("name", { required: "Full name is required." })} />
                {errors.name && <span className="field-error">{errors.name.message}</span>}
              </label>
              <label>
                Email
                <input
                  {...register("email", { required: "Email is required." })}
                  type="email"
                />
                {errors.email && <span className="field-error">{errors.email.message}</span>}
              </label>
              <label>
                Phone
                <input {...register("phone", { required: "Phone is required." })} />
                {errors.phone && <span className="field-error">{errors.phone.message}</span>}
              </label>
              <label>
                Street
                <input {...register("street", { required: "Street is required." })} />
                {errors.street && <span className="field-error">{errors.street.message}</span>}
              </label>
              <label>
                Suite
                <input {...register("suite", { required: "Suite is required." })} />
                {errors.suite && <span className="field-error">{errors.suite.message}</span>}
              </label>
              <label>
                City
                <input {...register("city", { required: "City is required." })} />
                {errors.city && <span className="field-error">{errors.city.message}</span>}
              </label>
              <label>
                Zip code
                <input {...register("zipcode", { required: "Zip code is required." })} />
                {errors.zipcode && <span className="field-error">{errors.zipcode.message}</span>}
              </label>
              <label>
                Company
                <input {...register("company", { required: "Company is required." })} />
                {errors.company && <span className="field-error">{errors.company.message}</span>}
              </label>
            </div>
          )}

          <ErrorState message={error} />

          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {credentials ? "Create account" : "Continue"}
          </button>
        </form>

        <p className="auth-switch">
          Already registered? <Link to={appRoutes.login}>Login</Link>
        </p>
      </section>
    </main>
  );
}

export default RegisterPage;
