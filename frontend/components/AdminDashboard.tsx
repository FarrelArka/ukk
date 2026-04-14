'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  LayoutDashboard, Users, Home, Calendar, CreditCard, Star,
  Menu, X, Search, Plus, Edit2, Trash2, Eye,
  DollarSign, Bell, LucideIcon,
  Check, XCircle, Filter, ChevronLeft, ChevronRight
} from 'lucide-react';
import SearchBar from './SearchBar';
import BookingsSearch from './BookingsSearch';
import UnitsSearch from './UnitsSearch';
import UsersSearch from './UsersSearch';
import TestimonialsSearch from './TestimonialsSearch';

// =====================
// TYPES
// =====================

type MenuId = 'dashboard' | 'bookings' | 'units' | 'users' | 'testimonials';

type Stat = {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  color: string;
};

type BookingStatus = 'confirmed' | 'pending' | 'cancelled';
type UnitStatus = 'available' | 'booked' | 'maintenance';
type UserRole = 'admin' | 'user' | 'guest';
type PaymentStatus = 'completed' | 'pending' | 'failed' | 'refunded';
type PaymentMethod = 'credit_card' | 'bank_transfer' | 'e_wallet' | 'cash';
type TestimonialStatus = 'approved' | 'pending' | 'rejected';

type Booking = {
  id: number;
  user: string;
  unit: string;
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
  amount: string;
  email?: string;
  phone?: string;
  guests?: number;
};

type Unit = {
  id: number;
  name: string;
  category: string;
  status: UnitStatus;
  price: string;
  rooms: number;
  location?: string;
  capacity?: number;
};

type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: 'active' | 'inactive';
  joinedDate: string;
  totalBookings: number;
  totalSpent: string;
};

type Payment = {
  id: number;
  bookingId: number;
  user: string;
  amount: string;
  status: PaymentStatus;
  method: PaymentMethod;
  date: string;
  transactionId: string;
};

type Testimonial = {
  id: number;
  user: string;
  unit: string;
  rating: number;
  comment: string;
  date: string;
  status: TestimonialStatus;
};

type MenuItem = {
  id: MenuId;
  label: string;
  icon: LucideIcon;
};

// =====================
// CONSTANTS
// =====================

const MENU_ITEMS: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'bookings', label: 'Bookings', icon: Calendar },
  { id: 'units', label: 'Units', icon: Home },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'testimonials', label: 'Testimonials', icon: Star }
];

