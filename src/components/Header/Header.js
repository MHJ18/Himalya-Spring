import { connect } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import {
  Navbar, Nav, NavItem, NavLink, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Badge,
} from 'reactstrap';
import HeaderSearch from './HeaderSearch';
import DarkModeToggle from './DarkModeToggle';
import BellIcon from '../Icons/HeaderIcons/BellIcon';
import MessageIcon from '../Icons/HeaderIcons/MessageIcon';
import BurgerIcon from '../Icons/HeaderIcons/BurgerIcon';
import ArrowIcon from '../Icons/HeaderIcons/ArrowIcon';
import {
  openSidebar, closeSidebar,
} from '../../actions/navigation';
import { logoutUser } from '../../actions/user';
import { getCurrentAdmin, getCurrentAdminProfile } from '../../utils/adminAuth';
import { getCustomerAvatar } from '../../utils/customerPhotos';
import s from './Header.module.scss';
import 'animate.css';

class Header extends React.Component {
  static propTypes = { dispatch: PropTypes.func.isRequired };

  constructor(props) {
    super(props);
    this.state = {
      messagesOpen: false,
      supportOpen: false,
      accountOpen: false,
      admin: getCurrentAdmin(),
    };
  }

  componentDidMount() {
    getCurrentAdminProfile().then((admin) => this.setState({ admin })).catch(() => {});
  }

  toggleSidebar = () => {
    this.props.isSidebarOpened
      ? this.props.dispatch(closeSidebar())
      : this.props.dispatch(openSidebar());
  };

  doLogout = () => {
    this.props.dispatch(logoutUser());
    this.props.history.push('/');
  };

  render() {
    const admin = this.state.admin || { name: 'Himaliya Admin', role: 'Admin', email: 'admin@himaliya.com' };
    return (
      <Navbar className="d-print-none">
        <div className={s.burger}>
          <NavLink onClick={this.toggleSidebar} className={`${s.burgerButton} ${s.navItem} text-white`} href="#" aria-label="Open menu">
            <BurgerIcon className={s.headerIcon} />
          </NavLink>
        </div>
        <span className={s.mobileBrand}>Himaliya Spring</span>
        <div className={`d-print-none ${s.root}`}>
          <Nav className={`ml-md-0 ${s.headerNav}`}>
            <NavItem className={s.desktopSearch}>
              <HeaderSearch />
            </NavItem>
            <NavItem className={s.mobileOnly}>
              <Link to="/notifications" className={`${s.navItem} nav-link`} aria-label="Notifications">
                <BellIcon className={s.headerIcon} />
                <div className={s.count} />
              </Link>
            </NavItem>
            <Dropdown className={s.desktopOnly} nav isOpen={this.state.messagesOpen} toggle={() => this.setState({ messagesOpen: !this.state.messagesOpen })}>
              <DropdownToggle nav className={`${s.navItem} ${s.iconPill} text-white`} aria-label="Messages">
                <MessageIcon className={s.headerIcon} />
              </DropdownToggle>
              <DropdownMenu className={`${s.dropdownMenu} ${s.messages}`}>
                <DropdownItem><img className={s.image} src={getCustomerAvatar(0)} alt="" /><div className={s.details}><div>Ali Khan</div><div className={s.text}>19L gallon delivered — Clifton</div></div></DropdownItem>
                <DropdownItem><img className={s.image} src={getCustomerAvatar(2)} alt="" /><div className={s.details}><div>Sara Ahmed</div><div className={s.text}>Bottle deposit received</div></div></DropdownItem>
                <DropdownItem><img className={s.image} src={getCustomerAvatar(4)} alt="" /><div className={s.details}><div>Hassan Traders</div><div className={s.text}>Weekly order confirmed</div></div></DropdownItem>
                <DropdownItem className={s.dropdownFooter}><Link to="/messages">See all messages <ArrowIcon className={s.dropdownFooterIcon} maskName="messagesArrow" /></Link></DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <DarkModeToggle />
            <Dropdown className={s.desktopOnly} nav isOpen={this.state.supportOpen} toggle={() => this.setState({ supportOpen: !this.state.supportOpen })}>
              <DropdownToggle nav className={`${s.navItem} ${s.iconPill} text-white`} aria-label="Notifications">
                <BellIcon className={s.headerIcon} />
                <div className={s.count} />
              </DropdownToggle>
              <DropdownMenu right className={`${s.dropdownMenu} ${s.support}`}>
                <DropdownItem><Badge color="danger"><i className="fa fa-bell-o" /></Badge><div className={s.details}>Morning Karachi route dispatched</div></DropdownItem>
                <DropdownItem><Badge color="success"><i className="fa fa-info-circle" /></Badge><div className={s.details}>Daily gallon sales target reached</div></DropdownItem>
                <DropdownItem className={s.dropdownFooter}><Link to="/notifications">See all notifications <ArrowIcon className={s.dropdownFooterIcon} maskName="bellArrow" /></Link></DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <NavItem className={`${s.divider} ${s.desktopOnly}`} />
            <Dropdown nav isOpen={this.state.accountOpen} toggle={() => this.setState({ accountOpen: !this.state.accountOpen })} className={s.accountDropdown}>
              <DropdownToggle nav caret className={s.accountToggle}>
                <span className={`${s.avatar} rounded-circle thumb-sm float-left`}>
                  <img src={getCustomerAvatar(5)} alt="Admin" />
                </span>
                <span className={`small ${s.accountCheck}`}>{admin.name}</span>
              </DropdownToggle>
              <DropdownMenu right className={`${s.dropdownMenu} ${s.account}`}>
                <section>
                  <strong>{admin.name}</strong>
                  <br />
                  <small className="text-muted">{admin.role} access</small>
                </section>
                <DropdownItem><Link to="/app/admins"><i className="fa fa-user-plus" />Create Admin</Link></DropdownItem>
                <DropdownItem><Link to="/app/settings"><i className="fa fa-cog" />Settings</Link></DropdownItem>
                <DropdownItem><Link to="/profile"><i className="fa fa-user" />Profile</Link></DropdownItem>
                <DropdownItem onClick={this.doLogout}><i className="fa fa-sign-out" />Logout</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </Nav>
        </div>
      </Navbar>
    );
  }
}

function mapStateToProps(store) {
  return {
    isSidebarOpened: store.navigation.sidebarOpened,
  };
}

export default withRouter(connect(mapStateToProps)(Header));
