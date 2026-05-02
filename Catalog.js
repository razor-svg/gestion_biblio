import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { booksAPI, borrowingAPI, membersAPI } from '../services/api';
import SearchBar from '../components/SearchBar';
import StatusBadge from '../components/StatusBadge';
import { 
  BookOpen, 
  User, 
  Calendar,
  ArrowRight,
  Eye
} from 'lucide-react';

const Catalog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedMember, setSelectedMember] = useState('');

  const { data: booksData, isLoading, refetch } = useQuery(
    ['books', searchTerm, filters],
    () => booksAPI.search({ keyword: searchTerm, ...filters }),
    { keepPreviousData: true }
  );

  const { data: members } = useQuery('membersForSelect', membersAPI.getForSelect);

  const handleSearch = (term, activeFilters) => {
    setSearchTerm(term);
  };

  const handleFilter = (activeFilters) => {
    setFilters(activeFilters);
  };

  const handleBorrow = (book) => {
    if (book.statut !== 'Available') return;
    
    setSelectedBook(book);
    setShowBorrowModal(true);
  };

  const confirmBorrow = async () => {
    if (!selectedBook || !selectedMember) return;

    try {
      await borrowingAPI.borrow({
        livre_id: selectedBook.livre_id,
        membre_id: parseInt(selectedMember)
      });
      
      setShowBorrowModal(false);
      setSelectedBook(null);
      setSelectedMember('');
      refetch(); // Refresh the book list
    } catch (error) {
      console.error('Borrow failed:', error);
      alert('Failed to borrow book. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const books = booksData?.data?.livres || booksData || [];
  const pagination = booksData?.data?.pagination;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Book Catalog</h1>
        <p className="text-gray-600">Search and manage the library's book collection</p>
      </div>

      {/* Search Bar */}
      <SearchBar 
        onSearch={handleSearch} 
        onFilter={handleFilter}
        filters={filters}
      />

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {pagination ? 
            `Showing ${books.length} of ${pagination.totalItems} books` : 
            `Found ${books.length} books`
          }
        </p>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => (
          <div key={book.livre_id} className="card hover:shadow-md transition-shadow duration-200">
            <div className="flex flex-col h-full">
              {/* Book Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {book.titre}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    by {book.auteur?.nom_complet}
                  </p>
                </div>
                <StatusBadge status={book.statut} />
              </div>

              {/* Book Details */}
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                {book.genre && (
                  <div className="flex items-center">
                    <span className="font-medium">Genre:</span>
                    <span className="ml-2">{book.genre}</span>
                  </div>
                )}
                {book.annee_publication && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Published: {book.annee_publication}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-auto pt-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <button className="btn btn-outline flex items-center gap-2 flex-1">
                    <Eye className="h-4 w-4" />
                    Details
                  </button>
                  
                  {book.statut === 'Available' ? (
                    <button 
                      onClick={() => handleBorrow(book)}
                      className="btn btn-success flex items-center gap-2 flex-1"
                    >
                      <BookOpen className="h-4 w-4" />
                      Borrow
                    </button>
                  ) : (
                    <button 
                      disabled
                      className="btn btn-secondary flex items-center gap-2 flex-1 opacity-50 cursor-not-allowed"
                    >
                      <BookOpen className="h-4 w-4" />
                      Unavailable
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {books.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or filters</p>
        </div>
      )}

      {/* Borrow Modal */}
      {showBorrowModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Borrow Book
            </h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Book</p>
                <p className="text-sm text-gray-900">{selectedBook?.titre}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Member
                </label>
                <select
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  className="input"
                  required
                >
                  <option value="">Choose a member...</option>
                  {members?.map((member) => (
                    <option key={member.membre_id} value={member.membre_id}>
                      {member.nom_complet} ({member.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowBorrowModal(false);
                  setSelectedBook(null);
                  setSelectedMember('');
                }}
                className="btn btn-outline flex-1"
              >
                Cancel
              </button>
              <button
                onClick={confirmBorrow}
                disabled={!selectedMember}
                className="btn btn-success flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Borrow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;
