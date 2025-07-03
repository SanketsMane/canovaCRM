import React, { useState, useRef } from 'react';
import './Employees.css';
import EmployeeListTable from './EmployeeListTable';
import Modal from '../../components/common/Modal';
import AddEmployeeForm from './AddEmployeeForm';

const Employees = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const employeeTableRef = useRef();

  const handleEmployeeAdded = () => {
    // Refresh the employee list when a new employee is added
    if (employeeTableRef.current && employeeTableRef.current.refreshEmployees) {
      employeeTableRef.current.refreshEmployees();
    }
  };

  return (
    <div className="employees-page">
      <div className="page-header">
        <div className="breadcrumbs">
          Home &gt; Employees
        </div>
        <button className="add-employees-btn" onClick={() => setIsModalOpen(true)}>Add Employees</button>
      </div>
      <EmployeeListTable ref={employeeTableRef} />
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <AddEmployeeForm 
            onCancel={() => setIsModalOpen(false)}
            onSuccess={handleEmployeeAdded}
          />
      </Modal>
    </div>
  );
};

export default Employees; 