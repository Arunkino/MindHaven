import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { markNotificationAsRead } from '../features/notifications/notificationSlice';

const NotificationList = () => {
  const { notifications } = useSelector(state => state.notifications);
  const dispatch = useDispatch();

  const handleMarkAsRead = (notificationId) => {
    dispatch(markNotificationAsRead(notificationId));
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Notifications</h2>
      {notifications.length === 0 ? (
        <p>No new notifications</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map(notification => (
            <li key={notification.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
              <span>{notification.content}</span>
              <button
                onClick={() => handleMarkAsRead(notification.id)}
                className="text-sm bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
              >
                Mark as Read
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationList;