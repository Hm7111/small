/*
  # إضافة فهارس للبحث

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

-- إضافة فهارس للبحث في جدول members
CREATE INDEX IF NOT EXISTS "idx_members_fulltext_search" ON public.members USING GIN (
  to_tsvector('arabic', coalesce(full_name, '')) || 
  to_tsvector('arabic', coalesce(city, '')) ||
  to_tsvector('arabic', coalesce(district, ''))
);

-- فهرس للمزيد من الحقول التي تستخدم في البحث والتصفية
CREATE INDEX IF NOT EXISTS "idx_members_combined" ON public.members (full_name, national_id, phone, city, disability_type);

-- فهرس لتحسين أداء الاستعلامات على حالة المستفيد
CREATE INDEX IF NOT EXISTS "idx_members_status_types" ON public.members (status, registration_status);

-- إضافة فهارس للبحث في جدول requests
CREATE INDEX IF NOT EXISTS "idx_requests_search" ON public.requests (member_id, service_id, status, created_at);

-- تحسين عمليات البحث عن الطلبات حسب التاريخ
CREATE INDEX IF NOT EXISTS "idx_requests_dates" ON public.requests (created_at, processed_at, updated_at);

-- إضافة فهرس لعلاقة المستخدمين والفروع
CREATE INDEX IF NOT EXISTS "idx_users_branch" ON public.users (branch_id, role);

-- تحسين البحث في المستندات
CREATE INDEX IF NOT EXISTS "idx_member_documents_verification" ON public.member_documents (member_id, verification_status);

-- تحسين عمليات البحث والتصفية للخدمات
CREATE INDEX IF NOT EXISTS "idx_services_search" ON public.services (name, category, is_active, deleted_at);

-- إضافة تعليق توضيحي
COMMENT ON INDEX public.idx_members_fulltext_search IS 'فهرس بحث نصي كامل للمستفيدين';
COMMENT ON INDEX public.idx_members_combined IS 'فهرس مركب للبحث السريع عن المستفيدين';
COMMENT ON INDEX public.idx_members_status_types IS 'فهرس لتصفية المستفيدين حسب الحالة';
COMMENT ON INDEX public.idx_requests_search IS 'فهرس للبحث في الطلبات';
COMMENT ON INDEX public.idx_requests_dates IS 'فهرس لعمليات البحث بالتاريخ';
COMMENT ON INDEX public.idx_users_branch IS 'فهرس للعلاقة بين المستخدمين والفروع';
COMMENT ON INDEX public.idx_member_documents_verification IS 'فهرس لتسريع البحث في حالات التحقق من المستندات';
COMMENT ON INDEX public.idx_services_search IS 'فهرس للبحث في الخدمات';