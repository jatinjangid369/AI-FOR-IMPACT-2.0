const supabase = require('../config/supabase');
const mockStore = require('../config/mockStore');
const { v4: uuidv4 } = require('uuid');

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

// @desc  Get all complaints (admin: all, student: own)
// @route GET /api/complaints
const getComplaints = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    // Mock Mode
    if (process.env.USE_MOCK_DB === 'true') {
      let filtered = [...mockStore.complaints];
      if (req.user.role !== 'admin') {
        filtered = filtered.filter(c => c.user_id === req.user.id);
      }
      if (status) {
        filtered = filtered.filter(c => c.status === status);
      }
      const total = filtered.length;
      const offset = (page - 1) * limit;
      const paginated = filtered.slice(offset, offset + parseInt(limit));
      return res.json({ complaints: paginated, total, page: parseInt(page), limit: parseInt(limit) });
    }

    // Live Mode
    const offset = (page - 1) * limit;
    let query = supabase
      .from('complaints')
      .select('*, users(name, email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (req.user.role !== 'admin') {
      query = query.eq('user_id', req.user.id);
    }

    if (status) query = query.eq('status', status);

    const { data, error, count } = await query;
    if (error) return res.status(500).json({ error: error.message });

    res.json({ complaints: data, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// @desc  Get single complaint
// @route GET /api/complaints/:id
const getComplaint = async (req, res) => {
  try {
    // Mock Mode
    if (process.env.USE_MOCK_DB === 'true') {
      const comp = mockStore.complaints.find(c => c.id === req.params.id);
      if (!comp) return res.status(404).json({ error: 'Complaint not found.' });
      if (req.user.role !== 'admin' && comp.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied.' });
      }
      return res.json({ complaint: comp });
    }

    // Live Mode
    const { data, error } = await supabase
      .from('complaints')
      .select('*, users(name, email)')
      .eq('id', req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Complaint not found.' });

    if (req.user.role !== 'admin' && data.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    res.json({ complaint: data });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// @desc  Create complaint
// @route POST /api/complaints
const createComplaint = async (req, res) => {
  try {
    const { title, description, location, attachment_url } = req.body;

    if (!title || !description || !location) {
      return res.status(400).json({ error: 'Title, description, and location are required.' });
    }

    // Mock Mode
    if (process.env.USE_MOCK_DB === 'true') {
      const activeUser = mockStore.users.find(u => u.id === req.user.id) || { name: req.user.name, email: req.user.email };
      const newComp = {
        id: uuidv4(),
        user_id: req.user.id,
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        status: 'open',
        attachment_url: attachment_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        users: { name: activeUser.name, email: activeUser.email }
      };

      mockStore.complaints.unshift(newComp);
      return res.status(201).json({ complaint: newComp, message: 'Complaint submitted successfully (Mock DB).' });
    }

    // Live Mode
    const { data, error } = await supabase
      .from('complaints')
      .insert([{
        id: uuidv4(),
        user_id: req.user.id,
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        status: 'open',
        attachment_url: attachment_url || null,
      }])
      .select('*, users(name, email)')
      .single();

    if (error) return res.status(500).json({ error: 'Failed to create complaint.' });

    res.status(201).json({ complaint: data, message: 'Complaint submitted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// @desc  Update complaint
// @route PUT /api/complaints/:id
const updateComplaint = async (req, res) => {
  try {
    const { status, title, description, location } = req.body;

    // Mock Mode
    if (process.env.USE_MOCK_DB === 'true') {
      const idx = mockStore.complaints.findIndex(c => c.id === req.params.id);
      if (idx === -1) return res.status(404).json({ error: 'Complaint not found.' });

      const existing = mockStore.complaints[idx];
      if (req.user.role !== 'admin' && existing.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied.' });
      }

      const prevStatus = existing.status;
      if (req.user.role === 'admin' && status) existing.status = status;
      if (title) existing.title = title.trim();
      if (description) existing.description = description.trim();
      if (location) existing.location = location.trim();
      existing.updated_at = new Date().toISOString();

      mockStore.complaints[idx] = existing;

      if (req.user.role === 'admin' && status && status !== prevStatus) {
        await createNotification(
          existing.user_id,
          `Your complaint "${existing.title}" status changed to: ${status.toUpperCase()}`,
          'complaint_update'
        );
      }

      return res.json({ complaint: existing, message: 'Complaint updated successfully.' });
    }

    // Live Mode
    const { data: existing, error: fetchError } = await supabase
      .from('complaints')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !existing) return res.status(404).json({ error: 'Complaint not found.' });

    if (req.user.role !== 'admin' && existing.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const updates = { updated_at: new Date().toISOString() };
    if (req.user.role === 'admin' && status) updates.status = status;
    if (title) updates.title = title.trim();
    if (description) updates.description = description.trim();
    if (location) updates.location = location.trim();

    const { data, error } = await supabase
      .from('complaints')
      .update(updates)
      .eq('id', req.params.id)
      .select('*, users(name, email)')
      .single();

    if (error) return res.status(500).json({ error: 'Failed to update complaint.' });

    if (req.user.role === 'admin' && status && status !== existing.status) {
      await createNotification(
        existing.user_id,
        `Your complaint "${existing.title}" status changed to: ${status.toUpperCase()}`,
        'complaint_update'
      );
    }

    res.json({ complaint: data, message: 'Complaint updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// @desc  Delete complaint
// @route DELETE /api/complaints/:id
const deleteComplaint = async (req, res) => {
  try {
    // Mock Mode
    if (process.env.USE_MOCK_DB === 'true') {
      const idx = mockStore.complaints.findIndex(c => c.id === req.params.id);
      if (idx === -1) return res.status(404).json({ error: 'Complaint not found.' });
      mockStore.complaints.splice(idx, 1);
      return res.json({ message: 'Complaint deleted successfully.' });
    }

    // Live Mode
    const { error } = await supabase
      .from('complaints')
      .delete()
      .eq('id', req.params.id);

    if (error) return res.status(500).json({ error: 'Failed to delete complaint.' });

    res.json({ message: 'Complaint deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { getComplaints, getComplaint, createComplaint, updateComplaint, deleteComplaint };
