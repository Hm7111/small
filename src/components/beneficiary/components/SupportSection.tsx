import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Phone, Mail, MessageSquare } from 'lucide-react';
import Button from '../../ui/Button';

const SupportSection: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800/30 rounded-2xl shadow-md p-8 relative overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row items-start gap-6">
        <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
          <Heart className="w-7 h-7 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="space-y-3 flex-1 relative z-10">
          <h3 className="text-xl font-bold text-blue-900 dark:text-blue-300 mb-2">تحتاج مساعدة؟</h3>
          <p className="text-blue-700 dark:text-blue-400 text-base leading-relaxed">
            يمكنك التواصل مع فريق الدعم الخاص بنا في حال واجهتك أي مشكلة أو استفسار.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
            <Button
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 shadow-md"
              icon={<Phone className="w-5 h-5 ml-3" />}
              onClick={() => window.open('tel:920000000')}
            >
              اتصل بالدعم
            </Button>
            <Button
              variant="outline"
              className="border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30"
              icon={<Mail className="w-5 h-5 ml-3" />}
              onClick={() => window.open('mailto:support@charity.org')}
            >
              راسلنا
            </Button>
            <Button
              variant="outline" 
              className="border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30"
              icon={<MessageSquare className="w-5 h-5 ml-3" />}
              onClick={() => window.open('https://wa.me/966500000000')}
            >
              واتساب
            </Button>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute bottom-0 right-0 w-64 h-64 opacity-[0.03] dark:opacity-[0.05] transform translate-x-32 translate-y-16">
        <Heart className="w-full h-full" />
      </div>
    </motion.div>
  );
};

export default SupportSection;
