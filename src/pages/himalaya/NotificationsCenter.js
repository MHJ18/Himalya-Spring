import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PageShell from '../../components/PageShell/PageShell';
import './UtilityPages.css';

const initialItems = [
  { id: 1, type: 'delivery', icon: 'DR', title: 'Morning route dispatched', detail: 'The Clifton route left the warehouse with 38 bottles.', time: '8 minutes ago', read: false },
  { id: 2, type: 'payment', icon: 'PKR', title: 'Customer payment received', detail: 'A payment was recorded for the DHA office account.', time: '32 minutes ago', read: false },
  { id: 3, type: 'stock', icon: 'ST', title: 'Gallon stock running low', detail: 'Only 12 filled 19L gallons remain for today.', time: '1 hour ago', read: false },
  { id: 4, type: 'delivery', icon: 'OK', title: 'Gulshan route completed', detail: 'All scheduled deliveries were marked delivered.', time: 'Yesterday', group: 'Yesterday', read: true },
];

export default function NotificationsCenter() {
  const [items, setItems] = useState(initialItems);
  const unread = items.filter((item) => !item.read).length;
  const markRead = (id) => setItems((current) => current.map((item) => (
    item.id === id ? { ...item, read: true } : item
  )));

  return (
    <PageShell title="Notifications" subtitle="Delivery, payment, and stock alerts">
      <motion.section className="water-page-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="water-page-card__header">
          <div><span>Notification center</span><h2>{unread} unread</h2></div>
          <button type="button" className="water-action" onClick={() => setItems((current) => current.map((item) => ({ ...item, read: true })))}>Mark all as read</button>
        </div>
        <div className="notification-list">
          {['Today', 'Yesterday'].map((group) => {
            const groupedItems = items.filter((item) => (item.group || 'Today') === group);
            if (!groupedItems.length) return null;
            return <section className="notification-group" key={group} aria-labelledby={`notifications-${group.toLowerCase()}`}>
              <h3 id={`notifications-${group.toLowerCase()}`} className="notification-group__title">{group}</h3>
              <div className="notification-group__card">
                {groupedItems.map((item) => (
                  <article
                    key={item.id}
                    className={`notification-item ${item.read ? 'is-read' : ''}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => markRead(item.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') markRead(item.id);
                    }}
                  >
                    <span className={`notification-icon notification-icon--${item.type}`}>{item.icon}</span>
                    <div><h3>{item.title}</h3><p>{item.detail}</p><time>{item.time}</time></div>
                    {!item.read && <span className="notification-unread" aria-label="Unread" />}
                  </article>
                ))}
              </div>
            </section>;
          })}
        </div>
      </motion.section>
    </PageShell>
  );
}
