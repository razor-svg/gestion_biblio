import React from 'react';
import { useQuery } from 'react-query';
import { 
  booksAPI, 
  membersAPI, 
  borrowingAPI 
} from '../services/api';
import { 
  BookOpen, 
  Users, 
  AlertCircle, 
  TrendingUp,
  Calendar,
  Clock
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

const Dashboard = () => {
  const { data: activeBorrows, isLoading: borrowsLoading } = useQuery(
    'activeBorrows',
    borrowingAPI.getActive,
    { refetchInterval: 30000 } // Refetch every 30 seconds
  );

  const { data: overdueBooks, isLoading: overdueLoading } = useQuery(
    'overdueBooks',
    borrowingAPI.getOverdue,
    { refetchInterval: 60000 } // Refetch every minute
  );

  const { data: members, isLoading: membersLoading } = useQuery(
    'activeMembers',
    membersAPI.getActive
  );

  const { data: books, isLoading: booksLoading } = useQuery(
    'allBooks',
    booksAPI.getAll
  );

  // Calculate KPIs
  const kpis = {
    totalBooks: books?.length || 0,
    availableBooks: books?.filter(book => book.statut === 'Available').length || 0,
    borrowedBooks: books?.filter(book => book.statut === 'Borrowed').length || 0,
    activeMembers: members?.length || 0,
    activeBorrows: activeBorrows?.length || 0,
    overdueBooks: overdueBooks?.length || 0,
  };

  const isLoading = borrowsLoading || overdueLoading || membersLoading || booksLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Library overview and key metrics</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Books */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Books</p>
              <p className="text-2xl font-bold text-gray-900">{kpis.totalBooks}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        {/* Available Books */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-2xl font-bold text-success-600">{kpis.availableBooks}</p>
            </div>
            <div className="p-3 bg-success-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-success-600" />
            </div>
          </div>
        </div>

        {/* Active Members */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Members</p>
              <p className="text-2xl font-bold text-gray-900">{kpis.activeMembers}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        {/* Active Borrows */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Borrows</p>
              <p className="text-2xl font-bold text-warning-600">{kpis.activeBorrows}</p>
            </div>
            <div className="p-3 bg-warning-100 rounded-lg">
              <Calendar className="h-6 w-6 text-warning-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Books Alert */}
      {kpis.overdueBooks > 0 && (
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-danger-600 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-danger-800">
                Overdue Books Alert
              </h3>
              <p className="text-sm text-danger-700 mt-1">
                You have {kpis.overdueBooks} overdue book{kpis.overdueBooks > 1 ? 's' : ''} that need attention.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Active Borrows */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Active Borrows</h2>
          <div className="space-y-3">
            {activeBorrows?.slice(0, 5).map((emprunt) => (
              <div key={emprunt.emprunt_id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {emprunt.livre?.titre}
                  </p>
                  <p className="text-xs text-gray-500">
                    by {emprunt.livre?.auteur?.nom_complet}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{emprunt.membre?.nom_complet}</p>
                  <p className="text-xs text-gray-400">
                    Due: {new Date(emprunt.date_retour_prevue).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {(!activeBorrows || activeBorrows.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">No active borrows</p>
            )}
          </div>
        </div>

        {/* Overdue Books */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            Overdue Books
            {kpis.overdueBooks > 0 && (
              <span className="ml-2 badge badge-danger">
                {kpis.overdueBooks}
              </span>
            )}
          </h2>
          <div className="space-y-3">
            {overdueBooks?.slice(0, 5).map((emprunt) => (
              <div key={emprunt.emprunt_id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {emprunt.livre?.titre}
                  </p>
                  <p className="text-xs text-gray-500">
                    by {emprunt.livre?.auteur?.nom_complet}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{emprunt.membre?.nom_complet}</p>
                  <p className="text-xs text-danger-600 font-medium">
                    {Math.ceil((new Date() - new Date(emprunt.date_retour_prevue)) / (1000 * 60 * 60 * 24))} days overdue
                  </p>
                </div>
              </div>
            ))}
            {(!overdueBooks || overdueBooks.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">No overdue books</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
