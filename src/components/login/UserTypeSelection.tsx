import React from 'react';
import { UserType } from '../../types';
import { Users, Shield, UserCheck, ArrowLeft, UserPlus, Building, ChevronLeft } from 'lucide-react';

interface UserTypeSelectionProps {
  onSelectType: (type: UserType | 'new_beneficiary') => void;
}

const UserTypeSelection: React.FC<UserTypeSelectionProps> = ({ onSelectType }) => {
  const userTypes = [
    {
      type: 'beneficiary' as UserType,
      title: 'دخول المستفيدين',
      description: 'للمستفيدين المسجلين في النظام',
      icon: <Users className="w-8 h-8" />,
      iconBg: 'bg-blue-600 dark:bg-blue-700',
      iconColor: 'text-white',
      borderColor: 'border-blue-200 dark:border-blue-800',
      hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
    },
    {
      type: 'new_beneficiary' as const,
      title: 'تسجيل مستفيد جديد',
      description: 'للمستفيدين الجدد الذين لم يسجلوا من قبل',
      icon: <UserPlus className="w-8 h-8" />,
      iconBg: 'bg-emerald-600 dark:bg-emerald-700',
      iconColor: 'text-white',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      hoverBg: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
    },
    {
      type: 'employee' as UserType,
      title: 'دخول الموظفين',
      description: 'للموظفين ومدراء الفروع المعتمدين',
      icon: <Building className="w-8 h-8" />,
      iconBg: 'bg-amber-600 dark:bg-amber-700',
      iconColor: 'text-white',
      borderColor: 'border-amber-200 dark:border-amber-800',
      hoverBg: 'hover:bg-amber-50 dark:hover:bg-amber-900/20'
    },
    {
      type: 'admin' as UserType,
      title: 'دخول الإدارة',
      description: 'للإدارة العليا ومسؤولي النظام',
      icon: <Shield className="w-8 h-8" />,
      iconBg: 'bg-purple-600 dark:bg-purple-700',
      iconColor: 'text-white',
      borderColor: 'border-purple-200 dark:border-purple-800',
      hoverBg: 'hover:bg-purple-50 dark:hover:bg-purple-900/20'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {userTypes.map((userType) => (
          <button
            key={userType.type}
            onClick={() => onSelectType(userType.type)}
            className={`
              group w-full p-5 rounded-lg border ${userType.borderColor}
              ${userType.hoverBg}
              hover:shadow-md
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500/50
            `}
          >
            <div className="flex items-center gap-4 text-right">
              {/* Icon */}
              <div className={`
                flex-shrink-0 w-14 h-14 rounded-lg ${userType.iconBg} ${userType.iconColor}
                flex items-center justify-center
                group-hover:scale-105 transition-transform duration-200
              `}>
                {userType.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {userType.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {userType.description}
                </p>
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0">
                <ChevronLeft className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:-translate-x-1 transition-all duration-200" />
              </div>
            </div>
          </button>
        ))}
      </div>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
        بالدخول إلى النظام، أنت توافق على <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">شروط الاستخدام</a> و<a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">سياسة الخصوصية</a>
      </p>
    </div>
  );
};

export default UserTypeSelection;
