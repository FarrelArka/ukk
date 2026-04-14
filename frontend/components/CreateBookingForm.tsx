// 'use client';

// import { useState, useEffect } from 'react';
// import { AlertCircle, CheckCircle, User, Home, Users } from 'lucide-react';

// type BookingStatus = 'confirmed' | 'pending' | 'cancelled';

// interface FormData {
//   userName: string;
//   unitId: number;
//   checkIn: string;
//   checkOut: string;
//   guests: number;
//   status: BookingStatus;
// }

// interface Unit {
//   id: number;
//   name: string;
//   status: 'available' | 'booked' | 'maintenance';
// }

// interface Booking {
//   id: number;
//   user: string;
//   unit: string;
//   checkIn: string;
//   checkOut: string;
//   status: BookingStatus;
// }

// const MOCK_UNITS: Unit[] = [
//   { id: 1, name: 'Villa Sunset View', status: 'available' },
//   { id: 2, name: 'Beach House Deluxe', status: 'booked' },
//   { id: 3, name: 'Mountain Cabin', status: 'available' },
//   { id: 4, name: 'City Apartment', status: 'available' },
//   { id: 5, name: 'Lake House', status: 'available' }
// ];

// const MOCK_BOOKINGS: Booking[] = [
//   { id: 1, user: 'John Doe', unit: 'Villa Sunset View', checkIn: '2026-02-01', checkOut: '2026-02-05', status: 'confirmed' },
// ];

// export default function CreateBookingForm() {
//   const [formData, setFormData] = useState<FormData>({
//     userName: '',
//     unitId: 0,
//     checkIn: '',
//     checkOut: '',
//     guests: 1,
//     status: 'pending'
//   });

//   const [bookedDates, setBookedDates] = useState<string[]>([]);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   useEffect(() => {
//     if (!formData.unitId) return;

//     const selectedUnit = MOCK_UNITS.find(u => u.id === formData.unitId);
//     if (!selectedUnit) return;

//     const unitBookings = MOCK_BOOKINGS.filter(
//       b => b.unit === selectedUnit.name && b.status === 'confirmed'
//     );

//     const dates: string[] = [];
//     unitBookings.forEach(booking => {
//       const start = new Date(booking.checkIn);
//       const end = new Date(booking.checkOut);
//       for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
//         dates.push(d.toISOString().split('T')[0]);
//       }
//     });

//     setBookedDates(dates);
//   }, [formData.unitId]);

//   const DatePicker = ({
//     value,
//     onChange,
//     label
//   }: {
//     value: string;
//     onChange: (date: string) => void;
//     label: string;
//   }) => {
//     const today = new Date();
//     const selectedDate = value ? new Date(value) : null;
//     const currentMonth = selectedDate ? selectedDate.getMonth() : today.getMonth();
//     const currentYear = selectedDate ? selectedDate.getFullYear() : today.getFullYear();

//     // Generate calendar days
//     const firstDay = new Date(currentYear, currentMonth, 1);
//     const lastDay = new Date(currentYear, currentMonth + 1, 0);
//     const startDate = new Date(firstDay);
//     startDate.setDate(startDate.getDate() - firstDay.getDay());

//     const calendarDays = [];
//     const current = new Date(startDate);

//     for (let i = 0; i < 42; i++) {
//       calendarDays.push(new Date(current));
//       current.setDate(current.getDate() + 1);
//     }

//     const monthNames = [
//       'January', 'February', 'March', 'April', 'May', 'June',
//       'July', 'August', 'September', 'October', 'November', 'December'
//     ];

//     const isCurrentMonth = (date: Date) => date.getMonth() === currentMonth;
//     const isSelected = (date: Date) => selectedDate && date.toDateString() === selectedDate.toDateString();
//     const hasBooking = (date: Date) => bookedDates.includes(date.toISOString().split('T')[0]);
//     const isPast = (date: Date) => date < new Date() && !isSelected(date);

//     return (
//       <div>
//         <label className="block font-medium mb-2 text-black">
//           {label}
//         </label>

//         <div className="border rounded-lg p-4 bg-white">
//           <div className="flex items-center justify-between mb-4">
//             <h4 className="text-lg font-semibold text-black">
//               {monthNames[currentMonth]} {currentYear}
//             </h4>
//           </div>

//           <div className="grid grid-cols-7 gap-1 text-center font-medium mb-2 text-black">
//             {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day => (
//               <div key={day} className="p-2">{day}</div>
//             ))}
//           </div>

