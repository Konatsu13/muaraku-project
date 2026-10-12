-- Migration: Add gender column to user_profiles
-- Date: 2026-10-12
-- Author: AI Engineering Agent
-- Safety: Additive, safe for production

alter table public.user_profiles
  add column if not exists gender text
  check (gender is null or gender in ('male', 'female', 'unspecified'));

comment on column public.user_profiles.gender is 'User gender choice: male, female, or unspecified (prefer not to say)';
