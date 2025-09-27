// GraphQL Client for Smart Service Booking System
class GraphQLClient {
    constructor() {
        // Automatically detect the correct endpoint based on current location
        const isLocalFile = window.location.protocol === 'file:';
        const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        if (isLocalFile || window.location.port === '5500') {
            // If running from file:// or Live Server (port 5500), connect to backend server
            this.endpoint = 'http://localhost:4000/graphql';
        } else if (isDevelopment) {
            // If running from our Express server, use relative path
            this.endpoint = '/graphql';
        } else {
            // Production - use relative path
            this.endpoint = '/graphql';
        }
        
        this.token = localStorage.getItem('token');
        
        console.log('GraphQL endpoint:', this.endpoint);
        console.log('Current location:', window.location.href);
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }

    // Get authentication headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    // Execute GraphQL query/mutation
    async execute(query, variables = {}) {
        console.log('Executing GraphQL request:', {
            endpoint: this.endpoint,
            query: query.substring(0, 100) + '...',
            variables
        });

        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    query,
                    variables
                })
            });

            console.log('Response status:', response.status, response.statusText);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`GraphQL endpoint not found. Make sure the server is running on the correct port.`);
                }
                if (response.status === 405) {
                    throw new Error(`Method not allowed. The GraphQL endpoint might not be configured correctly.`);
                }
                if (response.status === 0 || response.status >= 500) {
                    throw new Error(`Network error. Please check if the server is running.`);
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Non-JSON response:', text);
                throw new Error(`Expected JSON response but got ${contentType}. Response: ${text.substring(0, 200)}`);
            }

            const result = await response.json();
            console.log('GraphQL response:', result);

            if (result.errors) {
                throw new Error(result.errors[0].message);
            }

            return result.data;
        } catch (error) {
            console.error('GraphQL Error Details:', {
                message: error.message,
                endpoint: this.endpoint,
                error: error
            });
            
            // Provide more helpful error messages
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                throw new Error('Cannot connect to server. Please make sure:\n1. The server is running (npm run dev)\n2. You\'re accessing the app at http://localhost:4000\n3. No firewall is blocking the connection');
            }
            
            throw error;
        }
    }

    // Test connection to server
    async testConnection() {
        try {
            const testEndpoint = this.endpoint.replace('/graphql', '/health');
            const response = await fetch(testEndpoint);
            const data = await response.json();
            console.log('Server health check:', data);
            return data.status === 'OK';
        } catch (error) {
            console.error('Connection test failed:', error);
            return false;
        }
    }
}

