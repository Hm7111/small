/*
  # تحديث جدول المستفيدين ليشمل جميع البيانات المطلوبة

  1. إضافة الحقول الجديدة
    - نوع الإعاقة والتفاصيل
    - البيانات المهنية والتعليمية  
    - العنوان الوطني
    - حالة التسجيل
    - تواريخ المراجعة

  2. إنشاء ENUMs للبيانات المقيدة
    - أنواع الإعاقة
    - المؤهلات الدراسية
    - حالات التسجيل

  3. إضافة قيود التحقق المناسبة
*/

-- إنشاء ENUM لأنواع الإعاقة
DO $$ BEGIN
    CREATE TYPE disability_type AS ENUM (
        'deaf', -- أصم
        'hearing_impaired', -- ضعيف سمع
        'hearing_loss', -- فاقد سمع
        'visual_impaired', -- ضعيف بصر
        'blind', -- فاقد بصر
        'mobility_impaired', -- إعاقة حركية
        'intellectual_disability', -- إعاقة ذهنية
        'multiple_disabilities', -- إعاقات متعددة
        'other' -- أخرى
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- إنشاء ENUM للمؤهلات الدراسية
DO $$ BEGIN
    CREATE TYPE education_level AS ENUM (
        'no_education', -- بدون تعليم
        'primary', -- ابتدائي
        'intermediate', -- متوسط
        'secondary', -- ثانوي
        'diploma', -- دبلوم
        'bachelor', -- بكالوريوس
        'master', -- ماجستير
        'phd' -- دكتوراه
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- إنشاء ENUM لحالة التسجيل
DO $$ BEGIN
    CREATE TYPE registration_status AS ENUM (
        'profile_incomplete', -- البيانات غير مكتملة
        'pending_documents', -- في انتظار المستندات
        'pending_review', -- في انتظار المراجعة
        'under_employee_review', -- تحت مراجعة الموظف
        'under_manager_review', -- تحت مراجعة المدير
        'approved', -- مُعتمد
        'rejected', -- مرفوض
        'needs_correction' -- يحتاج تصحيح
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- إنشاء ENUM لحالة التوظيف
DO $$ BEGIN
    CREATE TYPE employment_status AS ENUM (
        'unemployed', -- عاطل
        'employed', -- موظف
        'retired', -- متقاعد
        'student', -- طالب
        'disabled_unable_work' -- غير قادر على العمل بسبب الإعاقة
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- إضافة الأعمدة الجديدة لجدول المستفيدين
DO $$
BEGIN
  -- البيانات الشخصية الإضافية
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'age') THEN
    ALTER TABLE members ADD COLUMN age integer;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'disability_type') THEN
    ALTER TABLE members ADD COLUMN disability_type disability_type;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'disability_details') THEN
    ALTER TABLE members ADD COLUMN disability_details text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'disability_card_number') THEN
    ALTER TABLE members ADD COLUMN disability_card_number text;
  END IF;

  -- البيانات المهنية والتعليمية
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'education_level') THEN
    ALTER TABLE members ADD COLUMN education_level education_level;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'employment_status') THEN
    ALTER TABLE members ADD COLUMN employment_status employment_status;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'job_title') THEN
    ALTER TABLE members ADD COLUMN job_title text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'employer') THEN
    ALTER TABLE members ADD COLUMN employer text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'monthly_income') THEN
    ALTER TABLE members ADD COLUMN monthly_income numeric(10,2);
  END IF;

  -- العنوان الوطني
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'building_number') THEN
    ALTER TABLE members ADD COLUMN building_number text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'street_name') THEN
    ALTER TABLE members ADD COLUMN street_name text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'district') THEN
    ALTER TABLE members ADD COLUMN district text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'postal_code') THEN
    ALTER TABLE members ADD COLUMN postal_code text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'additional_number') THEN
    ALTER TABLE members ADD COLUMN additional_number text;
  END IF;

  -- بيانات التواصل الإضافية
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'alternative_phone') THEN
    ALTER TABLE members ADD COLUMN alternative_phone text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'emergency_contact_name') THEN
    ALTER TABLE members ADD COLUMN emergency_contact_name text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'emergency_contact_phone') THEN
    ALTER TABLE members ADD COLUMN emergency_contact_phone text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'emergency_contact_relation') THEN
    ALTER TABLE members ADD COLUMN emergency_contact_relation text;
  END IF;

  -- الفرع المفضل
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'preferred_branch_id') THEN
    ALTER TABLE members ADD COLUMN preferred_branch_id uuid;
  END IF;

  -- حالة التسجيل والمراجعة
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'registration_status') THEN
    ALTER TABLE members ADD COLUMN registration_status registration_status DEFAULT 'profile_incomplete';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'reviewed_by_employee') THEN
    ALTER TABLE members ADD COLUMN reviewed_by_employee uuid;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'reviewed_by_manager') THEN
    ALTER TABLE members ADD COLUMN reviewed_by_manager uuid;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'employee_review_date') THEN
    ALTER TABLE members ADD COLUMN employee_review_date timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'manager_review_date') THEN
    ALTER TABLE members ADD COLUMN manager_review_date timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'employee_notes') THEN
    ALTER TABLE members ADD COLUMN employee_notes text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'manager_notes') THEN
    ALTER TABLE members ADD COLUMN manager_notes text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'rejection_reason') THEN
    ALTER TABLE members ADD COLUMN rejection_reason text;
  END IF;

  -- مؤشر اكتمال الملف
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'profile_completion_percentage') THEN
    ALTER TABLE members ADD COLUMN profile_completion_percentage integer DEFAULT 0;
  END IF;

