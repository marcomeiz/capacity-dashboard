-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_net";

-- Create tables
create table collaborators (
    id uuid primary key default uuid_generate_v4(),
    cor_id integer,
    first_name text not null,
    last_name text not null,
    picture_url text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

create table tasks (
    id uuid primary key default uuid_generate_v4(),
    cor_id integer unique not null,
    title text not null,
    project_name text not null,
    client_name text not null,
    status text not null,
    start_date timestamp with time zone not null,
    deadline timestamp with time zone,
    hours_charged decimal not null default 0,
    hours_estimated decimal not null default 0,
    project_manager text not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

create table task_collaborators (
    id uuid primary key default uuid_generate_v4(),
    task_id uuid references tasks(id) on delete cascade,
    collaborator_name text not null,
    hours_charged decimal not null default 0,
    hours_estimated decimal not null default 0,
    created_at timestamp with time zone default now()
);

create table absences (
    id uuid primary key default uuid_generate_v4(),
    factorial_id text unique,
    employee_name text not null,
    start_date date not null,
    end_date date not null,
    absence_type text not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Create indexes
create index tasks_date_idx on tasks(start_date);
create index tasks_cor_id_idx on tasks(cor_id);
create index task_collaborators_name_idx on task_collaborators(collaborator_name);
create index absences_date_idx on absences(start_date, end_date);
create index absences_employee_idx on absences(employee_name);

-- Create function for updating timestamps
create or replace function update_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create triggers
create trigger update_tasks_updated_at
    before update on tasks
    for each row
    execute function update_updated_at();

create trigger update_collaborators_updated_at
    before update on collaborators
    for each row
    execute function update_updated_at();

create trigger update_absences_updated_at
    before update on absences
    for each row
    execute function update_updated_at();