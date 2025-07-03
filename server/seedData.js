const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Employee = require('./models/Employee');
const Lead = require('./models/Lead');
const Activity = require('./models/Activity');
require('dotenv').config();

// Connect to MongoDB
console.log('🌱 Starting database seeding...');
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('✅ MongoDB connected for seeding');
}).catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Seed Employee data
const seedEmployees = [
  {
    firstName: 'Olivia',
    lastName: 'Williams',
    email: 'olivia.williams@canovacrm.com',
    password: 'admin123',
    location: 'Boston',
    preferredLanguage: 'English',
    role: 'admin',
    department: 'Operations',
    phone: '+15550101'
  },
  {
    firstName: 'James',
    lastName: 'Garcia',
    email: 'james.garcia@canovacrm.com',
    password: 'employee123',
    location: 'Austin',
    preferredLanguage: 'English',
    role: 'employee',
    department: 'Sales',
    phone: '+15550102'
  },
  {
    firstName: 'Emma',
    lastName: 'Brown',
    email: 'emma.brown@canovacrm.com',
    password: 'employee123',
    location: 'Seattle',
    preferredLanguage: 'English',
    role: 'employee',
    department: 'Marketing',
    phone: '+15550103'
  }
];

const seedLeads = [
  {
    name: 'Hannah Becker',
    email: 'hannah@greenenergy.com',
    phone: '+15550301',
    company: 'Green Energy Co.',
    source: 'Social Media',
    status: 'open',
    type: 'warm',
    location: 'Denver',
    preferredLanguage: 'English',
    notes: 'Interested in sustainability solutions',
    value: 42000,
    currency: 'USD',
    tags: ['green', 'sustainability']
  },
  {
    name: 'Lisa Chen',
    email: 'lisa@globalcorp.com',
    phone: '+15550987',
    company: 'Global Corp',
    source: 'Email Campaign',
    status: 'closed',
    type: 'hot',
    location: 'San Francisco',
    preferredLanguage: 'English',
    notes: 'Large enterprise client',
    value: 120000,
    currency: 'USD',
    tags: ['enterprise', 'technology']
  }
];

// Function to seed the database
const seedDatabase = async () => {
  try {
    // Clear existing data
    await Employee.deleteMany({});
    await Lead.deleteMany({});
    await Activity.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Hash passwords for employees
    for (let employee of seedEmployees) {
      employee.password = await bcrypt.hash(employee.password, 12);
    }

    // Insert employees
    const createdEmployees = await Employee.insertMany(seedEmployees);
    console.log(`👥 Created ${createdEmployees.length} employees`);

    // Assign leads to employees
    for (let i = 0; i < seedLeads.length; i++) {
      const randomEmployeeIndex = Math.floor(Math.random() * createdEmployees.length);
      seedLeads[i].assignedTo = createdEmployees[randomEmployeeIndex]._id;
    }

    // Insert leads
    const createdLeads = await Lead.insertMany(seedLeads);
    console.log(`🎯 Created ${createdLeads.length} leads`);

    console.log('✅ Database seeded successfully!');
    console.log('\n📝 Test Accounts:');
    console.log('Admin: olivia.williams@canovacrm.com / admin123');
    console.log('Employee: james.garcia@canovacrm.com / employee123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

// Run the seeding
seedDatabase();
