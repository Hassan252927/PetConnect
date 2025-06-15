import React from 'react';
import { Box, Typography, List, ListItem, Paper, Divider, Avatar, ListItemButton } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../hooks/useRedux';
import { Notification, markAsRead } from '../store/notificationSlice';
import { useNavigate } from 'react-router-dom';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.notification.notifications);

  const handleNotificationClick = (notification: Notification) => {
    dispatch(markAsRead(notification._id));
    navigate(`/posts/${notification.postID}`);
  };

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', padding: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Notifications
      </Typography>
      
      <Paper elevation={2}>
        <List>
          {notifications && notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <React.Fragment key={notification._id}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => handleNotificationClick(notification)}
                    sx={{ 
                      opacity: notification.read ? 0.7 : 1,
                      backgroundColor: notification.read ? 'inherit' : 'action.hover'
                    }}
                  >
                    <Box sx={{ display: 'flex', width: '100%', gap: 2 }}>
                      <Avatar 
                        src={notification.senderProfilePic} 
                        alt={notification.senderUsername}
                        sx={{ width: 40, height: 40 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1">
                          {notification.senderUsername}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {notification.type === 'like' 
                            ? 'liked your post'
                            : `commented: "${notification.content}"`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(notification.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  </ListItemButton>
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))
          ) : (
            <ListItem>
              <Typography variant="body1" color="text.secondary">
                No notifications yet
              </Typography>
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default NotificationsPage; 