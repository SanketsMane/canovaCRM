const Lead = require('../models/Lead');
const Employee = require('../models/Employee');
const User = require('../models/User');
const Activity = require('../models/Activity');
const csv = require('csv-parser');
const fs = require('fs');

// @desc    Get all leads with pagination and filters
// @route   GET /api/leads
// @access  Admin or Employee (assigned leads)
const getAllLeads = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      type = '',
      assignedTo = '',
      source = '',
      location = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    // If employee, only show assigned leads
    if (req.user.role === 'employee') {
      query.assignedTo = req.user._id;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (status) {
      query.status = status;
    }
    
    if (type) {
      query.type = type;
    }
    
    if (assignedTo && req.user.role === 'admin') {
      query.assignedTo = assignedTo;
    }
    
    if (source) {
      query.source = source;
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const leads = await Lead.find(query)
      .populate('assignedTo', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Lead.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: leads,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching leads'
    });
  }
};

// @desc    Get lead by ID
// @route   GET /api/leads/:id
// @access  Admin or Employee (assigned lead)
const getLeadById = async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findById(id)
      .populate('assignedTo', 'firstName lastName email location preferredLanguage');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Check if employee can access this lead
    if (req.user.role === 'employee') {
      // Find the employee record for the current user
      const userEmployee = await Employee.findOne({ userId: req.user._id });
      if (!userEmployee || lead.assignedTo?._id.toString() !== userEmployee._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    res.json({
      success: true,
      data: lead
    });
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching lead'
    });
  }
};

// @desc    Create new lead
// @route   POST /api/leads
// @access  Admin
const createLead = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      source,
      status = 'open',
      type = 'warm',
      assignedTo,
      location,
      preferredLanguage,
      notes,
      value,
      currency = 'USD',
      tags
    } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    // Check if lead already exists
    const existingLead = await Lead.findOne({ email });
    if (existingLead) {
      return res.status(400).json({
        success: false,
        message: 'Lead with this email already exists'
      });
    }

    // Validate assigned employee if provided
    if (assignedTo) {
      const employee = await Employee.findById(assignedTo);
      if (!employee) {
        return res.status(400).json({
          success: false,
          message: 'Assigned employee not found'
        });
      }
    }

    // Create new lead
    const lead = new Lead({
      name,
      email,
      phone,
      company,
      source,
      status,
      type,
      assignedTo,
      location,
      preferredLanguage,
      notes,
      value,
      currency,
      tags: tags || []
    });

    await lead.save();

    // Update employee's assigned leads if assigned
    if (assignedTo) {
      await Employee.findByIdAndUpdate(assignedTo, {
        $push: { assignedLeads: lead._id }
      });
    }

    // Log activity
    await Activity.logActivity({
      user: req.user._id,
      action: 'lead_created',
      entityType: 'lead',
      entityId: lead._id,
      description: `${req.user.fullName} created new lead ${lead.name}`,
      details: { status, type, assignedTo }
    });

    const populatedLead = await Lead.findById(lead._id)
      .populate('assignedTo', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: populatedLead
    });
  } catch (error) {
    console.error('Create lead error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating lead'
    });
  }
};

// @desc    Update lead
// @route   PUT /api/leads/:id
// @access  Admin or Employee (assigned lead)
const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Check if employee can update this lead
    if (req.user.role === 'employee') {
      // Find the employee record for the current user
      const userEmployee = await Employee.findOne({ userId: req.user._id });
      if (!userEmployee || lead.assignedTo?.toString() !== userEmployee._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    // Handle assignment changes
    if (updateData.assignedTo && updateData.assignedTo !== lead.assignedTo?.toString()) {
      // Remove from old employee
      if (lead.assignedTo) {
        await Employee.findByIdAndUpdate(lead.assignedTo, {
          $pull: { assignedLeads: lead._id }
        });
      }

      // Add to new employee
      await Employee.findByIdAndUpdate(updateData.assignedTo, {
        $push: { assignedLeads: lead._id }
      });

      updateData.assignedDate = new Date();
    }

    // Handle status changes
    if (updateData.status === 'closed' && lead.status !== 'closed') {
      updateData.closedDate = new Date();
    }

    // Update lead
    const updatedLead = await Lead.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'firstName lastName email');

    // Log activity
    await Activity.logActivity({
      user: req.user._id,
      action: 'lead_updated',
      entityType: 'lead',
      entityId: lead._id,
      description: `${req.user.fullName} updated lead ${lead.name}`,
      details: { updatedFields: Object.keys(updateData) }
    });

    res.json({
      success: true,
      message: 'Lead updated successfully',
      data: updatedLead
    });
  } catch (error) {
    console.error('Update lead error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating lead'
    });
  }
};

