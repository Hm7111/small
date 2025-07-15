/*
  # إنشاء جدول الخدمات

  1. جدول services
    - id (uuid, primary key) - معرف فريد للخدمة
    - name (text, not null) - اسم الخدمة
    - description (text) - وصف الخدمة
    - requirements (text) - متطلبات الحصول على الخدمة
    - category (text) - فئة الخدمة
    - max_amount (numeric) - الحد الأقصى للمبلغ (إن وجد)
    - duration_days (integer) - مدة الخدمة بالأيام
    - created_by (uuid, FK) - من أنشأ الخدمة
    - is_active (boolean) - حالة نشاط الخدمة
    - created_at (timestamptz) - تاريخ الإنشاء
    - updated_at (timestamptz) - تاريخ آخر تحديث

  2. العلاقات
    - created_by → users.id

  3. الأمان
    - تفعيل RLS
    - سياسات أمان مناسبة
*/

-- إنشاء جدول الخدمات
CREATE TABLE IF NOT EXISTS services (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    requirements text,
    category text,
    max_amount numeric(12,2),
    duration_days integer,
    created_by uuid,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- إضافة الفهارس
CREATE INDEX IF NOT EXISTS idx_services_name ON services(name);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_created_by ON services(created_by);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_created_at ON services(created_at);

-- إضافة قيود التحقق
ALTER TABLE services ADD CONSTRAINT check_service_name_length 
    CHECK (char_length(name) >= 2 AND char_length(name) <= 200);

ALTER TABLE services ADD CONSTRAINT check_service_max_amount 
    CHECK (max_amount IS NULL OR max_amount > 0);

ALTER TABLE services ADD CONSTRAINT check_service_duration 
    CHECK (duration_days IS NULL OR duration_days > 0);

-- تفعيل أمان مستوى الصف
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة: الجميع يمكنه رؤية الخدمات النشطة
CREATE POLICY "services_select_policy" ON services
    FOR SELECT
    TO authenticated
    USING (is_active = true);

-- سياسة التحديث: الإدارة والمنشئ يمكنهما التحديث
CREATE POLICY "services_update_policy" ON services
    FOR UPDATE
    TO authenticated
    USING (
        created_by::text = auth.uid()::text OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- سياسة الإدراج: الإدارة فقط تضيف خدمات جديدة
CREATE POLICY "services_insert_policy" ON services
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- ربط trigger التحديث التلقائي
DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();