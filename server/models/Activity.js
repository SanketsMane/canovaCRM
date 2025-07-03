const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login',
      'logout',
      'lead_created',
      'lead_updated',
      'lead_assigned',
      'lead_closed',
      'employee_created',
      'employee_updated',
      'employee_deleted',
      'user_created',
      'user_updated',
      'user_deleted',
      'csv_uploaded',
      'call_scheduled',
      'follow_up_scheduled',
      'note_added',
      'status_changed',
      'lead_imported',
      'break_started',
      'break_ended',
      'check_in',
      'check_out'
    ]
  },
  entityType: {
    type: String,
    required: true,
    enum: ['lead', 'employee', 'user', 'system', 'auth', 'break', 'attendance']
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'entityType'
  },
  description: {
    type: String,
    required: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted timestamp
activitySchema.virtual('formattedTime').get(function() {
  return this.timestamp.toLocaleString();
});

// Virtual for time ago
activitySchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffInSeconds = Math.floor((now - this.timestamp) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
});

// Static method to log activity
activitySchema.statics.logActivity = function(data) {
  return this.create({
    user: data.user,
    action: data.action,
    entityType: data.entityType,
    entityId: data.entityId,
    description: data.description,
    details: data.details || {},
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    severity: data.severity || 'low'
  });
};

// Static method to get recent activities
activitySchema.statics.getRecentActivities = function(limit = 10, userId = null) {
  const query = userId ? { user: userId } : {};
  return this.find(query)
    .populate('user', 'firstName lastName email')
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get activities by date range
activitySchema.statics.getActivitiesByDateRange = function(startDate, endDate, userId = null) {
  const query = {
    timestamp: {
      $gte: startDate,
      $lte: endDate
    }
  };
  
  if (userId) {
    query.user = userId;
  }
  
  return this.find(query)
    .populate('user', 'firstName lastName email')
    .sort({ timestamp: -1 });
};

// Static method to get activity summary
activitySchema.statics.getActivitySummary = function(days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          action: '$action',
          date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.date',
        activities: {
          $push: {
            action: '$_id.action',
            count: '$count'
          }
        },
        totalCount: { $sum: '$count' }
      }
    },
    {
      $sort: { _id: -1 }
    }
  ]);
};

// Indexes for performance
activitySchema.index({ timestamp: -1 });
activitySchema.index({ user: 1, timestamp: -1 });
activitySchema.index({ action: 1, timestamp: -1 });
activitySchema.index({ entityType: 1, entityId: 1 });
activitySchema.index({ severity: 1, timestamp: -1 });

// Text index for search
activitySchema.index({ description: 'text' });

module.exports = mongoose.model('Activity', activitySchema); 