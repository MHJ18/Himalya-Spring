import React from 'react';
import { NavItem, NavLink } from 'reactstrap';
import { useSettings } from '../../context/SettingsContext';
import s from './Header.module.scss';

export default function DarkModeToggle() {
  const { settings, toggleDarkMode } = useSettings();
  return (
    <NavItem>
      <NavLink
        className={`${s.navItem} text-white`}
        href="#"
        onClick={(e) => { e.preventDefault(); toggleDarkMode(); }}
        title={settings.darkMode ? 'Light mode' : 'Dark mode'}
      >
        <i className={`fa fa-${settings.darkMode ? 'sun-o' : 'moon-o'} ${s.headerIcon}`} />
      </NavLink>
    </NavItem>
  );
}
