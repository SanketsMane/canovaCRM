const Lead = require('../models/Lead');
const Employee = require('../models/Employee');
const User = require('../models/User');
const Activity = require('../models/Activity');

// Helper function to generate time-based greeting
const getTimeBasedGreeting = () => {
  const currentHour = new Date().getHours();
  if (currentHour >= 5 && currentHour < 12) return 'Good Morning';
  if (currentHour >= 12 && currentHour < 17) return 'Good Afternoon';
  if (currentHour >= 17 && currentHour < 21) return 'Good Evening';
  return 'Good Night';
};

// @desc    Get time-based greeting
// @route   GET /api/dashboard/greeting
// @access  Authenticated Users
const getGreeting = async (req, res) => {
  try {
    const greeting = getTimeBasedGreeting();
    res.json({ success: true, greeting });
  } catch (error) {
    console.error('Error getting greeting:', error);
    res.status(500).json({ success: false, message: 'Server error getting greeting' });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Admin
const getDashboardStats = async (req, res) => {
  try {
    // Get basic counts
    const totalLeads = await Lead.countDocuments();
    const unassignedLeads = await Lead.countDocuments({ assignedTo: null });
    const activeEmployees = await Employee.countDocuments({ status: 'active' });
    
    // Get leads by status
    const openLeads = await Lead.countDocuments({ 
      status: { $in: ['open', 'contacted', 'qualified', 'proposal', 'negotiation'] } 
    });
    const closedLeads = await Lead.countDocuments({ status: 'closed' });
    const lostLeads = await Lead.countDocuments({ status: 'lost' });

    // Get leads assigned this week
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    const leadsAssignedThisWeek = await Lead.countDocuments({
      assignedDate: { $gte: thisWeek }
    });

    // Calculate conversion rate
    const conversionRate = totalLeads > 0 ? ((closedLeads / totalLeads) * 100).toFixed(1) : 0;

    // Get leads by type
    const hotLeads = await Lead.countDocuments({ type: 'hot' });
    const warmLeads = await Lead.countDocuments({ type: 'warm' });
    const coldLeads = await Lead.countDocuments({ type: 'cold' });

    // Get leads by source
    const sourceStats = await Lead.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Get employee performance
    const employeeStats = await Employee.aggregate([
      {
        $match: { status: 'active' }
      },
      {
        $lookup: {
          from: 'leads',
          localField: '_id',
          foreignField: 'assignedTo',
          as: 'assignedLeads'
        }
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          email: 1,
          location: 1,
          totalLeads: { $size: '$assignedLeads' },
          closedLeads: {
            $size: {
              $filter: {
                input: '$assignedLeads',
                cond: { $eq: ['$$this.status', 'closed'] }
              }
            }
          }
        }
      },
      {
        $addFields: {
          conversionRate: {
            $cond: [
              { $gt: ['$totalLeads', 0] },
              { $multiply: [{ $divide: ['$closedLeads', '$totalLeads'] }, 100] },
              0
            ]
          }
        }
      },
      {
        $sort: { totalLeads: -1 }
      },
      {
        $limit: 10
      }
    ]);

    const stats = {
      totalLeads,
      unassignedLeads,
      leadsAssignedThisWeek,
      activeEmployees,
      conversionRate,
      statusBreakdown: {
        open: openLeads,
        closed: closedLeads,
        lost: lostLeads
      },
      typeBreakdown: {
        hot: hotLeads,
        warm: warmLeads,
        cold: coldLeads
      },
      sourceStats,
      employeeStats
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard statistics'
    });
  }
};

// @desc    Get sales analytics
// @route   GET /api/dashboard/analytics
// @access  Admin
const getSalesAnalytics = async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    let startDate = new Date();
    let groupFormat = '%Y-%m-%d';
    
    // Set period
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        groupFormat = '%Y-%m';
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // Get daily/weekly/monthly sales data
    const salesData = await Lead.aggregate([
      {
        $match: {
          status: 'closed',
          closedDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: groupFormat, date: '$closedDate' } }
          },
          sales: { $sum: 1 },
          value: { $sum: '$value' }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    // Get cumulative sales
    let cumulativeSales = 0;
    const analyticsData = salesData.map(item => {
      cumulativeSales += item.sales;
      return {
        name: item._id.date,
        sales: item.sales,
        value: item.value,
        cumulativeSales
      };
    });

    // Get lead source analytics
    const sourceAnalytics = await Lead.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 },
          closedCount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'closed'] }, 1, 0]
            }
          }
        }
      },
      {
        $addFields: {
          conversionRate: {
            $cond: [
              { $gt: ['$count', 0] },
              { $multiply: [{ $divide: ['$closedCount', '$count'] }, 100] },
              0
            ]
          }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get employee performance analytics
    const employeeAnalytics = await Employee.aggregate([
      {
        $match: { status: 'active' }
      },
      {
        $lookup: {
          from: 'leads',
          localField: '_id',
          foreignField: 'assignedTo',
          as: 'assignedLeads'
        }
      },
      {
        $project: {
          name: { $concat: ['$firstName', ' ', '$lastName'] },
          location: 1,
          totalLeads: { $size: '$assignedLeads' },
          closedLeads: {
            $size: {
              $filter: {
                input: '$assignedLeads',
                cond: { $eq: ['$$this.status', 'closed'] }
              }
            }
          },
          openLeads: {
            $size: {
              $filter: {
                input: '$assignedLeads',
                cond: { $in: ['$$this.status', ['open', 'contacted', 'qualified', 'proposal', 'negotiation']] }
              }
            }
          }
        }
      },
      {
        $addFields: {
          conversionRate: {
            $cond: [
              { $gt: ['$totalLeads', 0] },
              { $multiply: [{ $divide: ['$closedLeads', '$totalLeads'] }, 100] },
              0
            ]
          }
        }
      },
      {
        $sort: { totalLeads: -1 }
      }
    ]);

    const analytics = {
      salesData: analyticsData,
      sourceAnalytics,
      employeeAnalytics,
      period,
      totalSales: analyticsData.reduce((sum, item) => sum + item.sales, 0),
      totalValue: analyticsData.reduce((sum, item) => sum + item.value, 0)
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get sales analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching sales analytics'
    });
  }
};

