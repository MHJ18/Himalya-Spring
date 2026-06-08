import { connect } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import {
  Navbar, Nav, NavItem, NavLink, InputGroupAddon, InputGroupText, InputGroup, Input,
  Dropdown, Collapse, DropdownToggle, DropdownMenu, DropdownItem, Badge, Form, FormGroup,
  ButtonGroup, Button,
} from 'reactstrap';
import DarkModeToggle from './DarkModeToggle';
import BellIcon from '../Icons/HeaderIcons/BellIcon';
import MessageIcon from '../Icons/HeaderIcons/MessageIcon';
import BurgerIcon from '../Icons/HeaderIcons/BurgerIcon';
import SearchIcon from '../Icons/HeaderIcons/SearchIcon';
import ArrowIcon from '../Icons/HeaderIcons/ArrowIcon';
import SettingsIcon from '../Icons/HeaderIcons/SettingsIcon';
import {
  openSidebar, closeSidebar, changeSidebarPosition, changeSidebarVisibility,
} from '../../actions/navigation';
import { logoutUser } from '../../actions/user';
import { getCurrentAdmin } from '../../utils/adminAuth';
import { ADMIN_AVATAR } from '../../utils/customerPhotos';
import sender1 from '../../assets/people/a1.jpg';
import sender2 from '../../assets/people/a5.jpg';
import sender3 from '../../assets/people/a4.jpg';
import s from './Header.module.scss';
import 'animate.css';

class Header extends React.Component {
  static propTypes = { dispatch: PropTypes.func.isRequired };

  constructor(props) {
    super(props);
    this.state = {
      messagesOpen: false, supportOpen: false, searchFocused: false, searchOpen: false,
      settingsOpen: false, accountOpen: false,
      admin: getCurrentAdmin(),
    };
  }

  toggleSidebar = () => {
    this.props.isSidebarOpened
      ? this.props.dispatch(closeSidebar())
      : this.props.dispatch(openSidebar());
  };

  doLogout = () => {
    this.props.dispatch(logoutUser());
    this.props.history.push('/login');
  };

