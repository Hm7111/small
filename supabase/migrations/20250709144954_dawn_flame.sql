-- إجراء لإصلاح معرّف المستخدم المدير بين نظامي المصادقة والمستخدمين
DO $$
DECLARE
  auth_user_id UUID := '7151aed7-6856-4ae7-bb15-41125c7c98ba';  -- المعرّف من نظام المصادقة
  public_user_id UUID;  -- سيتم تحديده من الاستعلام
  admin_email TEXT := 'admin@charity.org';
  services_count INTEGER := 0;
  admin_exists BOOLEAN;
BEGIN
  -- 1. التحقق مما إذا كان المستخدم المدير موجود بالفعل
  SELECT EXISTS(
    SELECT 1 FROM public.users WHERE email = admin_email
  ) INTO admin_exists;
  
  RAISE NOTICE 'المستخدم المدير موجود: %', admin_exists;
  
  -- 2. إنشاء المستخدم بمعرف المصادقة أولاً (أو التأكد من وجوده)
  INSERT INTO public.users (
    id, 
    full_name, 
    email, 
    phone, 
    role, 
    is_active,
    created_at,
    updated_at
  )
  VALUES (
    auth_user_id,
    'مدير النظام',
    'admin@charity.org.temp', -- استخدام بريد مؤقت لتجنب التضارب
    '+966500000000',
    'admin',
    true,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active,
    updated_at = EXCLUDED.updated_at;
  
  RAISE NOTICE 'تم إنشاء/تحديث المستخدم المدير بالمعرّف: %', auth_user_id;
  
  IF admin_exists THEN
    -- 3. الحصول على معرف المستخدم المدير الحالي
    SELECT id INTO public_user_id
    FROM public.users
    WHERE email = admin_email;
    
    RAISE NOTICE 'معرّف المستخدم المدير الحالي: %', public_user_id;
    
    -- 4. إذا كان المعرّف الحالي مختلفًا عن معرّف المصادقة
    IF public_user_id != auth_user_id THEN
      -- 5. تحديث الخدمات المرتبطة بالمعرّف القديم للإشارة إلى المعرّف الجديد
      UPDATE services 
      SET created_by = auth_user_id
      WHERE created_by = public_user_id;
      
      GET DIAGNOSTICS services_count = ROW_COUNT;
      RAISE NOTICE 'تم تحديث % خدمة لاستخدام المعرّف الجديد', services_count;
      
      -- 6. حذف المستخدم القديم بعد نقل جميع العلاقات
      DELETE FROM public.users 
      WHERE id = public_user_id;
      
      RAISE NOTICE 'تم حذف المستخدم القديم بالمعرّف: %', public_user_id;
    ELSE
      RAISE NOTICE 'المعرّفات متطابقة بالفعل.';
    END IF;
  END IF;
  
  -- 7. تحديث البريد الإلكتروني للمستخدم الجديد إلى القيمة الصحيحة
  UPDATE public.users
  SET 
    email = admin_email,
    role = 'admin',
    is_active = true,
    full_name = 'مدير النظام',
    updated_at = now()
  WHERE id = auth_user_id;
  
  RAISE NOTICE 'اكتملت عملية إصلاح معرّف المستخدم المدير بنجاح';
  RAISE NOTICE 'الآن يجب أن تكون قادرًا على تسجيل الدخول باستخدام admin@charity.org';
END $$;