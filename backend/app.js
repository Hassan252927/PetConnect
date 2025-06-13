const express = require('express');
const app = express();
const messageRoutes = require('./routes/messageRoutes');

// ... existing code ...
app.use('/api/messages', messageRoutes);
// ... existing code ... 