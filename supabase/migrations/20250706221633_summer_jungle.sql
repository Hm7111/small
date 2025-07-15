/*
  # إنشاء الأنواع المخصصة (ENUMs)

  1. أنواع البيانات المخصصة
    - user_role: أدوار المستخدمين (admin, branch_manager, employee, beneficiary)
    - member_status: حالة المستفيد (active, inactive, suspended)
    - request_status: حالة الطلب (pending, under_review, approved, rejected)
    - gender_type: الجنس (male, female)

  2. الغرض
    - ضمان صحة البيانات المدخلة
    - تسهيل عمليات التحقق والفلترة
    - توحيد القيم المستخدمة في النظام
*/

-- إنشاء نوع دور المستخدم
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'admin',
        'branch_manager', 
        'employee',
        'beneficiary'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- إنشاء نوع حالة المستفيد
DO $$ BEGIN
    CREATE TYPE member_status AS ENUM (
        'active',
        'inactive',
        'suspended'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- إنشاء نوع حالة الطلب
DO $$ BEGIN
    CREATE TYPE request_status AS ENUM (
        'pending',
        'under_review',
        'approved',
        'rejected'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- إنشاء نوع الجنس
DO $$ BEGIN
    CREATE TYPE gender_type AS ENUM (
        'male',
        'female'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;