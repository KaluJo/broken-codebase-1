import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { formatDate, formatDistanceToNow } from '../utils/dateUtils';
import { debounce } from '../utils/performanceUtils';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [selectedUsers, setSelectedUsers] = useState(new Set());

  const { hasPermission } = useAuth();
  const { showSuccess, showError } = useNotifications();

  const usersPerPage = 10;

  // Mock users data
  const mockUsers = [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-01-15T10:30:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face',
    },
    {
      id: '2',
      name: 'Regular User',
      email: 'user@example.com',
      role: 'user',
      status: 'active',
      lastLogin: '2024-01-14T15:45:00Z',
      createdAt: '2024-01-02T00:00:00Z',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47b?w=48&h=48&fit=crop&crop=face',
    },
    {
      id: '3',
      name: 'Manager User',
      email: 'manager@example.com',
      role: 'manager',
      status: 'active',
      lastLogin: '2024-01-13T09:20:00Z',
      createdAt: '2024-01-03T00:00:00Z',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=face',
    },
    {
      id: '4',
      name: 'Inactive User',
      email: 'inactive@example.com',
      role: 'user',
      status: 'inactive',
      lastLogin: '2024-01-01T12:00:00Z',
      createdAt: '2024-01-04T00:00:00Z',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=48&h=48&fit=crop&crop=face',
    },
    {
      id: '5',
      name: 'Pending User',
      email: 'pending@example.com',
      role: 'user',
      status: 'pending',
      lastLogin: null,
      createdAt: '2024-01-15T08:30:00Z',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=48&h=48&fit=crop&crop=face',
    },
  ];

  // Simulate API call
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setUsers(mockUsers);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((term) => {
      setCurrentPage(1); // Reset to first page when searching
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    });

    // Sort users
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [users, searchTerm, roleFilter, statusFilter, sortConfig]);

  // Pagination
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * usersPerPage;
    return filteredAndSortedUsers.slice(startIndex, startIndex + usersPerPage);
  }, [filteredAndSortedUsers, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedUsers.length / usersPerPage);

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === paginatedUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(paginatedUsers.map(user => user.id)));
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
      
      showSuccess(`User status updated to ${newStatus}`);
    } catch (error) {
      showError('Failed to update user status');
    }
  };

  const canEdit = hasPermission('user:write');
  const canDelete = hasPermission('user:delete');

  const getSortIcon = (column) => {
    if (sortConfig.key !== column) return '↕️';
    return sortConfig.direction === 'asc' ? '⬆️' : '⬇️';
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'success',
      inactive: 'danger',
      pending: 'warning',
    };
    
    return (
      <span className={`status-badge ${styles[status]}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="page-header">
        <h2>User Management</h2>
        <div className="page-actions">
          {canEdit && (
            <button className="btn btn-primary">
              ➕ Add User
            </button>
          )}
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filter-controls">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="user">User</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      <div className="results-info">
        <p>
          Showing {paginatedUsers.length} of {filteredAndSortedUsers.length} users
          {selectedUsers.size > 0 && ` (${selectedUsers.size} selected)`}
        </p>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedUsers.size === paginatedUsers.length && paginatedUsers.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th onClick={() => handleSort('name')} className="sortable">
                Name {getSortIcon('name')}
              </th>
              <th onClick={() => handleSort('email')} className="sortable">
                Email {getSortIcon('email')}
              </th>
              <th onClick={() => handleSort('role')} className="sortable">
                Role {getSortIcon('role')}
              </th>
              <th onClick={() => handleSort('status')} className="sortable">
                Status {getSortIcon('status')}
              </th>
              <th onClick={() => handleSort('lastLogin')} className="sortable">
                Last Login {getSortIcon('lastLogin')}
              </th>
              <th onClick={() => handleSort('createdAt')} className="sortable">
                Created {getSortIcon('createdAt')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.id)}
                    onChange={() => handleUserSelect(user.id)}
                  />
                </td>
                <td>
                  <div className="user-info">
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="user-avatar-small"
                    />
                    <span>{user.name}</span>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role}
                  </span>
                </td>
                <td>{getStatusBadge(user.status)}</td>
                <td>
                  {user.lastLogin ? (
                    <span title={formatDate(user.lastLogin)}>
                      {formatDistanceToNow(user.lastLogin)}
                    </span>
                  ) : (
                    <span className="text-muted">Never</span>
                  )}
                </td>
                <td title={formatDate(user.createdAt)}>
                  {formatDistanceToNow(user.createdAt)}
                </td>
                <td>
                  <div className="action-buttons">
                    {canEdit && (
                      <select
                        value={user.status}
                        onChange={(e) => handleStatusChange(user.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                      </select>
                    )}
                    {canDelete && (
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => console.log('Delete user:', user.id)}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            ← Previous
          </button>
          
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 