-- GradeFlow Database Schema
-- Run this in your Supabase SQL editor

-- Teachers
create table if not exists teachers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  school text,
  school_color text default '#3b7ef4',
  avatar text default '👩‍🏫',
  created_at timestamptz default now()
);

-- Classes
create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references teachers(id) on delete cascade,
  period text not null,
  subject text not null,
  color text default '#3b7ef4',
  class_code text unique default substring(md5(random()::text), 1, 7),
  created_at timestamptz default now()
);

-- Students
create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  class_id uuid references classes(id) on delete cascade,
  created_at timestamptz default now()
);

-- Assignments
create table if not exists assignments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references classes(id) on delete cascade,
  name text not null,
  type text check (type in ('test','quiz','homework','participation')) default 'quiz',
  weight integer default 30,
  due_date date,
  assign_date date default current_date,
  options jsonb default '{}',
  created_at timestamptz default now()
);

-- Grades
create table if not exists grades (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  assignment_id uuid references assignments(id) on delete cascade,
  score numeric,
  max_score numeric default 100,
  submitted boolean default false,
  graded boolean default false,
  ai_graded boolean default false,
  ai_confidence text,
  needs_review boolean default false,
  created_at timestamptz default now(),
  unique(student_id, assignment_id)
);

-- Parent Messages
create table if not exists parent_messages (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references teachers(id),
  student_id uuid references students(id),
  trigger_type text,
  draft_negative text,
  draft_positive text,
  status text default 'pending',
  tone text default 'warm',
  auto_send boolean default false,
  sent_at timestamptz,
  created_at timestamptz default now()
);

-- Lessons
create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references teachers(id),
  class_id uuid references classes(id),
  title text not null,
  subject text,
  pages text,
  duration integer,
  lesson_date date default current_date,
  plan_data jsonb,
  created_at timestamptz default now()
);

-- Feed Posts
create table if not exists feed_posts (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references classes(id),
  author_id uuid,
  author_name text,
  content text not null,
  approved boolean default true,
  reactions jsonb default '{}',
  created_at timestamptz default now()
);

-- Sync Logs
create table if not exists public.sync_logs (
  id uuid primary key default gen_random_uuid(),
  triggered_by text not null,
  payload jsonb not null,
  created_at timestamp with time zone default now()
);

-- Support Staff Groups (REPLACES teams)
create table if not exists public.support_staff_groups (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references teachers(id),
  name text not null,
  created_at timestamp with time zone default now()
);

create table if not exists public.support_staff_group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references support_staff_groups(id) on delete cascade,
  student_id uuid not null references students(id),
  created_at timestamp with time zone default now(),
  unique(group_id, student_id)
);

-- Student Trends
create table if not exists public.student_trends (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  grade_avg numeric,
  participation_avg numeric,
  flags_count integer default 0,
  notes_count integer default 0,
  risk_level text check (risk_level in ('low','medium','high','critical')) default 'low',
  created_at timestamp with time zone default now(),
  unique(student_id, period_start)
);

-- Intervention Plans (extends notes)
create table if not exists public.intervention_plans (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  staff_id uuid references teachers(id),
  goal text not null,
  strategies jsonb default '[]'::jsonb,
  status text check (status in ('active','completed','discontinued')) default 'active',
  visibility text check (visibility in ('staff-only','teachers','admin')) default 'staff-only',
  checkins jsonb default '[]'::jsonb,  -- [{date: '...', notes: '...'}]
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- RLS for new tables
alter table support_staff_groups enable row level security;
alter table support_staff_group_members enable row level security;
alter table student_trends enable row level security;
alter table intervention_plans enable row level security;


-- Support Staff Notes
create table if not exists public.support_staff_notes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  staff_id uuid references teachers(id),
  note_type text,  -- e.g., "academic", "behavior", "wellness", "intervention"
  content text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  visibility text  -- "staff-only", "teachers", "admin"
);

-- Enable Row Level Security
alter table teachers enable row level security;
alter table classes enable row level security;
alter table students enable row level security;
alter table assignments enable row level security;
alter table grades enable row level security;
alter table parent_messages enable row level security;
alter table lessons enable row level security;
alter table feed_posts enable row level security;
alter table sync_logs enable row level security;
alter table support_staff_notes enable row level security;
