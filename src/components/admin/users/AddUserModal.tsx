import React, { useState, useEffect } from 'react';
    import { X, UserPlus, CheckCircle } from 'lucide-react';
    import Button from '../../ui/Button';
    import Input from '../../ui/Input';
    import Select from '../../ui/Select';
    import ErrorMessage from '../../ui/ErrorMessage';

    interface AddUserModalProps {
      isOpen: boolean;
      onClose: () => void;
      onSuccess: () => void;
    }

    const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onSuccess }) => {
      const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        nationalId: '',
        phone: '',
        role: 'employee',
        branchId: '',
      });

      const [branches, setBranches] = useState<{id: string, name: string}[]>([]);
      const [isLoading, setIsLoading] = useState(false);
      const [error, setError] = useState<string | null>(null);
      const [isSuccess, setIsSuccess] = useState(false);

      useEffect(() => {
        // Reset form when modal opens
        if (isOpen) {
          setFormData({
            fullName: '',
            email: '',
            nationalId: '',
            phone: '',
            role: 'employee',
            branchId: '',
          });
          setError(null);
          setIsSuccess(false);
          loadBranches();
        }
      }, [isOpen]);

      const loadBranches = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-branches`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'list' })
          });

          const result = await response.json();

          if (result.success) {
            setBranches(result.branches.map((branch: any) => ({
              id: branch.id,
              name: branch.name
            })));
          }
        } catch (error) {
          console.error('Error loading branches:', error);
        }
      };

      const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
      };

      const validateForm = (): boolean => {
        setError(null);

        // Always required: fullName, phone, role
        if (!formData.fullName.trim()) {
          setError('الاسم الكامل مطلوب');
          return false;
        }

        if (!formData.phone.trim()) {
          setError('رقم الجوال مطلوب');
          return false;
        }

        // Admin must have email
        if (formData.role === 'admin' && !formData.email.trim()) {
          setError('البريد الإلكتروني مطلوب للمدراء');
          return false;
        }

        // Non-admin must have national ID
        if (formData.role !== 'admin' && !formData.nationalId.trim()) {
          setError('رقم الهوية الوطنية مطلوب للموظفين ومدراء الفروع');
          return false;
        }

        // Branch manager and employee must have branch
        if ((formData.role === 'branch_manager' || formData.role === 'employee') && !formData.branchId) {
          setError('يجب اختيار الفرع للموظفين ومدراء الفروع');
          return false;
        }

        // Phone number validation
        if (!/^((\+966)|0)?5[0-9]{8}$/.test(formData.phone.replace(/\s|-/g, ''))) {
          setError('رقم الجوال غير صحيح');
          return false;
        }

        // National ID validation (if provided)
        if (formData.nationalId && !/^[0-9]{10}$/.test(formData.nationalId)) {
          setError('رقم الهوية الوطنية يجب أن يكون 10 أرقام');
          return false;
        }

        // Email validation (if provided)
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setError('البريد الإلكتروني غير صحيح');
          return false;
        }

        return true;
      };

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'create',
              userData: {
                full_name: formData.fullName,
                email: formData.email || null,
                national_id: formData.nationalId || null,
                phone: formData.phone,
                role: formData.role,
                branch_id: formData.branchId || null,
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
            setError(result.error || 'فشل في إنشاء المستخدم');
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
                  <UserPlus className="w-6 h-6 text-blue-600" />
                  إضافة مستخدم جديد
                </h2>
                <button
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 p-2 rounded-full hover:bg-gray-100"
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
                  <h3 className="text-xl font-bold text-green-900 mb-2">تم إنشاء المستخدم بنجاح</h3>
                  <p className="text-green-700 mb-6">تم إضافة المستخدم الجديد للنظام</p>
                  <Button onClick={onClose}>إغلاق</Button>
                </div>
              ) : (
                /* Form */
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input
                    label="الاسم الكامل *"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="مثال: أحمد محمد علي"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      pr-10
                      type="text"
                      value={formData.nationalId}
                      onChange={(e) => handleInputChange('nationalId', e.target.value)}
                      placeholder="1234567890"
                      maxLength={10}
                    />

                    <Input
                      label="رقم الجوال *"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="05xxxxxxxx"
                      maxLength={10}
                    />
                  </div>

                  <Input
                    label="البريد الإلكتروني"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="example@email.com"
                  />

                  <Select
                    label="الدور *"
                    value={formData.role}
                    onChange={(value) => handleInputChange('role', value)}
                    options={[
                      { value: 'admin', label: 'مدير النظام' },
                      { value: 'branch_manager', label: 'مدير فرع' },
                      { value: 'employee', label: 'موظف' }
                    ]}
                  />

                  {(formData.role === 'branch_manager' || formData.role === 'employee') && (
                    <Select
                      label="الفرع *"
                      value={formData.branchId}
                      onChange={(value) => handleInputChange('branchId', value)}
                      options={branches.map(branch => ({
                        value: branch.id,
                        label: branch.name
                      }))}
                      placeholder="اختر الفرع"
                    />
                  )}

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
                    >
                      إضافة المستخدم
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      );
    };

    export default AddUserModal;
