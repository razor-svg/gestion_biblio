import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'Available':
        return {
          className: 'badge-success',
          icon: '✓',
          text: 'Available'
        };
      case 'Borrowed':
        return {
          className: 'badge-warning',
          icon: '📚',
          text: 'Borrowed'
        };
      case 'Lost':
        return {
          className: 'badge-danger',
          icon: '✗',
          text: 'Lost'
        };
      case 'Active':
        return {
          className: 'badge-success',
          icon: '✓',
          text: 'Active'
        };
      case 'Suspended':
        return {
          className: 'badge-warning',
          icon: '⚠',
          text: 'Suspended'
        };
      case 'Inactive':
        return {
          className: 'badge-secondary',
          icon: '○',
          text: 'Inactive'
        };
      default:
        return {
          className: 'badge-secondary',
          icon: '',
          text: status
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`badge ${config.className}`}>
      {config.icon && <span className="mr-1">{config.icon}</span>}
      {config.text}
    </span>
  );
};

export default StatusBadge;
