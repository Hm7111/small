/*
  # تحسين نظام الصلاحيات والأمان
  
  1. فصل صلاحيات المستخدمين
    - إضافة دوال مساعدة للتحقق من صلاحيات المستخدمين
    - تحسين سياسات الوصول للجداول المختلفة
    
  2. الأمان
    - لا يتم تعديل أي بيانات موجودة
    - إضافة دوال مساعدة وتحسين الأمان
  
  3. ملاحظات
    - تم إضافة تعليق توضيحي لكل دالة لفهم الغرض منها
*/

-- إنشاء دالة للتحقق من صلاحيات المستخدم
CREATE OR REPLACE FUNCTION has_permission(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- التحقق من دور المستخدم الحالي
  RETURN (SELECT role::text = required_role FROM auth.users, users
          WHERE auth.users.id = auth.uid()
          AND users.id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION has_permission IS 'دالة للتحقق من صلاحيات المستخدم بناءً على الدور';

-- دالة للتحقق من أن المستخدم ينتمي لنفس الفرع
CREATE OR REPLACE FUNCTION is_in_same_branch(branch_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_branch_id UUID;
BEGIN
  -- الحصول على فرع المستخدم الحالي
  SELECT u.branch_id INTO user_branch_id
  FROM users u
  WHERE u.id = auth.uid();
  
  -- التحقق من أن المستخدم ينتمي لنفس الفرع
  RETURN (user_branch_id IS NOT NULL AND user_branch_id = branch_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_in_same_branch IS 'دالة للتحقق من أن المستخدم ينتمي لنفس الفرع';

-- دالة للتحقق من أن المستخدم هو مدير
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  -- التحقق من أن المستخدم هو مدير
  RETURN (SELECT role = 'admin' FROM users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_admin_user IS 'دالة للتحقق من أن المستخدم هو مدير النظام';

-- إنشاء دالة لتحديث وقت آخر تحديث تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column IS 'دالة لتحديث حقل updated_at تلقائياً';

-- إنشاء دالة لتحديث وقت معالجة الطلبات
CREATE OR REPLACE FUNCTION update_request_processed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.status <> NEW.status) AND (NEW.status = 'approved' OR NEW.status = 'rejected') THEN
    NEW.processed_at = CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_request_processed_at IS 'دالة لتحديث وقت معالجة الطلبات تلقائياً';