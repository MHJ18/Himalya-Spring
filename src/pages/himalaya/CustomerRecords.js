import React, { useState, useMemo, useEffect } from 'react';
import { Row, Col, Input, Button, ButtonGroup } from 'reactstrap';
import PageShell from '../../components/PageShell/PageShell';
import Widget from '../../components/Widget';
import CustomerSummary from '../../components/common/CustomerSummary';
import PurchaseHistoryTable from '../../components/tables/PurchaseHistoryTable';
import { useCustomers } from '../../context/CustomerContext';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagination } from '../../hooks/usePagination';
import { FILTER_PERIODS } from '../../data/constants';
import { filterTransactionsByPeriod, computePurchaseStats } from '../../utils/analytics';
import { formatCurrency } from '../../utils/formatters';
import { exportCustomerHistoryPdf } from '../../utils/exportPdf';
import { getCustomerAvatar } from '../../utils/customerPhotos';

export default function CustomerRecords() {
  const { customers, loading, searchCustomers } = useCustomers();
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [period, setPeriod] = useState(FILTER_PERIODS.MONTHLY);
  const debouncedQuery = useDebounce(query);
  const filtered = useMemo(() => searchCustomers(debouncedQuery), [searchCustomers, debouncedQuery]);
  const { paginatedItems, page, totalPages, goToPage, resetPage } = usePagination(filtered, 8);

  useEffect(() => { resetPage(); }, [debouncedQuery, resetPage]);

  const selected = customers.find((c) => c.id === selectedId);
  const periodStats = useMemo(() => {
    if (!selected) return null;
    return computePurchaseStats(filterTransactionsByPeriod(selected.purchaseHistory || [], period));
  }, [selected, period]);

  const displayHistory = useMemo(() => {
    if (!selected) return [];
    const sorted = [...(selected.purchaseHistory || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
    return filterTransactionsByPeriod(sorted, period);
  }, [selected, period]);

  if (loading) return <PageShell title="Customer Records"><p className="text-muted">Loading...</p></PageShell>;

  return (
    <PageShell title="Customer Records" subtitle="Search and view purchase history">
      <Widget className="mb-4">
        <Input type="search" placeholder="Search by name or phone..." value={query} onChange={(e) => setQuery(e.target.value)} className="bg-custom-dark border-0" />
      </Widget>
      <Row>
        <Col lg={4}>
          <Widget title={<h6>Customers ({filtered.length})</h6>} close bodyClass="p-0">
            <div className="list-group list-group-lg mb-0">
              {paginatedItems.length === 0 ? (
                <p className="text-muted p-3 mb-0">No customers found</p>
              ) : paginatedItems.map((c, idx) => (
                <button key={c.id} type="button" className={`list-group-item list-group-item-action text-left border-0 ${selectedId === c.id ? 'active' : ''}`} onClick={() => setSelectedId(c.id)}>
                  <span className="thumb-sm float-left mr">
                    <img className="rounded-circle" src={c.photo || getCustomerAvatar(idx)} alt="" width={40} height={40} />
                    <i className="status status-bottom bg-success" />
                  </span>
                  <div><h6 className="m-0">{c.name}</h6><small className="text-muted">{c.phone}</small></div>
                </button>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="d-flex justify-content-between p-3 border-top border-light">
                <Button size="sm" color="primary" disabled={page <= 1} onClick={() => goToPage(page - 1)}>Prev</Button>
                <span className="align-self-center small">{page} / {totalPages}</span>
                <Button size="sm" color="primary" disabled={page >= totalPages} onClick={() => goToPage(page + 1)}>Next</Button>
              </div>
            )}
          </Widget>
        </Col>
        <Col lg={8}>
          {!selected ? (
            <Widget title={<h6>Details</h6>}><p className="text-muted mb-0">Select a customer to view details.</p></Widget>
          ) : (
            <>
              <CustomerSummary customer={selected} />
              <Widget className="mt-4 customer-record-tools" title={<h6>Filter & Export</h6>}>
                <div className="customer-record-toolbar">
                  <ButtonGroup className="customer-record-filter">
                  {Object.values(FILTER_PERIODS).map((p) => (
                    <Button key={p} color={period === p ? 'primary' : 'secondary'} size="sm" onClick={() => setPeriod(p)} className="text-capitalize">{p}</Button>
                  ))}
                  </ButtonGroup>
                  <Button color="info" size="sm" className="customer-export-btn" onClick={() => exportCustomerHistoryPdf(selected)}>
                    <i className="fa fa-download mr-1" /> Export PDF
                  </Button>
                </div>
                {periodStats && (
                  <Row className="mt-4">
                    <Col xs={6} md={3}><small className="text-muted d-block">Orders</small><span className="fw-bold">{periodStats.totalOrders}</span></Col>
                    <Col xs={6} md={3}><small className="text-muted d-block">Bottles</small><span className="fw-bold">{periodStats.totalBottles}</span></Col>
                    <Col xs={6} md={3}><small className="text-muted d-block">Top Type</small><span className="fw-bold">{periodStats.mostPurchased}</span></Col>
                    <Col xs={6} md={3}><small className="text-muted d-block">Revenue</small><span className="fw-bold">{formatCurrency(periodStats.totalRevenue)}</span></Col>
                  </Row>
                )}
              </Widget>
              <Widget className="mt-4" title={<h6>Purchase History ({displayHistory.length})</h6>} refresh bodyClass="p-0">
                <div className="p-3"><PurchaseHistoryTable transactions={displayHistory} /></div>
              </Widget>
            </>
          )}
        </Col>
      </Row>
    </PageShell>
  );
}
