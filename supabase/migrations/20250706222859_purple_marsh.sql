/*
  # إنشاء جدول سير العمل للتسجيل

  1. جدول لتتبع خطوات التسجيل
    - `registration_workflow` - تتبع خطوات التسجيل والمراجعات
    
  2. الأمان
    - تفعيل RLS
    - سياسات مناسبة
    
  3. المتطلبات
    - تتبع كل خطوة في عملية التسجيل
    - تسجيل التواريخ والمراجعين
    - الملاحظات لكل خطوة
*/

-- إنشاء ENUM لخطوات التسجيل
DO $$ BEGIN
    CREATE TYPE workflow_step AS ENUM (
        'registration_started', -- بدء التسجيل
        'personal_info_completed', -- اكتمال البيانات الشخصية
        'professional_info_completed', -- اكتمال البيانات المهنية
        'address_info_completed', -- اكتمال بيانات العنوان
        'contact_info_completed', -- اكتمال بيانات التواصل
        'branch_selected', -- اختيار الفرع
        'documents_uploaded', -- رفع المستندات
        'profile_submitted', -- تقديم الملف
        'employee_review_started', -- بدء مراجعة الموظف
        'employee_review_completed', -- انتهاء مراجعة الموظف
        'manager_review_started', -- بدء مراجعة المدير
        'manager_review_completed', -- انتهاء مراجعة المدير
        'approved', -- تمت الموافقة
        'rejected', -- تم الرفض
        'needs_correction' -- يحتاج تصحيح
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- إنشاء ENUM لحالة الخطوة
DO $$ BEGIN
    CREATE TYPE workflow_step_status AS ENUM (
        'pending', -- في الانتظار
        'in_progress', -- قيد التنفيذ
        'completed', -- مكتملة
        'skipped' -- تم تخطيها
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- إنشاء جدول سير العمل
CREATE TABLE IF NOT EXISTS registration_workflow (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id uuid NOT NULL,
    step_name workflow_step NOT NULL,
    step_status workflow_step_status DEFAULT 'pending',
    started_at timestamptz,
    completed_at timestamptz,
    performed_by uuid,
    notes text,
    step_data jsonb, -- بيانات إضافية للخطوة
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- إضافة Foreign Keys
ALTER TABLE registration_workflow 
ADD CONSTRAINT fk_registration_workflow_member_id 
FOREIGN KEY (member_id) 
REFERENCES members(id) 
ON DELETE CASCADE;

ALTER TABLE registration_workflow 
ADD CONSTRAINT fk_registration_workflow_performed_by 
FOREIGN KEY (performed_by) 
REFERENCES users(id) 
ON DELETE SET NULL;

-- إضافة قيد فريد لمنع تكرار الخطوات للمستفيد الواحد
ALTER TABLE registration_workflow 
ADD CONSTRAINT unique_member_step 
UNIQUE (member_id, step_name);

-- إضافة الفهارس
CREATE INDEX IF NOT EXISTS idx_registration_workflow_member_id ON registration_workflow(member_id);
CREATE INDEX IF NOT EXISTS idx_registration_workflow_step_name ON registration_workflow(step_name);
CREATE INDEX IF NOT EXISTS idx_registration_workflow_step_status ON registration_workflow(step_status);
CREATE INDEX IF NOT EXISTS idx_registration_workflow_performed_by ON registration_workflow(performed_by);
CREATE INDEX IF NOT EXISTS idx_registration_workflow_created_at ON registration_workflow(created_at);

-- تفعيل Row Level Security
ALTER TABLE registration_workflow ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة: المستفيد يرى سير عمله، الموظفون يرون الجميع
CREATE POLICY "registration_workflow_select_policy" ON registration_workflow
    FOR SELECT
    TO authenticated
    USING (
        -- المستفيد يصل لسير عمله
        EXISTS (
            SELECT 1 FROM members 
            WHERE id = registration_workflow.member_id 
            AND user_id::text = auth.uid()::text
        ) OR
        -- الموظفون والإدارة يصلون لجميع سير العمل
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('admin', 'branch_manager', 'employee')
        )
    );

-- سياسة الإدراج: المستفيد ينشئ خطوات سير عمله، الموظفون ينشئون خطوات المراجعة
CREATE POLICY "registration_workflow_insert_policy" ON registration_workflow
    FOR INSERT
    TO authenticated
    WITH CHECK (
        -- المستفيد ينشئ خطوات سير عمله
        EXISTS (
            SELECT 1 FROM members 
            WHERE id = registration_workflow.member_id 
            AND user_id::text = auth.uid()::text
        ) OR
        -- الموظفون والإدارة ينشئون خطوات المراجعة
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('admin', 'branch_manager', 'employee')
        )
    );

-- سياسة التحديث: المستفيد يحدث خطواته، الموظفون يحدثون خطوات المراجعة
CREATE POLICY "registration_workflow_update_policy" ON registration_workflow
    FOR UPDATE
    TO authenticated
    USING (
        -- المستفيد يحدث خطواته
        EXISTS (
            SELECT 1 FROM members 
            WHERE id = registration_workflow.member_id 
            AND user_id::text = auth.uid()::text
        ) OR
        -- الموظفون والإدارة يحدثون جميع الخطوات
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('admin', 'branch_manager', 'employee')
        )
    );

