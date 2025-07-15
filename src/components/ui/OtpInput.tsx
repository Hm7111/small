import React, { useState, useRef, useEffect } from 'react';
import ErrorMessage from '../common/ErrorMessage.tsx';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: string;
  className?: string;
}

const OtpInput: React.FC<OtpInputProps> = ({
  value,
  onChange,
  length = 4,
  error,
  className = ''
}) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const otpArray = value.split('');
    const newOtp = Array(length).fill('');
    otpArray.forEach((digit, index) => {
      if (index < length) newOtp[index] = digit;
    });
    setOtp(newOtp);
  }, [value, length]);

  const handleChange = (index: number, digit: string) => {
    if (!/^\d*$/.test(digit)) return;

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    onChange(newOtp.join(''));

    // الانتقال للخانة التالية
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, length);
    
    const newOtp = Array(length).fill('');
    digits.split('').forEach((digit, index) => {
      newOtp[index] = digit;
    });
    
    setOtp(newOtp);
    onChange(newOtp.join(''));
    
    // التركيز على الخانة التالية أو الأخيرة
    const nextIndex = Math.min(digits.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className={`space-y-4 ${className}`} dir="ltr">
      <div className="flex justify-center gap-4">
        {otp.map((digit, index) => (
          <div key={index} className="relative">
            <input
              ref={el => inputRefs.current[index] = el}
              type="text"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(index, e.target.value)}
              onKeyDown={e => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={`
                w-16 h-16 text-center text-2xl font-bold
                border-2 rounded-lg transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500/30
                hover:border-gray-400 bg-white
                ${error ? 'border-red-400' : 'border-gray-300'}
                ${digit ? 'border-blue-500 bg-blue-50 text-blue-700' : ''}
              `}
            />
          </div>
        ))}
      </div>
      
      {error && (
        <ErrorMessage message={error} />
      )}
    </div>
  );
};

export default OtpInput;
