import React from 'react';
import './SearchFilter.css';

function SearchFilter({ searchTerm, onSearchChange, typeFilter, onTypeFilterChange, workspaceTypes, onClear }) {
  const hasActiveFilters = searchTerm || typeFilter !== 'all';

  return (
    <div className="search-filter">
      <div className="filter-group">
        <label htmlFor="search">Search:</label>
        <input
          id="search"
          type="text"
          placeholder="Search by name or path..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="filter-group">
        <label htmlFor="type-filter">Type:</label>
        <select
          id="type-filter"
          value={typeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value)}
          className="type-filter"
        >
          {workspaceTypes.map(type => (
            <option key={type} value={type}>
              {type === 'all' ? 'All Types' : type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </option>
          ))}
        </select>
      </div>

      {hasActiveFilters && (
        <button onClick={onClear} className="clear-button">
          Clear Filters
        </button>
      )}
    </div>
  );
}

export default SearchFilter;
