import Link from "next/link";

export default function Home() {
  return (
    <div className="container">
      <div className="card">
        <h1>تسنيم</h1>
        <p className="subtitle">منصة تعليمية للدروس والمواد الدراسية</p>
        <Link href="/login">
          <button>تسجيل دخول الأستاذ</button>
        </Link>
      </div>
    </div>
  );
}
