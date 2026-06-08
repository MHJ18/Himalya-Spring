import React, { useState } from 'react';
import { Button, FormGroup, Label, Input, FormFeedback, Row, Col } from 'reactstrap';
import { DEFAULT_COUNTRY_CODE, BOTTLE_TYPES } from '../../data/constants';
import { validateCustomerForm, normalizePhone } from '../../utils/validation';

const initial = { name: '', phone: DEFAULT_COUNTRY_CODE, address: '', email: '', photo: '' };

export default function CustomerFormBootstrap({ onSubmit, loading }) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validateCustomerForm(form);
    if (Object.keys(err).length) { setErrors(err); return; }
    onSubmit(form);
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setForm((p) => ({ ...p, photo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Row className="mb-4">
        <Col xs="12" className="text-center">
          {preview ? (
            <img src={preview} alt="" className="rounded-circle" width={96} height={96} />
          ) : (
            <span className="circle bg-primary text-white d-inline-flex align-items-center justify-content-center" style={{ width: 96, height: 96 }}>
              <i className="fa fa-user fa-2x" />
            </span>
          )}
          <FormGroup className="mt-2">
            <Label className="btn btn-sm btn-primary mb-0">
              Upload Photo
              <Input type="file" accept="image/*" className="d-none" onChange={handleImage} />
            </Label>
          </FormGroup>
        </Col>
      </Row>
      <FormGroup>
        <Label>Full Name *</Label>
        <Input name="name" value={form.name} onChange={handleChange} invalid={!!errors.name} />
        <FormFeedback>{errors.name}</FormFeedback>
      </FormGroup>
      <FormGroup>
        <Label>Phone (+92) *</Label>
        <Input name="phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: normalizePhone(e.target.value) }))} invalid={!!errors.phone} />
        <FormFeedback>{errors.phone}</FormFeedback>
      </FormGroup>
      <FormGroup>
        <Label>Address *</Label>
        <Input type="textarea" name="address" value={form.address} onChange={handleChange} invalid={!!errors.address} />
        <FormFeedback>{errors.address}</FormFeedback>
      </FormGroup>
      <FormGroup>
        <Label>Email</Label>
        <Input name="email" type="email" value={form.email} onChange={handleChange} invalid={!!errors.email} />
        <FormFeedback>{errors.email}</FormFeedback>
      </FormGroup>
      <Button color="primary" type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Add Customer'}
      </Button>
    </form>
  );
}
