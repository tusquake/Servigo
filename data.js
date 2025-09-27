// Mock data store for Smart Service Booking System
let nextUserId = 6;
let nextServiceId = 8;
let nextSlotId = 16;
let nextBookingId = 6;
let nextReviewId = 4;

// Users data
const users = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    password: "$2a$10$K7L/lQIe5l2vHRVaznCEcuAGmBhc1vcjM7Kk2qNhFzRg8P7XyLfnS", // password: "password123"
    role: "CUSTOMER",
    phone: "+1-555-0101",
    address: "123 Main St, New York, NY",
    createdAt: "2025-01-15T08:00:00Z"
  },
  {
    id: "2",
    name: "Sarah Wilson",
    email: "sarah@example.com",
    password: "$2a$10$K7L/lQIe5l2vHRVaznCEcuAGmBhc1vcjM7Kk2qNhFzRg8P7XyLfnS",
    role: "PROVIDER",
    phone: "+1-555-0102",
    address: "456 Oak Ave, New York, NY",
    specialization: "Plumbing Services",
    experience: "8 years",
    createdAt: "2025-01-10T10:30:00Z"
  },
  {
    id: "3",
    name: "Dr. Emily Chen",
    email: "emily.chen@example.com",
    password: "$2a$10$K7L/lQIe5l2vHRVaznCEcuAGmBhc1vcjM7Kk2qNhFzRg8P7XyLfnS",
    role: "PROVIDER",
    phone: "+1-555-0103",
    address: "789 Medical Center, New York, NY",
    specialization: "General Medicine",
    experience: "12 years",
    createdAt: "2025-01-05T14:20:00Z"
  },
  {
    id: "4",
    name: "Mike Johnson",
    email: "mike@example.com",
    password: "$2a$10$K7L/lQIe5l2vHRVaznCEcuAGmBhc1vcjM7Kk2qNhFzRg8P7XyLfnS",
    role: "PROVIDER",
    phone: "+1-555-0104",
    address: "321 Electric St, New York, NY",
    specialization: "Electrical Services",
    experience: "15 years",
    createdAt: "2025-01-08T09:15:00Z"
  },
  {
    id: "5",
    name: "Admin User",
    email: "admin@example.com",
    password: "$2a$10$K7L/lQIe5l2vHRVaznCEcuAGmBhc1vcjM7Kk2qNhFzRg8P7XyLfnS",
    role: "ADMIN",
    phone: "+1-555-0105",
    address: "System Administrator",
    createdAt: "2025-01-01T00:00:00Z"
  }
];

// Services data
const services = [
  {
    id: "1",
    title: "Emergency Plumbing Repair",
    category: "Plumbing",
    description: "Quick fixes for leaks, clogs, and pipe issues. Available 24/7 for urgent repairs.",
    price: 150.00,
    providerId: "2",
    duration: 120, // minutes
    rating: 4.8,
    totalReviews: 45,
    createdAt: "2025-01-10T11:00:00Z"
  },
  {
    id: "2",
    title: "Bathroom Installation",
    category: "Plumbing",
    description: "Complete bathroom renovation including fixtures, pipes, and water systems.",
    price: 800.00,
    providerId: "2",
    duration: 480, // 8 hours
    rating: 4.9,
    totalReviews: 23,
    createdAt: "2025-01-10T11:15:00Z"
  },
  {
    id: "3",
    title: "General Health Checkup",
    category: "Healthcare",
    description: "Comprehensive health examination including vital signs, basic lab work, and consultation.",
    price: 200.00,
    providerId: "3",
    duration: 60,
    rating: 4.7,
    totalReviews: 78,
    createdAt: "2025-01-05T15:00:00Z"
  },
  {
    id: "4",
    title: "Vaccination Service",
    category: "Healthcare",
    description: "COVID-19, flu, and other routine vaccinations with proper documentation.",
    price: 50.00,
    providerId: "3",
    duration: 30,
    rating: 4.9,
    totalReviews: 156,
    createdAt: "2025-01-05T15:30:00Z"
  },
  {
    id: "5",
    title: "Home Electrical Inspection",
    category: "Electrical",
    description: "Complete electrical system inspection for safety and code compliance.",
    price: 180.00,
    providerId: "4",
    duration: 180,
    rating: 4.6,
    totalReviews: 34,
    createdAt: "2025-01-08T10:00:00Z"
  },
  {
    id: "6",
    title: "Ceiling Fan Installation",
    category: "Electrical",
    description: "Professional installation of ceiling fans including wiring and mounting.",
    price: 120.00,
    providerId: "4",
    duration: 90,
    rating: 4.8,
    totalReviews: 67,
    createdAt: "2025-01-08T10:30:00Z"
  },
  {
    id: "7",
    title: "Kitchen Sink Repair",
    category: "Plumbing",
    description: "Fix leaky faucets, replace garbage disposal, and sink drain cleaning.",
    price: 95.00,
    providerId: "2",
    duration: 75,
    rating: 4.5,
    totalReviews: 29,
    createdAt: "2025-01-10T12:00:00Z"
  }
];