// @desc    Get recent activities
// @route   GET /api/dashboard/activities
// @access  Employee/Admin
const getRecentActivities = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const userId = req.user._id;
    const userRole = req.user.role;

    let activities;
    
    if (userRole === 'admin') {
      // Admins see all activities
      activities = await Activity.getRecentActivities(parseInt(limit));
    } else {
      // Employees see only their own activities
      activities = await Activity.getRecentActivities(parseInt(limit), userId);
    }

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Get recent activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching recent activities'
    });
  }
};

// @desc    Get employee dashboard data
// @route   GET /api/dashboard/employee
// @access  Employee
const getEmployeeDashboard = async (req, res) => {
  try {
    // Find the employee record for the current user
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    const employeeId = employee._id;

    // Get employee's leads
    const totalLeads = await Lead.countDocuments({ assignedTo: employeeId });
    const openLeads = await Lead.countDocuments({ 
      assignedTo: employeeId,
      status: { $in: ['open', 'contacted', 'qualified', 'proposal', 'negotiation'] }
    });
    const closedLeads = await Lead.countDocuments({ 
      assignedTo: employeeId,
      status: 'closed'
    });
    const lostLeads = await Lead.countDocuments({ 
      assignedTo: employeeId,
      status: 'lost'
    });

    // Get leads by type
    const hotLeads = await Lead.countDocuments({ assignedTo: employeeId, type: 'hot' });
    const warmLeads = await Lead.countDocuments({ assignedTo: employeeId, type: 'warm' });
    const coldLeads = await Lead.countDocuments({ assignedTo: employeeId, type: 'cold' });

    // Get recent leads
    const recentLeads = await Lead.find({ assignedTo: employeeId })
      .sort({ assignedDate: -1 })
      .limit(5)
      .select('name email company status type assignedDate');

    // Get overdue follow-ups
    const overdueFollowUps = await Lead.find({
      assignedTo: employeeId,
      nextFollowUp: { $lt: new Date() },
      status: { $ne: 'closed' }
    }).select('name email company nextFollowUp');

    // Get today's scheduled calls
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysCalls = await Lead.find({
      assignedTo: employeeId,
      'scheduledCall.date': {
        $gte: today,
        $lt: tomorrow
      }
    }).select('name email company scheduledCall');

    // Get recent activities
    const recentActivities = await Activity.getRecentActivities(5, employeeId);

    // Calculate conversion rate
    const conversionRate = totalLeads > 0 ? ((closedLeads / totalLeads) * 100).toFixed(1) : 0;

    // Get this month's performance
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const leadsThisMonth = await Lead.countDocuments({
      assignedTo: employeeId,
      assignedDate: { $gte: thisMonth }
    });

    const closedThisMonth = await Lead.countDocuments({
      assignedTo: employeeId,
      status: 'closed',
      closedDate: { $gte: thisMonth }
    });

    const dashboardData = {
      stats: {
        totalLeads,
        openLeads,
        closedLeads,
        lostLeads,
        hotLeads,
        warmLeads,
        coldLeads,
        conversionRate,
        leadsThisMonth,
        closedThisMonth
      },
      recentLeads,
      overdueFollowUps,
      todaysCalls,
      recentActivities
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Get employee dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching employee dashboard'
    });
  }
};

// @desc    Get activity summary
// @route   GET /api/dashboard/activity-summary
// @access  Admin
const getActivitySummary = async (req, res) => {
  try {
    const { days = 7 } = req.query;

    const activitySummary = await Activity.getActivitySummary(parseInt(days));

    res.json({
      success: true,
      data: activitySummary
    });
  } catch (error) {
    console.error('Get activity summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching activity summary'
    });
  }
};

module.exports = {
  getDashboardStats,
  getSalesAnalytics,
  getRecentActivities,
  getEmployeeDashboard,
  getActivitySummary,
  getGreeting
};