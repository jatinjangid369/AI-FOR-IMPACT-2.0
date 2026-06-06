const supabase = require('../config/supabase');
const mockStore = require('../config/mockStore');
const { v4: uuidv4 } = require('uuid');

// @desc  Get lost items
// @route GET /api/lost-items
const getLostItems = async (req, res) => {
  try {
    const { search, page = 1, limit = 12 } = req.query;

    if (process.env.USE_MOCK_DB === 'true') {
      let filtered = [...mockStore.lostItems];
      if (search) {
        const query = search.toLowerCase();
        filtered = filtered.filter(i => 
          i.item_name.toLowerCase().includes(query) ||
          i.description.toLowerCase().includes(query) ||
          i.location.toLowerCase().includes(query)
        );
      }
      const total = filtered.length;
      const offset = (page - 1) * limit;
      const paginated = filtered.slice(offset, offset + parseInt(limit));
      return res.json({ items: paginated, total, page: parseInt(page), limit: parseInt(limit) });
    }

    const offset = (page - 1) * limit;
    let query = supabase
      .from('lost_items')
      .select('*, users(name, email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (search) {
      query = query.or(`item_name.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`);
    }

    const { data, error, count } = await query;
    if (error) return res.status(500).json({ error: error.message });

    res.json({ items: data, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// @desc  Create lost item
// @route POST /api/lost-items
const createLostItem = async (req, res) => {
  try {
    const { item_name, description, location, date_lost, image_url } = req.body;

    if (!item_name || !description || !location) {
      return res.status(400).json({ error: 'Item name, description, and location are required.' });
    }

    if (process.env.USE_MOCK_DB === 'true') {
      const activeUser = mockStore.users.find(u => u.id === req.user.id) || { name: req.user.name, email: req.user.email };
      const newItem = {
        id: uuidv4(),
        user_id: req.user.id,
        item_name: item_name.trim(),
        description: description.trim(),
        location: location.trim(),
        date_lost: date_lost || new Date().toISOString(),
        image_url: image_url || null,
        created_at: new Date().toISOString(),
        users: { name: activeUser.name, email: activeUser.email }
      };

      mockStore.lostItems.unshift(newItem);
      return res.status(201).json({ item: newItem, message: 'Lost item reported (Mock DB).' });
    }

    const { data, error } = await supabase
      .from('lost_items')
      .insert([{
        id: uuidv4(),
        user_id: req.user.id,
        item_name: item_name.trim(),
        description: description.trim(),
        location: location.trim(),
        date_lost: date_lost || new Date().toISOString(),
        image_url: image_url || null,
      }])
      .select('*, users(name, email)')
      .single();

    if (error) return res.status(500).json({ error: 'Failed to report lost item.' });

    res.status(201).json({ item: data, message: 'Lost item reported.' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// @desc  Get found items
// @route GET /api/found-items
const getFoundItems = async (req, res) => {
  try {
    const { search, page = 1, limit = 12 } = req.query;

    if (process.env.USE_MOCK_DB === 'true') {
      let filtered = [...mockStore.foundItems];
      if (search) {
        const query = search.toLowerCase();
        filtered = filtered.filter(i => 
          i.item_name.toLowerCase().includes(query) ||
          i.description.toLowerCase().includes(query) ||
          i.location.toLowerCase().includes(query)
        );
      }
      const total = filtered.length;
      const offset = (page - 1) * limit;
      const paginated = filtered.slice(offset, offset + parseInt(limit));
      return res.json({ items: paginated, total, page: parseInt(page), limit: parseInt(limit) });
    }

    const offset = (page - 1) * limit;
    let query = supabase
      .from('found_items')
      .select('*, users(name, email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (search) {
      query = query.or(`item_name.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`);
    }

    const { data, error, count } = await query;
    if (error) return res.status(500).json({ error: error.message });

    res.json({ items: data, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// @desc  Create found item
// @route POST /api/found-items
const createFoundItem = async (req, res) => {
  try {
    const { item_name, description, location, date_found, image_url } = req.body;

    if (!item_name || !description || !location) {
      return res.status(400).json({ error: 'Item name, description, and location are required.' });
    }

    if (process.env.USE_MOCK_DB === 'true') {
      const activeUser = mockStore.users.find(u => u.id === req.user.id) || { name: req.user.name, email: req.user.email };
      const newItem = {
        id: uuidv4(),
        user_id: req.user.id,
        item_name: item_name.trim(),
        description: description.trim(),
        location: location.trim(),
        date_found: date_found || new Date().toISOString(),
        image_url: image_url || null,
        created_at: new Date().toISOString(),
        users: { name: activeUser.name, email: activeUser.email }
      };

      mockStore.foundItems.unshift(newItem);
      return res.status(201).json({ item: newItem, message: 'Found item reported (Mock DB).' });
    }

    const { data, error } = await supabase
      .from('found_items')
      .insert([{
        id: uuidv4(),
        user_id: req.user.id,
        item_name: item_name.trim(),
        description: description.trim(),
        location: location.trim(),
        date_found: date_found || new Date().toISOString(),
        image_url: image_url || null,
      }])
      .select('*, users(name, email)')
      .single();

    if (error) return res.status(500).json({ error: 'Failed to report found item.' });

    res.status(201).json({ item: data, message: 'Found item reported.' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { getLostItems, createLostItem, getFoundItems, createFoundItem };
