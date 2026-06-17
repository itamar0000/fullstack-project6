import React, { useState } from "react";
import { ErrorState } from "../components/Status.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function profileFromUser(user) {
  return {
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    website: user.website || "",
    street: user.address?.street || "",
    suite: user.address?.suite || "",
    city: user.address?.city || "",
    zipcode: user.address?.zipcode || "",
    company: user.company?.name || ""
  };
}

function AccountPage() {
  const { changePassword, currentUser, updateProfile } = useAuth();
  const [profile, setProfile] = useState(() => profileFromUser(currentUser));
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    verifyPassword: ""
  });
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function updateProfileField(field, value) {
    setProfile((state) => ({ ...state, [field]: value }));
  }

  function updatePasswordField(field, value) {
    setPasswords((state) => ({ ...state, [field]: value }));
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setProfileMessage("");

    try {
      await updateProfile({
        name: profile.name.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim(),
        website: profile.website.trim(),
        address: {
          street: profile.street.trim(),
          suite: profile.suite.trim(),
          city: profile.city.trim(),
          zipcode: profile.zipcode.trim()
        },
        company: {
          name: profile.company.trim(),
          catchPhrase: currentUser.company?.catchPhrase || "",
          bs: currentUser.company?.bs || ""
        }
      });
      setProfileMessage("Profile updated.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setPasswordMessage("");

    if (passwords.newPassword !== passwords.verifyPassword) {
      setError("New passwords do not match.");
      setBusy(false);
      return;
    }

    try {
      await changePassword(passwords.currentPassword, passwords.newPassword);
      setPasswords({ currentPassword: "", newPassword: "", verifyPassword: "" });
      setPasswordMessage("Password changed.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="page-section">
      <div className="section-heading">
        <p className="eyebrow">Account</p>
        <h2>Profile and password</h2>
        <p>Update your personal details and password.</p>
      </div>

      <ErrorState message={error} />

      <div className="split-grid">
        <section className="plain-panel">
          <div className="section-heading compact">
            <p className="eyebrow">Profile</p>
            <h3>Personal details</h3>
          </div>
          <form className="form-stack" onSubmit={handleProfileSubmit}>
            <div className="form-grid">
              <label>
                Full name
                <input value={profile.name} onChange={(event) => updateProfileField("name", event.target.value)} />
              </label>
              <label>
                Email
                <input value={profile.email} onChange={(event) => updateProfileField("email", event.target.value)} />
              </label>
              <label>
                Phone
                <input value={profile.phone} onChange={(event) => updateProfileField("phone", event.target.value)} />
              </label>
              <label>
                Website
                <input value={profile.website} onChange={(event) => updateProfileField("website", event.target.value)} />
              </label>
              <label>
                Street
                <input value={profile.street} onChange={(event) => updateProfileField("street", event.target.value)} />
              </label>
              <label>
                Suite
                <input value={profile.suite} onChange={(event) => updateProfileField("suite", event.target.value)} />
              </label>
              <label>
                City
                <input value={profile.city} onChange={(event) => updateProfileField("city", event.target.value)} />
              </label>
              <label>
                Zip code
                <input value={profile.zipcode} onChange={(event) => updateProfileField("zipcode", event.target.value)} />
              </label>
              <label>
                Company
                <input value={profile.company} onChange={(event) => updateProfileField("company", event.target.value)} />
              </label>
            </div>
            {profileMessage && <p className="status success">{profileMessage}</p>}
            <button type="submit" className="primary-button" disabled={busy}>
              Save profile
            </button>
          </form>
        </section>

        <section className="plain-panel">
          <div className="section-heading compact">
            <p className="eyebrow">Security</p>
            <h3>Change password</h3>
          </div>
          <form className="form-stack" onSubmit={handlePasswordSubmit}>
            <label>
              Current password
              <input
                type="password"
                value={passwords.currentPassword}
                onChange={(event) => updatePasswordField("currentPassword", event.target.value)}
              />
            </label>
            <label>
              New password
              <input
                type="password"
                value={passwords.newPassword}
                onChange={(event) => updatePasswordField("newPassword", event.target.value)}
              />
            </label>
            <label>
              Verify new password
              <input
                type="password"
                value={passwords.verifyPassword}
                onChange={(event) => updatePasswordField("verifyPassword", event.target.value)}
              />
            </label>
            {passwordMessage && <p className="status success">{passwordMessage}</p>}
            <button type="submit" className="primary-button" disabled={busy}>
              Change password
            </button>
          </form>
        </section>
      </div>
    </section>
  );
}

export default AccountPage;
