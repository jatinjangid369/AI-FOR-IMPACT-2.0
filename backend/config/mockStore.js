const mockUsers = [
  // Seed a default admin and student
  {
    id: 'admin-123',
    name: 'Admin User',
    email: 'admin@campus.edu',
    password_hash: '$2a$12$L7o3BvS7qFz2v1KkLg6VeuwYV3R3eD6aI1EaXFz3v3v3v3v3v3v3v', // bcrypt for 'admin123'
    role: 'admin',
    created_at: new Date().toISOString()
  },
  {
    id: 'student-123',
    name: 'Jane Doe',
    email: 'student@campus.edu',
    password_hash: '$2a$12$L7o3BvS7qFz2v1KkLg6VeuwYV3R3eD6aI1EaXFz3v3v3v3v3v3v3v', // bcrypt for 'student123'
    role: 'student',
    created_at: new Date().toISOString()
  }
];

const mockComplaints = [
  {
    id: 'comp-1',
    user_id: 'student-123',
    title: 'Water leaking in Room 302',
    description: 'There is a major pipe leak in the bathroom ceiling, water is dripping continuously onto the tiles.',
    location: 'Hostel Block A',
    status: 'in_progress',
    attachment_url: '',
    created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(), // 3 days ago
    updated_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    users: { name: 'Jane Doe', email: 'student@campus.edu' }
  },
  {
    id: 'comp-2',
    user_id: 'student-123',
    title: 'WiFi disconnects every 10 mins',
    description: 'The academic hall router drops connections periodically making it impossible to submit assignments.',
    location: 'Academic Block C',
    status: 'open',
    attachment_url: '',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    users: { name: 'Jane Doe', email: 'student@campus.edu' }
  }
];

const mockMaintenance = [
  {
    id: 'maint-1',
    user_id: 'student-123',
    category: 'electrical',
    description: 'The ceiling fan is making a clicking sound and running slowly.',
    location: 'Room 302, Hostel Block A',
    status: 'assigned',
    created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
    users: { name: 'Jane Doe', email: 'student@campus.edu' }
  },
  {
    id: 'maint-2',
    user_id: 'student-123',
    category: 'internet',
    description: 'Request for LAN port activation.',
    location: 'Lab 4, Science Block',
    status: 'submitted',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    users: { name: 'Jane Doe', email: 'student@campus.edu' }
  }
];

const mockLostItems = [
  {
    id: 'lost-1',
    user_id: 'student-123',
    item_name: 'Blue Nike Gym Bag',
    description: 'Left it near the benches. Contains running shoes and a water bottle.',
    location: 'Sports Complex',
    date_lost: new Date(Date.now() - 3600000 * 24).toISOString(),
    image_url: '',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    users: { name: 'Jane Doe', email: 'student@campus.edu' }
  }
];

const mockFoundItems = [
  {
    id: 'found-1',
    user_id: 'admin-123',
    item_name: 'Silver keys on a leather ring',
    description: 'Found on the desk. Please collect from security desk.',
    location: 'Library basement',
    date_found: new Date(Date.now() - 3600000 * 12).toISOString(),
    image_url: '',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    users: { name: 'Admin User', email: 'admin@campus.edu' }
  }
];

const mockPolicies = [
  {
    id: 'policy-1',
    title: 'Academic Integrity & Examination Code 2026',
    category: 'Academics',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    created_at: new Date(Date.now() - 3600000 * 24 * 30).toISOString()
  },
  {
    id: 'policy-2',
    title: 'Hostel Guidelines & Curfew Policies',
    category: 'Hostel Life',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    created_at: new Date(Date.now() - 3600000 * 24 * 15).toISOString()
  }
];

const mockNotifications = [
  {
    id: 'notif-1',
    user_id: 'student-123',
    message: 'Welcome to CampusGenie AI! Explore features in your dashboard.',
    type: 'general',
    is_read: false,
    created_at: new Date().toISOString()
  }
];

module.exports = {
  users: mockUsers,
  complaints: mockComplaints,
  maintenance: mockMaintenance,
  lostItems: mockLostItems,
  foundItems: mockFoundItems,
  policies: mockPolicies,
  notifications: mockNotifications
};