// Available time slots
const slots = [
  // Sarah Wilson (Plumber) slots - Service IDs 1, 2, 7
  { id: "1", serviceId: "1", startTime: "2025-09-28T09:00:00Z", endTime: "2025-09-28T11:00:00Z", isBooked: false },
  { id: "2", serviceId: "1", startTime: "2025-09-28T14:00:00Z", endTime: "2025-09-28T16:00:00Z", isBooked: true },
  { id: "3", serviceId: "2", startTime: "2025-09-30T08:00:00Z", endTime: "2025-09-30T16:00:00Z", isBooked: false },
  { id: "4", serviceId: "7", startTime: "2025-09-29T10:00:00Z", endTime: "2025-09-29T11:15:00Z", isBooked: false },
  
  // Dr. Emily Chen slots - Service IDs 3, 4
  { id: "5", serviceId: "3", startTime: "2025-09-28T10:00:00Z", endTime: "2025-09-28T11:00:00Z", isBooked: false },
  { id: "6", serviceId: "3", startTime: "2025-09-28T15:00:00Z", endTime: "2025-09-28T16:00:00Z", isBooked: true },
  { id: "7", serviceId: "4", startTime: "2025-09-29T09:00:00Z", endTime: "2025-09-29T09:30:00Z", isBooked: false },
  { id: "8", serviceId: "4", startTime: "2025-09-29T11:30:00Z", endTime: "2025-09-29T12:00:00Z", isBooked: false },
  
  // Mike Johnson (Electrician) slots - Service IDs 5, 6
  { id: "9", serviceId: "5", startTime: "2025-09-29T08:00:00Z", endTime: "2025-09-29T11:00:00Z", isBooked: false },
  { id: "10", serviceId: "6", startTime: "2025-09-28T13:00:00Z", endTime: "2025-09-28T14:30:00Z", isBooked: false },
  { id: "11", serviceId: "6", startTime: "2025-09-30T10:00:00Z", endTime: "2025-09-30T11:30:00Z", isBooked: true },
  
  // Additional future slots
  { id: "12", serviceId: "1", startTime: "2025-10-01T09:00:00Z", endTime: "2025-10-01T11:00:00Z", isBooked: false },
  { id: "13", serviceId: "3", startTime: "2025-10-01T14:00:00Z", endTime: "2025-10-01T15:00:00Z", isBooked: false },
  { id: "14", serviceId: "5", startTime: "2025-10-02T09:00:00Z", endTime: "2025-10-02T12:00:00Z", isBooked: false },
  { id: "15", serviceId: "4", startTime: "2025-10-01T16:00:00Z", endTime: "2025-10-01T16:30:00Z", isBooked: false }
];

