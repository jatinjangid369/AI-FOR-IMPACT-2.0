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

// @desc  Get all policies
// @route GET /api/policies
const getPolicies = async (req, res) => {
  try {
    const { category } = req.query;

    if (process.env.USE_MOCK_DB === 'true') {
      let filtered = [...mockStore.policies];
      if (category) {
        filtered = filtered.filter(p => p.category === category);
      }
      return res.json({ policies: filtered });
    }

    let query = supabase.from('policies').select('*').order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    res.json({ policies: data });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// @desc  Upload/Create policy
// @route POST /api/policies
const createPolicy = async (req, res) => {
  try {
    const { title, category, pdf_url } = req.body;

    if (!title || !category || !pdf_url) {
      return res.status(400).json({ error: 'Title, category, and pdf_url are required.' });
    }

    if (process.env.USE_MOCK_DB === 'true') {
      const newPolicy = {
        id: uuidv4(),
        title: title.trim(),
        category: category.trim(),
        pdf_url: pdf_url.trim(),
        created_at: new Date().toISOString()
      };

      mockStore.policies.unshift(newPolicy);

      // Broadcast notifications in memory
      mockStore.users.forEach(u => {
        mockStore.notifications.unshift({
          id: uuidv4(),
          user_id: u.id,
          message: `A new policy has been uploaded: "${title}" in ${category}`,
          type: 'policy_upload',
          is_read: false,
          created_at: new Date().toISOString()
        });
      });

      return res.status(201).json({ policy: newPolicy, message: 'Policy uploaded successfully.' });
    }

    const { data, error } = await supabase
      .from('policies')
      .insert([{
        id: uuidv4(),
        title: title.trim(),
        category: category.trim(),
        pdf_url: pdf_url.trim(),
      }])
      .select('*')
      .single();

    if (error) return res.status(500).json({ error: 'Failed to upload policy.' });

    // Notify all users about the new policy
    const { data: allUsers } = await supabase.from('users').select('id');
    if (allUsers && allUsers.length > 0) {
      const notifications = allUsers.map(u => ({
        id: uuidv4(),
        user_id: u.id,
        message: `A new policy has been uploaded: "${title}" in ${category}`,
        type: 'policy_upload',
        is_read: false
      }));
      await supabase.from('notifications').insert(notifications);
    }

    res.status(201).json({ policy: data, message: 'Policy uploaded successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { getPolicies, createPolicy };
