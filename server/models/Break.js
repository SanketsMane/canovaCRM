const mongoose = require('mongoose');

const breakSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  breakStartTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  breakEndTime: {
    type: Date,
    default: null
  },
  duration: {
    type: Number, // Duration in minutes
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  },
  reason: {
    type: String,
    trim: true,
    maxlength: [200, 'Break reason cannot exceed 200 characters'],
    default: 'Regular break'
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  formattedStartTime: {
    type: String, // Format: HH:mm AM/PM
    required: true
  },
  formattedEndTime: {
    type: String, // Format: HH:mm AM/PM
    default: null
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted duration
breakSchema.virtual('formattedDuration').get(function() {
  if (this.duration === 0) return '0 min';
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  
  if (hours === 0) {
    return `${minutes} min`;
  } else if (minutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${minutes}min`;
  }
});

// Pre-save middleware to calculate duration and formatted times
breakSchema.pre('save', function(next) {
  // Set date if not provided
  if (!this.date) {
    this.date = this.breakStartTime.toISOString().split('T')[0];
  }
  
  // Set formatted start time if not provided
  if (!this.formattedStartTime) {
    this.formattedStartTime = this.breakStartTime.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }
  
  // Calculate duration and formatted end time if break is ended
  if (this.breakEndTime && this.status === 'completed') {
    this.duration = Math.round((this.breakEndTime - this.breakStartTime) / (1000 * 60));
    
    if (!this.formattedEndTime) {
      this.formattedEndTime = this.breakEndTime.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    }
  }
  
  next();
});

// Static method to start a break
breakSchema.statics.startBreak = async function(userId, employeeId, reason = 'Regular break', ipAddress = null, userAgent = null) {
  // Check if user already has an active break
  const activeBreak = await this.findOne({
    user: userId,
    status: 'active'
  });
  
  if (activeBreak) {
    throw new Error('User already has an active break');
  }
  
  const now = new Date();
  const breakData = {
    employee: employeeId,
    user: userId,
    breakStartTime: now,
    reason: reason,
    date: now.toISOString().split('T')[0],
    formattedStartTime: now.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    }),
    ipAddress,
    userAgent
  };
  
  return this.create(breakData);
};

// Static method to end a break
breakSchema.statics.endBreak = async function(userId) {
  const activeBreak = await this.findOne({
    user: userId,
    status: 'active'
  });
  
  if (!activeBreak) {
    throw new Error('No active break found for this user');
  }
  
  const now = new Date();
  activeBreak.breakEndTime = now;
  activeBreak.status = 'completed';
  activeBreak.formattedEndTime = now.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
  
  return activeBreak.save();
};

// Static method to get breaks by user
breakSchema.statics.getBreaksByUser = function(userId, limit = 10, dateFrom = null, dateTo = null) {
  const query = { user: userId };
  
  if (dateFrom && dateTo) {
    query.date = {
      $gte: dateFrom,
      $lte: dateTo
    };
  }
  
  return this.find(query)
    .populate('employee', 'firstName lastName employeeId')
    .sort({ breakStartTime: -1 })
    .limit(limit);
};

// Static method to get today's breaks for a user
breakSchema.statics.getTodaysBreaks = function(userId) {
  const today = new Date().toISOString().split('T')[0];
  
  return this.find({
    user: userId,
    date: today
  })
    .populate('employee', 'firstName lastName employeeId')
    .sort({ breakStartTime: -1 });
};

// Static method to get break statistics
breakSchema.statics.getBreakStats = function(userId, days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];
  
  return this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDateStr },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: '$date',
        totalBreaks: { $sum: 1 },
        totalDuration: { $sum: '$duration' },
        averageDuration: { $avg: '$duration' }
      }
    },
    {
      $sort: { _id: -1 }
    }
  ]);
};

// Indexes for performance
breakSchema.index({ user: 1, date: -1 });
breakSchema.index({ employee: 1, date: -1 });
breakSchema.index({ status: 1, breakStartTime: -1 });
breakSchema.index({ date: -1, breakStartTime: -1 });

module.exports = mongoose.model('Break', breakSchema);
