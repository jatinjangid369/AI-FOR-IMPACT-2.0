const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const supabase = require('../config/supabase');
const mockStore = require('../config/mockStore');
const { sendOtp } = require('../utils/email');
const { generateOtp } = require('../utils/otp');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc  Register new user
// @route POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate inputs
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    if (!['student', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Role must be student or admin.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const emailKey = email.toLowerCase().trim();

    // Check mock database mode
    if (process.env.USE_MOCK_DB === 'true') {
      const existing = mockStore.users.find(u => u.email === emailKey);
      if (existing) {
        return res.status(409).json({ error: 'User with this email already exists.' });
      }

      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = {
        id: uuidv4(),
        name: name.trim(),
        email: emailKey,
        password_hash: hashedPassword,
        role,
        is_verified: false,
        created_at: new Date().toISOString()
      };

      mockStore.users.push(newUser);
      
      // Generate OTP
      const { otp, expiresAt } = generateOtp();
      mockStore.otpVerifications.push({ email: emailKey, otp, expiresAt });
      // Send OTP email via Brevo
      await sendOtp(emailKey, otp);

      return res.status(201).json({
        message: 'Account created. Please verify your email with the OTP sent.',
      });
    }

    // Live Supabase Database Mode
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', emailKey)
      .single();

    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { data: newUser, error } = await supabase
      .from('users')
      .insert([
        {
          id: uuidv4(),
          name: name.trim(),
          email: emailKey,
          password_hash: hashedPassword,
          role,
          is_verified: false
        },
      ])
      .select('id')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to create user account.' });
    }

    // Generate OTP
    const { otp, expiresAt } = generateOtp();
    await supabase.from('email_otps').insert([
      {
        user_id: newUser.id,
        otp_code: otp,
        expires_at: expiresAt,
      },
    ]);
    // Send OTP email via Brevo
    await sendOtp(emailKey, otp);

    res.status(201).json({
      message: 'Account created. Please verify your email with the OTP sent.',
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// @desc  Login user
// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const emailKey = email.toLowerCase().trim();

    // Mock Mode
    if (process.env.USE_MOCK_DB === 'true') {
      const user = mockStore.users.find(u => u.email === emailKey);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
      if (!user.is_verified) {
        return res.status(403).json({ error: 'Email not verified.' });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const token = generateToken(user);
      return res.json({
        message: 'Login successful (Local Mock Mode).',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar_url: user.avatar_url,
        },
      });
    }

    // Live DB Mode
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', emailKey)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    if (!user.is_verified) {
      return res.status(403).json({ error: 'Email not verified.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// @desc  Get current user profile
// @route GET /api/auth/me
const getMe = async (req, res) => {
  try {
    if (process.env.USE_MOCK_DB === 'true') {
      const user = mockStore.users.find(u => u.id === req.user.id);
      if (!user) return res.status(404).json({ error: 'User not found.' });
      return res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar_url: user.avatar_url, created_at: user.created_at } });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, avatar_url, created_at')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// @desc  Update user profile
// @route PUT /api/auth/me
const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    if (process.env.USE_MOCK_DB === 'true') {
      const idx = mockStore.users.findIndex(u => u.id === req.user.id);
      if (idx === -1) return res.status(404).json({ error: 'User not found' });
      mockStore.users[idx].name = name.trim();
      const user = mockStore.users[idx];
      return res.json({ message: 'Profile updated.', user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar_url: user.avatar_url, created_at: user.created_at } });
    }

    const { data: user, error } = await supabase
      .from('users')
      .update({ name: name.trim() })
      .eq('id', req.user.id)
      .select('id, name, email, role, avatar_url, created_at')
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update profile.' });
    }

    res.json({ message: 'Profile updated.', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// @desc  Change password
// @route PUT /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both passwords are required.' });
    }

    if (process.env.USE_MOCK_DB === 'true') {
      const idx = mockStore.users.findIndex(u => u.id === req.user.id);
      if (idx === -1) return res.status(404).json({ error: 'User not found' });
      
      const user = mockStore.users[idx];
      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Current password is incorrect.' });
      }

      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      mockStore.users[idx].password_hash = hashedPassword;
      return res.json({ message: 'Password changed successfully.' });
    }

    const { data: user } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', req.user.id)
      .single();

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await supabase
      .from('users')
      .update({ password_hash: hashedPassword })
      .eq('id', req.user.id);

    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required.' });
    }
    const emailKey = email.toLowerCase().trim();

    // Mock mode verification
    if (process.env.USE_MOCK_DB === 'true') {
      const otpIndex = mockStore.otpVerifications.findIndex(o => o.email === emailKey && o.otp === otp);
      if (otpIndex === -1) {
        return res.status(400).json({ error: 'Invalid OTP.' });
      }
      const stored = mockStore.otpVerifications[otpIndex];
      if (new Date() > stored.expiresAt) {
        return res.status(400).json({ error: 'OTP expired.' });
      }
      // Mark user verified
      const userIdx = mockStore.users.findIndex(u => u.email === emailKey);
      if (userIdx !== -1) {
        mockStore.users[userIdx].is_verified = true;
      }
      // Remove OTP record
      mockStore.otpVerifications.splice(otpIndex, 1);
      const user = mockStore.users[userIdx];
      const token = generateToken(user);
      return res.json({ message: 'OTP verified.', token, user: { id: user.id, name: user.name, email: user.email, role: user.role, is_verified: true } });
    }

    // Supabase verification
    const { data: otpRecord, error: otpErr } = await supabase
      .from('email_otps')
      .select('*')
      .eq('otp_code', otp)
      .eq('user_id', supabase.from('users').select('id').eq('email', emailKey).single())
      .single();
    // The above is placeholder; actual query would join; simplify for now
    // For demo, fetch OTP by email join
    const { data: user } = await supabase.from('users').select('id, name, email, role, is_verified').eq('email', emailKey).single();
    if (!user) {
      return res.status(400).json({ error: 'User not found.' });
    }
    const { data: otpEntry, error: err2 } = await supabase.from('email_otps').select('*').eq('user_id', user.id).eq('otp_code', otp).single();
    if (err2 || !otpEntry) {
      return res.status(400).json({ error: 'Invalid OTP.' });
    }
    if (new Date() > new Date(otpEntry.expires_at)) {
      return res.status(400).json({ error: 'OTP expired.' });
    }
    // Mark user verified
    await supabase.from('users').update({ is_verified: true }).eq('id', user.id);
    // Delete OTP
    await supabase.from('email_otps').delete().eq('id', otpEntry.id);
    const token = generateToken(user);
    return res.json({ message: 'OTP verified.', token, user: { ...user, is_verified: true } });
  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword, verifyOtp };
