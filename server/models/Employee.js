const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  // Basic employee information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  
  // Employee specific fields
  employeeId: {
    type: String,
    unique: true,
    sparse: true // Allow null values but enforce uniqueness when present
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  department: {
    type: String,
    trim: true,
    default: 'Sales'
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'employee'],
    default: 'employee'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  preferredLanguage: {
    type: String,
    trim: true,
    enum: ['English', 'Spanish', 'French', 'German', 'Mandarin', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Portuguese', 'Marathi'],
    default: 'English'
  },
  
  // Work-related fields
  assignedLeads: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead'
  }],
  hireDate: {
    type: Date,
    default: Date.now
  },
  
  // Performance metrics
  closedLeads: {
    type: Number,
    default: 0
  },
  
  // Optional reference to user account (if employee has login access)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Metadata
  profileImage: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
employeeSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for lead count
employeeSchema.virtual('leadCount').get(function() {
  return this.assignedLeads ? this.assignedLeads.length : 0;
});

// Pre-save middleware to generate employee ID
employeeSchema.pre('save', async function(next) {
  if (!this.employeeId && this.isNew) {
    // Generate a unique employee ID
    let employeeId;
    let isUnique = false;
    let counter = 1;
    
    // Find the highest existing employee ID number
    const lastEmployee = await mongoose.model('Employee')
      .findOne({ employeeId: { $exists: true, $ne: null } })
      .sort({ employeeId: -1 })
      .select('employeeId');
    
    if (lastEmployee && lastEmployee.employeeId) {
      const lastIdNumber = parseInt(lastEmployee.employeeId.replace('EMP', ''));
      counter = lastIdNumber + 1;
    }
    
    // Keep trying until we find a unique ID
    while (!isUnique) {
      employeeId = `EMP${String(counter).padStart(6, '0')}`;
      const existing = await mongoose.model('Employee').findOne({ employeeId });
      if (!existing) {
        isUnique = true;
      } else {
        counter++;
      }
    }
    
    this.employeeId = employeeId;
  }
  next();
});

// Method to get public profile
employeeSchema.methods.getPublicProfile = function() {
  return this.toObject();
};

// Index for search functionality
employeeSchema.index({ 
  firstName: 'text', 
  lastName: 'text', 
  email: 'text', 
  location: 'text',
  department: 'text',
  employeeId: 'text'
});

module.exports = mongoose.model('Employee', employeeSchema); 