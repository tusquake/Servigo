const { gql } = require('apollo-server-express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { users, services, slots, bookings, reviews, categories, dataHelpers } = require('./data');

// GraphQL Schema Definition
const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
    phone: String
    address: String
    specialization: String
    experience: String
    services: [Service!]!
    bookings: [Booking!]!
    createdAt: String!
  }

  type Service {
    id: ID!
    title: String!
    category: String!
    description: String
    price: Float!
    duration: Int
    rating: Float
    totalReviews: Int
    provider: User!
    slots: [Slot!]!
    createdAt: String!
  }

  type Slot {
    id: ID!
    service: Service!
    startTime: String!
    endTime: String!
    isBooked: Boolean!
  }

  type Booking {
    id: ID!
    customer: User!
    service: Service!
    slot: Slot!
    status: BookingStatus!
    notes: String
    totalAmount: Float!
    rejectionReason: String
    createdAt: String!
    confirmedAt: String
    completedAt: String
    rejectedAt: String
  }

  type Review {
    id: ID!
    booking: Booking!
    customer: User!
    service: Service!
    rating: Int!
    comment: String
    createdAt: String!
  }

  type Category {
    name: String!
    description: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  enum Role {
    CUSTOMER
    PROVIDER
    ADMIN
  }

  enum BookingStatus {
    PENDING
    CONFIRMED
    REJECTED
    COMPLETED
  }

  type Query {
    # User queries
    me: User
    users: [User!]!
    user(id: ID!): User

    # Service queries
    services(category: String, providerId: ID): [Service!]!
    service(id: ID!): Service
    categories: [Category!]!

    # Booking queries
    bookings(userId: ID, status: BookingStatus): [Booking!]!
    booking(id: ID!): Booking
    myBookings: [Booking!]!

    # Review queries
    reviews(serviceId: ID): [Review!]!
    serviceReviews(serviceId: ID!): [Review!]!

    # Slot queries
    availableSlots(serviceId: ID!): [Slot!]!
  }

  type Mutation {
    # Auth mutations
    register(name: String!, email: String!, password: String!, role: Role!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!

    # Service mutations
    createService(
      title: String!
      category: String!
      description: String
      price: Float!
      duration: Int
    ): Service!

    updateService(
      id: ID!
      title: String
      category: String
      description: String
      price: Float
      duration: Int
    ): Service!

    # Slot mutations
    createSlot(serviceId: ID!, startTime: String!, endTime: String!): Slot!
    deleteSlot(id: ID!): Boolean!

    # Booking mutations
    bookService(serviceId: ID!, slotId: ID!, notes: String): Booking!
    updateBookingStatus(id: ID!, status: BookingStatus!, rejectionReason: String): Booking!
    cancelBooking(id: ID!): Boolean!

    # Review mutations
    createReview(bookingId: ID!, rating: Int!, comment: String): Review!
  }
`;

// GraphQL Resolvers
const resolvers = {
  Query: {
    me: (_, __, { user }) => {
      if (!user) throw new Error('Authentication required');
      return dataHelpers.findUserById(user.id);
    },

    users: (_, __, { user }) => {
      if (!user || user.role !== 'ADMIN') throw new Error('Admin access required');
      return users;
    },

    user: (_, { id }) => dataHelpers.findUserById(id),

    services: (_, { category, providerId }) => {
      let filteredServices = services;
      
      if (category) {
        filteredServices = filteredServices.filter(service => service.category === category);
      }
      
      if (providerId) {
        filteredServices = filteredServices.filter(service => service.providerId === providerId);
      }
      
      return filteredServices;
    },

    service: (_, { id }) => services.find(service => service.id === id),

    categories: () => categories,

    bookings: (_, { userId, status }, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      let filteredBookings = bookings;
      
      if (userId) {
        if (user.role !== 'ADMIN' && user.id !== userId) {
          throw new Error('Access denied');
        }
        filteredBookings = filteredBookings.filter(booking => booking.customerId === userId);
      }
      
      if (status) {
        filteredBookings = filteredBookings.filter(booking => booking.status === status);
      }
      
      return filteredBookings;
    },

    booking: (_, { id }, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      const booking = bookings.find(b => b.id === id);
      if (!booking) return null;
      
      // Check if user has access to this booking
      if (user.role !== 'ADMIN' && user.id !== booking.customerId) {
        const service = services.find(s => s.id === booking.serviceId);
        if (!service || service.providerId !== user.id) {
          throw new Error('Access denied');
        }
      }
      
      return booking;
    },

    myBookings: (_, __, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      if (user.role === 'CUSTOMER') {
        return bookings.filter(booking => booking.customerId === user.id);
      } else if (user.role === 'PROVIDER') {
        return dataHelpers.findBookingsByProvider(user.id);
      }
      
      return bookings;
    },

    reviews: (_, { serviceId }) => {
      if (serviceId) {
        return reviews.filter(review => review.serviceId === serviceId);
      }
      return reviews;
    },

    serviceReviews: (_, { serviceId }) => {
      return reviews.filter(review => review.serviceId === serviceId);
    },

    availableSlots: (_, { serviceId }) => {
      return slots.filter(slot => slot.serviceId === serviceId && !slot.isBooked);
    }
  },

  Mutation: {
    register: async (_, { name, email, password, role }) => {
      // Check if user already exists
      if (dataHelpers.findUserByEmail(email)) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const newUser = {
        id: dataHelpers.generateId('user'),
        name,
        email,
        password: hashedPassword,
        role,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);

      // Generate JWT token
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      return { token, user: newUser };
    },

    login: async (_, { email, password }) => {
      // Find user
      const user = dataHelpers.findUserByEmail(email);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      return { token, user };
    },

    createService: (_, { title, category, description, price, duration }, { user }) => {
      if (!user || user.role !== 'PROVIDER') {
        throw new Error('Provider access required');
      }

      const newService = {
        id: dataHelpers.generateId('service'),
        title,
        category,
        description,
        price,
        duration,
        providerId: user.id,
        rating: 0,
        totalReviews: 0,
        createdAt: new Date().toISOString()
      };

      services.push(newService);
      return newService;
    },

    createSlot: (_, { serviceId, startTime, endTime }, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      const service = services.find(s => s.id === serviceId);
      if (!service) throw new Error('Service not found');
      
      if (user.role !== 'ADMIN' && service.providerId !== user.id) {
        throw new Error('Access denied');
      }

      const newSlot = {
        id: dataHelpers.generateId('slot'),
        serviceId,
        startTime,
        endTime,
        isBooked: false
      };

      slots.push(newSlot);
      return newSlot;
    },

    bookService: (_, { serviceId, slotId, notes }, { user }) => {
      if (!user || user.role !== 'CUSTOMER') {
        throw new Error('Customer access required');
      }

      const service = services.find(s => s.id === serviceId);
      const slot = slots.find(s => s.id === slotId);

      if (!service || !slot) {
        throw new Error('Service or slot not found');
      }

      if (slot.isBooked) {
        throw new Error('Slot is already booked');
      }

      // Mark slot as booked
      slot.isBooked = true;

      const newBooking = {
        id: dataHelpers.generateId('booking'),
        customerId: user.id,
        serviceId,
        slotId,
        status: 'PENDING',
        notes,
        totalAmount: service.price,
        createdAt: new Date().toISOString()
      };

      bookings.push(newBooking);
      return newBooking;
    },

    updateBookingStatus: (_, { id, status, rejectionReason }, { user }) => {
      if (!user) throw new Error('Authentication required');

      const booking = bookings.find(b => b.id === id);
      if (!booking) throw new Error('Booking not found');

      const service = services.find(s => s.id === booking.serviceId);
      
      // Only provider or admin can update booking status
      if (user.role !== 'ADMIN' && service.providerId !== user.id) {
        throw new Error('Access denied');
      }

      booking.status = status;
      
      if (status === 'REJECTED') {
        booking.rejectionReason = rejectionReason;
        booking.rejectedAt = new Date().toISOString();
        // Free up the slot
        const slot = slots.find(s => s.id === booking.slotId);
        if (slot) slot.isBooked = false;
      } else if (status === 'CONFIRMED') {
        booking.confirmedAt = new Date().toISOString();
      } else if (status === 'COMPLETED') {
        booking.completedAt = new Date().toISOString();
      }

      return booking;
    },

    createReview: (_, { bookingId, rating, comment }, { user }) => {
      if (!user) throw new Error('Authentication required');

      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) throw new Error('Booking not found');

      if (booking.customerId !== user.id) {
        throw new Error('Can only review your own bookings');
      }

      if (booking.status !== 'COMPLETED') {
        throw new Error('Can only review completed bookings');
      }

      const newReview = {
        id: dataHelpers.generateId('review'),
        bookingId,
        customerId: user.id,
        serviceId: booking.serviceId,
        rating,
        comment,
        createdAt: new Date().toISOString()
      };

      reviews.push(newReview);
      return newReview;
    }
  },

  // Type resolvers for nested fields
  User: {
    services: (user) => services.filter(service => service.providerId === user.id),
    bookings: (user) => {
      if (user.role === 'CUSTOMER') {
        return bookings.filter(booking => booking.customerId === user.id);
      } else if (user.role === 'PROVIDER') {
        return dataHelpers.findBookingsByProvider(user.id);
      }
      return [];
    }
  },

  Service: {
    provider: (service) => dataHelpers.findUserById(service.providerId),
    slots: (service) => slots.filter(slot => slot.serviceId === service.id)
  },

  Slot: {
    service: (slot) => services.find(service => service.id === slot.serviceId)
  },

  Booking: {
    customer: (booking) => dataHelpers.findUserById(booking.customerId),
    service: (booking) => services.find(service => service.id === booking.serviceId),
    slot: (booking) => slots.find(slot => slot.id === booking.slotId)
  },

  Review: {
    booking: (review) => bookings.find(booking => booking.id === review.bookingId),
    customer: (review) => dataHelpers.findUserById(review.customerId),
    service: (review) => services.find(service => service.id === review.serviceId)
  }
};

module.exports = { typeDefs, resolvers };