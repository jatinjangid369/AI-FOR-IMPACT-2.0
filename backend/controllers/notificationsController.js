const supabase = require('../config/supabase');
const mockStore = require('../config/mockStore');

// @desc  Get notifications for current user
// @route GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    if (process.env.USE_MOCK_DB === 'true') {
      const filtered = mockStore.notifications.filter(n => n.user_id === req.user.id);
      return res.json({ notifications: filtered });
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    res.json({ notifications: data });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// @desc  Mark notification as read
// @route PUT /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    if (process.env.USE_MOCK_DB === 'true') {
      const idx = mockStore.notifications.findIndex(n => n.id === req.params.id && n.user_id === req.user.id);
      if (idx === -1) return res.status(404).json({ error: 'Notification not found.' });
      mockStore.notifications[idx].is_read = true;
      return res.json({ notification: mockStore.notifications[idx] });
    }

    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select('*')
      .single();

    if (error) return res.status(500).json({ error: 'Failed to update notification status.' });

    res.json({ notification: data });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// @desc  Mark all notifications as read
// @route PUT /api/notifications/read-all
const markAllAsRead = async (req, res) => {
  try {
    if (process.env.USE_MOCK_DB === 'true') {
      mockStore.notifications.forEach((n, idx) => {
        if (n.user_id === req.user.id) {
          mockStore.notifications[idx].is_read = true;
        }
      });
      return res.json({ message: 'All notifications marked as read.' });
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', req.user.id);

    if (error) return res.status(500).json({ error: 'Failed to update notifications.' });

    res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