  render() {
    const admin = this.state.admin || { name: 'Himaliya Admin', role: 'Admin', email: 'admin@himaliya.com' };
    return (
      <Navbar className="d-print-none">
        <div className={s.burger}>
          <NavLink onClick={this.toggleSidebar} className={`d-md-none ${s.navItem} text-white`} href="#">
            <BurgerIcon className={s.headerIcon} />
          </NavLink>
        </div>
        <div className={`d-print-none ${s.root}`}>
          <Collapse className={`${s.searchCollapse} ml-lg-0 mr-md-3`} isOpen={this.state.searchOpen}>
            <InputGroup className={`${s.navbarForm} ${this.state.searchFocused ? s.navbarFormFocused : ''}`}>
              <InputGroupAddon addonType="prepend" className={s.inputAddon}>
                <InputGroupText><i className="fa fa-search" /></InputGroupText>
              </InputGroupAddon>
              <Input placeholder="Search..." className="input-transparent" onFocus={() => this.setState({ searchFocused: true })} onBlur={() => this.setState({ searchFocused: false })} />
            </InputGroup>
          </Collapse>
          <Form className="d-md-down-none mr-3 ml-3" inline>
            <FormGroup>
              <InputGroup className={`input-group-no-border ${s.searchForm}`}>
                <InputGroupAddon addonType="prepend">
                  <InputGroupText className={s.inputGroupText}><SearchIcon className={s.headerIcon} /></InputGroupText>
                </InputGroupAddon>
                <Input className="input-transparent" placeholder="Search Dashboard" />
              </InputGroup>
            </FormGroup>
          </Form>
          <Nav className={`ml-md-0 ${s.headerNav}`}>
            <NavItem className="d-lg-none">
              <NavLink onClick={() => this.setState({ searchOpen: !this.state.searchOpen })} className={s.navItem} href="#">
                <SearchIcon className={s.headerIcon} />
              </NavLink>
            </NavItem>
            <Dropdown className="d-none d-sm-block" nav isOpen={this.state.messagesOpen} toggle={() => this.setState({ messagesOpen: !this.state.messagesOpen })}>
              <DropdownToggle nav className={`d-sm-down-none ${s.navItem} text-white`}><MessageIcon className={s.headerIcon} /></DropdownToggle>
              <DropdownMenu className={`${s.dropdownMenu} ${s.messages}`}>
                <DropdownItem><img className={s.image} src={sender1} alt="" /><div className={s.details}><div>Jane Hew</div><div className={s.text}>Delivery confirmed...</div></div></DropdownItem>
                <DropdownItem><img className={s.image} src={sender2} alt="" /><div className={s.details}><div>Ali Raza</div><div className={s.text}>New order placed</div></div></DropdownItem>
                <DropdownItem><img className={s.image} src={sender3} alt="" /><div className={s.details}><div>Sana Iqbal</div><div className={s.text}>Payment received</div></div></DropdownItem>
                <DropdownItem><a href="#/app/customers" className="text-white">See all messages <ArrowIcon className={s.headerIcon} maskName="messagesArrow" /></a></DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <DarkModeToggle />
            <Dropdown className="d-none d-sm-block" nav isOpen={this.state.settingsOpen} toggle={() => this.setState({ settingsOpen: !this.state.settingsOpen })}>
              <DropdownToggle nav className={`${s.navItem} text-white`}>
                <SettingsIcon addId="header-settings" className={`${s.headerIcon} ${s.settingsIcon}`} />
              </DropdownToggle>
              <DropdownMenu className={`${s.dropdownMenu} ${s.settings}`}>
                <h6 className="mb-2">Sidebar side</h6>
                <ButtonGroup size="sm" className="mb-3">
                  <Button color="primary" className={this.props.sidebarPosition === 'left' ? 'active' : ''} onClick={() => this.props.dispatch(changeSidebarPosition('left'))}>Left</Button>
                  <Button color="primary" className={this.props.sidebarPosition === 'right' ? 'active' : ''} onClick={() => this.props.dispatch(changeSidebarPosition('right'))}>Right</Button>
                </ButtonGroup>
                <h6 className="mb-2">View mode</h6>
                <ButtonGroup size="sm">
                  <Button color="primary" className={this.props.sidebarVisibility === 'show' ? 'active' : ''} onClick={() => this.props.dispatch(changeSidebarVisibility('show'))}>Show</Button>
                  <Button color="primary" className={this.props.sidebarVisibility === 'hide' ? 'active' : ''} onClick={() => this.props.dispatch(changeSidebarVisibility('hide'))}>Hide</Button>
                </ButtonGroup>
              </DropdownMenu>
            </Dropdown>
            <Dropdown className="d-none d-sm-block" nav isOpen={this.state.supportOpen} toggle={() => this.setState({ supportOpen: !this.state.supportOpen })}>
              <DropdownToggle nav className={`${s.navItem} text-white`}><BellIcon className={s.headerIcon} /><div className={s.count} /></DropdownToggle>
              <DropdownMenu right className={`${s.dropdownMenu} ${s.support}`}>
                <DropdownItem><Badge color="danger"><i className="fa fa-bell-o" /></Badge><div className={s.details}>Morning route dispatched</div></DropdownItem>
                <DropdownItem><Badge color="success"><i className="fa fa-info-circle" /></Badge><div className={s.details}>Daily sales target reached</div></DropdownItem>
                <DropdownItem><a href="#/app/daily-sales" className="text-white">See all <ArrowIcon className={s.headerIcon} maskName="bellArrow" /></a></DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <NavItem className={`${s.divider} d-none d-sm-block`} />
            <Dropdown nav isOpen={this.state.accountOpen} toggle={() => this.setState({ accountOpen: !this.state.accountOpen })} className={s.accountDropdown}>
              <DropdownToggle nav caret className={s.accountToggle}>
                <span className={`${s.avatar} rounded-circle thumb-sm float-left`}>
                  <img src={ADMIN_AVATAR} alt="Admin" />
                </span>
                <span className={`small d-sm-down-none ${s.accountCheck}`}>{admin.name}</span>
              </DropdownToggle>
              <DropdownMenu right className={`${s.dropdownMenu} ${s.account}`}>
                <section>
                  <strong>{admin.name}</strong>
                  <br />
                  <small className="text-muted">{admin.role} access</small>
                </section>
                <DropdownItem><a href="#/app/admins"><i className="fa fa-user-plus" />Create Admin</a></DropdownItem>
                <DropdownItem><a href="#/app/settings"><i className="fa fa-cog" />Settings</a></DropdownItem>
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
    sidebarPosition: store.navigation.sidebarPosition,
    sidebarVisibility: store.navigation.sidebarVisibility,
  };
}

export default withRouter(connect(mapStateToProps)(Header));