const STATUS_COLORS: Record<string, string> = {
  // Booking Status
  confirmed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-700',

  // Unit Status
  available: 'bg-green-100 text-green-700',
  booked: 'bg-blue-100 text-blue-700',
  maintenance: 'bg-orange-100 text-orange-700',

  // Payment Status
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-purple-100 text-purple-700',

  // User Role
  admin: 'bg-purple-100 text-purple-700',
  user: 'bg-blue-100 text-blue-700',
  guest: 'bg-gray-100 text-gray-700',

  // User Status
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-700',

  // Testimonial Status
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const PAYMENT_METHODS: Record<PaymentMethod, string> = {
  credit_card: 'Credit Card',
  bank_transfer: 'Bank Transfer',
  e_wallet: 'E-Wallet',
  cash: 'Cash'
};

// =====================
// MOCK DATA
// =====================

const STATS: Stat[] = [
  { title: 'Total Bookings', value: '1,234', change: '+12%', icon: Calendar, color: 'bg-blue-500' },
  { title: 'Active Units', value: '89', change: '+3%', icon: Home, color: 'bg-purple-500' },
  { title: 'Total Users', value: '567', change: '+15%', icon: Users, color: 'bg-orange-500' }
];

const BOOKINGS: Booking[] = [
  {
    id: 1,
    user: 'John Doe',
    unit: 'Villa Sunset View',
    checkIn: '2026-04-01',
    checkOut: '2026-04-05',
    status: 'confirmed',
    amount: '$1,200',
    email: 'john.doe@email.com',
    phone: '+1 234-567-8901',
    guests: 4
  },
  {
    id: 2,
    user: 'Jane Smith',
    unit: 'Beach House Deluxe',
    checkIn: '2026-04-03',
    checkOut: '2026-04-07',
    status: 'confirmed',
    amount: '$1,800',
    email: 'jane.smith@email.com',
    phone: '+1 234-567-8902',
    guests: 6
  },
  {
    id: 3,
    user: 'Mike Johnson',
    unit: 'Mountain Cabin',
    checkIn: '2026-04-05',
    checkOut: '2026-04-10',
    status: 'confirmed',
    amount: '$950',
    email: 'mike.j@email.com',
    phone: '+1 234-567-8903',
    guests: 2
  },
  {
    id: 4,
    user: 'Sarah Williams',
    unit: 'City Apartment',
    checkIn: '2026-04-07',
    checkOut: '2026-04-09',
    status: 'confirmed',
    amount: '$600',
    email: 'sarah.w@email.com',
    phone: '+1 234-567-8904',
    guests: 3
  },
  {
    id: 5,
    user: 'Robert Brown',
    unit: 'Lake House',
    checkIn: '2026-04-10',
    checkOut: '2026-04-15',
    status: 'confirmed',
    amount: '$2,100',
    email: 'robert.b@email.com',
    phone: '+1 234-567-8905',
    guests: 5
  }
];

const UNITS: Unit[] = [
  {
    id: 1,
    name: 'Villa Sunset View',
    category: 'Villa',
    status: 'available',
    price: '$300/night',
    rooms: 4,
    location: 'Bali, Indonesia',
    capacity: 8
  },
  {
    id: 2,
    name: 'Beach House Deluxe',
    category: 'Beach House',
    status: 'booked',
    price: '$450/night',
    rooms: 5,
    location: 'Maldives',
    capacity: 10
  },
  {
    id: 3,
    name: 'Mountain Cabin',
    category: 'Cabin',
    status: 'available',
    price: '$190/night',
    rooms: 2,
    location: 'Swiss Alps',
    capacity: 4
  },
  {
    id: 4,
    name: 'City Apartment',
    category: 'Apartment',
    status: 'maintenance',
    price: '$150/night',
    rooms: 3,
    location: 'New York, USA',
    capacity: 6
  },
  {
    id: 5,
    name: 'Lake House',
    category: 'Lake House',
    status: 'available',
    price: '$420/night',
    rooms: 4,
    location: 'Lake Como, Italy',
    capacity: 8
  }
];

const USERS: User[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+1 234-567-8901',
    role: 'user',
    status: 'active',
    joinedDate: '2024-01-15',
    totalBookings: 5,
    totalSpent: '$6,200'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@email.com',
    phone: '+1 234-567-8902',
    role: 'user',
    status: 'active',
    joinedDate: '2024-03-20',
    totalBookings: 3,
    totalSpent: '$4,500'
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike.j@email.com',
    phone: '+1 234-567-8903',
    role: 'user',
    status: 'active',
    joinedDate: '2024-06-10',
    totalBookings: 8,
    totalSpent: '$12,300'
  },
  {
    id: 4,
    name: 'Sarah Williams',
    email: 'sarah.w@email.com',
    phone: '+1 234-567-8904',
    role: 'admin',
    status: 'active',
    joinedDate: '2023-11-05',
    totalBookings: 2,
    totalSpent: '$2,100'
  },
  {
    id: 5,
    name: 'Robert Brown',
    email: 'robert.b@email.com',
    phone: '+1 234-567-8905',
    role: 'user',
    status: 'inactive',
    joinedDate: '2024-08-22',
    totalBookings: 1,
    totalSpent: '$800'
  }
];

