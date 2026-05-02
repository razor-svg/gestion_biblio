import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { membersAPI, borrowingAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { 
  User, 
  Mail, 
  Calendar,
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const MemberProfile = () => {
  const { id } = useParams();

  const { data: member, isLoading: memberLoading } = useQuery(
    ['member', id],
    () => membersAPI.getById(id)
  );

  const { data: borrowingHistory, isLoading: historyLoading } = useQuery(
    ['memberHistory', id],
    () => borrowingAPI.getMemberHistory(id)
  );

  if (memberLoading || historyLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Member not found</h3>
        <p className="text-gray-600">The member you're looking for doesn't exist.</p>
      </div>
    );
  }

  const activeBorrows = borrowingHistory?.filter(emprunt => !emprunt.date_retour_reelle) || [];
  const returnedBooks = borrowingHistory?.filter(emprunt => emprunt.date_retour_reelle) || [];
  const overdueBooks = activeBorrows.filter(emprunt => 
    new Date(emprunt.date_retour_prevue) < new Date()
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Member Profile</h1>
        <p className="text-gray-600">View member details and borrowing history</p>
      </div>

      {/* Member Information */}
      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary-100 rounded-full">
              <User className="h-8 w-8 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{member.nom_complet}</h2>
              <StatusBadge status={member.statut_compte} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-sm font-medium text-gray-900">{member.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Member ID</p>
                <p className="text-sm font-medium text-gray-900">#{member.membre_id}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Total Books Borrowed</p>
                <p className="text-sm font-medium text-gray-900">{borrowingHistory?.length || 0}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Currently Borrowed</p>
                <p className="text-sm font-medium text-gray-900">{activeBorrows.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Alert */}
      {overdueBooks.length > 0 && (
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-danger-600 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-danger-800">
                Overdue Books
              </h3>
              <p className="text-sm text-danger-700 mt-1">
                This member has {overdueBooks.length} overdue book{overdueBooks.length > 1 ? 's' : ''}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Borrowing Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Borrows</p>
              <p className="text-2xl font-bold text-warning-600">{activeBorrows.length}</p>
            </div>
            <div className="p-3 bg-warning-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-warning-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Returned Books</p>
              <p className="text-2xl font-bold text-success-600">{returnedBooks.length}</p>
            </div>
            <div className="p-3 bg-success-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-success-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue Books</p>
              <p className="text-2xl font-bold text-danger-600">{overdueBooks.length}</p>
            </div>
            <div className="p-3 bg-danger-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-danger-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Borrowing History */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Borrowing History</h2>
        
        {borrowingHistory && borrowingHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Author</th>
                  <th>Borrow Date</th>
                  <th>Due Date</th>
                  <th>Return Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {borrowingHistory.map((emprunt) => {
                  const isOverdue = !emprunt.date_retour_reelle && 
                    new Date(emprunt.date_retour_prevue) < new Date();
                  
                  return (
                    <tr key={emprunt.emprunt_id}>
                      <td className="font-medium">{emprunt.livre?.titre}</td>
                      <td>{emprunt.livre?.auteur?.nom_complet}</td>
                      <td>{new Date(emprunt.date_emprunt).toLocaleDateString()}</td>
                      <td>
                        <span className={isOverdue ? 'text-danger-600 font-medium' : ''}>
                          {new Date(emprunt.date_retour_prevue).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        {emprunt.date_retour_reelle 
                          ? new Date(emprunt.date_retour_reelle).toLocaleDateString()
                          : '-'
                        }
                      </td>
                      <td>
                        {emprunt.date_retour_reelle ? (
                          <span className="badge badge-success">Returned</span>
                        ) : isOverdue ? (
                          <span className="badge badge-danger">Overdue</span>
                        ) : (
                          <span className="badge badge-warning">Active</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No borrowing history</h3>
            <p className="text-gray-600">This member hasn't borrowed any books yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberProfile;
