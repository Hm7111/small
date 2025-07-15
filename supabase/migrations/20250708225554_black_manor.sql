/*
  # تحديث جدول رموز التحقق المؤقتة ورموز المرور

  1. جدول otp_codes_temp 
    - تخزين رموز OTP للتحقق من رقم الجوال
    - تتبع وقت انتهاء الصلاحية وعدد المحاولات
    
  2. جدول user_passwords
    - تخزين كلمات المرور المولدة للمستخدمين
    - دعم تكامل Supabase Auth
*/

-- إنشاء جدول رموز OTP إذا لم يكن موجودًا
CREATE TABLE IF NOT EXISTS otp_codes_temp (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    national_id text NOT NULL,
    phone_number text NOT NULL,
    otp_code text NOT NULL,
    session_id bigint NOT NULL,
    created_at timestamptz DEFAULT now(),
    expires_at timestamptz NOT NULL,
    is_verified boolean DEFAULT false,
    verification_attempts smallint DEFAULT 0,
    user_agent text,
    ip_address text,
    is_new_user boolean DEFAULT false
);

-- إضافة الفهارس (لا ضرر من إعادة إنشائها)
CREATE INDEX IF NOT EXISTS idx_otp_codes_temp_national_id ON otp_codes_temp(national_id);
CREATE INDEX IF NOT EXISTS idx_otp_codes_temp_phone ON otp_codes_temp(phone_number);
CREATE INDEX IF NOT EXISTS idx_otp_codes_temp_session_id ON otp_codes_temp(session_id);
CREATE INDEX IF NOT EXISTS idx_otp_codes_temp_expires_at ON otp_codes_temp(expires_at);

-- إضافة قيود التحقق بطريقة آمنة
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_otp_code_format' AND conrelid = 'otp_codes_temp'::regclass
    ) THEN
        ALTER TABLE otp_codes_temp ADD CONSTRAINT check_otp_code_format 
            CHECK (length(otp_code) = 4 AND otp_code ~ '^[0-9]+$');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_otp_expires_future' AND conrelid = 'otp_codes_temp'::regclass
    ) THEN
        ALTER TABLE otp_codes_temp ADD CONSTRAINT check_otp_expires_future
            CHECK (expires_at > created_at);
    END IF;
END $$;

-- تفعيل أمان مستوى الصف
ALTER TABLE otp_codes_temp ENABLE ROW LEVEL SECURITY;

-- حذف السياسات إذا كانت موجودة لإعادة إنشائها بأمان
DROP POLICY IF EXISTS "otp_codes_temp_select_policy" ON otp_codes_temp;
DROP POLICY IF EXISTS "otp_codes_temp_update_policy" ON otp_codes_temp;
DROP POLICY IF EXISTS "otp_codes_temp_insert_policy" ON otp_codes_temp;

-- إعادة إنشاء سياسات الأمان
CREATE POLICY "otp_codes_temp_select_policy" ON otp_codes_temp
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

CREATE POLICY "otp_codes_temp_update_policy" ON otp_codes_temp
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

CREATE POLICY "otp_codes_temp_insert_policy" ON otp_codes_temp
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- دالة لإزالة رموز التحقق المنتهية الصلاحية
CREATE OR REPLACE FUNCTION cleanup_expired_otp_codes()
RETURNS void AS $$
BEGIN
    DELETE FROM otp_codes_temp
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- جدول لتخزين كلمات المرور المولدة عشوائياً
CREATE TABLE IF NOT EXISTS user_passwords (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE,
    password_hash text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- إضافة الفهارس
CREATE INDEX IF NOT EXISTS idx_user_passwords_user_id ON user_passwords(user_id);

-- تفعيل أمان مستوى الصف
ALTER TABLE user_passwords ENABLE ROW LEVEL SECURITY;

-- حذف السياسات إذا كانت موجودة لإعادة إنشائها بأمان
DROP POLICY IF EXISTS "user_passwords_select_policy" ON user_passwords;
DROP POLICY IF EXISTS "user_passwords_update_policy" ON user_passwords;
DROP POLICY IF EXISTS "user_passwords_insert_policy" ON user_passwords;

-- إعادة إنشاء سياسات الأمان
CREATE POLICY "user_passwords_select_policy" ON user_passwords
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

CREATE POLICY "user_passwords_update_policy" ON user_passwords
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

CREATE POLICY "user_passwords_insert_policy" ON user_passwords
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- ربط trigger التحديث التلقائي إذا لم يكن موجودًا
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_user_passwords_updated_at' 
        AND tgrelid = 'user_passwords'::regclass
    ) THEN
        CREATE TRIGGER update_user_passwords_updated_at
            BEFORE UPDATE ON user_passwords
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;