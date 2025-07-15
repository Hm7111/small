import React from 'react';
import { X, User, Phone, Mail, Calendar, Building, Shield, CheckCircle, XCircle } from 'lucide-react';
import Button from '../../ui/Button';
import { StatusBadge } from '../../../shared';
import { formatGregorianDate } from '../../../shared/utils/dateHelpers';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ isOpen, onClose, user }) => {
  console.log("User details modal rendered with data:", user);
  
  if (!isOpen || !user) return null;

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'مدير النظام';
      case 'branch_manager': return 'مدير فرع';
      case 'employee': return 'موظف';
      case 'beneficiary': return 'مستفيد';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'branch_manager': return 'warning';
      case 'employee': return 'info';
      case 'beneficiary': return 'success';
      default: return 'info';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md relative z-10 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <User className="w-6 h-6 text-blue-600" />
              تفاصيل المستخدم
            </h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* User Info */}
          <div className="space-y-6 overflow-auto max-h-[70vh]">
            {/* User Avatar & Name */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {user.full_name.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{user.full_name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge 
                    status={getRoleBadgeColor(user.role) as any} 
                    text={getRoleText(user.role)} 
                  />
                  {user.is_active ? (
                    <div className="flex items-center gap-1 text-green-600 text-sm">
                      <CheckCircle className="w-3 h-3" />
                      <span>نشط</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-600 text-sm">
                      <XCircle className="w-3 h-3" />
                      <span>غير نشط</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Contact Info */}
            <div className="bg-blue-50 rounded-xl p-4 space-y-3">
              <h4 className="font-semibold text-blue-900 mb-2">معلومات الاتصال</h4>
              
              {user.phone && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Phone className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-800">{user.phone}</p>
                    <p className="text-xs text-blue-600">رقم الجوال</p>
                  </div>
                </div>
              )}
              
              {user.email && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-800">{user.email}</p>
                    <p className="text-xs text-blue-600">البريد الإلكتروني</p>
                  </div>
                </div>
              )}
              
              {user.national_id && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-800">{user.national_id}</p>
                    <p className="text-xs text-blue-600">رقم الهوية</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* System Info */}
            <div className="bg-purple-50 rounded-xl p-4 space-y-3">
              <h4 className="font-semibold text-purple-900 mb-2">معلومات النظام</h4>
              
              {(user.role === 'branch_manager' || user.role === 'employee') && user.branch_name && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Building className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-800">{user.branch_name}</p>
                    <p className="text-xs text-purple-600">الفرع</p>
                  </div>
                </div>
              )}
              
              {user.created_at && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-800">{formatGregorianDate(user.created_at)}</p>
                    <p className="text-xs text-purple-600">تاريخ التسجيل</p>
                  </div>
                </div>
              )}
              
              {user.updated_at && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-800">{formatGregorianDate(user.updated_at)}</p>
                    <p className="text-xs text-purple-600">آخر تحديث</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex justify-end pt-4">
              <Button onClick={onClose}>إغلاق</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
