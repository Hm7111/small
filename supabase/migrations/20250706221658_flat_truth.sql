/*
  # إنشاء جدول الفروع

  1. جدول branches
    - id (uuid, primary key) - معرف فريد للفرع
    - name (text, not null) - اسم الفرع
    - city (text, not null) - المدينة
    - address (text) - العنوان التفصيلي
    - phone (text) - هاتف الفرع
    - manager_id (uuid) - معرف مدير الفرع (FK إلى users)
    - is_active (boolean) - حالة النشاط
    - created_at (timestamptz) - تاريخ الإنشاء
    - updated_at (timestamptz) - تاريخ آخر تحديث

  2. العلاقات
    - manager_id → users.id (علاقة واحد لواحد)

  3. الأمان
    - تفعيل RLS
    - سياسات أمان مناسبة للأدوار المختلفة
*/

-- إنشاء جدول الفروع
CREATE TABLE IF NOT EXISTS branches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    city text NOT NULL,
    address text,
    phone text,
    manager_id uuid,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- إضافة الفهارس
CREATE INDEX IF NOT EXISTS idx_branches_city ON branches(city);
CREATE INDEX IF NOT EXISTS idx_branches_manager_id ON branches(manager_id);
CREATE INDEX IF NOT EXISTS idx_branches_is_active ON branches(is_active);

-- إضافة قيود التحقق
ALTER TABLE branches ADD CONSTRAINT check_branch_name_length 
    CHECK (char_length(name) >= 2 AND char_length(name) <= 100);

ALTER TABLE branches ADD CONSTRAINT check_branch_city_length 
    CHECK (char_length(city) >= 2 AND char_length(city) <= 50);

-- تفعيل أمان مستوى الصف
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة: الجميع يمكنه رؤية الفروع النشطة
CREATE POLICY "branches_select_policy" ON branches
    FOR SELECT
    TO authenticated
    USING (is_active = true);

-- سياسة التحديث: الإدارة ومدراء الفروع يمكنهم التحديث
CREATE POLICY "branches_update_policy" ON branches
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND (role = 'admin' OR (role = 'branch_manager' AND id = branches.manager_id))
        )
    );

-- سياسة الإدراج: الإدارة فقط تضيف فروع جديدة
CREATE POLICY "branches_insert_policy" ON branches
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
DROP TRIGGER IF EXISTS update_branches_updated_at ON branches;
CREATE TRIGGER update_branches_updated_at
    BEFORE UPDATE ON branches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();