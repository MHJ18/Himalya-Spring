import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Switch, Route, withRouter, Redirect } from 'react-router';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import Hammer from 'rc-hammerjs';

import Dashboard from '../../pages/himalaya/Dashboard';
import AddCustomer from '../../pages/himalaya/AddCustomer';
import CustomerRecords from '../../pages/himalaya/CustomerRecords';
import DailySales from '../../pages/himalaya/DailySales';
import Analytics from '../../pages/himalaya/Analytics';
import Settings from '../../pages/himalaya/Settings';
import AdminUsers from '../../pages/himalaya/AdminUsers';

import Header from '../Header';
import Sidebar from '../Sidebar';
import BreadcrumbHistory from '../BreadcrumbHistory';
import { openSidebar, closeSidebar, changeActiveSidebarItem } from '../../actions/navigation';
import s from './Layout.module.scss';

class Layout extends React.Component {
  static propTypes = {
    sidebarOpened: PropTypes.bool,
    dispatch: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.handleSwipe = this.handleSwipe.bind(this);
    this.state = { chatOpen: false };
  }

  componentDidMount() {
    this.syncSidebarActive(this.props.location.pathname);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.pathname !== this.props.location.pathname) {
      this.syncSidebarActive(this.props.location.pathname);
    }
  }

  syncSidebarActive(pathname) {
    let active = 'dashboard';
    if (pathname.includes('add-customer')) active = 'add-customer';
    else if (pathname.includes('customers')) active = 'customers';
    else if (pathname.includes('daily-sales')) active = 'daily-sales';
    else if (pathname.includes('analytics')) active = 'analytics';
    else if (pathname.includes('admins')) active = 'admins';
    else if (pathname.includes('settings')) active = 'settings';
    this.props.dispatch(changeActiveSidebarItem(active));
  }

  handleSwipe(e) {
    if ('ontouchstart' in window) {
      if (e.direction === 4) this.props.dispatch(openSidebar());
      if (e.direction === 2 && this.props.sidebarOpened) this.props.dispatch(closeSidebar());
    }
  }

  render() {
    return (
      <div className={[s.root, 'sidebar-' + this.props.sidebarPosition, 'sidebar-' + this.props.sidebarVisibility].join(' ')}>
        <div className={s.wrap}>
          <Header />
          <Sidebar />
          <Hammer onSwipe={this.handleSwipe}>
            <main className={s.content}>
              <BreadcrumbHistory url={this.props.location.pathname} />
              <TransitionGroup>
                <CSSTransition
                  key={this.props.location.pathname}
                  classNames="fade"
                  timeout={{ enter: 300, exit: 200 }}
                >
                  <Switch>
                    <Route path="/app/main" exact render={() => <Redirect to="/app/main/dashboard" />} />
                    <Route path="/app/main/dashboard" exact component={Dashboard} />
                    <Route path="/app/add-customer" exact component={AddCustomer} />
                    <Route path="/app/customers" exact component={CustomerRecords} />
                    <Route path="/app/daily-sales" exact component={DailySales} />
                    <Route path="/app/analytics" exact component={Analytics} />
                    <Route path="/app/admins" exact component={AdminUsers} />
                    <Route path="/app/settings" exact component={Settings} />
                  </Switch>
                </CSSTransition>
              </TransitionGroup>
              <footer className={s.contentFooter}>
                Himaliya Spring Water &mdash; Admin Dashboard
              </footer>
            </main>
          </Hammer>
        </div>
      </div>
    );
  }
}

function mapStateToProps(store) {
  return {
    sidebarOpened: store.navigation.sidebarOpened,
    sidebarPosition: store.navigation.sidebarPosition,
    sidebarVisibility: store.navigation.sidebarVisibility,
  };
}

export default withRouter(connect(mapStateToProps)(Layout));
