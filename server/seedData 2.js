const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Employee = require('./models/Employee');
const Lead = require('./models/Lead');
const Activity = require('./models/Activity');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
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
    phone: ""
  },
  {
    firstName: 'Arjun',
    lastName: 'Mehta',
    email: 'arjun.mehta@canovacrm.com',
    password: 'employee123',
    location: 'Mumbai',
    preferredLanguage: 'Hindi',
    role: 'employee',
    department: 'Marketing',
    phone: ""
  },
  {
    firstName: 'Elena',
    lastName: 'Rossi',
    email: 'elena.rossi@canovacrm.com',
    password: 'employee123',
    location: 'Rome',
    preferredLanguage: 'Italian',
    role: 'employee',
    department: 'Support',
    phone: ""
  },
  {
    firstName: 'Tomás',
    lastName: 'Silva',
    email: 'tomas.silva@canovacrm.com',
    password: 'employee123',
    location: 'São Paulo',
    preferredLanguage: 'Portuguese',
    role: 'employee',
    department: 'Sales',
    phone: ""
  },
  {
    firstName: 'Mei',
    lastName: 'Ling',
    email: 'mei.ling@canovacrm.com',
    password: 'employee123',
    location: 'Beijing',
    preferredLanguage: 'Mandarin',
    role: 'employee',
    department: 'Development',
    phone: ""
  }
];

const seedLeads = [
  {
    name: 'Hannah Becker',
    email: 'hannah@greenenergy.com',
    phone: ""
    company: 'Green Energy Co.',
    source: 'LinkedIn',
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
    name: 'Akira Sato',
    email: 'akira@smartai.jp',
    phone: ""
    company: 'Smart AI Japan',
    source: 'Referral',
    status: 'proposal',
    type: 'hot',
    location: 'Tokyo',
    preferredLanguage: 'Japanese',
    notes: 'Proposal review meeting scheduled',
    value: 9800000,
    currency: 'JPY',
    tags: ['AI', 'automation']
  },
  {
    name: 'Isabella Costa',
    email: 'isabella@fashionhub.com',
    phone: ""
    company: 'Fashion Hub',
    source: 'Website',
    status: 'contacted',
    type: 'cold',
    location: 'Rio de Janeiro',
    preferredLanguage: 'Portuguese',
    notes: 'Needs pricing details',
    value: 20000,
    currency: 'USD',
    tags: ['ecommerce', 'fashion']
  },
  {
    name: 'Mohamed Al Farsi',
    email: 'mohamed@deserttech.ae',
    phone: ""
    company: 'DesertTech UAE',
    source: 'Cold Email',
    status: 'qualified',
    type: 'hot',
    location: 'Abu Dhabi',
    preferredLanguage: 'Arabic',
    notes: 'Wants cloud integration',
    value: 150000,
    currency: 'USD',
    tags: ['cloud', 'middle-east']
  },
  {
    name: 'Sophia Dubois',
    email: 'sophia@biomed.fr',
    phone: ""
    company: 'BioMed Solutions',
    source: 'Trade Show',
    status: 'negotiation',
    type: 'warm',
    location: 'Lyon',
    preferredLanguage: 'French',
    notes: 'Interested in long-term deal',
    value: 85000,
    currency: 'EUR',
    tags: ['health', 'biotech']
  },
  {
    name: 'Wei Zhang',
    email: 'wei.zhang@shangtech.cn',
    phone: ""
    company: 'Shanghai TechWorks',
    source: 'Website',
    status: 'open',
    type: 'cold',
    location: 'Shanghai',
    preferredLanguage: 'Mandarin',
    notes: 'Initial demo scheduled',
    value: 60000,
    currency: 'CNY',
    tags: ['tech', 'enterprise']
  },
  {
    name: 'Carlos Mendez',
    email: 'carlos@latamstartup.com',
    phone: ""
    company: 'LATAM Startup Group',
    source: 'Webinar',
    status: 'contacted',
    type: 'warm',
    location: 'Mexico City',
    preferredLanguage: 'Spanish',
    notes: 'Attended product overview session',
    value: 18000,
    currency: 'USD',
    tags: ['startup', 'latam']
  },
  {
    name: 'Nora Schmidt',
    email: 'nora@autotech.de',
    phone: ""
    company: 'AutoTech Germany',
    source: 'Inbound Call',
    status: 'qualified',
    type: 'hot',
    location: 'Munich',
    preferredLanguage: 'German',
    notes: 'Very keen on AI modules',
    value: 70000,
    currency: 'EUR',
    tags: ['automotive', 'germany']
  }
];


// Seed function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await Employee.deleteMany({});
    await Lead.deleteMany({});
    await Activity.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create employees
    const createdEmployees = [];
    for (const employeeData of seedEmployees) {
      const employee = new Employee(employeeData);
      await employee.save();
      createdEmployees.push(employee);
      console.log(`👤 Created employee: ${employee.fullName}`);
    }

    // Create leads and assign some to employees
    const createdLeads = [];
    for (let i = 0; i < seedLeads.length; i++) {
      const leadData = seedLeads[i];
      
      // Assign leads to employees (skip admin)
      if (i < createdEmployees.length - 1) {
        leadData.assignedTo = createdEmployees[i + 1]._id; // Skip admin (index 0)
        leadData.assignedDate = new Date();
      }

      const lead = new Lead(leadData);
      await lead.save();
      createdLeads.push(lead);
      console.log(`🎯 Created lead: ${lead.name}`);

      // Update employee's assigned leads
      if (leadData.assignedTo) {
        await Employee.findByIdAndUpdate(leadData.assignedTo, {
          $push: { assignedLeads: lead._id }
        });
      }
    }

    // Create some sample activities
    const sampleActivities = [
      {
        user: createdEmployees[0]._id, // Admin
        action: 'employee_created',
        entityType: 'employee',
        entityId: createdEmployees[1]._id,
        description: `${createdEmployees[0].fullName} created new employee ${createdEmployees[1].fullName}`,
        details: { role: 'employee', department: 'Sales' }
      },
      {
        user: createdEmployees[0]._id, // Admin
        action: 'lead_created',
        entityType: 'lead',
        entityId: createdLeads[0]._id,
        description: `${createdEmployees[0].fullName} created new lead ${createdLeads[0].name}`,
        details: { status: 'open', type: 'hot' }
      },
      {
        user: createdEmployees[1]._id, // John Smith
        action: 'lead_assigned',
        entityType: 'lead',
        entityId: createdLeads[0]._id,
        description: `${createdEmployees[1].fullName} was assigned lead ${createdLeads[0].name}`,
        details: { assignedBy: createdEmployees[0].fullName }
      }
    ];

    for (const activityData of sampleActivities) {
      await Activity.logActivity(activityData);
      console.log(`📝 Created activity: ${activityData.description}`);
    }

    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Created ${createdEmployees.length} employees`);
    console.log(`🎯 Created ${createdLeads.length} leads`);
    console.log(`📝 Created ${sampleActivities.length} activities`);

    // Display login credentials
    console.log('\n🔐 Login Credentials:');
    console.log('Admin: admin@canovacrm.com / admin');
    console.log('Employee: john.smith@canovacrm.com / employee');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

// Run seeding
seedDatabase(); 