import React from 'react';
import { connect } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router';
import { HashRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import ErrorPage from '../pages/error';
import '../styles/theme.scss';
import LayoutComponent from '../components/Layout';
import WaterLogin from '../pages/login/WaterLogin';
import Landing from '../pages/landing/Landing';
import AppProviders from '../context/AppProviders';
import { logoutUser } from '../actions/user';
import { getCurrentAdmin } from '../utils/adminAuth';

const CloseButton = ({ closeToast }) => (
  <i onClick={closeToast} className="la la-close notifications-close" role="presentation" />
);

const PrivateRoute = ({ dispatch, component, ...rest }) => {
  if (!WaterLogin.isAuthenticated(JSON.parse(localStorage.getItem('authenticated'))) || !getCurrentAdmin()) {
    dispatch(logoutUser());
    return <Redirect to="/login" />;
  }
  return <Route {...rest} render={(props) => React.createElement(component, props)} />;
};

class App extends React.PureComponent {
  render() {
    return (
      <AppProviders>
        <ToastContainer autoClose={5000} hideProgressBar closeButton={<CloseButton />} />
        <HashRouter>
          <Switch>
            <Route path="/" exact component={Landing} />
            <Route path="/login" exact component={WaterLogin} />
            <PrivateRoute path="/app" dispatch={this.props.dispatch} component={LayoutComponent} />
            <Route path="/error" exact component={ErrorPage} />
            <Redirect to="/" />
          </Switch>
        </HashRouter>
      </AppProviders>
    );
  }
}

export default connect()(App);
