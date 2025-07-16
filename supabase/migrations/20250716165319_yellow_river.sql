/*
  # إضافة دوال التحقق من الصلاحيات

  1. الدوال المساعدة
    - دالة للتحقق من دور المستخدم
    - دالة للتحقق من الانتماء لنفس الفرع
    - دالة للتحقق من صلاحية المدير
    - دوال لتحديث الحقول تلقائياً
    
  2. الأمان
    - تقييد الوصول حسب دور المستخدم
    - ضمان عدم وصول المستخدمين إلا للبيانات المصرح بها
    
  3. ملاحظات
    - تستخدم هذه الدوال في سياسات أمان الجداول
*/

-- دالة للتحقق من صلاحيات المستخدم بناءً على الدور
CREATE OR REPLACE FUNCTION has_permission(required_role TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    current_role TEXT;
BEGIN
    -- الحصول على دور المستخدم الحالي من JWT
    current_role := (SELECT role FROM users WHERE id = auth.uid());

    -- تحقق من وجود دور
    IF current_role IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- تحقق من المطابقة
    IF current_role = required_role THEN
        RETURN TRUE;
    ELSIF required_role = 'admin' AND current_role = 'admin' THEN
        RETURN TRUE;
    ELSIF required_role = 'branch_manager' AND current_role IN ('admin', 'branch_manager') THEN
        RETURN TRUE;
    ELSIF required_role = 'employee' AND current_role IN ('admin', 'branch_manager', 'employee') THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة للتحقق من وجود المستخدم في نفس الفرع (مع معالجة NULL)
CREATE OR REPLACE FUNCTION is_in_same_branch(branch_id_param uuid)
RETURNS BOOLEAN AS $$
DECLARE
    user_branch_id uuid;
    user_role text;
BEGIN
    -- الحصول على معرف فرع المستخدم ودوره
    SELECT branch_id, role INTO user_branch_id, user_role
    FROM users 
    WHERE id = auth.uid();
    
    -- إذا كان مدير نظام فلديه وصول لكل شيء
    IF user_role = 'admin' THEN
        RETURN TRUE;
    END IF;
    
    -- إذا كان أحد المعرفين فارغ
    IF branch_id_param IS NULL OR user_branch_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- تحقق من تطابق الفرع
    RETURN branch_id_param = user_branch_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة للتحقق من صلاحيات المدير
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
DECLARE
    user_role text;
BEGIN
    -- الحصول على دور المستخدم
    SELECT role INTO user_role
    FROM users
    WHERE id = auth.uid();
    
    -- التحقق من الدور
    RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة تحديث التاريخ في عمود updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة تحديث تاريخ المعالجة للطلبات عند تغيير الحالة
CREATE OR REPLACE FUNCTION update_request_processed_at()
RETURNS TRIGGER AS $$
BEGIN
    -- تحديث تاريخ المعالجة فقط عند تغيير الحالة إلى "معتمد" أو "مرفوض"
    IF (NEW.status = 'approved' OR NEW.status = 'rejected') AND 
       (OLD.status <> 'approved' AND OLD.status <> 'rejected') THEN
        NEW.processed_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;