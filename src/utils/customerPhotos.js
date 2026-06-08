import a1 from '../assets/people/a1.jpg';
import a2 from '../assets/people/a2.jpg';
import a3 from '../assets/people/a3.jpg';
import a4 from '../assets/people/a4.jpg';
import a5 from '../assets/people/a5.jpg';
import a6 from '../assets/people/a6.jpg';
import a7 from '../assets/people/a7.jpg';

export const CUSTOMER_AVATARS = [a1, a2, a3, a4, a5, a6, a7];
export const ADMIN_AVATAR = a6;

export function getCustomerAvatar(index) {
  return CUSTOMER_AVATARS[index % CUSTOMER_AVATARS.length];
}
