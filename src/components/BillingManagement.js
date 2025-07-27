import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { formatDate, formatDistanceToNow } from '../utils/dateUtils';

const BillingManagement = () => {
  const [loading, setLoading] = useState(true);
  const [billingData, setBillingData] = useState({});
  const [invoices, setInvoices] = useState([]);
  const [usage, setUsage] = useState({});
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const { hasPermission } = useAuth();
  const { showSuccess, showError } = useNotifications();

  // Mock billing data
  const mockBillingData = {
    subscription: {
      plan: 'Enterprise Pro',
      status: 'active',
      billingCycle: 'monthly',
      nextBillingDate: '2024-02-15T00:00:00Z',
      amount: 299.99,
      currency: 'USD',
      features: [
        'Unlimited users',
        'Advanced analytics',
        'Priority support',
        'Custom integrations',
        'Advanced security',
        'Dedicated account manager',
      ],
    },
    paymentMethod: {
      type: 'credit_card',
      last4: '4242',
      brand: 'Visa',
      expiryMonth: 12,
      expiryYear: 2025,
    },
    billingAddress: {
      company: 'Acme Corporation',
      line1: '123 Business St',
      line2: 'Suite 456',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94105',
      country: 'US',
    },
  };

  const mockInvoices = [
    {
      id: 'inv_001',
      number: 'INV-2024-001',
      status: 'paid',
      amount: 299.99,
      currency: 'USD',
      issueDate: '2024-01-15T00:00:00Z',
      dueDate: '2024-01-30T00:00:00Z',
      paidDate: '2024-01-16T10:30:00Z',
      description: 'Enterprise Pro - January 2024',
      downloadUrl: '/invoices/inv_001.pdf',
    },
    {
      id: 'inv_002',
      number: 'INV-2023-012',
      status: 'paid',
      amount: 299.99,
      currency: 'USD',
      issueDate: '2023-12-15T00:00:00Z',
      dueDate: '2023-12-30T00:00:00Z',
      paidDate: '2023-12-16T09:15:00Z',
      description: 'Enterprise Pro - December 2023',
      downloadUrl: '/invoices/inv_002.pdf',
    },
    {
      id: 'inv_003',
      number: 'INV-2023-011',
      status: 'paid',
      amount: 299.99,
      currency: 'USD',
      issueDate: '2023-11-15T00:00:00Z',
      dueDate: '2023-11-30T00:00:00Z',
      paidDate: '2023-11-17T14:20:00Z',
      description: 'Enterprise Pro - November 2023',
      downloadUrl: '/invoices/inv_003.pdf',
    },
  ];

  const mockUsage = {
    currentPeriod: {
      start: '2024-01-15T00:00:00Z',
      end: '2024-02-15T00:00:00Z',
    },
    metrics: {
      activeUsers: {
        current: 847,
        limit: 1000,
        unit: 'users',
      },
      apiCalls: {
        current: 2456789,
        limit: 5000000,
        unit: 'calls',
      },
      storage: {
        current: 234.5,
        limit: 500,
        unit: 'GB',
      },
      bandwidth: {
        current: 1.2,
        limit: 5,
        unit: 'TB',
      },
    },
  };

  useEffect(() => {
    const fetchBillingData = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1200));
        setBillingData(mockBillingData);
        setInvoices(mockInvoices);
        setUsage(mockUsage);
      } catch (error) {
        showError('Failed to load billing data');
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, [showError]);

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { class: 'success', icon: '✅', label: 'Active' },
      paid: { class: 'success', icon: '✅', label: 'Paid' },
      pending: { class: 'warning', icon: '⏳', label: 'Pending' },
      overdue: { class: 'danger', icon: '⚠️', label: 'Overdue' },
      cancelled: { class: 'neutral', icon: '❌', label: 'Cancelled' },
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`status-badge ${config.class}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  const getUsagePercentage = (current, limit) => {
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'danger';
    if (percentage >= 75) return 'warning';
    return 'success';
  };

  const downloadInvoice = async (invoice) => {
    try {
      // Simulate download
      await new Promise(resolve => setTimeout(resolve, 800));
      showSuccess(`Invoice ${invoice.number} download started`);
    } catch (error) {
      showError('Download failed');
    }
  };

  const updatePaymentMethod = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      showSuccess('Payment method updated successfully');
    } catch (error) {
      showError('Failed to update payment method');
    }
  };

  const cancelSubscription = async () => {
    if (window.confirm('Are you sure you want to cancel your subscription?')) {
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        showSuccess('Subscription cancellation request submitted');
      } catch (error) {
        showError('Failed to cancel subscription');
      }
    }
  };

  if (!hasPermission('admin')) {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You don't have permission to view billing information.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading billing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="billing-management">
      <div className="page-header">
        <h2>Billing & Subscription</h2>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={updatePaymentMethod}>
            💳 Update Payment Method
          </button>
        </div>
      </div>

      {/* Subscription Overview */}
      <div className="subscription-overview">
        <div className="subscription-card">
          <div className="subscription-header">
            <h3>{billingData.subscription?.plan}</h3>
            {getStatusBadge(billingData.subscription?.status)}
          </div>
          
          <div className="subscription-details">
            <div className="detail-row">
              <span>Amount:</span>
              <span className="amount">
                {formatCurrency(billingData.subscription?.amount)}/{billingData.subscription?.billingCycle}
              </span>
            </div>
            <div className="detail-row">
              <span>Next billing:</span>
              <span>{formatDate(billingData.subscription?.nextBillingDate, 'PP')}</span>
            </div>
            <div className="detail-row">
              <span>Payment method:</span>
              <span>
                {billingData.paymentMethod?.brand} •••• {billingData.paymentMethod?.last4}
              </span>
            </div>
          </div>

          <div className="subscription-features">
            <h4>Plan Features:</h4>
            <ul>
              {billingData.subscription?.features?.map((feature, index) => (
                <li key={index}>✓ {feature}</li>
              ))}
            </ul>
          </div>

          <div className="subscription-actions">
            <button className="btn btn-outline">
              🔄 Change Plan
            </button>
            <button 
              className="btn btn-danger-outline" 
              onClick={cancelSubscription}
            >
              ❌ Cancel Subscription
            </button>
          </div>
        </div>
      </div>

      {/* Usage Metrics */}
      <div className="usage-section">
        <h3>Current Usage</h3>
        <div className="usage-period">
          Period: {formatDate(usage.currentPeriod?.start, 'PP')} - {formatDate(usage.currentPeriod?.end, 'PP')}
        </div>
        
        <div className="usage-metrics">
          {Object.entries(usage.metrics || {}).map(([key, metric]) => {
            const percentage = getUsagePercentage(metric.current, metric.limit);
            const color = getUsageColor(percentage);
            
            return (
              <div key={key} className="usage-metric">
                <div className="metric-header">
                  <h4>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h4>
                  <span className="metric-value">
                    {metric.current.toLocaleString()} / {metric.limit.toLocaleString()} {metric.unit}
                  </span>
                </div>
                <div className="usage-bar">
                  <div 
                    className={`usage-fill ${color}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="usage-percentage">
                  {percentage.toFixed(1)}% used
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Billing Address */}
      <div className="billing-address-section">
        <h3>Billing Address</h3>
        <div className="address-card">
          <div className="address-content">
            <div>{billingData.billingAddress?.company}</div>
            <div>{billingData.billingAddress?.line1}</div>
            {billingData.billingAddress?.line2 && (
              <div>{billingData.billingAddress.line2}</div>
            )}
            <div>
              {billingData.billingAddress?.city}, {billingData.billingAddress?.state} {billingData.billingAddress?.postalCode}
            </div>
            <div>{billingData.billingAddress?.country}</div>
          </div>
          <button className="btn btn-outline">
            ✏️ Edit Address
          </button>
        </div>
      </div>

      {/* Invoice History */}
      <div className="invoices-section">
        <h3>Invoice History</h3>
        <div className="invoices-table">
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Issue Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>
                    <strong>{invoice.number}</strong>
                  </td>
                  <td>{invoice.description}</td>
                  <td>{formatCurrency(invoice.amount, invoice.currency)}</td>
                  <td>{formatDate(invoice.issueDate, 'PP')}</td>
                  <td>{getStatusBadge(invoice.status)}</td>
                  <td>
                    <div className="invoice-actions">
                      <button 
                        className="btn btn-sm btn-outline"
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setShowInvoiceModal(true);
                        }}
                      >
                        👁️ View
                      </button>
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => downloadInvoice(invoice)}
                      >
                        ⬇️ Download
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Detail Modal */}
      {showInvoiceModal && selectedInvoice && (
        <div className="modal-overlay" onClick={() => setShowInvoiceModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Invoice Details</h3>
              <button onClick={() => setShowInvoiceModal(false)} className="modal-close">
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="invoice-details">
                <div className="invoice-header">
                  <h4>{selectedInvoice.number}</h4>
                  {getStatusBadge(selectedInvoice.status)}
                </div>

                <div className="invoice-info">
                  <div className="info-group">
                    <h5>Invoice Information</h5>
                    <div className="info-grid">
                      <div><strong>Description:</strong> {selectedInvoice.description}</div>
                      <div><strong>Amount:</strong> {formatCurrency(selectedInvoice.amount)}</div>
                      <div><strong>Issue Date:</strong> {formatDate(selectedInvoice.issueDate, 'PPP')}</div>
                      <div><strong>Due Date:</strong> {formatDate(selectedInvoice.dueDate, 'PPP')}</div>
                      {selectedInvoice.paidDate && (
                        <div><strong>Paid Date:</strong> {formatDate(selectedInvoice.paidDate, 'PPP')}</div>
                      )}
                    </div>
                  </div>

                  <div className="info-group">
                    <h5>Billing Address</h5>
                    <div className="address-info">
                      <div>{billingData.billingAddress?.company}</div>
                      <div>{billingData.billingAddress?.line1}</div>
                      {billingData.billingAddress?.line2 && (
                        <div>{billingData.billingAddress.line2}</div>
                      )}
                      <div>
                        {billingData.billingAddress?.city}, {billingData.billingAddress?.state} {billingData.billingAddress?.postalCode}
                      </div>
                      <div>{billingData.billingAddress?.country}</div>
                    </div>
                  </div>
                </div>

                <div className="invoice-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => downloadInvoice(selectedInvoice)}
                  >
                    ⬇️ Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Billing Summary */}
      <div className="billing-summary">
        <div className="summary-cards">
          <div className="summary-card">
            <h4>Total Invoices</h4>
            <div className="summary-value">{invoices.length}</div>
          </div>
          
          <div className="summary-card">
            <h4>Total Paid</h4>
            <div className="summary-value">
              {formatCurrency(invoices.reduce((sum, inv) => sum + (inv.status === 'paid' ? inv.amount : 0), 0))}
            </div>
          </div>
          
          <div className="summary-card">
            <h4>Next Payment</h4>
            <div className="summary-value">
              {formatCurrency(billingData.subscription?.amount)}
            </div>
            <div className="summary-subtitle">
              {formatDistanceToNow(billingData.subscription?.nextBillingDate)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingManagement; 