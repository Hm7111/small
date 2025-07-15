/*
  # إنشاء جدول المستفيدين

  1. جدول members
    - id (uuid, primary key) - معرف فريد للمستفيد
    - user_id (uuid, FK) - ربط مع جدول المستخدمين
    - full_name (text, not null) - الاسم الكامل
    - national_id (text, unique, not null) - رقم الهوية الوطنية
    - phone (text, not null) - رقم الهاتف
    - gender (gender_type, not null) - الجنس
    - birth_date (date) - تاريخ الميلاد
    - city (text, not null) - المدينة
    - address (text) - العنوان
    - email (text) - البريد الإلكتروني
    - status (member_status) - حالة المستفيد
    - notes (text) - ملاحظات
    - created_at (timestamptz) - تاريخ التسجيل
    - updated_at (timestamptz) - تاريخ آخر تحديث

  2. العلاقات
    - user_id → users.id (علاقة واحد لواحد)

  3. الأمان
    - تفعيل RLS
    - سياسات أمان شاملة
*/

-- إنشاء جدول المستفيدين
CREATE TABLE IF NOT EXISTS members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    full_name text NOT NULL,
    national_id text UNIQUE NOT NULL,
    phone text NOT NULL,
    gender gender_type NOT NULL,
    birth_date date,
    city text NOT NULL,
    address text,
    email text,
    status member_status NOT NULL DEFAULT 'active',
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- إضافة الفهارس
CREATE INDEX IF NOT EXISTS idx_members_user_id ON members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_national_id ON members(national_id);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_city ON members(city);
CREATE INDEX IF NOT EXISTS idx_members_gender ON members(gender);
CREATE INDEX IF NOT EXISTS idx_members_created_at ON members(created_at);

-- إضافة قيود التحقق
ALTER TABLE members ADD CONSTRAINT check_member_national_id_format 
    CHECK (national_id ~ '^[0-9]{10}$');

ALTER TABLE members ADD CONSTRAINT check_member_phone_format 
    CHECK (phone ~ '^[0-9+\-\s()]{10,20}$');

ALTER TABLE members ADD CONSTRAINT check_member_email_format 
    CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE members ADD CONSTRAINT check_member_name_length 
    CHECK (char_length(full_name) >= 2 AND char_length(full_name) <= 100);

ALTER TABLE members ADD CONSTRAINT check_member_birth_date 
    CHECK (birth_date IS NULL OR birth_date <= CURRENT_DATE);

-- تفعيل أمان مستوى الصف
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة: المستفيد يرى بياناته، الموظفون والإدارة يرون الجميع
CREATE POLICY "members_select_policy" ON members
    FOR SELECT
    TO authenticated
    USING (
        user_id::text = auth.uid()::text OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('admin', 'branch_manager', 'employee')
        )
    );

-- سياسة التحديث: المستفيد يحدث بياناته، الموظفون يحدثون الجميع
CREATE POLICY "members_update_policy" ON members
    FOR UPDATE
    TO authenticated
    USING (
        user_id::text = auth.uid()::text OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('admin', 'branch_manager', 'employee')
        )
    );

-- سياسة الإدراج: الموظفون والإدارة يضيفون مستفيدين جدد
CREATE POLICY "members_insert_policy" ON members
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('admin', 'branch_manager', 'employee')
        )
    );

-- ربط trigger التحديث التلقائي
DROP TRIGGER IF EXISTS update_members_updated_at ON members;
CREATE TRIGGER update_members_updated_at
    BEFORE UPDATE ON members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();