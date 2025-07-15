/*
  # تحديثات جدول الخدمات

  1. إضافة حقول جديدة للخدمات
    - إضافة حقل لحفظ المدة الزمنية بين طلبات الخدمة المتكررة (reapplication_period_months)
    - إضافة حقل يحدد ما إذا كانت الخدمة تقدم مرة واحدة فقط للمستفيد (is_one_time_only)
    - إضافة حقل لتاريخ الحذف الناعم (soft delete) للخدمات (deleted_at)

  2. تحسين قواعد التحقق
    - إضافة قواعد تحقق للحقول الجديدة
    - التأكد من صحة قيم فترات إعادة التقديم
  
  3. تحديث سياسات الوصول
    - تحديث سياسات RLS لمراعاة الخدمات المحذوفة
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

-- إضافة دالة للتحقق من أهلية المستفيد للتقديم على الخدمة
-- تأخذ معرف المستفيد ومعرف الخدمة وتعيد إما صحيح (مؤهل) أو خطأ (غير مؤهل)
CREATE OR REPLACE FUNCTION check_service_eligibility(member_id uuid, service_id uuid)
RETURNS boolean AS $$
DECLARE
    is_eligible boolean := true;
    service_record RECORD;
    last_delivery_date timestamp;
    months_since_last integer;
BEGIN
    -- التحقق من أن الخدمة نشطة وغير محذوفة
    SELECT * INTO service_record
    FROM services
    WHERE id = service_id AND is_active = true AND deleted_at IS NULL;
    
    IF service_record IS NULL THEN
        RETURN false; -- الخدمة غير موجودة أو غير نشطة
    END IF;
    
    -- إذا كانت الخدمة لمرة واحدة فقط، نتحقق إن كان قد سبق للمستفيد الحصول عليها
    IF service_record.is_one_time_only THEN
        -- التحقق إذا كان المستفيد قد حصل على هذه الخدمة من قبل
        IF EXISTS (
            SELECT 1 FROM requests 
            WHERE member_id = check_service_eligibility.member_id 
            AND service_id = check_service_eligibility.service_id
            AND status = 'approved'
        ) THEN
            RETURN false; -- سبق وحصل على الخدمة
        END IF;
    -- إذا كانت الخدمة دورية ولها فترة إعادة تقديم محددة
    ELSIF service_record.reapplication_period_months IS NOT NULL THEN
        -- الحصول على تاريخ آخر استلام للخدمة
        SELECT MAX(processed_at) INTO last_delivery_date
        FROM requests
        WHERE member_id = check_service_eligibility.member_id 
        AND service_id = check_service_eligibility.service_id
        AND status = 'approved';
        
        IF last_delivery_date IS NOT NULL THEN
            -- حساب عدد الأشهر منذ آخر استلام
            SELECT EXTRACT(YEAR FROM age(current_timestamp, last_delivery_date)) * 12 +
                   EXTRACT(MONTH FROM age(current_timestamp, last_delivery_date))
            INTO months_since_last;
            
            -- التحقق من انقضاء فترة الانتظار
            IF months_since_last < service_record.reapplication_period_months THEN
                RETURN false; -- لم تنقض فترة الانتظار بعد
            END IF;
        END IF;
    END IF;
    
    RETURN is_eligible;
END;
$$ LANGUAGE plpgsql;