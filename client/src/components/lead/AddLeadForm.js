import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { leadsAPI, employeesAPI } from '../../services/api';
import './AddLeadForm.css';

const AddLeadForm = ({ onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: 'Website',
    status: 'open',
    type: 'warm',
    assignedTo: '',
    location: '',
    preferredLanguage: 'English',
    notes: '',
    value: '',
    currency: 'USD',
    tags: ''
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await employeesAPI.getAll(1, 100); // Get all employees
      setEmployees(response.data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        value: formData.value ? parseFloat(formData.value) : undefined,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        assignedTo: formData.assignedTo || undefined
      };

      // Remove empty fields
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '' || submitData[key] === undefined) {
          delete submitData[key];
        }
      });

      const response = await leadsAPI.create(submitData);
      
      if (response.success) {
        toast.success('Lead created successfully!');
        onSuccess && onSuccess(response.data);
      } else {
        toast.error(response.message || 'Failed to create lead');
      }
    } catch (error) {
      console.error('Error creating lead:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create lead';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const sourceOptions = [
    'Website', 'Referral', 'Cold Call', 'Social Media', 
    'Email Campaign', 'Trade Show', 'Advertisement', 'Other'
  ];

  const statusOptions = [
    'open', 'contacted', 'qualified', 'proposal', 
    'negotiation', 'closed', 'lost'
  ];

  const typeOptions = [
    'hot', 'warm', 'cold'
  ];

  const languageOptions = [
    'English', 'Spanish', 'French', 'German', 'Mandarin', 
    'Japanese', 'Korean', 'Arabic', 'Hindi', 'Portuguese', 'Marathi'
  ];

  return (
    <div className="add-lead-form">
      <div className="form-header">
        <h2>Add New Lead</h2>
        <p>Enter the lead information below</p>
      </div>

      <form onSubmit={handleSubmit} className="lead-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter lead name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter email address"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </div>
          <div className="form-group">
            <label htmlFor="company">Company</label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Enter company name"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="source">Source</label>
            <select
              id="source"
              name="source"
              value={formData.source}
              onChange={handleChange}
            >
              {sourceOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              {statusOptions.map(option => (
                <option key={option} value={option}>
                  {option.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="type">Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              {typeOptions.map(option => (
                <option key={option} value={option}>
                  {option.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="assignedTo">Assign To</label>
            <select
              id="assignedTo"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              disabled={loadingEmployees}
            >
              <option value="">Select Employee (Optional)</option>
              {employees.map(employee => (
                <option key={employee._id} value={employee._id}>
                  {employee.firstName} {employee.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter location"
            />
          </div>
          <div className="form-group">
            <label htmlFor="preferredLanguage">Preferred Language</label>
            <select
              id="preferredLanguage"
              name="preferredLanguage"
              value={formData.preferredLanguage}
              onChange={handleChange}
            >
              {languageOptions.map(language => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="value">Lead Value</label>
            <input
              type="number"
              id="value"
              name="value"
              value={formData.value}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
          <div className="form-group">
            <label htmlFor="currency">Currency</label>
            <select
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="INR">INR</option>
              <option value="CAD">CAD</option>
              <option value="AUD">AUD</option>
            </select>
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="tags">Tags</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="Enter tags separated by commas (e.g., enterprise, tech, urgent)"
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Enter any additional notes about this lead"
            rows="4"
          />
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="btn-cancel" 
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-submit" 
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Lead'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddLeadForm;
