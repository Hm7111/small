/*
  # إضافة فهارس بحث متقدمة
  
  1. الفهارس الجديدة
    - فهارس لرقم الهوية والاسم ورقم الجوال للمستفيدين
    - فهرس لعلاقة المستفيدين بالمستخدمين
    - فهارس أخرى لتحسين أداء البحث
  
  2. الأمان
    - لا يتم تعديل أي بيانات موجودة
    - إضافة فهارس فقط لتحسين الأداء
  
  3. ملاحظات
    - تم إضافة تعليق توضيحي لكل فهرس لفهم الغرض منه
*/

-- فهارس البحث النصي للمستفيدين
CREATE INDEX IF NOT EXISTS idx_members_full_text_search ON members USING GIN (
  to_tsvector('arabic', coalesce(full_name, ''))
);

-- إضافة فهرس منفصل لكل عمود للبحث السريع
CREATE INDEX IF NOT EXISTS idx_members_national_id_search ON members USING btree (national_id);
CREATE INDEX IF NOT EXISTS idx_members_phone_search ON members USING btree (phone);
CREATE INDEX IF NOT EXISTS idx_members_full_name_search ON members USING btree (full_name);

-- فهرس لتسريع عمليات البحث عن المستخدمين بالاسم ورقم الهوية
CREATE INDEX IF NOT EXISTS idx_users_full_name_search ON users USING btree (full_name);
CREATE INDEX IF NOT EXISTS idx_users_national_id_search ON users USING btree (national_id) WHERE national_id IS NOT NULL;

-- فهرس لتسريع عمليات البحث عن المستفيدين حسب الفرع
CREATE INDEX IF NOT EXISTS idx_members_preferred_branch_status ON members USING btree (preferred_branch_id, registration_status);

-- فهرس لتسريع عمليات البحث عن الطلبات حسب المستفيد والخدمة
CREATE INDEX IF NOT EXISTS idx_requests_member_service ON requests USING btree (member_id, service_id);

-- فهرس لتسريع عمليات البحث عن المستندات
CREATE INDEX IF NOT EXISTS idx_documents_member_type ON member_documents USING btree (member_id, document_type);

-- فهرس لتسريع عمليات البحث عن الموظفين حسب الفرع
CREATE INDEX IF NOT EXISTS idx_users_branch_role ON users USING btree (branch_id, role) WHERE role IN ('employee', 'branch_manager');

-- فهرس لعلاقة المستفيدين بالمستخدمين
CREATE INDEX IF NOT EXISTS idx_members_user_relationship ON members USING btree (user_id);

-- فهرس لتسريع البحث عن طلبات التسجيل حسب الحالة
CREATE INDEX IF NOT EXISTS idx_registration_status_date ON members USING btree (registration_status, created_at);

-- فهرس لتسريع البحث عن طلبات الخدمات حسب الحالة
CREATE INDEX IF NOT EXISTS idx_requests_status_date ON requests USING btree (status, created_at);

-- فهرس لتسريع التحقق من تاريخ انتهاء رموز OTP
CREATE INDEX IF NOT EXISTS idx_otp_expires_national_id ON otp_codes_temp USING btree (expires_at, national_id);

-- فهرس للبحث النصي الجزئي باستخدام المطابقة الجزئية
CREATE INDEX IF NOT EXISTS idx_members_full_name_pattern ON members USING btree (lower(full_name) text_pattern_ops);
CREATE INDEX IF NOT EXISTS idx_users_full_name_pattern ON users USING btree (lower(full_name) text_pattern_ops);

-- إضافة تعليق على الفهارس المضافة
COMMENT ON INDEX idx_members_full_text_search IS 'فهرس للبحث النصي الكامل في أسماء المستفيدين';
COMMENT ON INDEX idx_members_national_id_search IS 'فهرس للبحث السريع عن المستفيدين برقم الهوية';
COMMENT ON INDEX idx_members_phone_search IS 'فهرس للبحث السريع عن المستفيدين برقم الجوال';
COMMENT ON INDEX idx_members_full_name_search IS 'فهرس للبحث السريع عن المستفيدين بالاسم';