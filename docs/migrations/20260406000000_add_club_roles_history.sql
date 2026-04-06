-- Migration: Add club_roles_history to persons
-- This will store the history of roles a person had in the club across different generations.

ALTER TABLE persons ADD COLUMN IF NOT EXISTS club_roles_history jsonb DEFAULT '[]'::jsonb;
