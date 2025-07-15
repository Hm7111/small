import React, { useState, useEffect } from 'react';
import { X, Building, CheckCircle, MapPin, Phone } from 'lucide-react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import ErrorMessage from '../../ui/ErrorMessage';

interface AddBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddBranchModal: React.FC<AddBranchModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    address: '',
    phone: '',
    managerId: ''
  });

  const [managers, setManagers] = useState<{id: string, name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Reset form when modal opens
    if (isOpen) {
      setFormData({
        name: '',
        city: '',
        address: '',
        phone: '',
        managerId: ''
      });
      setError(null);
      setIsSuccess(false);
      loadManagers();
    }
  }, [isOpen]);

  const loadManagers = async () => {
    try {
      // Fetch all branch managers and employees
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'list' })
      });

      const result = await response.json();

      if (result.success) {
        // Filter users who can be branch managers (branch_manager role and employees)
        const potentialManagers = result.users.filter((user: any) => 
          (user.role === 'branch_manager' || user.role === 'employee') && user.is_active
        );
        
        setManagers(potentialManagers.map((user: any) => ({
          id: user.id,
          name: user.full_name
        })));
      }
    } catch (error) {
      console.error('Error loading managers:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    setError(null);

    // Validate name
    if (!formData.name.trim()) {
      setError('اسم الفرع مطلوب');
      return false;
    }
    
    // Validate city
    if (!formData.city.trim()) {
      setError('المدينة مطلوبة');
      return false;
    }

    // Validate phone number (if provided)
    if (formData.phone && !/^((\+966)|0)?5[0-9]{8}$/.test(formData.phone.replace(/\s|-/g, ''))) {
      setError('رقم الهاتف غير صحيح');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-branches`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          branchData: {
            name: formData.name,
            city: formData.city,
            address: formData.address || null,
            phone: formData.phone || null,
            manager_id: formData.managerId || null,
            is_active: true
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        setError(result.error || 'فشل في إنشاء الفرع');
      }
    } catch (error) {
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md relative z-10 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Building className="w-6 h-6 text-green-600" />
              إضافة فرع جديد
            </h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Success Message */}
          {isSuccess ? (
            <div className="text-center py-10">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-green-900 mb-2">تم إنشاء الفرع بنجاح</h3>
              <p className="text-green-700 mb-6">تم إضافة الفرع الجديد للنظام</p>
              <Button onClick={onClose}>إغلاق</Button>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="اسم الفرع *"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="مثال: فرع الرياض الشمالي"
                icon={<Building className="w-5 h-5" />}
              />
              
              <Input
                label="المدينة *"
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="مثال: الرياض"
                icon={<MapPin className="w-5 h-5" />}
              />
              
              <Input
                label="العنوان التفصيلي"
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="مثال: حي الملز، شارع الملك عبدالعزيز"
                icon={<MapPin className="w-5 h-5" />}
              />
              
              <Input
                label="رقم الهاتف"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="05xxxxxxxx"
                icon={<Phone className="w-5 h-5" />}
              />
              
              <Select
                label="مدير الفرع"
                value={formData.managerId}
                onChange={(value) => handleInputChange('managerId', value)}
                options={managers.map(manager => ({
                  value: manager.id,
                  label: manager.name
                }))}
                placeholder="اختر مدير الفرع (اختياري)"
              />
              
              {error && <ErrorMessage message={error} />}
              
              <div className="flex items-center justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  إضافة الفرع
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddBranchModal;