END $$;

-- إضافة Foreign Key للفرع المفضل
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_members_preferred_branch'
    ) THEN
        ALTER TABLE members 
        ADD CONSTRAINT fk_members_preferred_branch 
        FOREIGN KEY (preferred_branch_id) 
        REFERENCES branches(id) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- إضافة Foreign Keys للمراجعين
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_members_reviewed_by_employee'
    ) THEN
        ALTER TABLE members 
        ADD CONSTRAINT fk_members_reviewed_by_employee 
        FOREIGN KEY (reviewed_by_employee) 
        REFERENCES users(id) 
        ON DELETE SET NULL;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_members_reviewed_by_manager'
    ) THEN
        ALTER TABLE members 
        ADD CONSTRAINT fk_members_reviewed_by_manager 
        FOREIGN KEY (reviewed_by_manager) 
        REFERENCES users(id) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- إضافة قيود التحقق الجديدة
DO $$
BEGIN
  -- تحقق من صحة العمر
  IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'check_member_age') THEN
    ALTER TABLE members ADD CONSTRAINT check_member_age 
      CHECK (age IS NULL OR (age >= 0 AND age <= 120));
  END IF;

  -- تحقق من صحة الرمز البريدي
  IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'check_postal_code_format') THEN
    ALTER TABLE members ADD CONSTRAINT check_postal_code_format 
      CHECK (postal_code IS NULL OR postal_code ~ '^[0-9]{5}$');
  END IF;

  -- تحقق من صحة رقم المبنى
  IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'check_building_number_format') THEN
    ALTER TABLE members ADD CONSTRAINT check_building_number_format 
      CHECK (building_number IS NULL OR building_number ~ '^[0-9]{4}$');
  END IF;

  -- تحقق من نسبة اكتمال الملف
  IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'check_completion_percentage') THEN
    ALTER TABLE members ADD CONSTRAINT check_completion_percentage 
      CHECK (profile_completion_percentage >= 0 AND profile_completion_percentage <= 100);
  END IF;

  -- تحقق من الدخل الشهري
  IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'check_monthly_income') THEN
    ALTER TABLE members ADD CONSTRAINT check_monthly_income 
      CHECK (monthly_income IS NULL OR monthly_income >= 0);
  END IF;

END $$;

-- إضافة فهارس للأعمدة الجديدة
CREATE INDEX IF NOT EXISTS idx_members_registration_status ON members(registration_status);
CREATE INDEX IF NOT EXISTS idx_members_disability_type ON members(disability_type);
CREATE INDEX IF NOT EXISTS idx_members_education_level ON members(education_level);
CREATE INDEX IF NOT EXISTS idx_members_employment_status ON members(employment_status);
CREATE INDEX IF NOT EXISTS idx_members_preferred_branch ON members(preferred_branch_id);
CREATE INDEX IF NOT EXISTS idx_members_reviewed_by_employee ON members(reviewed_by_employee);
CREATE INDEX IF NOT EXISTS idx_members_reviewed_by_manager ON members(reviewed_by_manager);
CREATE INDEX IF NOT EXISTS idx_members_completion_percentage ON members(profile_completion_percentage);