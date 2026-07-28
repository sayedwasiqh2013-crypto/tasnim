"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Lesson = {
  id: string;
  title: string;
  description: string;
  file_url: string;
  created_at: string;
};

export default function TeacherPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/login");
        return;
      }
      setUserId(data.session.user.id);
      setCheckingAuth(false);
    }
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (userId) fetchLessons();
  }, [userId]);

  async function fetchLessons() {
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("teacher_id", userId)
      .order("created_at", { ascending: false });
    if (!error && data) setLessons(data as Lesson[]);
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!file) {
      setError("اختر ملف PDF أولًا");
      return;
    }
    if (file.type !== "application/pdf") {
      setError("الملف لازم يكون PDF فقط");
      return;
    }

    setUploading(true);

    const filePath = `${userId}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("lesson-files")
      .upload(filePath, file);

    if (uploadError) {
      setError("فشل رفع الملف: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("lesson-files")
      .getPublicUrl(filePath);

    const { error: insertError } = await supabase.from("lessons").insert({
      title,
      description,
      file_url: publicUrlData.publicUrl,
      teacher_id: userId,
    });

    if (insertError) {
      setError("فشل حفظ الدرس: " + insertError.message);
    } else {
      setMessage("تم رفع الدرس بنجاح");
      setTitle("");
      setDescription("");
      setFile(null);
      fetchLessons();
    }

    setUploading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (checkingAuth) {
    return (
      <div className="container">
        <p>جاري التحقق...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="topbar">
        <h1 style={{ fontSize: 20, margin: 0 }}>لوحة الأستاذ</h1>
        <button className="link-btn" onClick={handleLogout}>
          تسجيل خروج
        </button>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 18 }}>رفع درس جديد (PDF)</h1>
        <form onSubmit={handleUpload}>
          <label>عنوان الدرس</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <label>وصف الدرس</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label>ملف PDF</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
          />

          {error && <p className="error">{error}</p>}
          {message && <p className="success">{message}</p>}

          <button type="submit" disabled={uploading}>
            {uploading ? "جاري الرفع..." : "رفع الدرس"}
          </button>
        </form>
      </div>

      <div className="card">
        <h1 style={{ fontSize: 18 }}>دروسي المرفوعة</h1>
        {lessons.length === 0 && <p>لا يوجد دروس مرفوعة بعد</p>}
        {lessons.map((lesson) => (
          <div className="lesson-item" key={lesson.id}>
            <strong>{lesson.title}</strong>
            <p style={{ margin: "4px 0", color: "#666", fontSize: 14 }}>
              {lesson.description}
            </p>
            <a href={lesson.file_url} target="_blank" rel="noreferrer">
              فتح الملف
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
