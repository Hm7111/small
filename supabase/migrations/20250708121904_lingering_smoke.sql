/*
  # إضافة حقول المستندات المطلوبة للخدمات

  1. تحديثات لجدول الخدمات
    - إضافة حقل required_documents لتخزين المستندات المطلوبة للخدمة
    - يحفظ البيانات بتنسيق JSON لتخزين المستندات المطلوبة وحالة إلزاميتها

  2. الغرض
    - تمكين الإدارة من تحديد المستندات المطلوبة لكل خدمة
    - تسهيل عرض المستندات المطلوبة للمستفيدين عند طلب الخدمة
*/

-- إضافة حقل required_documents إلى جدول services
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'services' 
                 AND column_name = 'required_documents') THEN
    ALTER TABLE services ADD COLUMN required_documents jsonb;
  END IF;
END $$;

-- إنشاء فهرس لتحسين الأداء عند البحث في المستندات المطلوبة
CREATE INDEX IF NOT EXISTS idx_services_required_documents ON services USING GIN(required_documents);

-- إنشاء نوع document_type إذا لم يكن موجودًا بالفعل
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_type') THEN
    CREATE TYPE document_type AS ENUM (
      'national_id', -- صورة الهوية الوطنية
      'disability_card', -- بطاقة إثبات الإعاقة
      'income_certificate', -- شهادة دخل
      'medical_report', -- تقرير طبي
      'social_report', -- تقرير اجتماعي
      'birth_certificate', -- شهادة ميلاد
      'death_certificate', -- شهادة وفاة
      'marriage_certificate', -- شهادة زواج
      'divorce_certificate', -- شهادة طلاق
      'education_certificate', -- شهادة تعليمية
      'employment_certificate', -- شهادة عمل
      'bank_statement', -- كشف حساب بنكي
      'rental_contract', -- عقد إيجار
      'utility_bill', -- فاتورة خدمات
      'other' -- أخرى
    );
  END IF;
END $$;