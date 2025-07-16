/*
  # حذف الدوال الموجودة قبل إعادة إنشائها

  1. حذف الدوال الحالية
    - حذف الدوال التي تم إنشاؤها سابقًا لتجنب أخطاء التضارب
    - تحقق أولا من وجود الدالة قبل محاولة حذفها
*/

-- حذف الدوال الحالية بأمان (فقط إذا كانت موجودة)
DO $$
BEGIN
  -- حذف دالة التحقق من الصلاحيات
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'has_permission'
  ) THEN
    DROP FUNCTION IF EXISTS public.has_permission;
  END IF;

  -- حذف دالة التحقق من الفرع
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'is_in_same_branch'
  ) THEN
    DROP FUNCTION IF EXISTS public.is_in_same_branch;
  END IF;

  -- حذف دالة التحقق من المدير
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'is_admin_user'
  ) THEN
    DROP FUNCTION IF EXISTS public.is_admin_user;
  END IF;
END
$$;