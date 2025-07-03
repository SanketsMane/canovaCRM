import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { leadsAPI } from '../../services/api';
import './CSVUploader.css';
import CircularProgress from '../ui/CircularProgress';

const CSVUploader = ({ onCancel, onNext }) => {
  const [files, setFiles] = useState([]);
  const [step, setStep] = useState('initial'); // 'initial', 'confirming', 'uploading', 'completed'
  const [progress, setProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleNext = () => {
      if (files.length > 0) {
          setStep('confirming');
      }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select a CSV file');
      return;
    }

    setStep('uploading');
    setIsUploading(true);
    setProgress(0);

    try {
      // Start progress animation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90; // Stop at 90% until actual response
          }
          return prev + 10;
        });
      }, 200);

      // Upload file to backend
      const response = await leadsAPI.uploadCSV(files[0]);
      
      // Complete progress
      clearInterval(progressInterval);
      setProgress(100);
      
      if (response.success) {
        setUploadResult(response.data);
        setStep('completed');
        toast.success(`Leads added successfully! ${response.data.successCount} leads imported.`);
        
        // Auto-close after 2 seconds and refresh parent
        setTimeout(() => {
          onNext && onNext();
        }, 2000);
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error) {
      console.error('CSV upload error:', error);
      toast.error(error.message || 'Failed to upload CSV file');
      setStep('confirming'); // Go back to confirmation step
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = useCallback(acceptedFiles => {
    setFiles(prevFiles => [...prevFiles, ...acceptedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
    }))]);
  }, []);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    noClick: true,
    accept: { 'text/csv': ['.csv'] }
  });

  const removeFile = (fileName) => {
    setFiles(files.filter(file => file.name !== fileName));
  };

  const renderInitial = () => (
    <>
      <div {...getRootProps({className: 'drop-zone'})}>
        <input {...getInputProps()} />
        <p>Drag your file(s) to start uploading or <button type="button" onClick={open} className="browse-link">Browse files</button></p>
      </div>
      <div className="file-list">
        {files.map(file => (
            <div className="file-item" key={file.path}>
                <span>{file.path} - {file.size} bytes</span>
                <button onClick={() => removeFile(file.name)}>X</button>
            </div>
        ))}
      </div>
      <div className="modal-actions">
        <button className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn-primary" onClick={handleNext} disabled={files.length === 0}>Next</button>
      </div>
    </>
  );

  const renderConfirming = () => (
      <>
        <div className="file-list">
            {/* Using the first file for simplicity */}
            <div className="file-item-lg">
                <span>{files[0].name}</span>
                <span>{(files[0].size / 1024 / 1024).toFixed(2)}MB</span>
            </div>
        </div>
        <p className="confirmation-text">
            All the Leads will be distributed among other employees Equally.
        </p>
        <div className="modal-actions">
            <button className="btn-secondary" onClick={() => setStep('initial')}>Cancel</button>
            <button className="btn-primary" onClick={handleUpload}>Confirm</button>
        </div>
    </>
  );

  const renderUploading = () => (
      <div className="uploading-view">
        <CircularProgress progress={progress} />
        <p>{progress < 90 ? 'Uploading...' : 'Processing leads...'}</p>
        <button 
          className="btn-secondary" 
          onClick={onCancel}
          disabled={isUploading}
        >
          Cancel
        </button>
      </div>
  );

  const renderCompleted = () => (
    <div className="completed-view">
      <div className="success-icon">✅</div>
      <h3>Leads Added Successfully!</h3>
      {uploadResult && (
        <div className="upload-summary">
          <p><strong>Total Processed:</strong> {uploadResult.totalProcessed}</p>
          <p><strong>Successfully Imported:</strong> {uploadResult.successCount}</p>
          {uploadResult.errorCount > 0 && (
            <>
              <p><strong>Failed:</strong> {uploadResult.errorCount}</p>
              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <div className="error-list">
                  <p><strong>Errors:</strong></p>
                  <ul>
                    {uploadResult.errors.slice(0, 5).map((error, index) => (
                      <li key={index} className="error-item">{error}</li>
                    ))}
                    {uploadResult.errors.length > 5 && (
                      <li>... and {uploadResult.errors.length - 5} more errors</li>
                    )}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}
      <div className="modal-actions">
        <button className="btn-primary" onClick={onCancel}>
          Close
        </button>
      </div>
    </div>
  );

  const renderStep = () => {
      switch (step) {
          case 'confirming': return renderConfirming();
          case 'uploading': return renderUploading();
          case 'completed': return renderCompleted();
          case 'initial':
          default:
              return renderInitial();
      }
  }

  return (
    <div className="csv-uploader">
      <h3 className="uploader-title">Add Leads</h3>
      <p className="uploader-subtitle">Upload your leads data in CSV format</p>
      {renderStep()}
    </div>
  );
};

export default CSVUploader; 