// GraphQL Queries and Mutations
const GraphQLQueries = {
    // Auth Queries
    LOGIN: `
        mutation Login($email: String!, $password: String!) {
            login(email: $email, password: $password) {
                token
                user {
                    id
                    name
                    email
                    role
                    phone
                    address
                    specialization
                    experience
                }
            }
        }
    `,

    REGISTER: `
        mutation Register($name: String!, $email: String!, $password: String!, $role: Role!) {
            register(name: $name, email: $email, password: $password, role: $role) {
                token
                user {
                    id
                    name
                    email
                    role
                    phone
                    address
                    specialization
                    experience
                }
            }
        }
    `,

    ME: `
        query Me {
            me {
                id
                name
                email
                role
                phone
                address
                specialization
                experience
                createdAt
            }
        }
    `,

    // Service Queries
    GET_SERVICES: `
        query GetServices($category: String, $providerId: ID) {
            services(category: $category, providerId: $providerId) {
                id
                title
                category
                description
                price
                duration
                rating
                totalReviews
                createdAt
                provider {
                    id
                    name
                    specialization
                    experience
                }
            }
        }
    `,

    GET_SERVICE: `
        query GetService($id: ID!) {
            service(id: $id) {
                id
                title
                category
                description
                price
                duration
                rating
                totalReviews
                createdAt
                provider {
                    id
                    name
                    email
                    phone
                    address
                    specialization
                    experience
                }
                slots {
                    id
                    startTime
                    endTime
                    isBooked
                }
            }
        }
    `,

    GET_AVAILABLE_SLOTS: `
        query GetAvailableSlots($serviceId: ID!) {
            availableSlots(serviceId: $serviceId) {
                id
                startTime
                endTime
                isBooked
            }
        }
    `,

    GET_CATEGORIES: `
        query GetCategories {
            categories {
                name
                description
            }
        }
    `,

    // Booking Queries
    GET_MY_BOOKINGS: `
        query GetMyBookings {
            myBookings {
                id
                status
                notes
                totalAmount
                rejectionReason
                createdAt
                confirmedAt
                completedAt
                rejectedAt
                customer {
                    id
                    name
                    email
                    phone
                }
                service {
                    id
                    title
                    category
                    description
                    provider {
                        id
                        name
                        phone
                        address
                    }
                }
                slot {
                    id
                    startTime
                    endTime
                }
            }
        }
    `,

    GET_BOOKINGS: `
        query GetBookings($userId: ID, $status: BookingStatus) {
            bookings(userId: $userId, status: $status) {
                id
                status
                notes
                totalAmount
                rejectionReason
                createdAt
                confirmedAt
                completedAt
                rejectedAt
                customer {
                    id
                    name
                    email
                    phone
                }
                service {
                    id
                    title
                    category
                    description
                    provider {
                        id
                        name
                        phone
                        address
                    }
                }
                slot {
                    id
                    startTime
                    endTime
                }
            }
        }
    `,

    // Service Management
    CREATE_SERVICE: `
        mutation CreateService($title: String!, $category: String!, $description: String, $price: Float!, $duration: Int) {
            createService(title: $title, category: $category, description: $description, price: $price, duration: $duration) {
                id
                title
                category
                description
                price
                duration
                rating
                totalReviews
                createdAt
                provider {
                    id
                    name
                }
            }
        }
    `,

    CREATE_SLOT: `
        mutation CreateSlot($serviceId: ID!, $startTime: String!, $endTime: String!) {
            createSlot(serviceId: $serviceId, startTime: $startTime, endTime: $endTime) {
                id
                startTime
                endTime
                isBooked
            }
        }
    `,

    // Booking Management
    BOOK_SERVICE: `
        mutation BookService($serviceId: ID!, $slotId: ID!, $notes: String) {
            bookService(serviceId: $serviceId, slotId: $slotId, notes: $notes) {
                id
                status
                notes
                totalAmount
                createdAt
                customer {
                    id
                    name
                }
                service {
                    id
                    title
                    category
                    price
                    provider {
                        id
                        name
                    }
                }
                slot {
                    id
                    startTime
                    endTime
                }
            }
        }
    `,

    UPDATE_BOOKING_STATUS: `
        mutation UpdateBookingStatus($id: ID!, $status: BookingStatus!, $rejectionReason: String) {
            updateBookingStatus(id: $id, status: $status, rejectionReason: $rejectionReason) {
                id
                status
                rejectionReason
                confirmedAt
                completedAt
                rejectedAt
            }
        }
    `,

    CANCEL_BOOKING: `
        mutation CancelBooking($id: ID!) {
            cancelBooking(id: $id)
        }
    `,

    // Review Management
    CREATE_REVIEW: `
        mutation CreateReview($bookingId: ID!, $rating: Int!, $comment: String) {
            createReview(bookingId: $bookingId, rating: $rating, comment: $comment) {
                id
                rating
                comment
                createdAt
                customer {
                    id
                    name
                }
                service {
                    id
                    title
                }
            }
        }
    `,

    GET_SERVICE_REVIEWS: `
        query GetServiceReviews($serviceId: ID!) {
            serviceReviews(serviceId: $serviceId) {
                id
                rating
                comment
                createdAt
                customer {
                    id
                    name
                }
            }
        }
    `
};

// Utility functions for formatting
const Utils = {
    formatDate: (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    formatTime: (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    formatDateTime: (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    formatPrice: (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    },

    formatDuration: (minutes) => {
        if (minutes < 60) {
            return `${minutes} min`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        if (remainingMinutes === 0) {
            return `${hours} hr`;
        }
        return `${hours} hr ${remainingMinutes} min`;
    },

    getStatusColor: (status) => {
        const colors = {
            'PENDING': 'warning',
            'CONFIRMED': 'success',
            'COMPLETED': 'info',
            'REJECTED': 'error'
        };
        return colors[status] || 'secondary';
    },

    getRoleDisplayName: (role) => {
        const names = {
            'CUSTOMER': 'Customer',
            'PROVIDER': 'Service Provider',
            'ADMIN': 'Administrator'
        };
        return names[role] || role;
    },

    generateInitials: (name) => {
        return name.split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    },

    isSlotInPast: (startTime) => {
        return new Date(startTime) < new Date();
    },

    getDayFromDate: (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric'
            });
        }
    },

    validateEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    validatePassword: (password) => {
        // At least 6 characters
        return password.length >= 6;
    },

    debounce: (func, delay) => {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }
};

// Initialize GraphQL client
const graphqlClient = new GraphQLClient();