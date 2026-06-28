import React, { useEffect, useState } from 'react';
import {
  Row, Col, Button, FormGroup, Label, Input, Table, Badge, Alert,
} from 'reactstrap';
import { toast } from 'react-toastify';
import PageShell from '../../components/PageShell/PageShell';
import Widget from '../../components/Widget/Widget';
import {
  createAdmin, deleteAdminWithOwnerPassword, getAdmins, getCurrentAdminProfile,
} from '../../utils/adminAuth';

const initialForm = {
  name: '',
  email: '',
  password: '',
  role: 'Admin',
};

export default function AdminUsers() {
  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [ownerPassword, setOwnerPassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [currentAdmin, setCurrentAdmin] = useState(null);

  useEffect(() => {
    getAdmins().then(setAdmins).catch(() => setAdmins([]));
    getCurrentAdminProfile().then(setCurrentAdmin).catch(() => setCurrentAdmin(null));
  }, []);

  const updateForm = (field, value) => {
    setError('');
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Name, email, and password are required.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      const admin = await createAdmin(form);
      setAdmins((current) => [...current, admin]);
      setForm(initialForm);
      toast.success('Admin created');
    } catch (err) {
      setError(err.message || 'Could not create admin.');
    }
  };

  const openDeleteModal = (admin) => {
    setDeleteTarget(admin);
    setOwnerPassword('');
    setDeleteError('');
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
    setOwnerPassword('');
    setDeleteError('');
  };

  const handleDeleteAdmin = async () => {
    if (!deleteTarget) return;
    if (!ownerPassword) {
      setDeleteError('Enter the owner password to delete this admin.');
      return;
    }

    try {
      const nextAdmins = await deleteAdminWithOwnerPassword(deleteTarget.id, ownerPassword);
      setAdmins(nextAdmins);
      toast.success('Admin deleted');
      closeDeleteModal();
    } catch (err) {
      setDeleteError(err.message || 'Could not delete admin.');
    }
  };

  return (
    <PageShell title="Create Admin" subtitle="Register dashboard admins and manage access">
      <Row>
        <Col xl={5} lg={6}>
          <Widget title={<h5>New Admin</h5>} className="admin-access-card">
            <div className="admin-access-intro">
              <span className="admin-access-icon"><i className="fa fa-shield" /></span>
              <div>
                <h4>Dashboard access only</h4>
                <p>Only admins created here can sign in to the Himaliya Springs dashboard.</p>
              </div>
            </div>
            {error && <Alert color="danger" className="alert-sm">{error}</Alert>}
            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Label for="admin-name">Full Name</Label>
                <Input
                  id="admin-name"
                  value={form.name}
                  onChange={(e) => updateForm('name', e.target.value)}
                  placeholder="e.g. Hassan Admin"
                />
              </FormGroup>
              <FormGroup>
                <Label for="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateForm('email', e.target.value)}
                  placeholder="admin@example.com"
                />
              </FormGroup>
              <FormGroup>
                <Label for="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={form.password}
                  onChange={(e) => updateForm('password', e.target.value)}
                  placeholder="Minimum 6 characters"
                />
              </FormGroup>
              <FormGroup>
                <Label for="admin-role">Role</Label>
                <Input
                  id="admin-role"
                  type="select"
                  value={form.role}
                  onChange={(e) => updateForm('role', e.target.value)}
                >
                  <option>Admin</option>
                  <option>Manager</option>
                  <option>Owner</option>
                </Input>
              </FormGroup>
              <Button color="primary" type="submit" className="admin-access-submit">
                Create Admin
              </Button>
            </form>
          </Widget>
        </Col>
        <Col xl={7} lg={6}>
          <Widget title={<h5>Active Admins</h5>} className="admin-list-card">
            <div className="table-responsive">
              <Table className="admin-users-table mb-0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr key={admin.id}>
                      <td>
                        <div className="admin-user-cell">
                          <span>{admin.name.charAt(0).toUpperCase()}</span>
                          <strong>{admin.name}</strong>
                        </div>
                      </td>
                      <td>{admin.email}</td>
                      <td>{admin.role}</td>
                      <td><Badge color="success">Allowed</Badge></td>
                      <td className="text-right">
                        <Button
                          color="danger"
                          size="sm"
                          outline
                          className="admin-delete-btn"
                          disabled={currentAdmin && currentAdmin.id === admin.id}
                          onClick={() => openDeleteModal(admin)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            {deleteTarget && (
              <div className={`admin-delete-panel ${deleteError ? 'is-invalid' : ''}`}>
                <div className="admin-delete-panel-head">
                  <span className="admin-delete-icon"><i className="fa fa-lock" /></span>
                  <div>
                    <h4>Confirm admin removal</h4>
                    <p>
                      Enter the owner password to delete <strong>{deleteTarget.name}</strong>.
                    </p>
                  </div>
                </div>
                <Row form className="align-items-end">
                  <Col md={7}>
                    <FormGroup className="mb-md-0">
                      <Label for="owner-password">Owner Password</Label>
                      <Input
                        id="owner-password"
                        type="password"
                        value={ownerPassword}
                        className={deleteError ? 'is-invalid' : ''}
                        onChange={(e) => {
                          setOwnerPassword(e.target.value);
                          setDeleteError('');
                        }}
                        placeholder="Enter owner password"
                      />
                    </FormGroup>
                  </Col>
                  <Col md={5}>
                    <div className="admin-delete-actions">
                      <Button color="secondary" outline onClick={closeDeleteModal}>Cancel</Button>
                      <Button color="danger" onClick={handleDeleteAdmin}>Delete Admin</Button>
                    </div>
                  </Col>
                </Row>
              </div>
            )}
          </Widget>
        </Col>
      </Row>
    </PageShell>
  );
}
