import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { verifyOtp, verifyExistingUserOtp, sendOtp, sendExistingUserOtp } from '../../store/slices/authSlice';
import { Button } from '../ui/Button';
import OtpInput from '../ui/OtpInput'; // Assuming OtpInput is default export
import ErrorMessage from '../ui/ErrorMessage';
import LoadingSpinner from '../ui/LoadingSpinner';
import { ArrowLeft, RefreshCw } from 'lucide-react';

interface OtpVerificationProps {
  nationalId: string;
  phoneNumber?: string;
  fullName?: string;
  isNewUser: boolean;
  sessionId?: number;
  onBack: () => void;
  onSuccess: (user: any) => void;
}

export const OtpVerification: React.FC<OtpVerificationProps> = ({
  nationalId,
  phoneNumber,
  fullName,
  isNewUser,
  sessionId,
  onBack,
  onSuccess
}) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [canResend, setCanResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleVerifyOtp = async () => {
    if (otp.length !== 4) {
      return;
    }

    try {
      const action = isNewUser 
        ? verifyOtp({ nationalId, otp, sessionId })
        : verifyExistingUserOtp({ nationalId, otp, sessionId });
      
      const result = await dispatch(action as any);
      
      if (result.type.endsWith('/fulfilled')) {
        onSuccess(result.payload.user);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    try {
      const action = isNewUser 
        ? sendOtp({ nationalId, phoneNumber: phoneNumber || '', fullName })
        : sendExistingUserOtp(nationalId);
      
      await dispatch(action as any);
      setTimeLeft(120);
      setCanResend(false);
      setOtp('');
    } catch (error) {
      console.error('Error resending OTP:', error);
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          تحقق من رمز التحقق
        </h2>
        <p className="text-gray-600">
          تم إرسال رمز التحقق إلى رقم الهاتف المسجل
        </p>
        {phoneNumber && (
          <p className="text-sm text-gray-500 mt-1">
            {phoneNumber}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            رمز التحقق
          </label>
          <OtpInput
            value={otp}
            onChange={setOtp}
            disabled={isLoading}
            error={!!error}
          />
          {error && (
            <ErrorMessage message={error} className="mt-2" />
          )}
        </div>

        <div className="text-center">
          {timeLeft > 0 ? (
            <p className="text-sm text-gray-500">
              إعادة الإرسال خلال {formatTime(timeLeft)}
            </p>
          ) : (
            <button
              onClick={handleResendOtp}
              disabled={resendLoading}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center justify-center gap-1 mx-auto"
            >
              {resendLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  إعادة إرسال رمز التحقق
                </>
              )}
            </button>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onBack}
            variant="secondary"
            className="flex-1"
            disabled={isLoading}
          >
            <ArrowLeft className="h-4 w-4 ml-1" />
            رجوع
          </Button>
          <Button
            onClick={handleVerifyOtp}
            disabled={otp.length !== 4 || isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="ml-2" />
                جاري التحقق...
              </>
            ) : (
              'تأكيد'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
