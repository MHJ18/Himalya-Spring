import React from 'react';
import s from '../../pages/dashboard/Dashboard.module.scss';

export default function PageShell({ title, subtitle, children }) {
  return (
    <div className={s.root}>
      <h1 className="page-title">
        {title}
        {subtitle && (
          <>
            {' '}
            <small><small>{subtitle}</small></small>
          </>
        )}
      </h1>
      {children}
    </div>
  );
}
