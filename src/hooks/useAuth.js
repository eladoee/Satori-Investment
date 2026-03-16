import { useEffect, useMemo, useState } from "react";
import { createRemoteJWKSet, jwtVerify } from "jose";

const ALLOWED_HD = "oee.ltd";
const AUDIENCE = process.env.REACT_APP_GOOGLE_CLIENT_ID || "";
const JWKS_URL = new URL("https://www.googleapis.com/oauth2/v3/certs");

export const AUTH_ALLOWED_HD = ALLOWED_HD;

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const JWKS = useMemo(() => createRemoteJWKSet(JWKS_URL), []);

  useEffect(() => {
    const raw = sessionStorage.getItem("satori_session");

    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        sessionStorage.removeItem("satori_session");
      }
    }

    setLoading(false);
  }, []);

  async function verifyIdToken(idToken) {
    if (!AUDIENCE) {
      throw new Error("Missing Google Client ID.");
    }

    const { payload } = await jwtVerify(idToken, JWKS, {
      audience: AUDIENCE,
      issuer: ["https://accounts.google.com", "accounts.google.com"],
    });

    if (payload.hd !== ALLOWED_HD) {
      throw new Error(`Please use your @${ALLOWED_HD} account.`);
    }

    if (!payload.email_verified) {
      throw new Error("Email not verified.");
    }

    return {
      uid: payload.sub,
      email: payload.email,
      name: payload.name || "",
      picture: payload.picture || "",
    };
  }

  async function signIn(credential) {
    const profile = await verifyIdToken(credential);
    setUser(profile);
    sessionStorage.setItem("satori_session", JSON.stringify(profile));
  }

  function signOut() {
    setUser(null);
    sessionStorage.removeItem("satori_session");
  }

  return {
    user,
    loading,
    signIn,
    signOut,
  };
}