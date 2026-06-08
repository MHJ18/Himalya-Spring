import React, { useState, useMemo } from 'react';
import { Row, Col, Progress, Table, Label, Input } from 'reactstrap';
import AnimateNumber from 'react-animated-number';
import Widget from '../../components/Widget';
import Calendar from '../dashboard/components/calendar/Calendar';
import Map from '../dashboard/components/am4chartMap/am4chartMap';
import Rickshaw from '../dashboard/components/rickshaw/Rickshaw';
import { useAnalytics } from '../../context/AnalyticsContext';
import { useCustomers } from '../../context/CustomerContext';
import { formatCurrency } from '../../utils/formatters';
import s from '../dashboard/Dashboard.module.scss';
import peopleA1 from '../../assets/people/a1.jpg';
import peopleA2 from '../../assets/people/a2.jpg';
import peopleA4 from '../../assets/people/a4.jpg';
import peopleA5 from '../../assets/people/a5.jpg';

export default function Dashboard() {
  const {
    loading, revenueThisMonth, bottlesSoldToday, activeCustomers, totalCustomers,
    monthStats, todayStats, recentTransactions,
  } = useAnalytics();
  const { customers } = useCustomers();
  const [checkedArr, setCheckedArr] = useState([false, false, false]);

  const monthGrowth = useMemo(() => {
    if (!totalCustomers) return 0;
    return Math.min(99, Math.round((activeCustomers / totalCustomers) * 100));
  }, [activeCustomers, totalCustomers]);

  const checkTable = (id) => {
    let arr = [...checkedArr];
    if (id === 0) arr = arr.map(() => !arr[0]);
    else { arr[id] = !arr[id]; }
    if (arr[0]) {
      let count = 1;
      for (let i = 1; i < arr.length; i++) if (arr[i]) count += 1;
      if (count !== arr.length) arr[0] = false;
    }
    setCheckedArr(arr);
  };

  if (loading) {
    return (
      <div className={s.root}>
        <h1 className="page-title">Dashboard</h1>
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  const tableRows = recentTransactions.slice(0, 3);

  return (
    <div className={s.root}>
      <h1 className="page-title">
        Dashboard &nbsp;
        <small><small>Himaliya Spring Water</small></small>
      </h1>

      <Row>
        <Col lg={7}><Widget className="bg-transparent"><Map customers={customers} /></Widget></Col>
        <Col lg={1} />
        <Col lg={4}>
          <Widget className="bg-transparent" title={<h5>Delivery <span className="fw-semi-bold">&nbsp;Overview</span></h5>} settings refresh close>
            <p>Status: <strong>Live</strong></p>
            <p><span className="circle bg-default text-white"><i className="fa fa-tint" /></span> &nbsp; {totalCustomers} Customers · {activeCustomers} Active</p>
            <div className="row progress-stats">
              <div className="col-md-9 col-12">
                <h6 className="name fw-semi-bold">Monthly Revenue</h6>
                <p className="description deemphasize mb-xs text-white">{formatCurrency(revenueThisMonth)}</p>
                <Progress color="primary" value={monthGrowth} className="bg-subtle-blue progress-xs" />
              </div>
              <div className="col-md-3 col-12 text-center">
                <span className="status rounded rounded-lg bg-default text-light"><small><AnimateNumber value={monthGrowth} />%</small></span>
              </div>
            </div>
            <div className="row progress-stats">
              <div className="col-md-9 col-12">
                <h6 className="name fw-semi-bold">Bottles Sold Today</h6>
                <p className="description deemphasize mb-xs text-white">{bottlesSoldToday} bottles</p>
                <Progress color="success" value={Math.min(100, bottlesSoldToday * 2)} className="bg-subtle-blue progress-xs" />
              </div>
              <div className="col-md-3 col-12 text-center">
                <span className="status rounded rounded-lg bg-default text-light"><small><AnimateNumber value={bottlesSoldToday} /></small></span>
              </div>
            </div>
            <div className="row progress-stats">
              <div className="col-md-9 col-12">
                <h6 className="name fw-semi-bold">Orders Today</h6>
                <p className="description deemphasize mb-xs text-white">{todayStats.totalOrders} transactions</p>
                <Progress color="danger" value={60} className="bg-subtle-blue progress-xs" />
              </div>
              <div className="col-md-3 col-12 text-center">
                <span className="status rounded rounded-lg bg-default text-light"><small><AnimateNumber value={todayStats.totalOrders} /></small></span>
              </div>
            </div>
          </Widget>
        </Col>
      </Row>

      <Row>
        <Col lg={6} xl={4} xs={12}>
          <Widget title={<h6> USERBASE GROWTH </h6>} close settings>
            <div className="stats-row">
              <div className="stat-item"><h6 className="name">Total</h6><p className="value">{formatCurrency(revenueThisMonth)}</p></div>
              <div className="stat-item"><h6 className="name">Orders</h6><p className="value">{monthStats.totalOrders}</p></div>
              <div className="stat-item"><h6 className="name">Bottles</h6><p className="value">{monthStats.totalBottles}</p></div>
            </div>
            <Progress color="success" value="70" className="bg-subtle-blue progress-xs" />
            <p><small><span className="circle bg-default text-white mr-2"><i className="fa fa-chevron-up" /></span></small>
              <span className="fw-semi-bold">&nbsp;{totalCustomers} customers</span> registered</p>
          </Widget>
        </Col>
        <Col lg={6} xl={4} xs={12}>
          <Widget title={<h6> TRAFFIC VALUES </h6>} close settings>
            <div className="stats-row">
              <div className="stat-item"><h6 className="name">Revenue</h6><p className="value">{formatCurrency(todayStats.totalRevenue)}</p></div>
              <div className="stat-item"><h6 className="name">Orders</h6><p className="value">{todayStats.totalOrders}</p></div>
              <div className="stat-item"><h6 className="name">Bottles</h6><p className="value">{todayStats.totalBottles}</p></div>
            </div>
            <Progress color="danger" value="60" className="bg-subtle-blue progress-xs" />
            <p><small><span className="circle bg-default text-white mr-2"><i className="fa fa-chevron-down" /></span></small>
              <span className="fw-semi-bold">&nbsp;{bottlesSoldToday} bottles</span> sold today</p>
          </Widget>
        </Col>
        <Col lg={6} xl={4} xs={12}>
          <Widget title={<h6> RANDOM VALUES </h6>} close settings>
            <div className="stats-row">
              <div className="stat-item"><h6 className="name fs-sm">Active</h6><p className="value">{activeCustomers}</p></div>
              <div className="stat-item"><h6 className="name fs-sm">Total</h6><p className="value">{totalCustomers}</p></div>
              <div className="stat-item"><h6 className="name fs-sm">Today</h6><p className="value">{todayStats.totalOrders}</p></div>
            </div>
            <Progress color="bg-primary" value="60" className="bg-subtle-blue progress-xs" />
            <p><small><span className="circle bg-default text-white mr-2"><i className="fa fa-plus" /></span></small>
              <span className="fw-semi-bold">&nbsp;{formatCurrency(monthStats.totalRevenue)}</span> monthly revenue</p>
          </Widget>
        </Col>
      </Row>

      <Row>
        <Col lg={4} xs={12}>
          <Widget title={<h6><span className="badge badge-success mr-2">New</span> Messages</h6>} refresh close>
            <div className="widget-body undo_padding">
              <div className="list-group list-group-lg">
                {recentTransactions.slice(0, 4).map((t, i) => {
                  const cust = customers.find((c) => c.id === t.customerId);
                  const avatars = [peopleA2, peopleA4, peopleA1, peopleA5];
                  return (
                    <button key={t.id} type="button" className="list-group-item text-left">
                      <span className="thumb-sm float-left mr">
                        <img className="rounded-circle" src={cust?.photo || avatars[i % 4]} alt="" />
                        <i className="status status-bottom bg-success" />
                      </span>
                      <div>
                        <h6 className="m-0">{t.customerName}</h6>
                        <p className="help-block text-ellipsis m-0">{t.bottleType} × {t.quantity} — {formatCurrency(t.totalAmount)}</p>
                      </div>
                    </button>
                  );
                })}
                {!recentTransactions.length && <p className="p-3 text-muted mb-0">No sales yet</p>}
              </div>
            </div>
          </Widget>
        </Col>
        <Col lg={4} xs={12}>
          <Widget title={<h6>Market <span className="fw-semi-bold">Stats</span></h6>} close>
            <div className="widget-body">
              <h3>{formatCurrency(monthStats.totalRevenue)}</h3>
              <p className="fs-mini text-muted mb mt-sm">Monthly orders: <span className="fw-semi-bold">{monthStats.totalOrders}</span></p>
            </div>
            <div className={`widget-table-overflow ${s.table}`}>
              <Table striped size="sm">
                <thead className="no-bd">
                  <tr>
                    <th><div className="checkbox abc-checkbox"><Input className="mt-0" id="cb0" type="checkbox" onClick={() => checkTable(0)} checked={checkedArr[0]} readOnly /> <Label for="cb0" /></div></th>
                    <th>Customer</th>
                    <th className="text-align-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((t, idx) => (
                    <tr key={t.id}>
                      <td><div className="checkbox abc-checkbox"><Input className="mt-0" id={`cb${idx + 1}`} type="checkbox" onClick={() => checkTable(idx + 1)} checked={checkedArr[idx + 1]} readOnly /> <Label for={`cb${idx + 1}`} /></div></td>
                      <td>{t.customerName}</td>
                      <td className="text-align-right fw-semi-bold">{formatCurrency(t.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            <div className="widget-body mt-xlg chart-overflow-bottom" style={{ height: 100 }}><Rickshaw height={100} /></div>
          </Widget>
        </Col>
        <Col lg={4} xs={12}>
          <Widget title={<h6>Calendar</h6>} settings close bodyClass="pt-2 px-0 py-0">
            <Calendar />
            <div className="list-group fs-mini">
              <button type="button" className="list-group-item text-ellipsis"><span className="badge badge-pill badge-primary float-right">AM</span>Morning delivery route</button>
              <button type="button" className="list-group-item text-ellipsis"><span className="badge badge-pill badge-success float-right">PM</span>Evening collection</button>
            </div>
          </Widget>
        </Col>
      </Row>
    </div>
  );
}
