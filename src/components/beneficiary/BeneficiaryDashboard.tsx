import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LogOut, RefreshCw, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import { supabase } from '../../utils/supabase';
import { logout } from '../../store/slices/authSlice';
import { AppDispatch, RootState } from '../../store';
import { useAuth } from '../../features/auth/hooks/useAuth';

// Component imports
import DashboardHeader from './components/DashboardHeader';
import StatusCard from './components/StatusCard';
import StatsCards from './components/StatsCards';
import ActivityAndQuickActions from './components/ActivityAndQuickActions';
import MembershipCard from './components/MembershipCard';
import SupportSection from './components/SupportSection';
import ContactInfoSection from './components/ContactInfoSection';
import BeneficiaryRequests from './BeneficiaryRequests';
import BeneficiaryProfile from './BeneficiaryProfile';
import BeneficiaryLayout from './BeneficiaryLayout';
import BeneficiaryDocuments from './documents/BeneficiaryDocuments';
import RegistrationWorkflow from './RegistrationWorkflow';
import ServicesList from './services/ServicesList';

// Consolidated interfaces
interface BeneficiaryStats {
  availableServices: number;
  activeRequests: number;
  completedRequests: number;
  lastLogin: string;
  nextAppointment: string;
}

interface MemberData {
  id: string;
  full_name: string;
  national_id: string;
  phone: string;
  email?: string;
  city: string;
  address?: string;
  registration_status: string;
  profile_completion_percentage: number;
  created_at: string;
  updated_at: string;
  disability_type?: string;
  disability_details?: string;
  disability_card_number?: string;
  education_level?: string;
  employment_status?: string;
  job_title?: string;
  employer?: string;
  monthly_income?: number;
  building_number?: string;
  street_name?: string;
  district?: string;
  postal_code?: string;
  additional_number?: string;
  alternative_phone?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  preferred_branch_id?: string;
  reviewed_by_employee?: string;
  reviewed_by_manager?: string;
  employee_review_date?: string;
  manager_review_date?: string;
  employee_notes?: string;
  manager_notes?: string;
  rejection_reason?: string;
  branch_name?: string;
  status?: string;
  user_id?: string;
  gender?: string;
  birth_date?: string;
  age?: number;
}

interface NavigationItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  description?: string;
  badge?: string;
}

const BeneficiaryDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const { logout: authLogout } = useAuth();
  const [memberData, setMemberData] = useState<MemberData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profileSubTab, setProfileSubTab] = useState<'personal' | 'professional' | 'address' | 'contact' | 'documents'>('personal');
  const [stats, setStats] = useState<BeneficiaryStats>({
    availableServices: 0,
    activeRequests: 0,
    completedRequests: 0,
    lastLogin: new Date().toISOString(),
    nextAppointment: ''
  });

  // Get the active tab from URL if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, []);

  // Unified function to fetch member data
  const fetchMemberData = async (userId?: string) => {
    if (!userId) {
      setError('معرف المستخدم غير متوفر');
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);

      // التحقق من وجود الجلسة قبل محاولة جلب البيانات
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        throw new Error('لم يتم العثور على جلسة صالحة');
      }

      // جلب بيانات المستفيد
      const { data: member, error: memberError } = await supabase
        .from('members')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (memberError) {
        if (memberError.code === 'PGRST116') {
          setMemberData(null);
          setError('لم يتم العثور على بيانات المستفيد. يرجى إكمال التسجيل.');
        } else {
          throw new Error(`خطأ في جلب بيانات المستفيد: ${memberError.message}`);
        }
      } else {
        setMemberData(member);
        
        // جلب اسم الفرع إذا كان هناك فرع مفضل
        if (member.preferred_branch_id) {
          const { data: branch } = await supabase
            .from('branches')
            .select('name')
            .eq('id', member.preferred_branch_id)
            .single();
            
          if (branch) {
            setMemberData(prev => prev ? {...prev, branch_name: branch.name} : null);
          }
        }
        
        // جلب الإحصائيات إذا كان المستفيد معتمداً
        if (member.registration_status === 'approved') {
          await fetchRealStats(member.id);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ في جلب البيانات';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Unified function to fetch real statistics
  const fetchRealStats = async (memberId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/beneficiary-stats`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memberId })
      });
      
      if (!response.ok) {
        throw new Error(`خطأ في الشبكة: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setStats(result.stats);
      } else {
        throw new Error(result.error || 'خطأ في جلب الإحصائيات');
      }
    } catch (err) {
      console.error('خطأ في جلب إحصائيات المستفيد:', err);
      // استخدام إحصائيات افتراضية في حالة الخطأ
      setStats({
        availableServices: 0,
        activeRequests: 0,
        completedRequests: 0,
        lastLogin: new Date().toISOString(),
        nextAppointment: ''
      });
    }
  };

  // Handle logout
  const handleLogout = () => {
    if (window.confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      authLogout();
      dispatch(logout());
    }
  };

  // Retry data fetch
  const retryFetch = () => {
    if (user?.id) {
      fetchMemberData(user.id);
    }
  };

  // Update profile completion percentage
  const handleProfileProgress = (percentage: number) => {
    setMemberData(prev => prev ? {...prev, profile_completion_percentage: percentage} : null);
  };

  // Update registration status
  const handleRegistrationStatusChange = (status: string) => {
    setMemberData(prev => prev ? {...prev, registration_status: status} : null);
  };

  // Load member data on component mount
  useEffect(() => {
    if (user?.id) {
      fetchMemberData(user.id);
    } else {
      setIsLoading(false);
      setError('لم يتم العثور على بيانات المستخدم');
    }
  }, [user?.id]);

  // Navigation items for the sidebar
  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      title: 'لوحة التحكم',
      icon: <span>🏠</span>,
      description: 'الصفحة الرئيسية'
    },
    {
      id: 'services',
      title: 'الخدمات المتاحة',
      icon: <span>📋</span>,
      description: 'استعراض وطلب الخدمات'
    },
    {
      id: 'requests',
      title: 'طلباتي',
      icon: <span>📝</span>,
      description: 'متابعة الطلبات المقدمة'
    },
    {
      id: 'profile',
      title: 'الملف الشخصي',
      icon: <span>👤</span>,
      description: 'تحديث البيانات الشخصية'
    },
    {
      id: 'documents',
      title: 'المستندات',
      icon: <span>📄</span>,
      description: 'إدارة المستندات المرفقة'
    }
  ];

  // Registration-specific navigation item
  if (memberData?.registration_status && 
      ['profile_incomplete', 'pending_documents', 'needs_correction'].includes(memberData.registration_status)) {
    navigationItems.push({
      id: 'registration',
      title: 'إكمال التسجيل',
      icon: <span>✅</span>,
      description: 'استكمال بيانات التسجيل',
      badge: memberData.profile_completion_percentage 
        ? `${memberData.profile_completion_percentage}%` 
        : undefined
    });
  }

  // Error handling and loading states
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">جاري تحميل بيانات المستفيد...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">خطأ في تحميل البيانات</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={retryFetch}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                إعادة المحاولة
              </button>
              <button
                onClick={handleLogout}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render the appropriate content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Dashboard Header */}
            <DashboardHeader userData={user} memberData={memberData} />

            {/* Registration Status Card (only shown if not approved) */}
            <StatusCard 
              registrationStatus={memberData?.registration_status || 'profile_incomplete'}
              memberData={memberData}
              onRetry={retryFetch}
            />

            {/* Stats Cards (only shown if approved) */}
            <StatsCards 
              stats={stats}
              registrationStatus={memberData?.registration_status || 'profile_incomplete'}
            />

            {/* Recent Activity & Quick Actions */}
            <ActivityAndQuickActions 
              registrationStatus={memberData?.registration_status || 'profile_incomplete'}
              memberData={memberData}
              retryFetch={retryFetch}
            />
            
            {/* Membership Badge (only shown if approved) */}
            <MembershipCard 
              registrationStatus={memberData?.registration_status || 'profile_incomplete'}
              memberData={memberData}
            />

            {/* Help & Support Section */}
            <SupportSection />
            
            {/* Contact Information Section (only shown if approved) */}
            <ContactInfoSection 
              registrationStatus={memberData?.registration_status || 'profile_incomplete'}
              memberData={memberData}
            />
          </div>
        );
      case 'services':
        return (
          <ServicesList 
            memberData={memberData}
          />
        );
      case 'requests':
        return (
          <BeneficiaryRequests 
            memberData={memberData}
          />
        );
      case 'profile':
        return (
          <BeneficiaryProfile 
            userData={user}
            memberData={memberData}
            activeSubTab={profileSubTab}
            onChangeSubTab={setProfileSubTab}
          />
        );
      case 'documents':
        return (
          <BeneficiaryDocuments 
            memberData={memberData}
          />
        );
      case 'registration':
        return memberData?.id && user?.id ? (
          <RegistrationWorkflow
            userId={user.id}
            memberId={memberData.id}
            onProgress={handleProfileProgress}
            onStatusChange={handleRegistrationStatusChange}
          />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-900 mb-2">خطأ في تحميل بيانات التسجيل</h3>
            <p className="text-red-600 mb-4">لا يمكن العثور على معرف المستخدم أو معرف المستفيد</p>
            <Button onClick={retryFetch}>إعادة المحاولة</Button>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <DashboardHeader userData={user} memberData={memberData} />
            <StatusCard 
              registrationStatus={memberData?.registration_status || 'profile_incomplete'}
              memberData={memberData}
              onRetry={retryFetch}
            />
          </div>
        );
    }
  };

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Update URL to reflect current tab for bookmarking
    const newUrl = `${window.location.pathname}?tab=${tab}`;
    window.history.pushState({}, '', newUrl);
  };

  // Main return - using BeneficiaryLayout
  return (
    <BeneficiaryLayout
      user={user}
      activeTab={activeTab}
      navigationItems={navigationItems}
      onTabChange={handleTabChange}
      onLogout={handleLogout}
      memberData={memberData}
      isLoading={isLoading}
    >
      {renderContent()}
    </BeneficiaryLayout>
  );
};

export default BeneficiaryDashboard;
