import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { toast } from 'react-toastify';
import './EmployeeListTable.css';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/common/Modal';
import { employeesAPI } from '../../services/api';

const EmployeeListTable = forwardRef((props, ref) => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const itemsPerPage = 8;

    const [editFormData, setEditFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'employee',
        status: 'active',
        location: '',
        department: ''
    });

    // Expose refresh function to parent component
    useImperativeHandle(ref, () => ({
        refreshEmployees: fetchEmployees
    }));

    // Fetch employees from backend
    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await employeesAPI.getAll(currentPage, itemsPerPage, searchTerm);
            if (response.success) {
                setEmployees(response.data);
                setTotalPages(response.pagination.totalPages);
                setTotalItems(response.pagination.totalItems);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
            toast.error('Failed to fetch employees');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, searchTerm]);

    const handleMenuToggle = (id) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        setOpenMenuId(null);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleEditEmployee = (employee) => {
        setSelectedEmployee(employee);
        setEditFormData({
            firstName: employee.firstName || '',
            lastName: employee.lastName || '',
            email: employee.email || '',
            phone: employee.phone || '',
            role: employee.role || 'employee',
            status: employee.status || 'active',
            location: employee.location || '',
            department: employee.department || ''
        });
        setIsEditModalOpen(true);
        setOpenMenuId(null);
    };

    const handleDeleteEmployee = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete employee ${name}?`)) {
            try {
                const response = await employeesAPI.delete(id);
                if (response.success) {
                    toast.success('Employee deleted successfully');
                    fetchEmployees();
                }
            } catch (error) {
                console.error('Error deleting employee:', error);
                toast.error('Failed to delete employee');
            }
        }
        setOpenMenuId(null);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await employeesAPI.update(selectedEmployee._id, editFormData);

            if (response.success) {
                toast.success('Employee updated successfully');
                setIsEditModalOpen(false);
                setSelectedEmployee(null);
                fetchEmployees();
            }
        } catch (error) {
            console.error('Error updating employee:', error);
            toast.error('Failed to update employee');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const getStatusClass = (status) => status === 'active' ? 'status-active' : 'status-inactive';
    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };

    if (loading) {
        return (
            <div className="table-container">
                <div className="loading-spinner">Loading employees...</div>
            </div>
        );
    }

  return (
    <div className="table-container">
      {/* Search section only */}
      <div className="table-header">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
      </div>

      <table className="employee-list-table">
        <thead>
          <tr>
            <th><input type="checkbox" /></th>
            <th>Name</th>
            <th>Employee ID</th>
            <th>Assigned Leads</th>
            <th>Closed Leads</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => (
            <tr key={emp._id}>
              <td><input type="checkbox" /></td>
              <td>
                <div className="employee-info">
                    <div className="employee-avatar">{getInitials(emp.firstName, emp.lastName)}</div>
                    <div>
                        <div>{emp.firstName} {emp.lastName}</div>
                        <div className="employee-email">{emp.email}</div>
                    </div>
                </div>
              </td>
              <td className="employee-id-cell">{emp.employeeId || `#EMP${emp._id.slice(-6).toUpperCase()}`}</td>
              <td>{emp.assignedLeads?.length || 0}</td>
              <td>{emp.closedLeads || 0}</td>
              <td><span className={getStatusClass(emp.status)}>{emp.status}</span></td>
              <td className="actions-cell">
                <button className="actions-btn" onClick={() => handleMenuToggle(emp._id)}>&hellip;</button>
                {openMenuId === emp._id && (
                    <div className="actions-menu">
                        <button onClick={() => handleEditEmployee(emp)}><span>✏️</span> Edit</button>
                        <button onClick={() => handleDeleteEmployee(emp._id, `${emp.firstName} ${emp.lastName}`)}><span>🗑️</span> Delete</button>
                    </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
      />

      {/* Edit Employee Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Employee"
      >
        <div className="edit-employee-form">
          <form onSubmit={handleFormSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={editFormData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={editFormData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={editFormData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={editFormData.phone}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  name="role"
                  value={editFormData.role}
                  onChange={handleInputChange}
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={editFormData.status}
                  onChange={handleInputChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={editFormData.location}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="department">Department</label>
              <input
                type="text"
                id="department"
                name="department"
                value={editFormData.department}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-actions">
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn-cancel">
                Cancel
              </button>
              <button type="submit" className="btn-update">
                Update Employee
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
});

export default EmployeeListTable; 