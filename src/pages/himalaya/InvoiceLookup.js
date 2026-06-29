import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import { Input, Button } from 'reactstrap';
import PageShell from '../../components/PageShell/PageShell';
import Widget from '../../components/Widget/Widget';
import InvoiceView from '../../components/invoice/InvoiceView';
import { invoiceApi } from '../../services/api/invoiceApi';
import { Search, ExternalLink, FileText, Loader2 } from 'lucide-react';
import './InvoiceLookup.css';

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
      const data = await invoiceApi.lookupByNumber(value, { authenticatedFallback: true });
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
      <Widget className="mb-4 invoice-lookup-card">
        <div className="invoice-lookup-card__intro">
          <span className="invoice-lookup-card__icon" aria-hidden="true"><FileText size={24} /></span>
          <div>
            <h2>Find a customer invoice</h2>
            <p>Enter the invoice reference exactly as it appears on the customer bill.</p>
          </div>
        </div>
        <form className="invoice-lookup-form" onSubmit={handleSearch}>
          <label className="sr-only" htmlFor="invoice-number">Invoice number</label>
          <div className="invoice-lookup-form__control">
            <Search size={20} aria-hidden="true" />
            <Input
              id="invoice-number"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value.toUpperCase())}
              placeholder="e.g. HSW-8K2P4M7N"
              autoComplete="off"
              aria-describedby={error ? 'invoice-lookup-error' : undefined}
            />
          </div>
          <Button color="primary" type="submit" disabled={loading || !query.trim()}>
            {loading ? <><Loader2 className="invoice-search-spinner" size={18} aria-hidden="true" /> Searching…</> : 'Find invoice'}
          </Button>
        </form>
        {loading && (
          <div className="invoice-lookup-loading" role="status" aria-live="polite">
            <span className="invoice-lookup-loading__pulse" aria-hidden="true" />
            Searching securely for invoice {query.trim()}…
          </div>
        )}
        {error && <p id="invoice-lookup-error" role="alert" className="invoice-lookup-error">{error}</p>}
        {invoice && (
          <div className="invoice-lookup-card__result">
            <span>Invoice found and verified</span>
            <Button
              color="link"
              type="button"
              onClick={() => history.push(`/invoice/${invoice.invoice_number || query.trim()}`)}
            >
              Open public view <ExternalLink size={16} aria-hidden="true" />
            </Button>
          </div>
        )}
      </Widget>

      {invoice && <InvoiceView invoice={invoice} />}
    </PageShell>
  );
}

export default withRouter(InvoiceLookup);
