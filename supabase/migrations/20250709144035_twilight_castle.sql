/*
  # إصلاح ربط حساب الإدارة

  1. الهدف
    - ربط حساب المستخدم في جدول auth.users مع السجل في public.users
    - تصحيح دور المستخدم ليكون "admin" في جدول public.users
    - تحديث أي خدمات تشير إلى معرف المستخدم القديم

  2. الحل
    - البحث عن المستخدم في auth.users
    - التأكد من وجود سجل مطابق في public.users
    - ضمان وجود الدور الصحيح للمستخدم في جدول public.users
*/

-- إصلاح ربط حساب المدير بين جداول المصادقة والمستخدمين
DO $$
DECLARE
  -- متغيرات لتخزين معرفات المستخدم
  auth_user_id UUID;            -- معرف المستخدم في جدول المصادقة
  public_user_id UUID;          -- معرف المستخدم في جدول المستخدمين العام
  admin_email TEXT := 'admin@charity.org';  -- بريد المدير القياسي
  services_admin_id UUID;       -- المعرف المستخدم في الخدمات
  has_auth_user BOOLEAN;        -- هل يوجد مستخدم في نظام المصادقة؟
  needs_public_user BOOLEAN;    -- هل يحتاج إلى إنشاء سجل في جدول المستخدمين العام؟
  services_count INTEGER := 0;  -- عدد الخدمات التي تحتاج للتحديث
BEGIN
  -- 1. التحقق من وجود مستخدم في جدول المصادقة (auth.users)
  BEGIN
    SELECT id INTO auth_user_id 
    FROM auth.users 
    WHERE email = admin_email 
    LIMIT 1;
    
    has_auth_user := auth_user_id IS NOT NULL;
  EXCEPTION 
    WHEN OTHERS THEN
      has_auth_user := false;
      RAISE NOTICE 'لا يمكن الاستعلام عن جدول auth.users: %', SQLERRM;
  END;
  
  -- 2. التحقق من وجود المستخدم في جدول المستخدمين العام (public.users)
  SELECT id INTO public_user_id 
  FROM public.users 
  WHERE email = admin_email AND role = 'admin'
  LIMIT 1;
  
  -- 3. البحث عن أي معرف مستخدم يستخدم في جدول الخدمات
  SELECT created_by INTO services_admin_id
  FROM services
  WHERE created_by IS NOT NULL
  LIMIT 1;
  
  RAISE NOTICE 'حالة المدير الحالية: Auth ID: %, Public ID: %, Services ID: %', 
    COALESCE(auth_user_id::text, 'غير موجود'),
    COALESCE(public_user_id::text, 'غير موجود'),
    COALESCE(services_admin_id::text, 'غير موجود');
  
  -- 4. إذا وجد المستخدم في auth.users ولكن ليس في public.users، أنشئ سجلاً جديداً
  needs_public_user := has_auth_user AND public_user_id IS NULL;
  
  IF needs_public_user THEN
    RAISE NOTICE 'إنشاء سجل في جدول public.users للمستخدم %', auth_user_id;
    
    INSERT INTO public.users (
      id, 
      full_name, 
      email, 
      phone, 
      role, 
      is_active,
      created_at,
      updated_at
    ) VALUES (
      auth_user_id, 
      'مدير النظام',
      admin_email, 
      '+966500000000', 
      'admin', 
      true,
      now(),
      now()
    );
    
    public_user_id := auth_user_id;
  END IF;
  
  -- 5. إذا كان المستخدم موجوداً في public.users ولكن ليس لديه دور admin، قم بتحديثه
  IF public_user_id IS NOT NULL THEN
    -- التأكد من أن له دور admin
    UPDATE public.users
    SET 
      role = 'admin',
      is_active = true,
      full_name = 'مدير النظام',
      updated_at = now()
    WHERE id = public_user_id AND (role != 'admin' OR is_active = false);
    
    RAISE NOTICE 'تم تحديث مستخدم موجود لضمان دور المدير: %', public_user_id;
    
    -- حل مشكلة تعدد المستخدمين بنفس البريد الإلكتروني
    UPDATE public.users
    SET 
      email = 'old_admin_' || now()::text || '@temp.com',
      updated_at = now()
    WHERE email = admin_email AND id != public_user_id;
    
    RAISE NOTICE 'تم تغيير بريد أي مستخدم آخر له نفس البريد لتجنب التضارب';
  ELSE
    -- إذا لم يوجد مستخدم في جدول المستخدمين العام، قم بإنشاء واحد
    -- استخدم معرف من auth.users إذا وجد، وإلا أنشئ معرف جديد
    RAISE NOTICE 'لا يوجد مستخدم مدير في جدول public.users، سيتم إنشاء واحد';
    
    INSERT INTO public.users (
      id, 
      full_name, 
      email, 
      phone, 
      role, 
      is_active,
      created_at,
      updated_at
    ) VALUES (
      COALESCE(auth_user_id, gen_random_uuid()),
      'مدير النظام',
      admin_email, 
      '+966500000000', 
      'admin', 
      true,
      now(),
      now()
    );
    
    -- الحصول على المعرف المنشأ حديثاً
    SELECT id INTO public_user_id 
    FROM public.users 
    WHERE email = admin_email AND role = 'admin'
    LIMIT 1;
    
    RAISE NOTICE 'تم إنشاء مستخدم مدير جديد بمعرف: %', public_user_id;
  END IF;
  
  -- 6. تحديث الخدمات التي تشير إلى معرف NULL أو معرف غير موجود
  -- أولاً، عد عدد الخدمات التي تحتاج للتحديث
  SELECT COUNT(*) INTO services_count
  FROM services
  WHERE created_by IS NULL 
     OR (created_by != public_user_id 
         AND NOT EXISTS (SELECT 1 FROM public.users WHERE id = services.created_by));
  
  IF services_count > 0 THEN
    RAISE NOTICE 'تحديث % خدمة لتشير إلى معرف المدير الصحيح', services_count;
    
    UPDATE services
    SET created_by = public_user_id
    WHERE created_by IS NULL 
       OR (created_by != public_user_id 
           AND NOT EXISTS (SELECT 1 FROM public.users WHERE id = services.created_by));
  END IF;
  
  -- 7. عرض ملخص العملية
  RAISE NOTICE 'اكتملت عملية إصلاح حساب المدير:';
  RAISE NOTICE '- معرف المدير في جدول المستخدمين العام: %', public_user_id;
  RAISE NOTICE '- معرف المدير في نظام المصادقة: %', 
    CASE WHEN has_auth_user THEN auth_user_id::text ELSE 'غير موجود (يجب إنشاؤه يدوياً من لوحة تحكم Supabase)' END;
  RAISE NOTICE '- تم تحديث % خدمة', services_count;
  
  -- 8. تعليمات متابعة إذا كان المستخدم غير موجود في نظام المصادقة
  IF NOT has_auth_user THEN
    RAISE NOTICE 'يجب إنشاء مستخدم في نظام المصادقة:';
    RAISE NOTICE '1. اذهب إلى لوحة تحكم Supabase -> Authentication -> Users';
    RAISE NOTICE '2. انقر على "Add user"';
    RAISE NOTICE '3. أدخل البريد الإلكتروني: %', admin_email;
    RAISE NOTICE '4. أدخل كلمة مرور قوية';
    RAISE NOTICE '5. انقر على "Create user"';
  END IF;

END $$;