/*
  # إضافة فهارس محسّنة للبحث

  1. فهارس البحث
    - فهارس لرقم الهوية والاسم ورقم الجوال للمستفيدين
    - فهرس لعلاقة المستفيدين بالمستخدمين
    - فهارس أخرى لتحسين أداء البحث
    
  2. الأمان
    - لا يتم تعديل أي بيانات موجودة
    - إضافة فهارس فقط لتحسين الأداء
    
  3. ملاحظات
    - تم إضافة تعليق توضيحي لكل فهرس لفهم الغرض منه
*/

-- فهارس لجدول المستفيدين
-- فهرس للبحث بالاسم (بحث نصي عادي)
CREATE INDEX IF NOT EXISTS idx_members_full_name_search 
ON public.members(full_name) 
WITH (fillfactor = 90);
COMMENT ON INDEX idx_members_full_name_search IS 'فهرس للبحث السريع عن المستفيدين بالاسم';

-- فهرس للبحث بالاسم (بحث بأنماط النصوص)
CREATE INDEX IF NOT EXISTS idx_members_full_name_pattern 
ON public.members(lower(full_name) text_pattern_ops) 
WITH (fillfactor = 90);

-- فهرس للبحث برقم الهوية
CREATE INDEX IF NOT EXISTS idx_members_national_id 
ON public.members(national_id) 
WITH (fillfactor = 90);

-- فهرس للبحث برقم الهوية فقط للقيم غير الفارغة
CREATE INDEX IF NOT EXISTS idx_members_national_id_search 
ON public.members(national_id) 
WITH (fillfactor = 90);
COMMENT ON INDEX idx_members_national_id_search IS 'فهرس للبحث السريع عن المستفيدين برقم الهوية';

-- فهرس للبحث برقم الجوال
CREATE INDEX IF NOT EXISTS idx_members_phone_search 
ON public.members(phone) 
WITH (fillfactor = 90);
COMMENT ON INDEX idx_members_phone_search IS 'فهرس للبحث السريع عن المستفيدين برقم الجوال';

-- فهرس للبحث النصي الكامل في الاسماء
CREATE INDEX IF NOT EXISTS idx_members_full_text_search 
ON public.members USING gin (to_tsvector('arabic', COALESCE(full_name, '')));
COMMENT ON INDEX idx_members_full_text_search IS 'فهرس للبحث النصي الكامل في أسماء المستفيدين';

-- فهارس إضافية لتحسين الأداء
-- فهرس لعلاقة المستفيدين بالمستخدمين
CREATE INDEX IF NOT EXISTS idx_members_user_relationship 
ON public.members(user_id);

-- فهرس لحالة التسجيل
CREATE INDEX IF NOT EXISTS idx_members_registration_status 
ON public.members(registration_status);

-- فهرس للتاريخ + حالة التسجيل
CREATE INDEX IF NOT EXISTS idx_registration_status_date 
ON public.members(registration_status, created_at);

-- فهرس للفرع المفضل
CREATE INDEX IF NOT EXISTS idx_members_preferred_branch 
ON public.members(preferred_branch_id);

-- فهرس مركب للفرع + المدينة
CREATE INDEX IF NOT EXISTS idx_members_preferred_branch_city 
ON public.members(preferred_branch_id, city);

-- فهرس مركب للفرع + حالة التسجيل
CREATE INDEX IF NOT EXISTS idx_members_preferred_branch_status 
ON public.members(preferred_branch_id, registration_status);

-- فهارس لتسريع البحث في المراجعات
CREATE INDEX IF NOT EXISTS idx_members_reviewed_by_employee 
ON public.members(reviewed_by_employee);

CREATE INDEX IF NOT EXISTS idx_members_reviewed_by_manager 
ON public.members(reviewed_by_manager);

-- فهارس إضافية للمستخدمين
CREATE INDEX IF NOT EXISTS idx_users_national_id 
ON public.users(national_id);

CREATE INDEX IF NOT EXISTS idx_users_email 
ON public.users(email);

CREATE INDEX IF NOT EXISTS idx_users_branch_id 
ON public.users(branch_id);

-- فهرس مركب للمستخدمين حسب الفرع والدور
CREATE INDEX IF NOT EXISTS idx_users_branch_role 
ON public.users(branch_id, role) 
WHERE role IN ('employee', 'branch_manager');

CREATE INDEX IF NOT EXISTS idx_users_role 
ON public.users(role);

CREATE INDEX IF NOT EXISTS idx_users_created_at 
ON public.users(created_at);

CREATE INDEX IF NOT EXISTS idx_users_full_name_search 
ON public.users(full_name);

CREATE INDEX IF NOT EXISTS idx_users_full_name_pattern 
ON public.users(lower(full_name) text_pattern_ops);

CREATE INDEX IF NOT EXISTS idx_users_national_id_search 
ON public.users(national_id) 
WHERE national_id IS NOT NULL;

-- فهارس للوثائق
CREATE INDEX IF NOT EXISTS idx_member_documents_member_id 
ON public.member_documents(member_id);

CREATE INDEX IF NOT EXISTS idx_member_documents_type 
ON public.member_documents(document_type);

CREATE INDEX IF NOT EXISTS idx_member_documents_status 
ON public.member_documents(verification_status);

CREATE INDEX IF NOT EXISTS idx_member_documents_uploaded_at 
ON public.member_documents(uploaded_at);

CREATE INDEX IF NOT EXISTS idx_member_documents_verified_by 
ON public.member_documents(verified_by);

-- فهرس مركب للمستندات
CREATE INDEX IF NOT EXISTS idx_documents_member_type 
ON public.member_documents(member_id, document_type);