import { dashboardMenu } from './dashboard';
import { bookingsMenu } from './bookings';
import { unitsMenu } from './units';
import { usersMenu } from './users';
import { paymentsMenu } from './payments';
import { testimonialsMenu } from './testimonials';

export const menuItems = [
  dashboardMenu,
  bookingsMenu,
  unitsMenu,
  usersMenu,
  testimonialsMenu
];

export type MenuId = typeof menuItems[number]['id'];
export type MenuItem = typeof menuItems[number];
