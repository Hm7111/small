/*
  # تحسين الصلاحيات والأمان

  1. الصلاحيات الجديدة
    - تحديد صلاحيات الوصول بشكل دقيق لكل نوع من المستخدمين
    - تطبيق Row Level Security بشكل متقدم
    
  2. الأمان
    - تحسين التحقق من هوية المستخدم
    - فصل الصلاحيات حسب الدور بشكل واضح

  3. الدوال
    - إضافة دوال مساعدة للتحقق من صلاحيات المستخدم
*/

-- دالة للتحقق مما إذا كان المستخدم هو المستفيد نفسه
CREATE OR REPLACE FUNCTION public.is_own_member_record(member_id uuid)
RETURNS BOOLEAN AS $$
DECLARE
  user_member_id uuid;
BEGIN
  -- البحث عن معرف المستفيد المرتبط بالمستخدم الحالي
  SELECT id INTO user_member_id 
  FROM members 
  WHERE user_id = auth.uid();
  
  -- التحقق من التطابق
  RETURN user_member_id = member_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة للتحقق مما إذا كان المستخدم موظفاً أو مديراً في نفس الفرع
CREATE OR REPLACE FUNCTION public.is_in_same_branch(target_branch_id uuid)
RETURNS BOOLEAN AS $$
DECLARE
  user_branch_id uuid;
  user_role text;
BEGIN
  -- الحصول على فرع وصلاحية المستخدم الحالي
  SELECT branch_id, role INTO user_branch_id, user_role
  FROM users
  WHERE id = auth.uid();
  
  -- السماح للمدير بالوصول إلى جميع الفروع
  IF user_role = 'admin' THEN
    RETURN true;
  END IF;
  
  -- التحقق من أن المستخدم في نفس الفرع
  RETURN user_branch_id = target_branch_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة للتحقق من صلاحية المستخدم
CREATE OR REPLACE FUNCTION public.has_permission(required_role text)
RETURNS BOOLEAN AS $$
DECLARE
  user_role text;
BEGIN
  -- الحصول على دور المستخدم الحالي
  SELECT role INTO user_role
  FROM users
  WHERE id = auth.uid();
  
  -- التحقق من الصلاحية المطلوبة
  CASE
    WHEN required_role = 'admin' THEN
      RETURN user_role = 'admin';
    WHEN required_role = 'branch_manager' THEN
      RETURN user_role IN ('admin', 'branch_manager');
    WHEN required_role = 'employee' THEN
      RETURN user_role IN ('admin', 'branch_manager', 'employee');
    WHEN required_role = 'any' THEN
      RETURN TRUE;
    ELSE
      RETURN FALSE;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- تحديث سياسات جدول المستخدمين
DROP POLICY IF EXISTS "users_select_admin_access" ON public.users;
CREATE POLICY "users_select_admin_access" 
ON public.users 
FOR SELECT 
TO authenticated 
USING (
  -- المدراء يمكنهم رؤية جميع المستخدمين
  has_permission('admin') OR 
  -- مدراء الفروع يمكنهم رؤية موظفي فروعهم والمستخدمين في فروعهم
  (has_permission('branch_manager') AND is_in_same_branch(branch_id)) OR
  -- الموظفون يمكنهم رؤية المستخدمين في فروعهم فقط
  (has_permission('employee') AND is_in_same_branch(branch_id)) OR
  -- المستخدمون يمكنهم رؤية بياناتهم فقط
  auth.uid() = id
);

-- سياسة تحديث المستخدمين
DROP POLICY IF EXISTS "users_update_own_or_admin" ON public.users;
CREATE POLICY "users_update_own_or_admin"
ON public.users
FOR UPDATE
TO authenticated
USING (
  auth.uid() = id OR
  has_permission('admin') OR
  (has_permission('branch_manager') AND is_in_same_branch(branch_id))
)
WITH CHECK (
  -- الشروط التي يمكن معها تحديث البيانات
  auth.uid() = id OR
  has_permission('admin') OR
  (has_permission('branch_manager') AND is_in_same_branch(branch_id))
);

-- تحديث سياسات جدول المستفيدين
DROP POLICY IF EXISTS "members_select_policy" ON public.members;
CREATE POLICY "members_select_policy"
ON public.members
FOR SELECT
TO authenticated
USING (
  -- حق الوصول الخاص بصاحب البيانات
  user_id = auth.uid() OR 
  -- حق وصول المدراء
  has_permission('admin') OR
  -- حق وصول مدراء الفروع للمستفيدين في فروعهم
  (has_permission('branch_manager') AND is_in_same_branch(preferred_branch_id)) OR
  -- حق وصول الموظفين للمستفيدين في فروعهم
  (has_permission('employee') AND is_in_same_branch(preferred_branch_id))
);

-- سياسة تحديث المستفيدين
DROP POLICY IF EXISTS "members_update_policy" ON public.members;
CREATE POLICY "members_update_policy"
ON public.members
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() OR
  has_permission('admin') OR
  (has_permission('branch_manager') AND is_in_same_branch(preferred_branch_id)) OR
  (has_permission('employee') AND is_in_same_branch(preferred_branch_id))
);

-- سياسة الوصول للطلبات
DROP POLICY IF EXISTS "requests_select_policy" ON public.requests;
CREATE POLICY "requests_select_policy"
ON public.requests
FOR SELECT
TO authenticated
USING (
  -- المستفيدون يمكنهم رؤية طلباتهم فقط
  EXISTS (
    SELECT 1 FROM members 
    WHERE members.id = requests.member_id AND members.user_id = auth.uid()
  ) OR
  -- المدراء يمكنهم رؤية جميع الطلبات
  has_permission('admin') OR
  -- مدراء الفروع والموظفون يمكنهم رؤية طلبات فروعهم
  EXISTS (
    SELECT 1 FROM members 
    WHERE 
      members.id = requests.member_id AND
      is_in_same_branch(members.preferred_branch_id)
  )
);