import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import s from './Sidebar.module.scss';
import LinksGroup from './LinksGroup';

import {changeActiveSidebarItem} from '../../actions/navigation';
import HomeIcon from '../Icons/SidebarIcons/HomeIcon';
import TypographyIcon from '../Icons/SidebarIcons/TypographyIcon';
import TablesIcon from '../Icons/SidebarIcons/TablesIcon';
import NotificationsIcon from '../Icons/SidebarIcons/NotificationsIcon';
import ComponentsIcon from '../Icons/SidebarIcons/ComponentsIcon';



class Sidebar extends React.Component {
    static propTypes = {
        sidebarStatic: PropTypes.bool,
        sidebarOpened: PropTypes.bool,
        dispatch: PropTypes.func.isRequired,
        activeItem: PropTypes.string,
        location: PropTypes.shape({
            pathname: PropTypes.string,
        }).isRequired,
    };

    static defaultProps = {
        sidebarStatic: false,
        activeItem: '',
    };

    componentDidMount() {
        this.element.addEventListener('transitionend', () => {
            if (this.props.sidebarOpened) {
                this.element.classList.add(s.sidebarOpen);
            }
        }, false);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.sidebarOpened !== this.props.sidebarOpened) {
            if (nextProps.sidebarOpened) {
                this.element.style.height = `${this.element.scrollHeight}px`;
            } else {
                this.element.classList.remove(s.sidebarOpen);
                setTimeout(() => {
                    this.element.style.height = '';
                }, 0);
            }
        }
    }

    render() {
        return (
            <nav
                className={cx(s.root)}
                ref={(nav) => {
                    this.element = nav;
                }}
            >
                <header className={s.logo}>
                    <a href="#/app/main/dashboard">Himaliya <span
                        className="fw-bold">Spring</span></a>
                </header>
                <ul className={s.nav}>
                    <LinksGroup
                        onActiveSidebarItemChange={activeItem => this.props.dispatch(changeActiveSidebarItem(activeItem))}
                        activeItem={this.props.activeItem}
                        header="Dashboard"
                        isHeader
                        iconName={<HomeIcon className={s.menuIcon} />}
                        link="/app/main/dashboard"
                        index="dashboard"
                    />
                    <h5 className={[s.navTitle, s.groupTitle].join(' ')}>CUSTOMERS</h5>
                    <LinksGroup
                        onActiveSidebarItemChange={activeItem => this.props.dispatch(changeActiveSidebarItem(activeItem))}
                        activeItem={this.props.activeItem}
                        header="Add Customer"
                        isHeader
                        iconName={<TypographyIcon className={s.menuIcon} />}
                        link="/app/add-customer"
                        index="add-customer"
                    />
                    <LinksGroup
                        onActiveSidebarItemChange={t => this.props.dispatch(changeActiveSidebarItem(t))}
                        activeItem={this.props.activeItem}
                        header="Customer Records"
                        isHeader
                        iconName={<TablesIcon className={s.menuIcon} />}
                        link="/app/customers"
                        index="customers"
                    />
                    <h5 className={[s.navTitle, s.groupTitle].join(' ')}>SALES</h5>
                    <LinksGroup
                        onActiveSidebarItemChange={activeItem => this.props.dispatch(changeActiveSidebarItem(activeItem))}
                        activeItem={this.props.activeItem}
                        header="Daily Sales Entry"
                        isHeader
                        iconName={<NotificationsIcon className={s.menuIcon}/>}
                        link="/app/daily-sales"
                        index="daily-sales"
                    />
                    <LinksGroup
                        onActiveSidebarItemChange={activeItem => this.props.dispatch(changeActiveSidebarItem(activeItem))}
                        activeItem={this.props.activeItem}
                        header="Monthly Analytics"
                        isHeader
                        iconName={<ComponentsIcon className={s.menuIcon}/>}
                        link="/app/analytics"
                        index="analytics"
                    />
                    <h5 className={[s.navTitle, s.groupTitle].join(' ')}>SYSTEM</h5>
                    <LinksGroup
                        onActiveSidebarItemChange={activeItem => this.props.dispatch(changeActiveSidebarItem(activeItem))}
                        activeItem={this.props.activeItem}
                        header="Create Admin"
                        isHeader
                        iconName={<ComponentsIcon className={s.menuIcon} />}
                        link="/app/admins"
                        index="admins"
                    />
                    <LinksGroup
                        onActiveSidebarItemChange={activeItem => this.props.dispatch(changeActiveSidebarItem(activeItem))}
                        activeItem={this.props.activeItem}
                        header="Settings"
                        isHeader
                        iconName={<HomeIcon className={s.menuIcon} />}
                        link="/app/settings"
                        index="settings"
                    />
                </ul>
                <h5 className={s.navTitle}>
                    QUICK LINKS
                </h5>
                <ul className={s.sidebarLabels}>
                    <li>
                        <a href="#/app/daily-sales">
                            <i className="fa fa-circle text-success mr-2"/>
                            <span className={s.labelName}>Today&apos;s Sales</span>
                        </a>
                    </li>
                    <li>
                        <a href="#/app/customers">
                            <i className="fa fa-circle text-primary mr-2"/>
                            <span className={s.labelName}>Customers</span>
                        </a>
                    </li>
                    <li>
                        <a href="#/app/analytics">
                            <i className="fa fa-circle text-info mr-2"/>
                            <span className={s.labelName}>Reports</span>
                        </a>
                    </li>
                </ul>
            </nav>
        );
    }
}

function mapStateToProps(store) {
    return {
        sidebarOpened: store.navigation.sidebarOpened,
        activeItem: store.navigation.activeItem,
    };
}

export default withRouter(connect(mapStateToProps)(Sidebar));
