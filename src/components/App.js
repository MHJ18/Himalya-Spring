import React from 'react';
import { connect } from 'react-redux';
import { MotionConfig } from 'framer-motion';
import { BrowserRouter, Switch, Route, Redirect, withRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import ErrorPage from '../pages/error/ErrorPage';
import '../styles/theme.scss';
import LayoutComponent from './Layout/Layout';
import WaterLogin from '../pages/login/WaterLogin';
import Landing from '../pages/landing/Landing';
import PublicInvoice from '../pages/invoice/PublicInvoice';
import AppProviders from '../context/AppProviders';
import { receiveLogout } from '../actions/user';
import {
  getSessionExpiredEventName,
  hasSessionExpiredNotice,
  hasStoredSession,
} from '../services/cloud/supabaseClient';

const CloseButton = ({ closeToast }) => (
  <i onClick={closeToast} className="la la-close notifications-close" role="presentation" />
);

const PrivateRoute = ({ dispatch, component, ...rest }) => {
  if (!hasStoredSession()) {
    dispatch(receiveLogout());
    return (
      <Redirect
        to={{
          pathname: '/login',
          state: hasSessionExpiredNotice() ? { sessionExpired: true } : undefined,
        }}
      />
    );
  }
  return <Route {...rest} render={(props) => React.createElement(component, props)} />;
};

class SessionExpiryHandler extends React.PureComponent {
  componentDidMount() {
    window.addEventListener(getSessionExpiredEventName(), this.handleExpiry);
  }

  componentWillUnmount() {
    window.removeEventListener(getSessionExpiredEventName(), this.handleExpiry);
  }

  handleExpiry = () => {
    this.props.dispatch(receiveLogout());
    this.props.history.replace('/login', { sessionExpired: true });
  };

  render() { return null; }
}

const RoutedSessionExpiryHandler = withRouter(SessionExpiryHandler);

class App extends React.PureComponent {
  render() {
    return (
      <MotionConfig reducedMotion="user">
        <AppProviders>
          <ToastContainer autoClose={5000} hideProgressBar closeButton={<CloseButton />} />
          <BrowserRouter>
            <React.Fragment>
              <RoutedSessionExpiryHandler dispatch={this.props.dispatch} />
              <Switch>
                <Route path="/" exact component={Landing} />
                <Route path="/login" exact component={WaterLogin} />
                <Route path="/invoice/:invoiceNumber" exact component={PublicInvoice} />
                <PrivateRoute path="/app" dispatch={this.props.dispatch} component={LayoutComponent} />
                <PrivateRoute path="/history" exact dispatch={this.props.dispatch} component={LayoutComponent} />
                <PrivateRoute path="/messages" exact dispatch={this.props.dispatch} component={LayoutComponent} />
                <PrivateRoute path="/notifications" exact dispatch={this.props.dispatch} component={LayoutComponent} />
                <PrivateRoute path="/profile" exact dispatch={this.props.dispatch} component={LayoutComponent} />
                <Route path="/error" exact component={ErrorPage} />
                <Redirect to="/" />
              </Switch>
            </React.Fragment>
          </BrowserRouter>
        </AppProviders>
      </MotionConfig>
    );
  }
}

export default connect()(App);