const PAYMENTS: Payment[] = [
  {
    id: 1,
    bookingId: 1,
    user: 'John Doe',
    amount: '$1,200',
    status: 'completed',
    method: 'credit_card',
    date: '2026-01-25',
    transactionId: 'TXN001234'
  },
  {
    id: 2,
    bookingId: 2,
    user: 'Jane Smith',
    amount: '$1,800',
    status: 'pending',
    method: 'bank_transfer',
    date: '2026-01-26',
    transactionId: 'TXN001235'
  },
  {
    id: 3,
    bookingId: 3,
    user: 'Mike Johnson',
    amount: '$950',
    status: 'completed',
    method: 'e_wallet',
    date: '2026-01-27',
    transactionId: 'TXN001236'
  },
  {
    id: 4,
    bookingId: 4,
    user: 'Sarah Williams',
    amount: '$600',
    status: 'refunded',
    method: 'credit_card',
    date: '2026-01-28',
    transactionId: 'TXN001237'
  },
  {
    id: 5,
    bookingId: 5,
    user: 'Robert Brown',
    amount: '$2,100',
    status: 'completed',
    method: 'credit_card',
    date: '2026-01-28',
    transactionId: 'TXN001238'
  }
];

// Testimonials mock data removed, now handled by TestimonialsSearch.tsx

// =====================
// UTILITY FUNCTIONS
// =====================

const getStatusColor = (status: string): string => {
  return STATUS_COLORS[status] || 'bg-gray-100 text-gray-700';
};

const formatPaymentMethod = (method: PaymentMethod): string => {
  return PAYMENT_METHODS[method];
};

const renderStars = (rating: number) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
};

// =====================
// SUBCOMPONENTS
// =====================

const StatCard = ({ stat }: { stat: Stat }) => {
  const Icon = stat.icon;
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
          <p className="text-sm text-green-600 mt-1 font-medium">{stat.change}</p>
        </div>
        <div className={`${stat.color} p-4 rounded-xl shadow-md`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ message = 'No data found', subtitle = 'Try adjusting your search or filter criteria' }) => (
  <div className="px-6 py-12 text-center">
    <div className="flex flex-col items-center gap-2">
      <Search className="w-12 h-12 text-gray-300" />
      <p className="text-gray-500 font-medium">{message}</p>
      <p className="text-sm text-gray-400">{subtitle}</p>
    </div>
  </div>
);

const FilterInfo = ({ count }: { count: number }) => (
  <div className="flex items-center gap-2 text-sm">
    <Filter className="w-4 h-4 text-gray-500" />
    <span className="text-gray-600">
      Found <span className="font-semibold text-gray-900">{count}</span> result{count !== 1 ? 's' : ''}
    </span>
  </div>
);

// =====================
// API AND HELPERS
// =====================

const API_DASHBOARD = 'http://localhost:5050/api/admin/dashboard';

interface DashboardResponse {
  stats: {
    total_bookings: number;
    active_units: number;
    total_users: number;
  };
  calendar_bookings: Array<{
    unit: string;
    checkIn: string;
    checkOut: string;
    status: string;
  }>;
  units: string[];
}

function getToken(): string {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  const urlToken = params.get('token');
  if (urlToken) return urlToken;
  return localStorage.getItem('token') ?? '';
}

// =====================
// MAIN COMPONENT
// =====================