-- دالة لإنشاء خطوات سير العمل تلقائياً عند تسجيل مستفيد جديد
CREATE OR REPLACE FUNCTION create_registration_workflow(member_uuid uuid)
RETURNS void AS $$
BEGIN
    INSERT INTO registration_workflow (member_id, step_name, step_status, started_at)
    VALUES 
        (member_uuid, 'registration_started', 'completed', now()),
        (member_uuid, 'personal_info_completed', 'pending', null),
        (member_uuid, 'professional_info_completed', 'pending', null),
        (member_uuid, 'address_info_completed', 'pending', null),
        (member_uuid, 'contact_info_completed', 'pending', null),
        (member_uuid, 'branch_selected', 'pending', null),
        (member_uuid, 'documents_uploaded', 'pending', null),
        (member_uuid, 'profile_submitted', 'pending', null);
END;
$$ LANGUAGE plpgsql;

-- دالة لتحديث خطوة في سير العمل
CREATE OR REPLACE FUNCTION update_workflow_step(
    member_uuid uuid,
    step workflow_step,
    status workflow_step_status,
    user_uuid uuid DEFAULT null,
    step_notes text DEFAULT null,
    additional_data jsonb DEFAULT null
)
RETURNS void AS $$
BEGIN
    UPDATE registration_workflow
    SET 
        step_status = status,
        completed_at = CASE WHEN status = 'completed' THEN now() ELSE completed_at END,
        started_at = CASE WHEN status = 'in_progress' AND started_at IS NULL THEN now() ELSE started_at END,
        performed_by = COALESCE(user_uuid, performed_by),
        notes = COALESCE(step_notes, notes),
        step_data = COALESCE(additional_data, step_data),
        updated_at = now()
    WHERE member_id = member_uuid AND step_name = step;
END;
$$ LANGUAGE plpgsql;

-- دالة لحساب نسبة اكتمال التسجيل
CREATE OR REPLACE FUNCTION calculate_registration_completion(member_uuid uuid)
RETURNS integer AS $$
DECLARE
    total_steps integer;
    completed_steps integer;
    completion_percentage integer;
BEGIN
    -- عدد الخطوات الأساسية قبل التقديم
    SELECT COUNT(*) INTO total_steps
    FROM registration_workflow
    WHERE member_id = member_uuid
    AND step_name IN (
        'personal_info_completed',
        'professional_info_completed', 
        'address_info_completed',
        'contact_info_completed',
        'branch_selected',
        'documents_uploaded'
    );
    
    -- عدد الخطوات المكتملة
    SELECT COUNT(*) INTO completed_steps
    FROM registration_workflow
    WHERE member_id = member_uuid
    AND step_name IN (
        'personal_info_completed',
        'professional_info_completed',
        'address_info_completed', 
        'contact_info_completed',
        'branch_selected',
        'documents_uploaded'
    )
    AND step_status = 'completed';
    
    -- حساب النسبة المئوية
    IF total_steps > 0 THEN
        completion_percentage := ROUND((completed_steps::decimal / total_steps::decimal) * 100);
    ELSE
        completion_percentage := 0;
    END IF;
    
    -- تحديث نسبة الاكتمال في جدول المستفيدين
    UPDATE members 
    SET profile_completion_percentage = completion_percentage
    WHERE id = member_uuid;
    
    RETURN completion_percentage;
END;
$$ LANGUAGE plpgsql;

-- ربط trigger التحديث التلقائي
DROP TRIGGER IF EXISTS update_registration_workflow_updated_at ON registration_workflow;
CREATE TRIGGER update_registration_workflow_updated_at
    BEFORE UPDATE ON registration_workflow
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();