import React, { useState } from 'react';
import { Search, Filter, Plus, Phone, Mail, MapPin, Briefcase, Calendar } from 'lucide-react';
import styles from './HROverview.module.css';
import DataTable from '../../../../components/dashboard/shared/DataTable';
import ActionModal from '../../../../components/dashboard/shared/ActionModal';

const EmployeeList: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const columns = [
        { key: 'name', label: 'Employee Name' },
        { key: 'role', label: 'Role / Designation' },
        { key: 'department', label: 'Department' },
        { key: 'status', label: 'Status' },
        { key: 'joinDate', label: 'Join Date' },
    ];

    const mockEmployees = [
        { id: '1', name: 'John Doe', role: 'Senior Support Agent', department: 'Customer Support', status: 'Active', joinDate: '2022-01-15' },
        { id: '2', name: 'Jane Smith', role: 'Telecaller', department: 'Operations', status: 'Active', joinDate: '2022-06-20' },
        { id: '3', name: 'Mike Johnson', role: 'Finance Analyst', department: 'Finance', status: 'On Leave', joinDate: '2021-11-10' },
        { id: '4', name: 'Sarah Williams', role: 'HR Manager', department: 'Human Resources', status: 'Active', joinDate: '2020-05-05' },
        { id: '5', name: 'David Brown', role: 'Marketing Lead', department: 'Marketing', status: 'Probation', joinDate: '2023-09-01' },
        { id: '6', name: 'Emily Davis', role: 'Data Entry Clerk', department: 'Operations', status: 'Active', joinDate: '2023-01-10' },
    ];

    const filteredEmployees = mockEmployees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsAddModalOpen(false);
        // Toast placeholder
    };

    return (
        <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
                <div>
                    <h2 className={styles.sectionTitle}>Employee Directory</h2>
                    <p className={styles.sectionSubtitle}>Manage all staff profiles and records.</p>
                </div>
                <button className={styles.primaryBtn} onClick={() => setIsAddModalOpen(true)}>
                    <Plus size={16} /> Add Employee
                </button>
            </div>

            <div className={styles.filtersRow}>
                <div className={styles.searchBox}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
                <div className={styles.filterBox}>
                    <Filter size={18} className={styles.filterIcon} />
                    <select className={styles.filterSelect}>
                        <option value="all">All Departments</option>
                        <option value="hr">Human Resources</option>
                        <option value="finance">Finance</option>
                        <option value="operations">Operations</option>
                    </select>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={filteredEmployees}
                onEdit={(row) => console.log('Edit', row)}
                onDelete={(row) => console.log('Delete', row)}
            />

            <ActionModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add New Employee"
            >
                <form className={styles.modalForm} onSubmit={handleAddSubmit}>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Full Name</label>
                            <input type="text" required placeholder="Alice Smith" />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Email Address</label>
                            <input type="email" required placeholder="alice@eadvocate.com" />
                        </div>
                    </div>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Department</label>
                            <select required>
                                <option value="">Select Department</option>
                                <option value="hr">Human Resources</option>
                                <option value="finance">Finance</option>
                                <option value="support">Customer Support</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Designation</label>
                            <input type="text" required placeholder="e.g. Call Support Agent" />
                        </div>
                    </div>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Join Date</label>
                            <input type="date" required />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Employment Type</label>
                            <select required>
                                <option value="fulltime">Full-Time</option>
                                <option value="parttime">Part-Time</option>
                                <option value="contract">Contractor</option>
                            </select>
                        </div>
                    </div>
                    <div className={styles.modalActions}>
                        <button type="button" className={styles.cancelBtn} onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                        <button type="submit" className={styles.submitBtn}>Save Employee</button>
                    </div>
                </form>
            </ActionModal>
        </div>
    );
};

export default EmployeeList;
