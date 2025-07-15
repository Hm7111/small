/*
  # تحسين جدول الخدمات وإضافة مدة الصلاحية والحذف الناعم

  1. تحديثات لجدول الخدمات
    - إضافة حقل reapplication_period_months لتحديد المدة اللازمة قبل إعادة التقديم (بالشهور)
    - إضافة حقل is_one_time_only للخدمات التي تقدم مرة واحدة فقط
    - إضافة حقل deleted_at لتطبيق مفهوم الحذف الناعم (Soft Delete)

  2. الغرض
    - تمكين الإدارة من تحديد فترة إعادة التقديم على الخدمة
    - تحسين إدارة الخدمات مع الحفاظ على البيانات التاريخية
*/

-- إضافة حقل مدة إعادة التقديم (بالشهور)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'services' 
                 AND column_name = 'reapplication_period_months') THEN
    ALTER TABLE services ADD COLUMN reapplication_period_months integer;
    
    -- قيد تحقق على قيمة المدة (إما null أو قيمة موجبة)
    ALTER TABLE services ADD CONSTRAINT check_reapplication_period
      CHECK (reapplication_period_months IS NULL OR reapplication_period_months > 0);
  END IF;
END $$;

-- إضافة حقل للخدمات التي تقدم مرة واحدة فقط
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'services' 
                 AND column_name = 'is_one_time_only') THEN
    ALTER TABLE services ADD COLUMN is_one_time_only boolean DEFAULT false;
  END IF;
END $$;

-- إضافة حقل deleted_at للحذف الناعم
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'services' 
                 AND column_name = 'deleted_at') THEN
    ALTER TABLE services ADD COLUMN deleted_at timestamptz DEFAULT NULL;
    
    -- إنشاء فهرس لتحسين الأداء عند البحث
    CREATE INDEX IF NOT EXISTS idx_services_deleted_at ON services(deleted_at);
  END IF;
END $$;

-- تحديث سياسات أمان مستوى الصف لاستبعاد الخدمات المحذوفة
DROP POLICY IF EXISTS "services_select_policy" ON services;
CREATE POLICY "services_select_policy" ON services
    FOR SELECT
    TO authenticated
    USING (is_active = true AND deleted_at IS NULL);

-- تحديث functions القائمة للتعامل مع الخدمات المحذوفة
CREATE OR REPLACE FUNCTION is_service_deleted(service_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM services 
        WHERE id = service_id AND deleted_at IS NOT NULL
    );
END;
$$ LANGUAGE plpgsql;