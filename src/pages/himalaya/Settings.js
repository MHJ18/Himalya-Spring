import React, { useState } from 'react';
import { Row, Col, Button, FormGroup, Label, Input, CustomInput, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { toast } from 'react-toastify';
import PageShell from '../../components/PageShell/PageShell';
import Widget from '../../components/Widget';
import { useSettings } from '../../context/SettingsContext';
import { useCustomers } from '../../context/CustomerContext';
import { loadFromStorage, removeFromStorage } from '../../utils/storage';
import { STORAGE_KEYS } from '../../data/constants';
import { exportCustomersToCsv, exportSalesToCsv } from '../../utils/exportCsv';
import { isCloudSyncConfigured } from '../../services/cloud/supabaseSync';

export default function Settings() {
  const { settings, updateSettings, toggleDarkMode } = useSettings();
  const { customers } = useCustomers();
  const [confirmClear, setConfirmClear] = useState(false);
  const [cloudStatus] = useState(loadFromStorage(STORAGE_KEYS.CLOUD_SYNC_STATUS, {
    status: isCloudSyncConfigured() ? 'pending' : 'local',
    message: isCloudSyncConfigured() ? 'Cloud sync is configured' : 'Cloud sync is not configured',
  }));
  const [form, setForm] = useState({
    businessName: settings.businessName,
    businessPhone: settings.businessPhone,
    businessAddress: settings.businessAddress,
  });

  const handleSave = (e) => {
    e.preventDefault();
    updateSettings(form);
    toast.success('Settings saved');
  };

  const handleClear = () => {
    removeFromStorage(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem('ws_seeded_v2');
    window.location.reload();
  };

  return (
    <PageShell title="Settings" subtitle="Business profile and preferences">
      <Row>
        <Col lg={6}>
          <Widget title={<h5>Appearance</h5>} close>
            <CustomInput type="switch" id="darkMode" label="Dark mode" checked={settings.darkMode} onChange={toggleDarkMode} />
          </Widget>
          <Widget title={<h5>Business Profile</h5>} className="mt-4" refresh>
            <form onSubmit={handleSave}>
              <FormGroup><Label>Business Name</Label><Input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} /></FormGroup>
              <FormGroup><Label>Phone</Label><Input value={form.businessPhone} onChange={(e) => setForm({ ...form, businessPhone: e.target.value })} /></FormGroup>
              <FormGroup><Label>Address</Label><Input type="textarea" value={form.businessAddress} onChange={(e) => setForm({ ...form, businessAddress: e.target.value })} /></FormGroup>
              <Button color="primary" type="submit">Save</Button>
            </form>
          </Widget>
        </Col>
        <Col lg={6}>
          <Widget title={<h5>Cloud & CSV Storage</h5>} className="mb-4 cloud-storage-card">
            <div className="cloud-storage-status">
              <span className={`cloud-status-dot ${cloudStatus.status}`} />
              <div>
                <strong>{isCloudSyncConfigured() ? 'Supabase cloud sync ready' : 'Local storage mode'}</strong>
                <p>{cloudStatus.message}</p>
              </div>
            </div>
            <p className="text-muted mb-3">
              Customer and sales data are saved locally, mirrored as CSV, and synced to Supabase when environment keys are configured.
            </p>
            <div className="cloud-storage-actions">
              <Button color="info" onClick={() => exportCustomersToCsv(customers)}>
                <i className="fa fa-download mr-1" /> Customers CSV
              </Button>
              <Button color="info" outline onClick={() => exportSalesToCsv(customers)}>
                <i className="fa fa-download mr-1" /> Sales CSV
              </Button>
            </div>
          </Widget>
          <Widget title={<h5 className="text-danger">Danger Zone</h5>}>
            <p className="text-muted">Clear all customers and sales from local storage.</p>
            <Button color="danger" onClick={() => setConfirmClear(true)}>Clear All Data</Button>
          </Widget>
        </Col>
      </Row>
      <Modal isOpen={confirmClear} toggle={() => setConfirmClear(false)}>
        <ModalHeader toggle={() => setConfirmClear(false)}>Clear all data?</ModalHeader>
        <ModalBody>This will permanently delete all local customer and sales data.</ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setConfirmClear(false)}>Cancel</Button>
          <Button color="danger" onClick={handleClear}>Clear</Button>
        </ModalFooter>
      </Modal>
    </PageShell>
  );
}
