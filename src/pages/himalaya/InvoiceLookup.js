import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import { Input, Button } from 'reactstrap';
import PageShell from '../../components/PageShell/PageShell';
import Widget from '../../components/Widget/Widget';
import InvoiceView from '../../components/invoice/InvoiceView';
import { invoiceApi } from '../../services/api/invoiceApi';

function InvoiceLookup({ history }) {
  const [query, setQuery] = useState('');
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (event) => {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;

    setLoading(true);
    setError('');
    setInvoice(null);

    try {
      const data = await invoiceApi.lookupByNumber(value);
      if (!data) {
        setError('No invoice found for that number.');
        return;
      }
      setInvoice(data);
    } catch (lookupError) {
      setError(lookupError.message || 'Could not look up that invoice.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell title="Invoice Lookup" subtitle="Search and verify customer invoices by number">
      <Widget className="mb-4">
        <form className="d-flex flex-wrap gap-2" onSubmit={handleSearch}>
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value.toUpperCase())}
            placeholder="Enter invoice number, e.g. HSW-8K2P4M7N"
            className="bg-custom-dark border-0 flex-grow-1"
          />
          <Button color="primary" type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Find invoice'}
          </Button>
          {invoice && (
          <Button
              color="secondary"
              type="button"
              onClick={() => history.push(`/invoice/${invoice.invoice_number || query.trim()}`)}
            >
              Open public link
            </Button>
          )}
        </form>
        {error && <p className="text-danger mt-3 mb-0">{error}</p>}
      </Widget>

      {invoice && <InvoiceView invoice={invoice} />}
    </PageShell>
  );
}

export default withRouter(InvoiceLookup);