// @desc    Delete lead
// @route   DELETE /api/leads/:id
// @access  Admin
const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Remove from employee's assigned leads
    if (lead.assignedTo) {
      await Employee.findByIdAndUpdate(lead.assignedTo, {
        $pull: { assignedLeads: lead._id }
      });
    }

    await Lead.findByIdAndDelete(id);

    // Log activity
    await Activity.logActivity({
      user: req.user._id,
      action: 'lead_deleted',
      entityType: 'lead',
      description: `${req.user.fullName} deleted lead ${lead.name}`,
      details: { deletedLeadId: id }
    });

    res.json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting lead'
    });
  }
};

// @desc    Upload leads from CSV
// @route   POST /api/leads/upload
// @access  Admin
const uploadLeads = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'CSV file is required'
      });
    }

    const results = [];
    const errors = [];
    let successCount = 0;
    let errorCount = 0;

    // Read CSV file
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => {
        results.push(data);
      })
      .on('end', async () => {
        try {
          // Process each row
          for (let i = 0; i < results.length; i++) {
            const row = results[i];
            
            try {
              // Validate required fields
              if (!row.name || !row.email) {
                errors.push(`Row ${i + 1}: Name and email are required`);
                errorCount++;
                continue;
              }

              // Check if lead already exists
              const existingLead = await Lead.findOne({ email: row.email.toLowerCase() });
              if (existingLead) {
                errors.push(`Row ${i + 1}: Lead with email ${row.email} already exists`);
                errorCount++;
                continue;
              }

              // Create lead
              const lead = new Lead({
                name: row.name.trim(),
                email: row.email.toLowerCase().trim(),
                phone: row.phone?.trim() || '',
                company: row.company?.trim() || '',
                source: row.source?.trim() || 'Website',
                status: row.status?.trim() || 'open',
                type: row.type?.trim() || 'warm',
                location: row.location?.trim() || '',
                preferredLanguage: row.preferredLanguage?.trim() || 'English',
                notes: row.notes?.trim() || '',
                value: parseFloat(row.value) || 0,
                currency: row.currency?.trim() || 'USD',
                tags: row.tags?.split(',').map(tag => tag.trim()).filter(tag => tag) || []
              });

              await lead.save();
              successCount++;

              // Log activity for each lead
              await Activity.logActivity({
                user: req.user._id,
                action: 'lead_added',
                entityType: 'lead',
                entityId: lead._id,
                description: `${req.user.fullName} added lead ${lead.name} via CSV upload`,
                details: { source: 'csv_upload' }
              });

            } catch (error) {
              errors.push(`Row ${i + 1}: ${error.message}`);
              errorCount++;
            }
          }

          // Clean up uploaded file
          fs.unlinkSync(req.file.path);

          res.json({
            success: true,
            message: 'Leads added successfully',
            data: {
              totalProcessed: results.length,
              successCount,
              errorCount,
              errors: errors.slice(0, 10) // Limit error messages
            }
          });

        } catch (error) {
          console.error('CSV processing error:', error);
          res.status(500).json({
            success: false,
            message: 'Error processing CSV file'
          });
        }
      })
      .on('error', (error) => {
        console.error('CSV read error:', error);
        res.status(500).json({
          success: false,
          message: 'Error reading CSV file'
        });
      });

  } catch (error) {
    console.error('Upload leads error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during CSV upload'
    });
  }
};

// @desc    Get lead statistics
// @route   GET /api/leads/stats
// @access  Admin
const getLeadStats = async (req, res) => {
  try {
    // Get basic counts
    const totalLeads = await Lead.countDocuments();
    const unassignedLeads = await Lead.countDocuments({ assignedTo: null });
    const openLeads = await Lead.countDocuments({ status: { $in: ['open', 'contacted', 'qualified', 'proposal', 'negotiation'] } });
    const closedLeads = await Lead.countDocuments({ status: 'closed' });
    const lostLeads = await Lead.countDocuments({ status: 'lost' });

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
      }
    ]);

    // Get leads assigned this week
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    const leadsThisWeek = await Lead.countDocuments({
      assignedDate: { $gte: thisWeek }
    });

    // Get conversion rate
    const conversionRate = totalLeads > 0 ? ((closedLeads / totalLeads) * 100).toFixed(1) : 0;

    const stats = {
      totalLeads,
      unassignedLeads,
      openLeads,
      closedLeads,
      lostLeads,
      hotLeads,
      warmLeads,
      coldLeads,
      leadsThisWeek,
      conversionRate,
      sourceStats
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get lead stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching lead statistics'
    });
  }
};

module.exports = {
  getAllLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  uploadLeads,
  getLeadStats
}; 