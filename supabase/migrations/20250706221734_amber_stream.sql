/*
  # إنشاء جدول طلبات الخدمات

  1. جدول requests
    - id (uuid, primary key) - معرف فريد للطلب
    - member_id (uuid, FK, not null) - معرف المستفيد
    - service_id (uuid, FK, not null) - معرف الخدمة
    - status (request_status) - حالة الطلب
    - requested_amount (numeric) - المبلغ المطلوب
    - approved_amount (numeric) - المبلغ المعتمد
    - employee_id (uuid, FK) - الموظف المسؤول
    - manager_decision (text) - قرار المدير
    - rejection_reason (text) - سبب الرفض
    - notes (text) - ملاحظات
    - priority (integer) - أولوية الطلب (1-5)
    - documents_uploaded (boolean) - هل تم رفع المستندات
    - created_at (timestamptz) - تاريخ الطلب
    - updated_at (timestamptz) - تاريخ آخر تحديث
    - processed_at (timestamptz) - تاريخ المعالجة

  2. العلاقات
    - member_id → members.id
    - service_id → services.id  
    - employee_id → users.id

  3. الأمان
    - تفعيل RLS
    - سياسات شاملة للأدوار المختلفة
*/

-- إنشاء جدول طلبات الخدمات
CREATE TABLE IF NOT EXISTS requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id uuid NOT NULL,
    service_id uuid NOT NULL,
    status request_status NOT NULL DEFAULT 'pending',
    requested_amount numeric(12,2),
    approved_amount numeric(12,2),
    employee_id uuid,
    manager_decision text,
    rejection_reason text,
    notes text,
    priority integer DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
    documents_uploaded boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    processed_at timestamptz
);

-- إضافة الفهارس
CREATE INDEX IF NOT EXISTS idx_requests_member_id ON requests(member_id);
CREATE INDEX IF NOT EXISTS idx_requests_service_id ON requests(service_id);
CREATE INDEX IF NOT EXISTS idx_requests_employee_id ON requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_priority ON requests(priority);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at);
CREATE INDEX IF NOT EXISTS idx_requests_processed_at ON requests(processed_at);

-- إضافة قيود التحقق
ALTER TABLE requests ADD CONSTRAINT check_request_amounts 
    CHECK (
        (requested_amount IS NULL OR requested_amount > 0) AND
        (approved_amount IS NULL OR approved_amount > 0)
    );

ALTER TABLE requests ADD CONSTRAINT check_approved_not_exceed_requested 
    CHECK (
        approved_amount IS NULL OR 
        requested_amount IS NULL OR 
        approved_amount <= requested_amount
    );

-- تفعيل أمان مستوى الصف
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة: المستفيد يرى طلباته، الموظفون يرون الجميع
CREATE POLICY "requests_select_policy" ON requests
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM members 
            WHERE id = requests.member_id 
            AND user_id::text = auth.uid()::text
        ) OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('admin', 'branch_manager', 'employee')
        )
    );

-- سياسة التحديث: الموظفون يحدثون الطلبات
CREATE POLICY "requests_update_policy" ON requests
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('admin', 'branch_manager', 'employee')
        )
    );

-- سياسة الإدراج: المستفيدون يضيفون طلبات جديدة
CREATE POLICY "requests_insert_policy" ON requests
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM members 
            WHERE id = requests.member_id 
            AND user_id::text = auth.uid()::text
        ) OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('admin', 'branch_manager', 'employee')
        )
    );

-- دالة تحديث processed_at عند تغيير الحالة
CREATE OR REPLACE FUNCTION update_request_processed_at()
RETURNS TRIGGER AS $$
BEGIN
    -- تحديث processed_at عند تغيير الحالة من pending
    IF OLD.status = 'pending' AND NEW.status != 'pending' THEN
        NEW.processed_at = now();
    END IF;
    
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ربط trigger التحديث
DROP TRIGGER IF EXISTS update_requests_processed_at ON requests;
CREATE TRIGGER update_requests_processed_at
    BEFORE UPDATE ON requests
    FOR EACH ROW
    EXECUTE FUNCTION update_request_processed_at();