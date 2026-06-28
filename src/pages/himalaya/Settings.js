import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Button, ButtonGroup, FormGroup, Label, Input, CustomInput } from 'reactstrap';
import { toast } from 'react-toastify';
import PageShell from '../../components/PageShell/PageShell';
import Widget from '../../components/Widget/Widget';
import { useSettings } from '../../context/SettingsContext';
import { useCustomers } from '../../context/CustomerContext';
import { exportCustomersToCsv, exportSalesToCsv } from '../../utils/exportCsv';
import { isSupabaseConfigured } from '../../services/cloud/supabaseClient';
import { changeSidebarPosition, changeSidebarVisibility } from '../../actions/navigation';

export default function Settings() {
  const { settings, updateSettings, toggleDarkMode } = useSettings();
  const dispatch = useDispatch();
  const sidebarPosition = useSelector((state) => state.navigation.sidebarPosition);
  const sidebarVisibility = useSelector((state) => state.navigation.sidebarVisibility);
  const { customers } = useCustomers();
  const cloudStatus = {
    status: isSupabaseConfigured() ? 'synced' : 'error',
    message: isSupabaseConfigured() ? 'Supabase is the only data store' : 'Supabase is not configured',
  };
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

  return (
    <PageShell title="Settings" subtitle="Business profile and preferences">
      <Row>
        <Col lg={6}>
          <Widget title={<h5>Appearance</h5>} close>
            <CustomInput type="switch" id="darkMode" label="Dark mode" checked={settings.darkMode} onChange={toggleDarkMode} />
            <hr />
            <FormGroup>
              <Label className="d-block">Sidebar position</Label>
              <ButtonGroup size="sm">
                <Button color="primary" outline={sidebarPosition !== 'left'} onClick={() => dispatch(changeSidebarPosition('left'))}>Left</Button>
                <Button color="primary" outline={sidebarPosition !== 'right'} onClick={() => dispatch(changeSidebarPosition('right'))}>Right</Button>
              </ButtonGroup>
            </FormGroup>
            <FormGroup className="mb-0">
              <Label className="d-block">Sidebar visibility</Label>
              <ButtonGroup size="sm">
                <Button color="primary" outline={sidebarVisibility !== 'show'} onClick={() => dispatch(changeSidebarVisibility('show'))}>Show</Button>
                <Button color="primary" outline={sidebarVisibility !== 'hide'} onClick={() => dispatch(changeSidebarVisibility('hide'))}>Hide</Button>
              </ButtonGroup>
            </FormGroup>
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
                <strong>{isSupabaseConfigured() ? 'Supabase cloud storage ready' : 'Configuration required'}</strong>
                <p>{cloudStatus.message}</p>
              </div>
            </div>
            <p className="text-muted mb-3">
              Customers, sales, bottle prices, settings, and administrator profiles are stored in Supabase. CSV files are generated only when you export them.
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
        </Col>
      </Row>
    </PageShell>
  );
}
