import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { setUser, logout as logoutThunk, initAuth } from '../../../store/slices/authSlice';
import { supabase } from '../../../shared/utils/supabase';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);
  const [initializing, setInitializing] = useState(true);

  const restoreUserFromStorage = (): boolean => {
    console.log('🔄 محاولة استعادة المستخدم من التخزين المحلي...');
    
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        console.log('✅ تم العثور على مستخدم مخزن:', parsedUser);
        dispatch(setUser(parsedUser));
        return true;
      }
      console.log('⚠️ لم يتم العثور على مستخدم مخزن');
      return false;
    } catch (error) {
      console.error('❌ خطأ في استعادة المستخدم من التخزين:', error);
      return false;
    }
  };

  const handleLogout = async () => {
    console.log('🔄 بدء عملية تسجيل الخروج...');
    
    try {
      // استخدام logout thunk للتعامل مع العملية بالكامل
      await dispatch(logoutThunk());
      window.location.href = '/';
    } catch (error) {
      console.error('❌ خطأ في تسجيل الخروج:', error);
      
      // آلية احتياطية للخروج
      console.log('🔄 تطبيق آلية احتياطية للخروج...');
      dispatch(clearUser());
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    }
  };

  const setupAuthListener = () => {
    console.log('🔄 إعداد مستمع تغييرات المصادقة...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 تغيير حالة المصادقة:', event, session);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ تم تسجيل الدخول بنجاح:', session.user);
          dispatch(setUser(session.user));
          localStorage.setItem('currentUser', JSON.stringify(session.user));
        } 
      }
    );

    return subscription;
  };

  useEffect(() => {
    console.log('🔄 تهيئة useAuth...');
    
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ خطأ في الحصول على الجلسة:', error);
          // محاولة استعادة المستخدم من التخزين المحلي
          restoreUserFromStorage();
        } else if (session?.user) {
          console.log('✅ تم العثور على جلسة نشطة:', session.user);
          dispatch(setUser(session.user));
          localStorage.setItem('currentUser', JSON.stringify(session.user));
        } else {
          console.log('⚠️ لا توجد جلسة نشطة');
          // محاولة استعادة المستخدم من التخزين المحلي
          restoreUserFromStorage();
        }
      } catch (error) {
        console.error('❌ خطأ في تهيئة المصادقة:', error);
        restoreUserFromStorage();
      } finally {
        setInitializing(false);
      }
    };

    // تهيئة المستمع
    const subscription = setupAuthListener();

    // استدعاء دالة التهيئة من authSlice
    dispatch(initAuth());

    // تنظيف عند الخروج
    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return {
    user,
    isLoading: isLoading || initializing,
    logout: handleLogout,
    restoreUserFromStorage,
  };
};
