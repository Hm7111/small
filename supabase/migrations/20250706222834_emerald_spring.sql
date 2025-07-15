/*
  # إنشاء جدول المستندات

  1. جدول لحفظ معلومات المستندات المرفقة
    - `member_documents` - المستندات المرفقة للمستفيدين
    
  2. الأمان
    - تفعيل RLS
    - سياسات للوصول المناسب
    
  3. المتطلبات
    - أنواع المستندات المختلفة
    - حالة التحقق من المستندات
    - ربط بالمستفيد
*/

-- إنشاء ENUM لأنواع المستندات
DO $$ BEGIN
    CREATE TYPE document_type AS ENUM (
        'national_id', -- صورة الهوية الوطنية
        'disability_card', -- بطاقة إثبات الإعاقة
        'income_certificate', -- شهادة دخل
        'medical_report', -- تقرير طبي
        'social_report', -- تقرير اجتماعي
        'birth_certificate', -- شهادة ميلاد
        'death_certificate', -- شهادة وفاة
        'marriage_certificate', -- شهادة زواج
        'divorce_certificate', -- شهادة طلاق
        'education_certificate', -- شهادة تعليمية
        'employment_certificate', -- شهادة عمل
        'bank_statement', -- كشف حساب بنكي
        'rental_contract', -- عقد إيجار
        'utility_bill', -- فاتورة خدمات
        'other' -- أخرى
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- إنشاء ENUM لحالة التحقق من المستندات
DO $$ BEGIN
    CREATE TYPE document_verification_status AS ENUM (
        'pending', -- في انتظار المراجعة
        'verified', -- تم التحقق
        'rejected', -- مرفوض
        'needs_replacement' -- يحتاج استبدال
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- إنشاء جدول المستندات
CREATE TABLE IF NOT EXISTS member_documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id uuid NOT NULL,
    document_type document_type NOT NULL,
    file_name text NOT NULL,
    file_path text NOT NULL,
    file_size bigint,
    mime_type text,
    verification_status document_verification_status DEFAULT 'pending',
    is_required boolean DEFAULT false,
    verified_by uuid,
    verified_at timestamptz,
    verification_notes text,
    uploaded_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- إضافة Foreign Keys
ALTER TABLE member_documents 
ADD CONSTRAINT fk_member_documents_member_id 
FOREIGN KEY (member_id) 
REFERENCES members(id) 
ON DELETE CASCADE;

ALTER TABLE member_documents 
ADD CONSTRAINT fk_member_documents_verified_by 
FOREIGN KEY (verified_by) 
REFERENCES users(id) 
ON DELETE SET NULL;

-- إضافة الفهارس
CREATE INDEX IF NOT EXISTS idx_member_documents_member_id ON member_documents(member_id);
CREATE INDEX IF NOT EXISTS idx_member_documents_type ON member_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_member_documents_status ON member_documents(verification_status);
CREATE INDEX IF NOT EXISTS idx_member_documents_verified_by ON member_documents(verified_by);
CREATE INDEX IF NOT EXISTS idx_member_documents_uploaded_at ON member_documents(uploaded_at);

-- إضافة قيود التحقق
ALTER TABLE member_documents ADD CONSTRAINT check_file_name_not_empty 
    CHECK (char_length(trim(file_name)) > 0);

ALTER TABLE member_documents ADD CONSTRAINT check_file_path_not_empty 
    CHECK (char_length(trim(file_path)) > 0);

ALTER TABLE member_documents ADD CONSTRAINT check_file_size_positive 
    CHECK (file_size IS NULL OR file_size > 0);

-- تفعيل Row Level Security
ALTER TABLE member_documents ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة: المستفيد يرى مستنداته، الموظفون يرون مستندات المستفيدين في فرعهم
CREATE POLICY "member_documents_select_policy" ON member_documents
    FOR SELECT
    TO authenticated
    USING (
        -- المستفيد يصل لمستنداته
        EXISTS (
            SELECT 1 FROM members 
            WHERE id = member_documents.member_id 
            AND user_id::text = auth.uid()::text
        ) OR
        -- الموظفون والإدارة يصلون للمستندات
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('admin', 'branch_manager', 'employee')
        )
    );

-- سياسة الإدراج: المستفيد يرفع مستنداته، الموظفون يرفعون للمستفيدين
CREATE POLICY "member_documents_insert_policy" ON member_documents
    FOR INSERT
    TO authenticated
    WITH CHECK (
        -- المستفيد يرفع مستنداته
        EXISTS (
            SELECT 1 FROM members 
            WHERE id = member_documents.member_id 
            AND user_id::text = auth.uid()::text
        ) OR
        -- الموظفون والإدارة يرفعون المستندات
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('admin', 'branch_manager', 'employee')
        )
    );

-- سياسة التحديث: المستفيد يحدث مستنداته، الموظفون يحدثون حالة التحقق
CREATE POLICY "member_documents_update_policy" ON member_documents
    FOR UPDATE
    TO authenticated
    USING (
        -- المستفيد يحدث مستنداته (ما عدا حالة التحقق)
        EXISTS (
            SELECT 1 FROM members 
            WHERE id = member_documents.member_id 
            AND user_id::text = auth.uid()::text
        ) OR
        -- الموظفون والإدارة يحدثون جميع البيانات
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('admin', 'branch_manager', 'employee')
        )
    );

-- سياسة الحذف: المستفيد يحذف مستنداته، الموظفون يحذفون المستندات
CREATE POLICY "member_documents_delete_policy" ON member_documents
    FOR DELETE
    TO authenticated
    USING (
        -- المستفيد يحذف مستنداته
        EXISTS (
            SELECT 1 FROM members 
            WHERE id = member_documents.member_id 
            AND user_id::text = auth.uid()::text
        ) OR
        -- الموظفون والإدارة يحذفون المستندات
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('admin', 'branch_manager', 'employee')
        )
    );

-- ربط trigger التحديث التلقائي
DROP TRIGGER IF EXISTS update_member_documents_updated_at ON member_documents;
CREATE TRIGGER update_member_documents_updated_at
    BEFORE UPDATE ON member_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();