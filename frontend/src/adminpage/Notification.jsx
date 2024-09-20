import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Notification.css';

function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/notifications');
      setNotifications(response.data.notifications || []);
      // Mark all fetched notifications as read if necessary
      const notificationIds = response.data.notifications?.map(notification => notification.id) || [];
      if (notificationIds.length > 0) {
        await markAllAsRead(notificationIds);
      }
    } catch (err) {
      setError('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  // Mark notifications as read
  const markAllAsRead = async (notificationIds) => {
    if (notificationIds.length === 0) return;
    
    try {
      await Promise.all(notificationIds.map(id => 
        axios.patch(`http://localhost:3000/api/notifications/${id}/read`)
      ));
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notificationIds.includes(notification.id)
            ? { ...notification, is_read: 1 }
            : notification
        )
      );
    } catch (err) {
      console.error('Failed to mark notifications as read:', err);
    }
  };

  // Handle notification click to mark as read
  const handleNotificationClick = async (id) => {
    try {
      await axios.patch(`http://localhost:3000/api/notifications/${id}/read`);
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === id
            ? { ...notification, is_read: 1 }
            : notification
        )
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err.response ? err.response.data : err.message);
      setError('Failed to mark notification as read');
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="contain-not">
    <div className='notification-container'>
      <h3>Notifications</h3>
      <div className='notification-list'>
        {notifications.length === 0 ? (
          <p>No notifications available</p>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.id}
              className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}
              onClick={() => handleNotificationClick(notification.id)}
            >
              <h3>{notification.product_name}</h3>
              <p>Branch: {notification.branch_name}</p>
              <p>{notification.message}</p>
              <span className='notification-time'>
                {new Date(notification.created_at).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
    </div>
  );
}

export default Notification;
