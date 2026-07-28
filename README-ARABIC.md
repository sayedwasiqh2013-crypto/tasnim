# خطوات تشغيل موقع تسنيم

## 1) إعداد قاعدة البيانات في Supabase

روح لمشروعك في Supabase → من القائمة الجانبية اختر **SQL Editor** → **New query**
والصق هذا الكود واضغط **Run**:

```sql
create table lessons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  file_url text not null,
  teacher_id uuid not null references auth.users(id),
  created_at timestamp with time zone default now()
);

alter table lessons enable row level security;

create policy "teachers can insert their own lessons"
  on lessons for insert
  with check (auth.uid() = teacher_id);

create policy "teachers can view their own lessons"
  on lessons for select
  using (auth.uid() = teacher_id);
```

## 2) إعداد مكان تخزين الملفات (Storage)

من القائمة الجانبية اختر **Storage** → **New bucket**
- الاسم: `lesson-files`
- فعّل خيار **Public bucket** (عشان روابط الملفات تشتغل مباشرة)
- اضغط **Create bucket**

## 3) رفع المشروع على GitHub

1. سوّي حساب على github.com (إذا ما عندك)
2. سوّي repository جديد اسمه `tasnim`
3. ارفع كل الملفات الموجودة بهذا المجلد إليه

## 4) الربط مع Vercel

1. ادخل vercel.com وسجّل دخول
2. **Add New Project** → اختر الـ repository `tasnim`
3. قبل الضغط على Deploy، افتح **Environment Variables** وضيف:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://qhwtbtbilkukckcogmyu.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `sb_publishable_3xjHD_-d5aT3c-5BGBxhvw_rXUj_EUx`
4. اضغط **Deploy**

## بعد النشر

- الموقع الرئيسي: صفحة ترحيبية
- `/login`: تسجيل دخول أو إنشاء حساب أستاذ جديد
- `/teacher`: رفع دروس PDF وعرضها (تظهر بعد تسجيل الدخول فقط)
