import React from 'react';
import './WorkspaceTable.css';

function WorkspaceTable({ workspaces, sortConfig, onSort }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
  };

  const getTypeLabel = (type) => {
    const labels = {
      'local': 'Local',
      'remote': 'Remote',
      'dev-container': 'Dev Container',
      'attached-container': 'Attached Container',
      'ssh-remote': 'SSH Remote',
      'unknown': 'Unknown'
    };
    return labels[type] || type;
  };

  const getTypeClass = (type) => {
    return `type-badge type-${type}`;
  };

  return (
    <div className="workspace-table-container">
      <table className="workspace-table">
        <thead>
          <tr>
            <th onClick={() => onSort('name')} className="sortable">
              Name{getSortIndicator('name')}
            </th>
            <th onClick={() => onSort('lastModified')} className="sortable">
              Last Modified{getSortIndicator('lastModified')}
            </th>
            <th onClick={() => onSort('type')} className="sortable">
              Type{getSortIndicator('type')}
            </th>
            <th onClick={() => onSort('path')} className="sortable">
              Path{getSortIndicator('path')}
            </th>
          </tr>
        </thead>
        <tbody>
          {workspaces.length === 0 ? (
            <tr>
              <td colSpan="4" className="no-results">
                No workspaces found
              </td>
            </tr>
          ) : (
            workspaces.map((workspace) => (
              <tr key={workspace.id}>
                <td className="workspace-name">{workspace.name}</td>
                <td className="workspace-date">{formatDate(workspace.lastModified)}</td>
                <td className="workspace-type">
                  <span className={getTypeClass(workspace.type)}>
                    {getTypeLabel(workspace.type)}
                  </span>
                </td>
                <td className="workspace-path" title={workspace.path}>
                  {workspace.path}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default WorkspaceTable;
