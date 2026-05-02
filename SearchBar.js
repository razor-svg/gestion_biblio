import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

const SearchBar = ({ onSearch, onFilter, filters }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters || {});

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm, localFilters);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilters = () => {
    setLocalFilters({});
    onFilter({});
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, author, or genre..."
              className="input pl-10"
            />
          </div>
          
          {/* Search Button */}
          <button type="submit" className="btn btn-primary">
            Search
          </button>
          
          {/* Filter Toggle */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-outline flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {Object.keys(localFilters).length > 0 && (
              <span className="bg-primary-100 text-primary-600 rounded-full px-2 py-0.5 text-xs font-medium">
                {Object.keys(localFilters).length}
              </span>
            )}
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Genre Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Genre
                </label>
                <select
                  value={localFilters.genre || ''}
                  onChange={(e) => handleFilterChange('genre', e.target.value)}
                  className="input"
                >
                  <option value="">All Genres</option>
                  <option value="Fiction">Fiction</option>
                  <option value="Non-Fiction">Non-Fiction</option>
                  <option value="Science">Science</option>
                  <option value="Technology">Technology</option>
                  <option value="History">History</option>
                  <option value="Biography">Biography</option>
                  <option value="Mystery">Mystery</option>
                  <option value="Romance">Romance</option>
                  <option value="Fantasy">Fantasy</option>
                  <option value="Self-Help">Self-Help</option>
                </select>
              </div>

              {/* Year Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Publication Year (Min)
                </label>
                <input
                  type="number"
                  value={localFilters.year_min || ''}
                  onChange={(e) => handleFilterChange('year_min', e.target.value)}
                  placeholder="e.g., 2000"
                  min="1000"
                  max={new Date().getFullYear()}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Publication Year (Max)
                </label>
                <input
                  type="number"
                  value={localFilters.year_max || ''}
                  onChange={(e) => handleFilterChange('year_max', e.target.value)}
                  placeholder="e.g., 2023"
                  min="1000"
                  max={new Date().getFullYear()}
                  className="input"
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            {Object.keys(localFilters).length > 0 && (
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="btn btn-outline flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;
