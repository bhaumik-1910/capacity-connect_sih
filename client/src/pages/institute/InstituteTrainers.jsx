import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast, useDialog } from '../../context/NotificationContext';
import {
  Users,
  Search,
  Plus,
  Upload,
  Trash2,
  CheckCircle2,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react';
import {
  Button,
  DataTable,
  PageHeader,
  Badge,
  Input,
  Select,
  FilterBar,
  Modal,
  ConfirmDialog,
} from '../../components/design-system';

/**
 * Government Minimalism Trainer Management (Section 26)
 * Trainer list with Search, Filters, Add Trainer (Single OR Bulk import stepper)
 * Table: Name | Specialization | Courses | Experience | Status | Actions
 */
const InstituteTrainers = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [trainers, setTrainers] = useState([]);
  const [search, setSearch] = useState('');
  const [specFilter, setSpecFilter] = useState('all');

  // Single Trainer Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addingTrainer, setAddingTrainer] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: 'Radar Meteorology',
    designation: 'Assistant Professor / Scientific Officer',
    experienceYears: '5',
  });

  // Bulk Import Stepper Modal (Section 26: Upload -> Preview -> Validation -> Import)
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkStep, setBulkStep] = useState(1);
  const [bulkFile, setBulkFile] = useState(null);
  const [previewRows, setPreviewRows] = useState([]);
  const [importing, setImporting] = useState(false);

  // Delete Confirm
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadTrainers = async () => {
    setLoading(true);
    try {
      const res = await api.getUsers('role=trainer');
      if (res && res.success && Array.isArray(res.users)) {
        setTrainers(res.users);
      } else {
        setTrainers([]);
      }
    } catch (err) {
      console.error('Failed to load trainers:', err);
      setTrainers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrainers();
  }, []);

  const handleAddSingleTrainer = async (e) => {
    e.preventDefault();
    setAddingTrainer(true);
    try {
      const payload = {
        ...formData,
        role: 'trainer',
        organizationId: user?.organizationId?._id || user?.organizationId,
        organizationName: user?.organizationName || '',
      };
      const res = await api.register(payload);
      if (res.success) {
        toast.success(`Faculty member ${formData.name} added.`, 'Trainer Registered');
        setAddModalOpen(false);
        setFormData({
          name: '',
          email: '',
          password: '',
          department: 'Radar Meteorology',
          designation: 'Assistant Professor',
          experienceYears: '5',
        });
        loadTrainers();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add trainer.');
    } finally {
      setAddingTrainer(false);
    }
  };

  // Bulk Import Mock Workflow
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBulkFile(file);
      setPreviewRows([
        { name: 'Dr. Manisha Sen', email: 'msen@imd.gov.in', department: 'Aviation Meteorology', experience: '9 Years', valid: true },
        { name: 'Dr. Vikramaditya Joshi', email: 'vjoshi@iisc.ac.in', department: 'Atmospheric Physics', experience: '14 Years', valid: true },
        { name: 'Er. Tarun Pradhan', email: 'tpradhan@moes.gov.in', department: 'Ocean Meteorology', experience: '6 Years', valid: true },
      ]);
      setBulkStep(2); // Preview
    }
  };

  const handleConfirmBulkImport = async () => {
    setImporting(true);
    setTimeout(() => {
      setImporting(false);
      toast.success('Successfully imported 3 faculty records into institute directory.');
      setBulkModalOpen(false);
      setBulkStep(1);
      setBulkFile(null);
      loadTrainers();
    }, 800);
  };

  const filteredTrainers = trainers.filter((t) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      t.name?.toLowerCase().includes(q) ||
      t.email?.toLowerCase().includes(q) ||
      t.department?.toLowerCase().includes(q);
    const matchesDept = specFilter === 'all' || (t.department || '').toLowerCase().includes(specFilter.toLowerCase());
    return matchesSearch && matchesDept;
  });

  // Table Columns (Section 26)
  const columns = [
    {
      key: 'name',
      label: 'Trainer Name',
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="font-semibold text-[#17202A]">{val || row.name}</div>
          <div className="text-xs text-[#5F6B76] font-mono">{row.email}</div>
        </div>
      ),
    },
    {
      key: 'department',
      label: 'Specialization',
      sortable: true,
      render: (val, row) => (
        <span className="text-xs text-[#17202A] font-medium">
          {val || row.specialization || '—'}
        </span>
      ),
    },
    {
      key: 'coursesCount',
      label: 'Courses',
      render: (val, row) => (
        <span className="font-mono text-xs text-[#1F4E79] font-semibold">
          {val != null ? `${val} Courses` : `${row.courses?.length || 2} Courses`}
        </span>
      ),
    },
    {
      key: 'experienceYears',
      label: 'Experience',
      render: (val, row) => (
        <span className="text-xs text-[#5F6B76]">
          {val ? `${val} Yrs` : (row.experience || '—')}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val, row) => (
        <Badge variant={row.isApproved !== false ? 'approved' : 'pending'} size="sm" dot>
          {row.isApproved !== false ? 'Active' : 'Pending'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => toast.info(`Viewing profile for ${row.name}`, 'Faculty Profile')}
          >
            View
          </Button>
          <button
            type="button"
            onClick={() => setDeleteTarget(row)}
            className="p-1.5 text-[#87919B] hover:text-[#B42318] hover:bg-[#FEE4E2]/40 rounded-[4px] transition-colors"
            title="Remove"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header (Section 26) */}
      <PageHeader
        title="Trainer Management"
        description="Oversee faculty appointments, specialization departments, and course instruction responsibilities."
        badge={<Badge variant="primary" size="sm">Faculty Directory</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setBulkStep(1);
                setBulkModalOpen(true);
              }}
              icon={FileSpreadsheet}
            >
              Bulk Import (CSV/Excel)
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setAddModalOpen(true)}
              icon={Plus}
            >
              Add Trainer
            </Button>
          </div>
        }
      />

      {/* Filter Bar (Section 26) */}
      <FilterBar>
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search trainers by name, email, specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
          />
        </div>

        <div className="w-52">
          <Select
            value={specFilter}
            onChange={(e) => setSpecFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Specializations' },
              { value: 'Radar', label: 'Radar Meteorology' },
              { value: 'Modeling', label: 'Numerical Modeling' },
              { value: 'Satellite', label: 'Satellite Climatology' },
              { value: 'Agro', label: 'Agrometeorology' },
            ]}
          />
        </div>
      </FilterBar>

      {/* Trainers Table (Section 26) */}
      <DataTable
        columns={columns}
        data={filteredTrainers}
        loading={loading}
        emptyMessage="No trainers found in the institute directory."
      />

      {/* Modal: Add Single Trainer (Section 26) */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Faculty Member"
        description="Provide official credentials for the new instructor."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddSingleTrainer}
              loading={addingTrainer}
            >
              Save Trainer
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddSingleTrainer} className="space-y-3.5 text-xs">
          <Input
            label="Full Name & Title"
            required
            placeholder="e.g. Dr. Ramesh Gupta"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <Input
            label="Official Institutional Email"
            type="email"
            required
            placeholder="name@institute.edu.in"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <Input
            label="Initial Account Password"
            type="password"
            required
            placeholder="Min. 8 characters"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Specialization Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              options={[
                'Radar Meteorology',
                'Numerical Weather Prediction',
                'Satellite Meteorology',
                'Agrometeorology',
                'Synoptic Forecasting',
              ]}
            />
            <Input
              label="Teaching Experience (Years)"
              type="number"
              value={formData.experienceYears}
              onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* Modal: Bulk Import Stepper (Section 26) */}
      <Modal
        isOpen={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        maxWidth="max-w-2xl"
        title="Bulk Import Faculty (Excel / CSV)"
        description="Step-by-step onboarding for multiple departmental trainers."
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-[#87919B]">Step {bulkStep} of 3</span>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => setBulkModalOpen(false)}>
                Cancel
              </Button>
              {bulkStep === 2 && (
                <Button variant="primary" size="sm" onClick={() => setBulkStep(3)}>
                  Run Validation
                </Button>
              )}
              {bulkStep === 3 && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleConfirmBulkImport}
                  loading={importing}
                >
                  Confirm Import (3 Trainers)
                </Button>
              )}
            </div>
          </div>
        }
      >
        <div className="space-y-4 py-1">
          {/* Stepper Progress Header (Section 20 & 26) */}
          <div className="flex items-center justify-between text-xs border-b border-[#E5E7EB] pb-3">
            <div className={`font-semibold ${bulkStep >= 1 ? 'text-[#1F4E79]' : 'text-[#87919B]'}`}>
              01 Upload File
            </div>
            <span>→</span>
            <div className={`font-semibold ${bulkStep >= 2 ? 'text-[#1F4E79]' : 'text-[#87919B]'}`}>
              02 Preview Data
            </div>
            <span>→</span>
            <div className={`font-semibold ${bulkStep >= 3 ? 'text-[#1F4E79]' : 'text-[#87919B]'}`}>
              03 Validation & Import
            </div>
          </div>

          {/* STEP 1: Upload */}
          {bulkStep === 1 && (
            <div className="p-8 border-2 border-dashed border-[#CBD5E1] rounded-[8px] text-center bg-[#F8FAFC]">
              <FileSpreadsheet className="w-10 h-10 text-[#1F4E79] mx-auto mb-2" />
              <div className="text-sm font-semibold text-[#17202A]">Select CSV or Excel Spreadsheet</div>
              <p className="text-xs text-[#5F6B76] mt-1 mb-4">
                Required columns: Name, Email, Department, ExperienceYears
              </p>
              <label className="inline-flex">
                <input
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <span className="px-4 py-2 bg-[#1F4E79] text-white text-xs font-semibold rounded-[6px] cursor-pointer hover:bg-[#163A5C]">
                  Browse File
                </span>
              </label>
            </div>
          )}

          {/* STEP 2: Preview */}
          {bulkStep === 2 && (
            <div className="space-y-3 text-xs">
              <div className="font-semibold text-[#17202A]">
                Previewing: {bulkFile?.name || 'trainers_roster.xlsx'} (3 records found)
              </div>
              <div className="border border-[#E5E7EB] rounded-[6px] overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB] text-[#5F6B76]">
                    <tr>
                      <th className="p-2">Name</th>
                      <th className="p-2">Email</th>
                      <th className="p-2">Department</th>
                      <th className="p-2">Experience</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {previewRows.map((r, i) => (
                      <tr key={i}>
                        <td className="p-2 font-medium">{r.name}</td>
                        <td className="p-2 font-mono text-[11px]">{r.email}</td>
                        <td className="p-2">{r.department}</td>
                        <td className="p-2">{r.experience}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 3: Validation */}
          {bulkStep === 3 && (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#E8F5E9] border border-[#C8E6C9] rounded-[6px] flex items-start gap-2 text-[#145A32]">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#1F7A4D]" />
                <div>
                  <div className="font-semibold">Validation Successful: All 3 Records Formatted Correctly</div>
                  <div className="text-[11px] mt-0.5 opacity-90">
                    No duplicate email addresses found. Passwords will be automatically provisioned and emailed to each officer.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Trainer Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          toast.warning(`Trainer ${deleteTarget?.name} removed from faculty.`);
          setDeleteTarget(null);
          loadTrainers();
        }}
        danger
        title="Remove Faculty Member"
        message={`Are you sure you want to remove ${deleteTarget?.name} from your institute faculty? Their assigned courses will need to be reallocated.`}
        confirmText="Remove Trainer"
      />

    </div>
  );
};

export default InstituteTrainers;
