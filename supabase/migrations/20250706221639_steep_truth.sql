/*
  # إنشاء جدول المستخدمين

  1. جدول users
    - id (uuid, primary key) - معرف فريد للمستخدم
    - full_name (text, not null) - الاسم الكامل
    - email (text, unique) - البريد الإلكتروني (للإدارة والموظفين)
    - national_id (text, unique) - رقم الهوية الوطنية (للمستفيدين والموظفين)
    - phone (text, not null) - رقم الهاتف
    - role (user_role, not null) - دور المستخدم
    - branch_id (uuid) - معرف الفرع (للموظفين)
    - is_active (boolean) - حالة النشاط
    - created_at (timestamptz) - تاريخ الإنشاء
    - updated_at (timestamptz) - تاريخ آخر تحديث

  2. الفهارس والقيود
    - فهرس على email للبحث السريع
    - فهرس على national_id للبحث السريع
    - فهرس على role للفلترة
    - قيد unique على email و national_id

  3. الأمان
    - تفعيل RLS
    - سياسات أمان للقراءة والكتابة
*/

-- إنشاء جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name text NOT NULL,
    email text UNIQUE,
    national_id text UNIQUE,
    phone text NOT NULL,
    role user_role NOT NULL DEFAULT 'beneficiary',
    branch_id uuid,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- إضافة الفهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_national_id ON users(national_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_branch_id ON users(branch_id);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- إضافة قيود التحقق
ALTER TABLE users ADD CONSTRAINT check_email_format 
    CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE users ADD CONSTRAINT check_national_id_format 
    CHECK (national_id IS NULL OR (national_id ~ '^[0-9]{10}$'));

ALTER TABLE users ADD CONSTRAINT check_phone_format 
    CHECK (phone ~ '^[0-9+\-\s()]{10,20}$');

-- إضافة قيد منطقي: الإدارة يجب أن يكون لها email
ALTER TABLE users ADD CONSTRAINT check_admin_email 
    CHECK ((role = 'admin' AND email IS NOT NULL) OR role != 'admin');

-- إضافة قيد منطقي: غير الإدارة يجب أن يكون لها national_id
ALTER TABLE users ADD CONSTRAINT check_non_admin_national_id 
    CHECK ((role != 'admin' AND national_id IS NOT NULL) OR role = 'admin');

-- تفعيل أمان مستوى الصف
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة: المستخدمون يمكنهم رؤية بياناتهم الخاصة والإدارة ترى الجميع
CREATE POLICY "users_select_policy" ON users
    FOR SELECT
    TO authenticated
    USING (
        auth.uid()::text = id::text OR 
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- سياسة التحديث: المستخدمون يمكنهم تحديث بياناتهم والإدارة تحدث الجميع
CREATE POLICY "users_update_policy" ON users
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid()::text = id::text OR 
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- سياسة الإدراج: الإدارة فقط تضيف مستخدمين جدد
CREATE POLICY "users_insert_policy" ON users
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- دالة تحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ربط الدالة بجدول المستخدمين
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();