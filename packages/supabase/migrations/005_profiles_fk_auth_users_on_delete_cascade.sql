-- Ensure profile rows are automatically removed when the corresponding auth user is deleted.
-- This replaces the existing FK from public.profiles(id) -> auth.users(id) with ON DELETE CASCADE.
DO $$
DECLARE
    fk_record RECORD;
BEGIN
    IF to_regclass('public.profiles') IS NULL OR to_regclass('auth.users') IS NULL THEN
        RAISE NOTICE 'Skipping migration: public.profiles or auth.users does not exist.';
        RETURN;
    END IF;

    -- Drop any existing FK on public.profiles(id) -> auth.users(id), regardless of constraint name.
    FOR fk_record IN
        SELECT c.conname
        FROM pg_constraint c
        JOIN pg_attribute src
            ON src.attrelid = c.conrelid
            AND src.attnum = c.conkey[1]
            AND NOT src.attisdropped
        JOIN pg_attribute dst
            ON dst.attrelid = c.confrelid
            AND dst.attnum = c.confkey[1]
            AND NOT dst.attisdropped
        WHERE c.contype = 'f'
          AND c.conrelid = 'public.profiles'::regclass
          AND c.confrelid = 'auth.users'::regclass
          AND array_length(c.conkey, 1) = 1
          AND array_length(c.confkey, 1) = 1
          AND src.attname = 'id'
          AND dst.attname = 'id'
    LOOP
        EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS %I', fk_record.conname);
    END LOOP;

    -- Recreate FK with ON DELETE CASCADE.
    ALTER TABLE public.profiles
        ADD CONSTRAINT profiles_id_fkey
        FOREIGN KEY (id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE;
END;
$$;

-- Verification query: confirm FK on public.profiles(id) -> auth.users(id) uses ON DELETE CASCADE.
SELECT
    c.conname AS constraint_name,
    CASE c.confdeltype
        WHEN 'a' THEN 'NO ACTION'
        WHEN 'r' THEN 'RESTRICT'
        WHEN 'c' THEN 'CASCADE'
        WHEN 'n' THEN 'SET NULL'
        WHEN 'd' THEN 'SET DEFAULT'
        ELSE c.confdeltype::text
    END AS on_delete_action,
    pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
JOIN pg_attribute src
    ON src.attrelid = c.conrelid
    AND src.attnum = c.conkey[1]
    AND NOT src.attisdropped
JOIN pg_attribute dst
    ON dst.attrelid = c.confrelid
    AND dst.attnum = c.confkey[1]
    AND NOT dst.attisdropped
WHERE c.contype = 'f'
  AND c.conrelid = 'public.profiles'::regclass
  AND c.confrelid = 'auth.users'::regclass
  AND array_length(c.conkey, 1) = 1
  AND array_length(c.confkey, 1) = 1
  AND src.attname = 'id'
  AND dst.attname = 'id';
