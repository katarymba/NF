-- 1. Проверяем структуру users и добавляем необходимые колонки
DO $$
BEGIN
    -- Проверяем наличие колонки phone
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'phone'
    ) THEN
        ALTER TABLE users ADD COLUMN phone VARCHAR;
        UPDATE users SET phone = 'user_' || id::text;
        ALTER TABLE users ALTER COLUMN phone SET NOT NULL;
    ELSE
        -- Если колонка phone существует, но имеет ограничение NOT NULL и нет значений
        BEGIN
            ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;
            UPDATE users SET phone = 'user_' || id::text WHERE phone IS NULL;
            ALTER TABLE users ALTER COLUMN phone SET NOT NULL;
        EXCEPTION
            WHEN OTHERS THEN
            -- Игнорируем ошибки, если ограничения не существовало
        END;
    END IF;
    
    -- Проверяем индекс и создаем его если нет
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'users' AND indexname = 'ix_users_phone'
    ) THEN
        CREATE UNIQUE INDEX ix_users_phone ON users(phone);
    END IF;
    
    -- Проверяем колонку full_name
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'full_name'
    ) THEN
        ALTER TABLE users ADD COLUMN full_name VARCHAR;
    END IF;
    
    -- Проверяем колонку is_active
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE users ADD COLUMN is_active BOOLEAN;
        UPDATE users SET is_active = TRUE;
        ALTER TABLE users ALTER COLUMN is_active SET NOT NULL;
        ALTER TABLE users ALTER COLUMN is_active SET DEFAULT TRUE;
    END IF;
END $$;

-- 2. Устанавливаем версию миграции на abee15aa05cd
TRUNCATE alembic_version;
INSERT INTO alembic_version (version_num) VALUES ('abee15aa05cd');