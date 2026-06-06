const supabase = require('../config/supabase');
const mockStore = require('../config/mockStore');
const { v4: uuidv4 } = require('uuid');

const VALID_CATEGORIES = ['electrical', 'plumbing', 'furniture', 'internet', 'cleaning', 'other'];
const VALID_STATUSES = ['submitted', 'assigned', 'in_progress', 'resolved'];

const createNotification = async (userId, message, type = 'general') => {
  if (process.env.USE_MOCK_DB === 'true') {
    mockStore.notifications.unshift({
      id: uuidv4(),
      user_id: userId,
      message,
      type,
      is_read: false,
      created_at: new Date().toISOString()
    });
  } else {
    await supabase.from('notifications').insert([
      { id: uuidv4(), user_id: userId, message, type, is_read: false },
    ]);
  }
};

// @desc  Get maintenance requests
// @route GET /api/maintenance
const getMaintenanceRequests = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;

    if (process.env.USE_MOCK_DB === 'true') {
      let filtered = [...mockStore.maintenance];
      if (req.user.role !== 'admin') {
        filtered = filtered.filter(r => r.user_id === req.user.id);
      }
      if (status) {
        filtered = filtered.filter(r => r.status === status);
      }
      if (category) {
        filtered = filtered.filter(r => r.category === category);
      }
      const total = filtered.length;
      const offset = (page - 1) * limit;
      const paginated = filtered.slice(offset, offset + parseInt(limit));
      return res.json({ requests: paginated, total, page: parseInt(page), limit: parseInt(limit) });
    }

    const offset = (page - 1) * limit;
    let query = supabase
      .from('maintenance_requests')
      .select('*, users(name, email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (req.user.role !== 'admin') query = query.eq('user_id', req.user.id);
    if (status) query = query.eq('status', status);
    if (category) query = query.eq('category', category);

    const { data, error, count } = await query;
    if (error) return res.status(500).json({ error: error.message });

    res.json({ requests: data, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// @desc  Create maintenance request
// @route POST /api/maintenance
const createMaintenanceRequest = async (req, res) => {
  try {
    const { category, description, location } = req.body;

    if (!category || !description || !location) {
      return res.status(400).json({ error: 'Category, description, and location are required.' });
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: `Category must be one of: ${VALID_CATEGORIES.join(', ')}` });
    }

    if (process.env.USE_MOCK_DB === 'true') {
      const activeUser = mockStore.users.find(u => u.id === req.user.id) || { name: req.user.name, email: req.user.email };
      const newMaint = {
        id: uuidv4(),
        user_id: req.user.id,
        category,
        description: description.trim(),
        location: location.trim(),
        status: 'submitted',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        users: { name: activeUser.name, email: activeUser.email }
      };

      mockStore.maintenance.unshift(newMaint);
      return res.status(201).json({ request: newMaint, message: 'Maintenance request submitted (Mock DB).' });
    }

    const { data, error } = await supabase
      .from('maintenance_requests')
      .insert([{
        id: uuidv4(),
        user_id: req.user.id,
        category,
        description: description.trim(),
        location: location.trim(),
        status: 'submitted',
      }])
      .select('*, users(name, email)')
      .single();

    if (error) return res.status(500).json({ error: 'Failed to create maintenance request.' });

    res.status(201).json({ request: data, message: 'Maintenance request submitted.' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// @desc  Update maintenance request
// @route PUT /api/maintenance/:id
const updateMaintenanceRequest = async (req, res) => {
  try {
    const { status } = req.body;

    if (process.env.USE_MOCK_DB === 'true') {
      const idx = mockStore.maintenance.findIndex(r => r.id === req.params.id);
      if (idx === -1) return res.status(404).json({ error: 'Request not found.' });

      const existing = mockStore.maintenance[idx];
      const prevStatus = existing.status;

      if (req.user.role === 'admin' && status && VALID_STATUSES.includes(status)) {
        existing.status = status;
      }
      existing.updated_at = new Date().toISOString();
      mockStore.maintenance[idx] = existing;

      if (req.user.role === 'admin' && status && status !== prevStatus) {
        await createNotification(
          existing.user_id,
          `Your maintenance request (${existing.category}) has been updated to: ${status.toUpperCase()}`,
          'maintenance_update'
        );
      }

      return res.json({ request: existing, message: 'Request updated.' });
    }

    const { data: existing } = await supabase
      .from('maintenance_requests')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (!existing) return res.status(404).json({ error: 'Request not found.' });

    const updates = { updated_at: new Date().toISOString() };

    if (req.user.role === 'admin') {
      if (status && VALID_STATUSES.includes(status)) updates.status = status;
    }

    const { data, error } = await supabase
      .from('maintenance_requests')
      .update(updates)
      .eq('id', req.params.id)
      .select('*, users(name, email)')
      .single();

    if (error) return res.status(500).json({ error: 'Failed to update request.' });

    if (req.user.role === 'admin' && status && status !== existing.status) {
      await createNotification(
        existing.user_id,
        `Your maintenance request (${existing.category}) has been updated to: ${status.toUpperCase()}`,
        'maintenance_update'
      );
    }

    res.json({ request: data, message: 'Request updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { getMaintenanceRequests, createMaintenanceRequest, updateMaintenanceRequest };
