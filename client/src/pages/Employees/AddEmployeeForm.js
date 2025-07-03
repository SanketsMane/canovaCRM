import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { employeesAPI } from '../../services/api';
import './AddEmployeeForm.css';

const AddEmployeeForm = ({ onCancel, onSuccess }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'employee',
        status: 'active',
        location: 'Pune',
        department: '',
        preferredLanguage: 'English'
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        
        if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsLoading(true);
        try {
            const response = await employeesAPI.create(formData);
            if (response.success) {
                toast.success('Employee added successfully');
                onSuccess && onSuccess();
                onCancel();
            }
        } catch (error) {
            console.error('Error creating employee:', error);
            toast.error('Failed to add employee');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="add-employee-form">
            <div className="modal-header">
                <h3>Add New Employee</h3>
                <button onClick={onCancel} className="close-btn">&times;</button>
            </div>
            <form onSubmit={handleSave}>
                <div className="form-group">
                    <label htmlFor="firstName">First name *</label>
                    <input 
                        type="text" 
                        id="firstName" 
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="lastName">Last name *</label>
                    <input 
                        type="text" 
                        id="lastName" 
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input 
                        type="email" 
                        id="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <input 
                        type="tel" 
                        id="phone" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group-row">
                    <div className="form-group">
                        <label htmlFor="location">Location</label>
                        <select 
                            id="location" 
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                        >
                            <option value="Pune">Pune</option>
                            <option value="Mumbai">Mumbai</option>
                            <option value="Kolhapur">Kolhapur</option>
                            <option value="Bareilly">Bareilly</option>
                        </select>
                    </div>
                     <span className="tooltip">Lead will be assigned based on location</span>
                </div>
                <div className="form-group-row">
                    <div className="form-group">
                        <label htmlFor="preferredLanguage">Preferred Language</label>
                        <select 
                            id="preferredLanguage" 
                            name="preferredLanguage"
                            value={formData.preferredLanguage}
                            onChange={handleInputChange}
                        >
                            <option value="English">English</option>
                            <option value="Hindi">Hindi</option>
                            <option value="Marathi">Marathi</option>
                        </select>
                    </div>
                    <span className="tooltip">Lead will be assigned based on language</span>
                </div>
                <div className="form-group-row">
                    <div className="form-group">
                        <label htmlFor="role">Role</label>
                        <select 
                            id="role" 
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                        >
                            <option value="employee">Employee</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="department">Department</label>
                        <input 
                            type="text" 
                            id="department" 
                            name="department"
                            value={formData.department}
                            onChange={handleInputChange}
                            placeholder="e.g., Sales, Marketing"
                        />
                    </div>
                </div>
                <div className="form-actions">
                    <button 
                        type="submit" 
                        className="save-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddEmployeeForm; 