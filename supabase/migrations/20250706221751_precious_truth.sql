/*
  # إنشاء العلاقات الخارجية (Foreign Keys)

  1. العلاقات المُضافة
    - users.branch_id → branches.id
    - branches.manager_id → users.id  
    - members.user_id → users.id
    - services.created_by → users.id
    - requests.member_id → members.id
    - requests.service_id → services.id
    - requests.employee_id → users.id

  2. الغرض
    - ضمان سلامة البيانات المرجعية
    - منع حذف السجلات المرتبطة
    - تحسين الأداء في الاستعلامات

  3. سياسات الحذف
    - CASCADE: حذف تلقائي للسجلات التابعة
    - RESTRICT: منع الحذف إذا وجدت سجلات مرتبطة
    - SET NULL: تعيين null عند الحذف
*/

-- إضافة Foreign Key: users.branch_id → branches.id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_users_branch_id'
    ) THEN
        ALTER TABLE users 
        ADD CONSTRAINT fk_users_branch_id 
        FOREIGN KEY (branch_id) 
        REFERENCES branches(id) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- إضافة Foreign Key: branches.manager_id → users.id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_branches_manager_id'
    ) THEN
        ALTER TABLE branches 
        ADD CONSTRAINT fk_branches_manager_id 
        FOREIGN KEY (manager_id) 
        REFERENCES users(id) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- إضافة Foreign Key: members.user_id → users.id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_members_user_id'
    ) THEN
        ALTER TABLE members 
        ADD CONSTRAINT fk_members_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- إضافة Foreign Key: services.created_by → users.id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_services_created_by'
    ) THEN
        ALTER TABLE services 
        ADD CONSTRAINT fk_services_created_by 
        FOREIGN KEY (created_by) 
        REFERENCES users(id) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- إضافة Foreign Key: requests.member_id → members.id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_requests_member_id'
    ) THEN
        ALTER TABLE requests 
        ADD CONSTRAINT fk_requests_member_id 
        FOREIGN KEY (member_id) 
        REFERENCES members(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- إضافة Foreign Key: requests.service_id → services.id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_requests_service_id'
    ) THEN
        ALTER TABLE requests 
        ADD CONSTRAINT fk_requests_service_id 
        FOREIGN KEY (service_id) 
        REFERENCES services(id) 
        ON DELETE RESTRICT;
    END IF;
END $$;

-- إضافة Foreign Key: requests.employee_id → users.id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_requests_employee_id'
    ) THEN
        ALTER TABLE requests 
        ADD CONSTRAINT fk_requests_employee_id 
        FOREIGN KEY (employee_id) 
        REFERENCES users(id) 
        ON DELETE SET NULL;
    END IF;
END $$;