//           <div className="grid grid-cols-7 gap-1">
//             {calendarDays.map((date, index) => {
//               const dayNumber = date.getDate();
//               const isCurrent = isCurrentMonth(date);
//               const isSelectedDate = isSelected(date);
//               const hasBookingDate = hasBooking(date);
//               const isPastDate = isPast(date);

//               return (
//                 <button
//                   key={index}
//                   onClick={() => !isPastDate && !hasBookingDate && onChange(date.toISOString().split('T')[0])}
//                   disabled={isPastDate || hasBookingDate}
//                   className={`p-2 text-center text-sm relative rounded-lg transition-colors ${
//                     !isCurrent
//                       ? 'text-gray-300 cursor-not-allowed'
//                       : isPastDate
//                         ? 'text-gray-300 cursor-not-allowed bg-gray-100'
//                         : isSelectedDate
//                           ? 'bg-blue-500 text-white font-semibold'
//                           : hasBookingDate
//                             ? 'bg-red-200 text-red-800 cursor-not-allowed'
//                             : 'text-black hover:bg-gray-100'
//                   }`}
//                 >
//                   {dayNumber}
//                   {hasBookingDate && !isSelectedDate && (
//                     <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full"></div>
//                   )}
//                 </button>
//               );
//             })}
//           </div>

//           <div className="mt-4 flex items-center justify-center gap-6 text-sm">
//             <div className="flex items-center gap-2">
//               <div className="w-3 h-3 bg-blue-500 rounded"></div>
//               <span className="text-black">Selected</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="w-3 h-3 bg-red-200 rounded"></div>
//               <span className="text-black">Booked</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="w-3 h-3 bg-gray-100 rounded"></div>
//               <span className="text-black">Past</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="space-y-6 text-black">

//       {error && (
//         <div className="p-3 bg-red-100 rounded">
//           <AlertCircle className="inline mr-2" />
//           {error}
//         </div>
//       )}

//       {success && (
//         <div className="p-3 bg-green-100 rounded">
//           <CheckCircle className="inline mr-2" />
//           {success}
//         </div>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

//         <div>
//           <label className="block mb-2 font-medium text-black">
//             <User className="inline w-4 h-4 mr-1" />
//             Nama User
//           </label>
//           <input
//             type="text"
//             name="userName"
//             value={formData.userName}
//             onChange={(e) =>
//               setFormData({ ...formData, userName: e.target.value })
//             }
//             className="w-full border rounded p-2 text-black"
//           />
//         </div>

//         <div>
//           <label className="block mb-2 font-medium text-black">
//             <Home className="inline w-4 h-4 mr-1" />
//             Pilih Unit
//           </label>
//           <select
//             value={formData.unitId}
//             onChange={(e) =>
//               setFormData({ ...formData, unitId: parseInt(e.target.value) })
//             }
//             className="w-full border rounded p-2 text-black"
//           >
//             <option value={0}>Pilih Unit</option>
//             {MOCK_UNITS.map(unit => (
//               <option key={unit.id} value={unit.id}>
//                 {unit.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label className="block mb-2 font-medium text-black">
//             <Users className="inline w-4 h-4 mr-1" />
//             Jumlah Tamu
//           </label>
//           <input
//             type="number"
//             min="1"
//             value={formData.guests}
//             onChange={(e) =>
//               setFormData({ ...formData, guests: parseInt(e.target.value) })
//             }
//             className="w-full border rounded p-2 text-black"
//           />
//         </div>
//       </div>

//       {/* DATE SECTION */}
//       <div className="grid md:grid-cols-2 gap-6">
//         <DatePicker
//           label="Tanggal Check-in"
//           value={formData.checkIn}
//           onChange={(date) =>
//             setFormData({ ...formData, checkIn: date })
//           }
//         />

//         <DatePicker
//           label="Tanggal Check-out"
//           value={formData.checkOut}
//           onChange={(date) =>
//             setFormData({ ...formData, checkOut: date })
//           }
//         />
//       </div>

//       {/* BOOKING BUTTON */}
//       <div className="flex justify-end pt-6">
//         <button
//           onClick={handleSubmit}
//           disabled={loading}
//           className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//         >
//           {loading ? 'Membuat Booking...' : 'Buat Booking'}
//         </button>
//       </div>

//     </div>
//   );
// }