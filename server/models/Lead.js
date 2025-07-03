const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Lead name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  company: {
    type: String,
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  source: {
    type: String,
    trim: true,
    enum: ['Website', 'Referral', 'Cold Call', 'Social Media', 'Email Campaign', 'Trade Show', 'Advertisement', 'Other'],
    default: 'Website'
  },
  status: {
    type: String,
    enum: ['open', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed', 'lost'],
    default: 'open'
  },
  type: {
    type: String,
    enum: ['hot', 'warm', 'cold'],
    default: 'warm'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  preferredLanguage: {
    type: String,
    trim: true,
    enum: ['English', 'Spanish', 'French', 'German', 'Mandarin', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Portuguese'],
    default: 'English'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  scheduledCall: {
    date: {
      type: Date
    },
    type: {
      type: String,
      enum: ['cold_call', 'follow_up', 'discovery', 'presentation', 'closing'],
      default: 'cold_call'
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Call notes cannot exceed 500 characters']
    }
  },
  value: {
    type: Number,
    min: [0, 'Value cannot be negative'],
    default: 0
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR']
  },
  assignedDate: {
    type: Date,
    default: Date.now
  },
  closedDate: {
    type: Date
  },
  lastContact: {
    type: Date,
    default: Date.now
  },
  nextFollowUp: {
    type: Date
  },
  tags: [{
    type: String,
    trim: true
  }],
  customFields: {
    type: Map,
    of: String
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

// Virtual for lead age in days
leadSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for days since last contact
leadSchema.virtual('daysSinceLastContact').get(function() {
  if (!this.lastContact) return null;
  return Math.floor((Date.now() - this.lastContact) / (1000 * 60 * 60 * 24));
});

// Virtual for is overdue follow up
leadSchema.virtual('isOverdueFollowUp').get(function() {
  if (!this.nextFollowUp) return false;
  return new Date() > this.nextFollowUp;
});

// Method to update last contact
leadSchema.methods.updateLastContact = function() {
  this.lastContact = new Date();
  return this.save();
};

// Method to assign to employee
leadSchema.methods.assignToEmployee = function(employeeId) {
  this.assignedTo = employeeId;
  this.assignedDate = new Date();
  return this.save();
};

// Method to close lead
leadSchema.methods.closeLead = function(status = 'closed') {
  this.status = status;
  this.closedDate = new Date();
  return this.save();
};

// Method to schedule follow up
leadSchema.methods.scheduleFollowUp = function(date, type = 'follow_up', notes = '') {
  this.nextFollowUp = date;
  this.scheduledCall = {
    date: date,
    type: type,
    notes: notes
  };
  return this.save();
};

// Index for search functionality
leadSchema.index({ 
  name: 'text', 
  email: 'text', 
  company: 'text', 
  location: 'text',
  notes: 'text'
});

// Indexes for common queries
leadSchema.index({ status: 1, type: 1 });
leadSchema.index({ assignedTo: 1, status: 1 });
leadSchema.index({ assignedDate: -1 });
leadSchema.index({ nextFollowUp: 1 });
leadSchema.index({ createdAt: -1 });

// Pre-save middleware to update timestamps
leadSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Lead', leadSchema); 