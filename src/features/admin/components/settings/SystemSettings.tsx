import React, { useState } from 'react';
import { 
  Settings, Shield, Database, Bell, Mail, 
  Save, RefreshCw, AlertTriangle, CheckCircle 
} from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';

const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    systemName: 'نظام خدمات المستفيدين',
    organizationName: 'الجمعية الخيرية',
    adminEmail: 'admin@charity.org',
    supportEmail: 'support@charity.org',
    maxFileSize: '5', // MB
    sessionTimeout: '60', // minutes
    enableNotifications: true,
    enableEmailNotifications: true,
    autoApproveRequests: false,
    requireManagerApproval: true,
    defaultLanguage: 'ar',
    dateFormat: 'gregory'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSaveSettings = async () => {
    setIsLoading(true);
    setSaveStatus('idle');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, save to backend
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const settingSections = [
    {
      title: 'الإعدادات العامة',
      icon: <Settings className="w-5 h-5" />,
      color: 'blue',
      fields: [
        {
          key: 'systemName',
          label: 'اسم النظام',
          type: 'text',
          description: 'اسم النظام الذي يظهر في جميع أنحاء التطبيق'
        },
        {
          key: 'organizationName',
          label: 'اسم المؤسسة',
          type: 'text',
          description: 'اسم الجمعية أو المؤسسة'
        },
        {
          key: 'defaultLanguage',
          label: 'اللغة الافتراضية',
          type: 'select',
          options: [
            { value: 'ar', label: 'العربية' },
            { value: 'en', label: 'English' }
          ],
          description: 'لغة النظام الافتراضية'
        },
        {
          key: 'dateFormat',
          label: 'نظام التاريخ',
          type: 'select',
          options: [
            { value: 'gregory', label: 'ميلادي' },
            { value: 'islamic', label: 'هجري' }
          ],
          description: 'نظام التاريخ المستخدم في النظام'
        }
      ]
    },
    {
      title: 'إعدادات الأمان',
      icon: <Shield className="w-5 h-5" />,
      color: 'red',
      fields: [
        {
          key: 'sessionTimeout',
          label: 'انتهاء الجلسة (دقيقة)',
          type: 'number',
          description: 'مدة انتهاء جلسة المستخدم بالدقائق'
        },
        {
          key: 'maxFileSize',
          label: 'الحد الأقصى لحجم الملف (MB)',
          type: 'number',
          description: 'أقصى حجم للملفات المرفوعة'
        },
        {
          key: 'requireManagerApproval',
          label: 'يتطلب موافقة المدير',
          type: 'toggle',
          description: 'جميع الطلبات تحتاج موافقة مدير الفرع'
        },
        {
          key: 'autoApproveRequests',
          label: 'موافقة تلقائية على الطلبات',
          type: 'toggle',
          description: 'موافقة تلقائية على طلبات معينة'
        }
      ]
    },
    {
      title: 'إعدادات التنبيهات',
      icon: <Bell className="w-5 h-5" />,
      color: 'purple',
      fields: [
        {
          key: 'enableNotifications',
          label: 'تفعيل التنبيهات',
          type: 'toggle',
          description: 'إرسال تنبيهات داخل النظام'
        },
        {
          key: 'enableEmailNotifications',
          label: 'تفعيل تنبيهات الإيميل',
          type: 'toggle',
          description: 'إرسال تنبيهات عبر البريد الإلكتروني'
        }
      ]
    },
    {
      title: 'إعدادات البريد الإلكتروني',
      icon: <Mail className="w-5 h-5" />,
      color: 'green',
      fields: [
        {
          key: 'adminEmail',
          label: 'بريد المدير',
          type: 'email',
          description: 'البريد الإلكتروني للمدير الرئيسي'
        },
        {
          key: 'supportEmail',
          label: 'بريد الدعم',
          type: 'email',
          description: 'البريد الإلكتروني للدعم الفني'
        }
      ]
    }
  ];

  const handleFieldChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const renderField = (field: any) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <Input
            type={field.type}
            value={settings[field.key as keyof typeof settings]}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.label}
          />
        );
      
      case 'select':
        return (
          <Select
            value={settings[field.key as keyof typeof settings] as string}
            onChange={(value) => handleFieldChange(field.key, value)}
            options={field.options}
          />
        );
      
      case 'toggle':
        return (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings[field.key as keyof typeof settings] as boolean}
              onChange={(e) => handleFieldChange(field.key, e.target.checked)}
              className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              {settings[field.key as keyof typeof settings] ? 'مفعل' : 'معطل'}
            </span>
          </label>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Settings className="w-8 h-8 text-gray-600 dark:text-gray-400" />
              إعدادات النظام
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              إدارة إعدادات النظام العامة والأمان
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {saveStatus === 'success' && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="w-5 h-5 dark:text-green-400" />
                <span className="text-sm dark:text-green-400">تم الحفظ بنجاح</span>
              </div>
            )}
            
            {saveStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-sm">خطأ في الحفظ</span>
              </div>
            )}

            <Button
              onClick={handleSaveSettings}
              isLoading={isLoading}
              icon={isLoading ? <RefreshCw className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            >
              {isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </Button>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {settingSections.map((section, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                section.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' :
                section.color === 'red' ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' :
                section.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400' :
                'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400'
              }`}>
                {section.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{section.title}</h3>
            </div>

            <div className="space-y-6">
              {section.fields.map((field, fieldIndex) => (
                <div key={fieldIndex} className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {field.label}
                  </label>
                  {renderField(field)}
                  {field.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{field.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* System Information */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          معلومات النظام
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">إصدار النظام</h4>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">v1.0.0</p>
            <p className="text-sm text-blue-700 dark:text-blue-400">آخر تحديث: 2024</p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
            <h4 className="font-semibold text-green-900 dark:text-green-300 mb-2">قاعدة البيانات</h4>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">متصلة</p>
            <p className="text-sm text-green-700 dark:text-green-400">PostgreSQL 14.x</p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
            <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">وقت التشغيل</h4>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">99.9%</p>
            <p className="text-sm text-purple-700 dark:text-purple-400">آخر 30 يوم</p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-red-900 dark:text-red-300 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6" />
          منطقة الخطر
        </h3>
        <p className="text-red-700 dark:text-red-400 mb-6">
          هذه الإجراءات لا يمكن التراجع عنها. يرجى التأكد قبل المتابعة.
        </p>
        
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
          >
            إعادة تعيين الإعدادات
          </Button>
          <Button
            variant="outline"
            className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
          >
            مسح البيانات التجريبية
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
