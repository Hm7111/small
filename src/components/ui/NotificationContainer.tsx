import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { RootState } from '../../store';
import { removeNotification } from '../../store/slices/uiSlice';
import Notification from './Notification';

interface NotificationContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxNotifications?: number;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({
  position = 'bottom-left',
  maxNotifications = 5
}) => {
  const notifications = useSelector((state: RootState) => state.ui.notifications);
  const dispatch = useDispatch();

  // Position classes
  const positionClasses = {
    'top-right': 'fixed top-4 right-4 z-50 flex flex-col-reverse gap-3 max-w-md',
    'top-left': 'fixed top-4 left-4 z-50 flex flex-col-reverse gap-3 max-w-md',
    'bottom-right': 'fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-3 max-w-md',
    'bottom-left': 'fixed bottom-4 left-4 z-50 flex flex-col-reverse gap-3 max-w-md'
  };

  // Only show the most recent notifications up to maxNotifications
  const visibleNotifications = notifications.slice(-maxNotifications);

  // Handle notification close
  const handleClose = (id: number | string) => {
    dispatch(removeNotification(Number(id)));
  };

  if (visibleNotifications.length === 0) return null;

  return (
    <div className={positionClasses[position]} dir="rtl">
      <AnimatePresence>
        {visibleNotifications.map((notification) => (
          <Notification
            key={notification.id}
            id={notification.id}
            type={notification.type}
            title={notification.title}
            message={notification.message}
            onClose={handleClose}
            autoClose={notification.autoClose}
            duration={notification.duration}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationContainer;