export default function AdminDashboard({ defaultMenu = 'dashboard' }: { defaultMenu?: MenuId }) {
  const [activeMenu, setActiveMenu] = useState<MenuId>(defaultMenu);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatus | 'all'>('all');

  // Dashboard Data State
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  useEffect(() => {
  let isMounted = true;

  const fetchDashboard = async () => {
    try {
      const res = await fetch(API_DASHBOARD, {
        method: "GET",
        credentials: "include", // 🔥 WAJIB
      });

      if (res.ok) {
        const data = await res.json();
        if (isMounted) setDashboardData(data);
      } else {
        console.error("Unauthorized / gagal:", res.status);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      if (isMounted) setLoadingDashboard(false);
    }
  };

  fetchDashboard();
  return () => { isMounted = false; };
}, []);

  // =====================
  // FILTERED DATA
  // =====================

  const filteredPayments = useMemo(() => {
    let filtered = PAYMENTS.filter(payment => {
      const searchLower = paymentSearch.toLowerCase();
      return (
        payment.user.toLowerCase().includes(searchLower) ||
        payment.transactionId.toLowerCase().includes(searchLower) ||
        payment.bookingId.toString().includes(paymentSearch)
      );
    });

    if (paymentStatusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === paymentStatusFilter);
    }

    return filtered;
  }, [paymentSearch, paymentStatusFilter]);

  // Testimonials filter removed

  // =====================
  // CALLBACKS
  // =====================

  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);
  const handleMenuChange = useCallback((menuId: MenuId) => setActiveMenu(menuId), []);

  // =====================
  // VIEW COMPONENTS
  // =====================

  const BookingCalendar = ({ bookings, allUnits = [] }: { bookings: any[], allUnits?: string[] }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [viewDate, setViewDate] = useState(new Date());
    const currentMonth = viewDate.getMonth();
    const currentYear = viewDate.getFullYear();

    const handlePrevMonth = () => {
      setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
      setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    // Dynamic Unit definitions with colors
    const tailwindColors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-400', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500'];
    const UNIT_COLORS: Record<string, { dot: string; label: string }> = {};
    
    // Use the full units list provided by backend if available, otherwise fallback to units with bookings
    const displayUnits = allUnits.length > 0 ? allUnits : Array.from(new Set(bookings.map(b => b.unit)));
    
    displayUnits.forEach((unitName, index) => {
        UNIT_COLORS[unitName] = {
            dot: tailwindColors[index % tailwindColors.length],
            label: unitName
        };
    });

    // Build map: dateKey -> list of unit names booked
    const bookedMap: Record<string, string[]> = {};
    bookings.forEach(booking => {
      // API returns 'confirmed' and 'pending' statuses
      if (booking.status === 'confirmed' || booking.status === 'pending') {
        const checkIn = new Date(booking.checkIn);
        const checkOut = new Date(booking.checkOut);
        
        const current = new Date(checkIn);
        while (current <= checkOut) {
          // Only highlight if the date being processed is today or in the future
          if (current >= today) {
            const dateStr = current.toISOString().split('T')[0];
            if (!bookedMap[dateStr]) bookedMap[dateStr] = [];
            if (!bookedMap[dateStr].includes(booking.unit)) {
              bookedMap[dateStr].push(booking.unit);
            }
          }
          current.setDate(current.getDate() + 1);
        }
      }
    });

    const firstDay = new Date(currentYear, currentMonth, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const calendarDays: Date[] = [];
    const current = new Date(startDate);
    for (let i = 0; i < 42; i++) {
      calendarDays.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const isCurrentMonth = (date: Date) => date.getMonth() === currentMonth;
    const isToday = (date: Date) => date.toDateString() === (new Date()).toDateString();

    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
          <h4 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            {monthNames[currentMonth]} {currentYear}
          </h4>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrevMonth}
              className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 hover:shadow-sm transition-all"
              title="Previous Month"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button 
              onClick={() => setViewDate(new Date())}
              className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all"
            >
              Today
            </button>
            <button 
              onClick={handleNextMonth}
              className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 hover:shadow-sm transition-all"
              title="Next Month"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}

          {calendarDays.map((date, index) => {
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            const dateKey = `${yyyy}-${mm}-${dd}`;
            const isCurrent = isCurrentMonth(date);
            const isTodayDate = isToday(date);
            const units = bookedMap[dateKey] || [];

            return (
              <div
                key={index}
                className={`relative p-1 rounded-lg flex flex-col items-center gap-0.5 min-h-[52px] ${isTodayDate
                  ? 'bg-blue-100'
                  : units.length > 0
                    ? 'bg-red-50'
                    : 'hover:bg-gray-50'
                  }`}
              >
                {/* Date number */}
                <span
                  className={`text-sm leading-none mt-1 ${isTodayDate
                    ? 'font-bold text-blue-700'
                    : units.length > 0
                      ? 'font-semibold text-red-700'
                      : isCurrent
                        ? 'text-gray-900'
                        : 'text-gray-400'
                    }`}
                >
                  {date.getDate()}
                </span>

                {/* Colored dots per unit */}
                {units.length > 0 && (
                  <div className="flex gap-0.5 flex-wrap justify-center">
                    {units.map((unitName, i) => {
                      const color = UNIT_COLORS[unitName]?.dot ?? 'bg-gray-400';
                      return (
                        <span
                          key={i}
                          className={`w-2 h-2 rounded-full ${color}`}
                          title={UNIT_COLORS[unitName]?.label ?? unitName}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2 font-medium">Unit Legend</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {Object.entries(UNIT_COLORS).map(([unitName, { dot, label }]) => (
              <div key={unitName} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${dot}`} />
                <span className="text-xs text-gray-600">{label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              <span className="text-xs text-gray-600">Today</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DashboardContent = () => {
    if (loadingDashboard) {
      return (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-500">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
          <p>Memuat data Dashboard...</p>
        </div>
      );
    }

    const currentStats: Stat[] = [
      { title: 'Total Bookings', value: dashboardData?.stats?.total_bookings?.toString() || '0', change: 'Total Orders', icon: Calendar, color: 'bg-blue-500' },
      { title: 'Active Units', value: dashboardData?.stats?.active_units?.toString() || '0', change: 'Property Units', icon: Home, color: 'bg-purple-500' },
      { title: 'Total Users', value: dashboardData?.stats?.total_users?.toString() || '0', change: 'Registered Users', icon: Users, color: 'bg-orange-500' }
    ];

    return (
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {currentStats.map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Availability Calendar</h3>
          <BookingCalendar 
            bookings={dashboardData?.calendar_bookings || []} 
            allUnits={dashboardData?.units || []}
          />
        </div>
      </div>
    );
  };

  const PaymentsContent = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payments Management</h2>
          <p className="text-sm text-gray-600 mt-1">Track all payment transactions</p>
        </div>
        <button className="bg-gray-900 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-gray-800 transition-all shadow-md hover:shadow-lg">
          <Plus className="w-4 h-4" />
          New Payment
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar
          value={paymentSearch}
          onChange={setPaymentSearch}
          placeholder="Search payments by user, transaction ID, or booking ID..."
        />
        <select
          value={paymentStatusFilter}
          onChange={(e) => setPaymentStatusFilter(e.target.value as PaymentStatus | 'all')}
          className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white shadow-sm hover:shadow-md transition-all min-w-[160px]"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Results Count */}
      {(paymentSearch || paymentStatusFilter !== 'all') && (
        <FilterInfo count={filteredPayments.length} />
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Booking ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Method</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-gray-700 font-medium">{payment.transactionId}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">#{payment.bookingId}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{payment.user}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{payment.amount}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{formatPaymentMethod(payment.method)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{payment.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8}>
                    <EmptyState message="No payments found" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <DashboardContent />;
      case 'bookings':
        return <BookingsSearch />;
      case 'units':
        return <UnitsSearch />;
      case 'users':
        return <UsersSearch />;
      case 'testimonials':
        return <TestimonialsSearch />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} z-50 shadow-lg`}>
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold text-gray-900">BookingAdmin</h1>}
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeMenu === item.id
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
                aria-current={activeMenu === item.id ? 'page' : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {MENU_ITEMS.find(item => item.id === activeMenu)?.label || 'Dashboard'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">Welcome back, Admin</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative transition-colors" aria-label="Notifications">
                <div className="w-2 h-2 bg-red-500 rounded-full absolute top-2 right-2" aria-hidden="true"></div>
                <Bell className="w-6 h-6 text-gray-700" />
              </button>
              <button className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-semibold hover:bg-gray-800 transition-colors shadow-md" aria-label="User menu">
                A
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">{renderContent()}</div>
      </main>
    </div>
  );
}
