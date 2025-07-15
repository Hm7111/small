import React, { useState, useCallback } from 'react';
import { 
  Search, FileText, User, Phone, CreditCard, 
  AlertCircle, CheckCircle, Clock, Eye, X,
  Calendar, MapPin, Building, Award, DollarSign,
  FileCheck, Download, Printer, Copy, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import LoadingSpinner from '../../ui/LoadingSpinner';
import { formatGregorianDate } from '../../../shared/utils/dateHelpers';
import { formatCurrency } from '../../../utils/helpers';

interface BeneficiaryData {
  id: string;
  national_id: string;
  full_name: string;
  phone: string;
  email?: string;
  city: string;
  district: string;
  registration_date: string;
  status: string;
  preferred_branch?: {
    id: string;
    name: string;
    city: string;
  };
}

interface ServiceRequest {
  id: string;
  request_number: string;
  service: {
    id: string;
    name: string;
    category: string;
  };
  status: string;
  request_date: string;
}

interface ComprehensiveReport {
  beneficiary: BeneficiaryData;
  service_requests: ServiceRequest[];
}

interface BranchReportsProps {
  branchId: string;
  branchName: string;
  managerId: string;
}

import { getAccessToken } from '../../../utils/authToken';

const BranchReports: React.FC<BranchReportsProps> = () => {

  const [searchType, setSearchType] = useState<'national_id' | 'transaction_id'>('national_id');
  const [searchValue, setSearchValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentReport, setCurrentReport] = useState<ComprehensiveReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    if (!searchValue.trim()) {
      setError('الرجاء إدخال قيمة للبحث');
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const token = getAccessToken();
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/branch-manager-reports`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate_report',
          criteria: { 
            type: searchType, 
            value: searchValue.trim() 
          }
        })
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      const result = await response.json();
      if (result.success) {
        setCurrentReport(result.data);
      } else {
        setError(result.error || 'خطأ في البحث');
      }
    } catch (error) {
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsSearching(false);
    }
  }, [searchValue, searchType]);

  return (
    <div className="p-4">
      <div className="mb-4">
        <Input
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="ابحث برقم الهوية"
        />
        <Button onClick={handleSearch} disabled={isSearching}>
          {isSearching ? 'جاري البحث...' : 'بحث'}
        </Button>
      </div>

      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}

      {currentReport && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-2">{currentReport.beneficiary.full_name}</h2>
          <p>رقم الهوية: {currentReport.beneficiary.national_id}</p>
        </div>
      )}
    </div>
  );
};

export default BranchReports;
