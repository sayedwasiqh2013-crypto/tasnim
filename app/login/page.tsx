"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError("بيانات الدخول غير صحيحة");
      } else {
        router.push("/teacher");
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        router.push("/teacher");
      }
    }
    setLoading(false);
  }

  return (
    <div className="container">
      <div className="card">
        <h1>{mode === "login" ? "تسجيل الدخول" : "حساب جديد"}</h1>
        <p className="subtitle">لوحة الأستاذ</p>

        <form onSubmit={handleSubmit}>
          <label>البريد الإلكتروني</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>كلمة المرور</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading
              ? "جاري التحقق..."
              : mode === "login"
              ? "دخول"
              : "إنشاء حساب"}
          </button>
        </form>

        <button
          className="link-btn"
          style={{ marginTop: 16 }}
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login"
            ? "ما عندك حساب؟ سوّي حساب جديد"
            : "عندك حساب؟ سجّل دخول"}
        </button>
      </div>
    </div>
  );
}
