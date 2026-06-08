import React from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  Alert, Button, FormGroup, Label,
  InputGroup, InputGroupAddon, Input, InputGroupText,
} from 'reactstrap';
import { loginUser } from '../../actions/user';
import './WaterLogin.css';

function WaterLogin({ dispatch, isFetching, errorMessage, location }) {
  const [email, setEmail] = React.useState('admin@himaliya.com');
  const [password, setPassword] = React.useState('admin123');
  const from = (location.state && location.state.from) || { pathname: '/app/main/dashboard' };

  if (WaterLogin.isAuthenticated(JSON.parse(localStorage.getItem('authenticated')))) {
    return <Redirect to={from} />;
  }

  return (
    <main className="water-login-page">
      <div className="water-login-shell">
        <section className="water-login-copy">
          <span className="water-login-badge">Secure admin access</span>
          <h1>Sign in and keep the water moving.</h1>
          <p>
            A focused workspace for customer records, daily sales entry, monthly analytics, and delivery tracking.
          </p>
          <div className="water-login-stats">
            <span><strong>Fast</strong> daily entries</span>
            <span><strong>Local</strong> demo data</span>
            <span><strong>Clean</strong> admin view</span>
          </div>
        </section>

        <section className="water-login-card">
          <div className="water-login-logo">
            <span className="water-login-logo-mark">HS</span>
            <div>
              <h2>Himaliya Springs</h2>
              <p>Admin dashboard</p>
            </div>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); dispatch(loginUser({ email, password })); }}>
            {errorMessage && (
              <Alert className="alert-sm rounded" color="danger">{errorMessage}</Alert>
            )}
            <FormGroup>
              <Label for="email">Email address</Label>
              <InputGroup className="water-login-field">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText><i className="la la-user" /></InputGroupText>
                </InputGroupAddon>
                <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="admin@himaliya.com" required />
              </InputGroup>
            </FormGroup>
            <FormGroup>
              <Label for="password">Password</Label>
              <InputGroup className="water-login-field">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText><i className="la la-lock" /></InputGroupText>
                </InputGroupAddon>
                <Input id="password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Enter password" required />
              </InputGroup>
            </FormGroup>
            <Button type="submit" className="water-login-submit">
              {isFetching ? 'Signing in...' : 'Sign in to dashboard'}
            </Button>
            <p className="water-login-note">Default admin: admin@himaliya.com / admin123</p>
          </form>
          <Link className="water-login-back" to="/">Back to landing</Link>
        </section>
      </div>
    </main>
  );
}

WaterLogin.isAuthenticated = (token) => !!token;
WaterLogin.propTypes = {
  dispatch: PropTypes.func.isRequired,
  isFetching: PropTypes.bool,
  errorMessage: PropTypes.string,
  location: PropTypes.object.isRequired,
};

WaterLogin.defaultProps = {
  isFetching: false,
  errorMessage: null,
};

export default withRouter(connect((state) => ({
  isFetching: state.auth.isFetching,
  errorMessage: state.auth.errorMessage,
}))(WaterLogin));
