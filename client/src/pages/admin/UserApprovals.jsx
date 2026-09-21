import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Users,
  CheckCircle,
  XCircle,
  Search,
  Shield,
  AlertTriangle,
  Building,
  Mail,
  UserCheck,
  FileText,
  ExternalLink,
  ChevronRight,
  Eye,
  Check,
} from 'lucide-react';
import { useToast, useDialog } from '../../context/NotificationContext';
import {
  Button,
  Badge,
  PageHeader,
  DataTable,
  Modal,
  ConfirmDialog,
  Tabs,
  Input,
  Card,
} from '../../components/design-system';

/**
 * Government Minimalism Institute & User Verification (Section 25)
 * Clean review layout:
 * Left: Institute Information | Right: Verification status & Documents
 * Actions: [Approve], [Request Correction], [Reject] (Danger requires confirmation)
 */
const UserApprovals = () => {
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Review Dossier Modal State
  const [selectedReviewUser, setSelectedReviewUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Reject / Correction Dialog State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);

  const toast = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [pendRes, allRes] = await Promise.all([
        api.getPendingUsers(),
        api.getUsers(),
      ]);
      if (pendRes.success) setPendingUsers(pendRes.users || []);
      if (allRes.success) setUsers(allRes.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async () => {
    if (!selectedReviewUser) return;
    setActionLoading(true);
    try {
      const res = await api.approveUser(selectedReviewUser._id);
      if (res.success) {
        toast.success(`Accreditation authorized for ${selectedReviewUser.name}!`, 'Application Approved');
        setConfirmApproveOpen(false);
        setSelectedReviewUser(null);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.message, 'Approval Failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedReviewUser) return;
    setActionLoading(true);
    try {
      const res = await api.rejectUser(selectedReviewUser._id, rejectReason);
      if (res.success) {
        toast.warning('Application rejected and logged to central audit trail.', 'Application Rejected');
        setRejectModalOpen(false);
        setRejectReason('');
        setSelectedReviewUser(null);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.message, 'Rejection Failed');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredPending = pendingUsers.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.organizationName?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  const filteredAll = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      key: 'name',
      label: 'Applicant / Organization',
      sortable: true,
      render: (_, row) => (
        <div>
          <div className="font-semibold text-[#17202A]">{row.name}</div>
          <div className="text-xs text-[#5F6B76]">{row.email}</div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Requested Role',
      render: (role) => (
        <Badge variant={role?.includes('admin') ? 'primary' : 'neutral'} size="sm">
          {role?.replace(/_/g, ' ').toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'organizationName',
      label: 'Institution',
      render: (val, row) => (
        <span className="text-xs text-[#17202A] font-medium">
          {val || row.instituteId?.name || 'Central Framework'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Submission Date',
      render: (val) => (
        <span className="text-xs text-[#5F6B76]">
          {val ? new Date(val).toLocaleDateString('en-IN') : 'Recent'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, row) => (
        <Badge variant={row.isApproved ? 'approved' : 'pending'} size="sm" dot>
          {row.isApproved ? 'Approved' : 'Pending Verification'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_, row) => (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setSelectedReviewUser(row)}
        >
          Review
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Institutional & User Verification"
        description="Verify accreditation documents, representative authorization, and official details for affiliated centers."
        actions={
          <div className="w-64">
            <Input
              placeholder="Search by name, institute, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={Search}
            />
          </div>
        }
      />

      {/* Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'pending', label: 'Pending Verification Queue', count: pendingUsers.length },
          { id: 'all', label: 'All Registered Entities', count: users.length },
        ]}
      />

      {/* Verification Data Table */}
      <DataTable
        columns={columns}
        data={activeTab === 'pending' ? filteredPending : filteredAll}
        loading={loading}
        emptyMessage={activeTab === 'pending' ? 'No pending applications' : 'No records found'}
        emptyDescription={
          activeTab === 'pending'
            ? 'All submitted accreditation requests have been evaluated.'
            : 'Try modifying your search criteria.'
        }
      />

      {/* SECTION 25: INSTITUTE VERIFICATION REVIEW DOSSIER MODAL */}
      {selectedReviewUser && (
        <Modal
          isOpen={!!selectedReviewUser}
          onClose={() => setSelectedReviewUser(null)}
          maxWidth="max-w-4xl"
          title={`Accreditation Review: ${selectedReviewUser.name}`}
          description="Examine verified documentation before granting national platform credentials."
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="danger"
                size="sm"
                onClick={() => setRejectModalOpen(true)}
              >
                Reject Application
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    toast.info('Request for additional documentation dispatched to applicant.', 'Notice Dispatched');
                    setSelectedReviewUser(null);
                  }}
                >
                  Request Correction
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setConfirmApproveOpen(true)}
                  icon={Check}
                >
                  Approve Accreditation
                </Button>
              </div>
            </div>
          }
        >
          {/* Two-Column Review Layout (Section 25) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
            
            {/* LEFT: Institute / Applicant Information */}
            <div className="space-y-4 pr-0 md:pr-4 md:border-r border-[#E5E7EB]">
              <h4 className="text-xs font-bold text-[#17202A] uppercase tracking-wider">
                Official Entity Details
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[#5F6B76] block">Organization / Full Name</span>
                  <span className="font-bold text-[#17202A] text-sm">{selectedReviewUser.name}</span>
                </div>

                <div>
                  <span className="text-[#5F6B76] block">Official Email Address</span>
                  <span className="font-mono text-[#17202A]">{selectedReviewUser.email}</span>
                </div>

                <div>
                  <span className="text-[#5F6B76] block">Applied Role / Authority</span>
                  <Badge variant="primary" size="sm" className="mt-0.5">
                    {selectedReviewUser.role?.replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                </div>

                <div>
                  <span className="text-[#5F6B76] block">Affiliated Institution</span>
                  <span className="font-semibold text-[#17202A]">
                    {selectedReviewUser.organizationName || selectedReviewUser.instituteId?.name || 'Autonomous Directorate'}
                  </span>
                </div>

                <div>
                  <span className="text-[#5F6B76] block">Application Timestamp</span>
                  <span className="text-[#17202A]">
                    {selectedReviewUser.createdAt
                      ? new Date(selectedReviewUser.createdAt).toLocaleString('en-IN')
                      : 'Recent'}
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT: Verification Status & Documents Checklist */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-[#17202A] uppercase tracking-wider">
                Submitted Verification Documents
              </h4>

              <div className="space-y-2.5">
                {[
                  { name: 'Institutional Registration Certificate', docType: 'Govt Gazette / AICTE / UGC', verified: true },
                  { name: 'Authorized Signatory Delegation Letter', docType: 'Official Letterhead with Seal', verified: true },
                  { name: 'Official Institutional Seal & High-Res Logo', docType: 'SVG / PNG Transparent Asset', verified: true },
                  { name: 'IT Cell Security & Tenant Isolation Agreement', docType: 'Signed MoES Undertaking', verified: true },
                ].map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#F8FAFC] rounded-[6px] border border-[#E5E7EB] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-4 h-4 text-[#1F4E79] flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="font-semibold text-[#17202A] truncate">{doc.name}</div>
                        <div className="text-[11px] text-[#5F6B76]">{doc.docType}</div>
                      </div>
                    </div>
                    <Badge variant="approved" size="sm">
                      Attached
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[#E5E7EB]">
                <div className="text-[11px] text-[#5F6B76] leading-relaxed">
                  Verification check by Central Governance Cell ensures data isolation and prevents unauthorized issuance of national meteorological credentials.
                </div>
              </div>
            </div>

          </div>
        </Modal>
      )}

      {/* Confirmation Dialog for Approval (Section 25) */}
      <ConfirmDialog
        isOpen={confirmApproveOpen}
        onClose={() => setConfirmApproveOpen(false)}
        onConfirm={handleApprove}
        loading={actionLoading}
        title="Approve Institutional Accreditation"
        message={`Are you sure you want to approve accreditation for ${selectedReviewUser?.name}? This will grant access to create faculty, author courses, and issue verifiable certificates.`}
        confirmText="Confirm & Authorize"
      />

      {/* Rejection / Danger Confirmation Dialog */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        maxWidth="max-w-md"
        title="Reject Application"
        description="This action will deny portal access and log the rejection reason into the audit register."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleReject}
              loading={actionLoading}
            >
              Confirm Rejection
            </Button>
          </>
        }
      >
        <div className="space-y-3 py-1">
          <Input
            label="Reason for Rejection / Deficiencies Noted"
            required
            placeholder="e.g., Incomplete signatory authorization letter or invalid registration document."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </div>
      </Modal>

    </div>
  );
};

export default UserApprovals;
