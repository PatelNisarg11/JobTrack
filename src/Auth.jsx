import { useState } from "react";
import {
createUserWithEmailAndPassword,
signInWithEmailAndPassword,
updateProfile
} from "firebase/auth";

import { auth } from "./firebase";
import "./Auth.css";

function Auth() {

const [isSignup, setIsSignup] = useState(false);

const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

const [error, setError] = useState("");
const [loading, setLoading] = useState(false);

const handleSubmit = async (e) => {


e.preventDefault();

setError("");
setLoading(true);

try {

  if (isSignup) {

    if (password.length < 6) {
      throw new Error("Password must contain at least 6 characters.");
    }

    const result = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await updateProfile(result.user, {
      displayName: name
    });

  } else {

    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

  }

} catch (err) {

  if (err.code === "auth/email-already-in-use") {
    setError("This email is already registered. Please Login.");
  } else if (err.code === "auth/invalid-credential") {
    setError("Incorrect email or password.");
  } else if (err.code === "auth/invalid-email") {
    setError("Please enter a valid email.");
  } else if (err.code === "auth/weak-password") {
    setError("Password must contain at least 6 characters.");
  } else if (err.code === "auth/network-request-failed") {
    setError("Network error. Please try again.");
  } else {
    setError(err.message);
  }

} finally {

  setLoading(false);

}


};

return (


<div className="auth-container">

  <div className="auth-card">

    <h1 className="auth-logo">JobTrack.</h1>

    <h2>
      {isSignup ? "Create Account" : "Welcome Back"}
    </h2>

    <p className="auth-subtitle">
      {isSignup
        ? "Create your account to start tracking jobs."
        : "Login to manage your job applications."}
    </p>

    {error && (
      <div className="auth-error">
        {error}
      </div>
    )}

    <form onSubmit={handleSubmit}>

      {isSignup && (

        <>
          <label>Full Name</label>

          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </>

      )}

      <label>Email Address</label>

      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <label>Password</label>

      <input
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        minLength="6"
        required
      />

      <button
        type="submit"
        className="auth-submit"
        disabled={loading}
      >
        {loading
          ? "Please wait..."
          : isSignup
            ? "Create Account"
            : "Login"}
      </button>

    </form>

    <p className="auth-switch">

      {isSignup
        ? "Already have an account?"
        : "Don't have an account?"}

      <button
        type="button"
        onClick={() => {
          setIsSignup(!isSignup);
          setError("");
        }}
      >
        {isSignup ? "Login" : "Sign Up"}
      </button>

    </p>

  </div>

</div>

);

}

export default Auth;
