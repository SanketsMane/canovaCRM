import React, { useState } from 'react';
import './Leads.css';
import LeadList from '../../components/lead/LeadList';
import Modal from '../../components/common/Modal';
import CSVUploader from '../../components/lead/CSVUploader';

const Leads = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('csv'); // Only 'csv' now
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const openAddLeadsModal = () => {
    setModalContent('csv');
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleLeadAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    closeModal();
  };

  return (
    <div className="leads-page">
      <div className="leads-header">
        <div className="breadcrumbs">
          Home &gt; Leads
        </div>
        <div className="header-actions">
          <button className="add-leads-btn" onClick={openAddLeadsModal}>
            Add Leads
          </button>
        </div>
      </div>
      <LeadList key={refreshTrigger} />
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <CSVUploader onCancel={closeModal} onNext={handleLeadAdded} />
      </Modal>
    </div>
  );
};

export default Leads; 