// Bookings data
const bookings = [
  {
    id: "1",
    customerId: "1",
    serviceId: "1",
    slotId: "2",
    status: "CONFIRMED",
    notes: "Emergency repair needed ASAP",
    totalAmount: 150.00,
    createdAt: "2025-09-26T14:30:00Z",
    confirmedAt: "2025-09-26T15:00:00Z"
  },
  {
    id: "2",
    customerId: "1",
    serviceId: "3",
    slotId: "6",
    status: "COMPLETED",
    notes: "Annual checkup",
    totalAmount: 200.00,
    createdAt: "2025-09-25T10:20:00Z",
    confirmedAt: "2025-09-25T10:45:00Z",
    completedAt: "2025-09-28T16:00:00Z"
  },
  {
    id: "3",
    customerId: "1",
    serviceId: "6",
    slotId: "11",
    status: "PENDING",
    notes: "Install ceiling fan in living room",
    totalAmount: 120.00,
    createdAt: "2025-09-27T09:15:00Z"
  },
  {
    id: "4",
    customerId: "1",
    serviceId: "4",
    slotId: "7",
    status: "REJECTED",
    notes: "Flu vaccination",
    rejectionReason: "Slot no longer available",
    totalAmount: 50.00,
    createdAt: "2025-09-26T16:00:00Z",
    rejectedAt: "2025-09-26T18:30:00Z"
  },
  {
    id: "5",
    customerId: "1",
    serviceId: "5",
    slotId: "9",
    status: "CONFIRMED",
    notes: "Pre-purchase home inspection",
    totalAmount: 180.00,
    createdAt: "2025-09-27T11:00:00Z",
    confirmedAt: "2025-09-27T12:15:00Z"
  }
];

// Reviews data
const reviews = [
  {
    id: "1",
    bookingId: "2",
    customerId: "1",
    serviceId: "3",
    rating: 5,
    comment: "Dr. Chen was very thorough and professional. Explained everything clearly and made me feel comfortable throughout the checkup.",
    createdAt: "2025-09-28T17:30:00Z"
  },
  {
    id: "2",
    bookingId: "1",
    customerId: "1",
    serviceId: "1",
    rating: 4,
    comment: "Sarah fixed the leak quickly and efficiently. Arrived on time and cleaned up after the work. Would recommend!",
    createdAt: "2025-09-28T18:00:00Z"
  },
  {
    id: "3",
    bookingId: "5",
    customerId: "1",
    serviceId: "5",
    rating: 5,
    comment: "Mike did a comprehensive electrical inspection and provided a detailed report. Very knowledgeable and professional.",
    createdAt: "2025-09-29T13:45:00Z"
  }
];

// Categories for easy filtering
const categories = [
  { name: "Plumbing", description: "Water, pipes, and drainage services" },
  { name: "Electrical", description: "Electrical installations and repairs" },
  { name: "Healthcare", description: "Medical consultations and treatments" },
  { name: "Tutoring", description: "Educational services and lessons" },
  { name: "Cleaning", description: "Home and office cleaning services" },
  { name: "Automotive", description: "Car repair and maintenance" },
  { name: "Beauty", description: "Hair, makeup, and wellness services" }
];

// Helper functions for data operations
const dataHelpers = {
  // Generate next ID
  generateId: (type) => {
    switch(type) {
      case 'user': return String(++nextUserId);
      case 'service': return String(++nextServiceId);
      case 'slot': return String(++nextSlotId);
      case 'booking': return String(++nextBookingId);
      case 'review': return String(++nextReviewId);
      default: return String(Date.now());
    }
  },

  // Find user by email
  findUserByEmail: (email) => users.find(user => user.email === email),

  // Find user by ID
  findUserById: (id) => users.find(user => user.id === id),

  // Find services by provider
  findServicesByProvider: (providerId) => services.filter(service => service.providerId === providerId),

  // Find available slots for a service
  findAvailableSlots: (serviceId) => slots.filter(slot => slot.serviceId === serviceId && !slot.isBooked),

  // Find bookings by user
  findBookingsByUser: (userId) => bookings.filter(booking => booking.customerId === userId),

  // Find bookings by provider
  findBookingsByProvider: (providerId) => {
    const providerServices = services.filter(service => service.providerId === providerId).map(s => s.id);
    return bookings.filter(booking => providerServices.includes(booking.serviceId));
  }
};

module.exports = {
  users,
  services,
  slots,
  bookings,
  reviews,
  categories,
  dataHelpers
};