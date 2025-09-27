// Main Application Logic for Smart Service Booking System

class App {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'hero';
        this.services = [];
        this.bookings = [];
        this.selectedService = null;
        this.selectedSlot = null;
        
        this.initializeApp();
        this.bindEvents();
        this.checkAuthStatus();
    }

    initializeApp() {
        // Hide all sections except hero initially
        this.showSection('hero');
    }

    bindEvents() {
        // Navigation events
        document.getElementById('servicesLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.showServicesSection();
        });

        document.getElementById('bookingsLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.showBookingsSection();
        });

        document.getElementById('profileLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.showProfileSection();
        });

        // Hero section events
        document.getElementById('browseServicesBtn').addEventListener('click', () => {
            this.showServicesSection();
        });

        document.getElementById('becomeProviderBtn').addEventListener('click', () => {
            this.showRegisterModal('PROVIDER');
        });

        // Auth events
        document.getElementById('loginBtn').addEventListener('click', () => {
            this.showLoginModal();
        });

        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Modal events
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModals();
            });
        });

        // Click outside modal to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModals();
                }
            });
        });

        // Auth form events
        document.getElementById('authForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAuthSubmit();
        });

        document.getElementById('switchToRegister').addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegisterModal();
        });

        document.getElementById('switchToLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginModal();
        });

        // Filter events
        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.filterServices(e.target.value);
        });

        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.filterBookings(e.target.value);
        });

        document.getElementById('refreshServices').addEventListener('click', () => {
            this.loadServices();
        });

        // Booking form events
        document.getElementById('bookingForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleBookingSubmit();
        });
    }

    // Authentication Methods
    async checkAuthStatus() {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const data = await graphqlClient.execute(GraphQLQueries.ME);
                this.currentUser = data.me;
                this.updateUIForAuthenticatedUser();
            } catch (error) {
                console.error('Auth check failed:', error);
                this.logout();
            }
        }
    }

    async handleAuthSubmit() {
        const formData = new FormData(document.getElementById('authForm'));
        const isLogin = document.getElementById('nameField').style.display === 'none';
        
        const email = formData.get('email');
        const password = formData.get('password');

        if (!Utils.validateEmail(email)) {
            this.showToast('Please enter a valid email address', 'error');
            return;
        }

        if (!Utils.validatePassword(password)) {
            this.showToast('Password must be at least 6 characters long', 'error');
            return;
        }

        this.showLoading(true);

        try {
            let result;
            if (isLogin) {
                result = await graphqlClient.execute(GraphQLQueries.LOGIN, {
                    email,
                    password
                });
                result = result.login;
            } else {
                const name = formData.get('name');
                const role = formData.get('role');
                
                if (!name || name.trim().length < 2) {
                    this.showToast('Please enter a valid name', 'error');
                    this.showLoading(false);
                    return;
                }
                
                result = await graphqlClient.execute(GraphQLQueries.REGISTER, {
                    name: name.trim(),
                    email,
                    password,
                    role
                });
                result = result.register;
            }

            graphqlClient.setToken(result.token);
            this.currentUser = result.user;
            this.updateUIForAuthenticatedUser();
            this.closeModals();
            this.showToast(`Welcome, ${result.user.name}!`, 'success');
            
        } catch (error) {
            this.showToast(error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    logout() {
        graphqlClient.setToken(null);
        this.currentUser = null;
        this.updateUIForUnauthenticatedUser();
        this.showSection('hero');
        this.showToast('You have been logged out', 'info');
    }

    updateUIForAuthenticatedUser() {
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'inline-block';
        
        // Show navigation links
        document.getElementById('servicesLink').style.display = 'inline-block';
        document.getElementById('bookingsLink').style.display = 'inline-block';
        document.getElementById('profileLink').style.display = 'inline-block';
    }

    updateUIForUnauthenticatedUser() {
        document.getElementById('loginBtn').style.display = 'inline-block';
        document.getElementById('logoutBtn').style.display = 'none';
        
        // Hide navigation links
        document.getElementById('servicesLink').style.display = 'none';
        document.getElementById('bookingsLink').style.display = 'none';
        document.getElementById('profileLink').style.display = 'none';
    }

    // Section Management
    showSection(sectionName) {
        // Hide all sections
        document.getElementById('heroSection').style.display = 'none';
        document.getElementById('servicesSection').style.display = 'none';
        document.getElementById('bookingsSection').style.display = 'none';
        document.getElementById('profileSection').style.display = 'none';

        // Show target section
        document.getElementById(`${sectionName}Section`).style.display = 'block';
        this.currentSection = sectionName;
    }

    async showServicesSection() {
        this.showSection('services');
        if (this.services.length === 0) {
            await this.loadServices();
        }
    }

    async showBookingsSection() {
        if (!this.currentUser) {
            this.showToast('Please login to view your bookings', 'warning');
            this.showLoginModal();
            return;
        }
        
        this.showSection('bookings');
        await this.loadBookings();
    }

    async showProfileSection() {
        if (!this.currentUser) {
            this.showToast('Please login to view your profile', 'warning');
            this.showLoginModal();
            return;
        }
        
        this.showSection('profile');
        this.renderProfile();
    }

    // Services Methods
    async loadServices(category = null) {
        this.showLoading(true);
        
        try {
            const data = await graphqlClient.execute(GraphQLQueries.GET_SERVICES, {
                category
            });
            
            this.services = data.services;
            this.renderServices(this.services);
        } catch (error) {
            console.error('Failed to load services:', error);
            this.showToast('Failed to load services', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    renderServices(services) {
        const grid = document.getElementById('servicesGrid');
        
        if (services.length === 0) {
            grid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search" style="font-size: 3rem; color: #64748b; margin-bottom: 1rem;"></i>
                    <h3>No services found</h3>
                    <p>Try adjusting your filters or check back later.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = services.map(service => `
            <div class="service-card" onclick="app.showServiceDetails('${service.id}')">
                <div class="service-card-header">
                    <div>
                        <h3 class="service-title">${service.title}</h3>
                        <div class="service-provider">by ${service.provider.name}</div>
                    </div>
                    <span class="service-category">${service.category}</span>
                </div>
                
                <p class="service-description">${service.description || 'No description available'}</p>
                
                <div class="service-meta">
                    <div class="service-price">${Utils.formatPrice(service.price)}</div>
                    <div class="service-rating">
                        ${'★'.repeat(Math.floor(service.rating || 0))}${'☆'.repeat(5 - Math.floor(service.rating || 0))}
                        <span>(${service.totalReviews || 0})</span>
                    </div>
                </div>
                
                ${service.duration ? `<div style="color: #64748b; font-size: 0.9rem; margin: 1rem 0;"><i class="fas fa-clock"></i> ${Utils.formatDuration(service.duration)}</div>` : ''}
                
                <div class="service-actions">
                    <button class="btn btn-outline btn-small" onclick="event.stopPropagation(); app.showServiceDetails('${service.id}')">
                        View Details
                    </button>
                    ${this.currentUser && this.currentUser.role === 'CUSTOMER' ? 
                        `<button class="btn btn-primary btn-small" onclick="event.stopPropagation(); app.showBookingModal('${service.id}')">Book Now</button>` : 
                        ''
                    }
                </div>
            </div>
        `).join('');
    }

    async showServiceDetails(serviceId) {
        this.showLoading(true);
        
        try {
            const data = await graphqlClient.execute(GraphQLQueries.GET_SERVICE, {
                id: serviceId
            });
            
            const service = data.service;
            if (!service) {
                throw new Error('Service not found');
            }
            
            document.getElementById('serviceTitle').textContent = service.title;
            document.getElementById('serviceDetails').innerHTML = `
                <div class="service-detail-grid">
                    <div class="service-info">
                        <h4>Description</h4>
                        <p>${service.description || 'No description available'}</p>
                        
                        <h4>Provider Information</h4>
                        <div class="provider-info" style="background-color: #f8fafc; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
                            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                                <div class="profile-avatar" style="width: 50px; height: 50px; font-size: 1.2rem;">
                                    ${Utils.generateInitials(service.provider.name)}
                                </div>
                                <div>
                                    <div style="font-weight: 600; color: #1e293b;">${service.provider.name}</div>
                                    <div style="color: #64748b;">${service.provider.specialization || 'Service Provider'}</div>
                                </div>
                            </div>
                            ${service.provider.experience ? `<div style="color: #64748b;"><strong>Experience:</strong> ${service.provider.experience}</div>` : ''}
                            ${service.provider.address ? `<div style="color: #64748b;"><strong>Location:</strong> ${service.provider.address}</div>` : ''}
                        </div>
                        
                        ${this.currentUser && this.currentUser.role === 'CUSTOMER' ? 
                            `<button class="btn btn-primary" onclick="app.showBookingModal('${service.id}'); app.closeModals();">Book This Service</button>` : 
                            ''
                        }
                    </div>
                    
                    <div class="service-stats">
                        <div class="stat-item">
                            <span class="stat-label">Price</span>
                            <span class="stat-value">${Utils.formatPrice(service.price)}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Category</span>
                            <span class="stat-value">${service.category}</span>
                        </div>
                        ${service.duration ? `
                            <div class="stat-item">
                                <span class="stat-label">Duration</span>
                                <span class="stat-value">${Utils.formatDuration(service.duration)}</span>
                            </div>
                        ` : ''}
                        <div class="stat-item">
                            <span class="stat-label">Rating</span>
                            <span class="stat-value">
                                ${'★'.repeat(Math.floor(service.rating || 0))}${'☆'.repeat(5 - Math.floor(service.rating || 0))}
                                (${service.totalReviews || 0})
                            </span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Available Slots</span>
                            <span class="stat-value">${service.slots.filter(slot => !slot.isBooked && !Utils.isSlotInPast(slot.startTime)).length}</span>
                        </div>
                    </div>
                </div>
            `;
            
            document.getElementById('serviceModal').style.display = 'block';
        } catch (error) {
            console.error('Failed to load service details:', error);
            this.showToast('Failed to load service details', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    filterServices(category) {
        if (category) {
            const filteredServices = this.services.filter(service => service.category === category);
            this.renderServices(filteredServices);
        } else {
            this.renderServices(this.services);
        }
    }

    // Booking Methods
    async showBookingModal(serviceId) {
        if (!this.currentUser || this.currentUser.role !== 'CUSTOMER') {
            this.showToast('Please login as a customer to book services', 'warning');
            this.showLoginModal();
            return;
        }

        this.showLoading(true);

        try {
            const data = await graphqlClient.execute(GraphQLQueries.GET_SERVICE, {
                id: serviceId
            });
            
            const service = data.service;
            this.selectedService = service;
            
            // Update service info in modal
            document.getElementById('selectedServiceId').value = serviceId;
            document.getElementById('selectedServiceInfo').innerHTML = `
                <div class="selected-service-title">${service.title}</div>
                <div style="color: #64748b; margin: 0.5rem 0;">${service.category} • by ${service.provider.name}</div>
                <div class="selected-service-price">${Utils.formatPrice(service.price)}</div>
            `;
            
            // Load available slots
            await this.loadAvailableSlots(serviceId);
            
            document.getElementById('bookingModal').style.display = 'block';
        } catch (error) {
            console.error('Failed to load booking data:', error);
            this.showToast('Failed to load booking information', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async loadAvailableSlots(serviceId) {
        try {
            const data = await graphqlClient.execute(GraphQLQueries.GET_AVAILABLE_SLOTS, {
                serviceId
            });
            
            const slots = data.availableSlots.filter(slot => !Utils.isSlotInPast(slot.startTime));
            
            const slotsContainer = document.getElementById('availableSlots');
            
            if (slots.length === 0) {
                slotsContainer.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: #64748b;">
                        <i class="fas fa-calendar-times" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                        <div>No available slots at the moment</div>
                        <div style="font-size: 0.9rem; margin-top: 0.5rem;">Please check back later or contact the provider directly.</div>
                    </div>
                `;
                return;
            }
            
            slotsContainer.innerHTML = slots.map(slot => `
                <div class="slot-option" onclick="app.selectSlot('${slot.id}', this)">
                    <div class="slot-time">${Utils.formatTime(slot.startTime)} - ${Utils.formatTime(slot.endTime)}</div>
                    <div class="slot-date">${Utils.getDayFromDate(slot.startTime)}</div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Failed to load available slots:', error);
            this.showToast('Failed to load available time slots', 'error');
        }
    }

    selectSlot(slotId, element) {
        // Remove selection from other slots
        document.querySelectorAll('.slot-option').forEach(slot => {
            slot.classList.remove('selected');
        });
        
        // Select this slot
        element.classList.add('selected');
        this.selectedSlot = slotId;
        document.getElementById('selectedSlotId').value = slotId;
    }

    async handleBookingSubmit() {
        const serviceId = document.getElementById('selectedServiceId').value;
        const slotId = document.getElementById('selectedSlotId').value;
        const notes = document.getElementById('bookingNotes').value.trim();

        if (!slotId) {
            this.showToast('Please select a time slot', 'warning');
            return;
        }

        this.showLoading(true);

        try {
            const data = await graphqlClient.execute(GraphQLQueries.BOOK_SERVICE, {
                serviceId,
                slotId,
                notes: notes || null
            });

            this.showToast('Booking created successfully! Waiting for provider confirmation.', 'success');
            this.closeModals();
            
            // Refresh bookings if we're on the bookings page
            if (this.currentSection === 'bookings') {
                await this.loadBookings();
            }
            
            // Clear form
            document.getElementById('bookingForm').reset();
            document.getElementById('selectedSlotId').value = '';
            document.querySelectorAll('.slot-option').forEach(slot => {
                slot.classList.remove('selected');
            });
            
        } catch (error) {
            console.error('Booking failed:', error);
            this.showToast(error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async loadBookings(status = null) {
        this.showLoading(true);
        
        try {
            const data = await graphqlClient.execute(GraphQLQueries.GET_MY_BOOKINGS);
            let bookings = data.myBookings;
            
            if (status) {
                bookings = bookings.filter(booking => booking.status === status);
            }
            
            this.bookings = bookings;
            this.renderBookings(bookings);
        } catch (error) {
            console.error('Failed to load bookings:', error);
            this.showToast('Failed to load bookings', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    renderBookings(bookings) {
        const grid = document.getElementById('bookingsGrid');
        
        if (bookings.length === 0) {
            grid.innerHTML = `
                <div class="no-results" style="text-align: center; padding: 3rem; color: #64748b;">
                    <i class="fas fa-calendar-check" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <h3>No bookings found</h3>
                    <p>You haven't made any bookings yet. <a href="#" onclick="app.showServicesSection()" style="color: #667eea;">Browse services</a> to get started!</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = bookings.map(booking => `
            <div class="booking-card ${booking.status.toLowerCase()}">
                <div class="booking-header">
                    <div>
                        <div class="booking-service">${booking.service.title}</div>
                        <div style="color: #64748b; font-size: 0.9rem;">by ${booking.service.provider.name}</div>
                    </div>
                    <span class="booking-status status-${booking.status.toLowerCase()}">${booking.status}</span>
                </div>
                
                <div class="booking-details">
                    <div class="booking-time">
                        <i class="fas fa-clock"></i>
                        ${Utils.formatDateTime(booking.slot.startTime)} - ${Utils.formatTime(booking.slot.endTime)}
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
                        <div class="booking-price">${Utils.formatPrice(booking.totalAmount)}</div>
                        <div style="color: #64748b; font-size: 0.9rem;">
                            Booked on ${Utils.formatDate(booking.createdAt)}
                        </div>
                    </div>
                    
                    ${booking.notes ? `
                        <div style="margin-top: 1rem; padding: 0.75rem; background-color: #f8fafc; border-radius: 6px; border-left: 3px solid #667eea;">
                            <strong>Notes:</strong> ${booking.notes}
                        </div>
                    ` : ''}
                    
                    ${booking.rejectionReason ? `
                        <div style="margin-top: 1rem; padding: 0.75rem; background-color: #fef2f2; border-radius: 6px; border-left: 3px solid #ef4444; color: #dc2626;">
                            <strong>Rejection Reason:</strong> ${booking.rejectionReason}
                        </div>
                    ` : ''}
                </div>
                
                ${this.renderBookingActions(booking)}
            </div>
        `).join('');
    }

    renderBookingActions(booking) {
        const actions = [];
        
        if (booking.status === 'PENDING' && this.currentUser.role === 'CUSTOMER') {
            actions.push(`<button class="btn btn-secondary btn-small" onclick="app.cancelBooking('${booking.id}')">Cancel</button>`);
        }
        
        if (booking.status === 'COMPLETED' && this.currentUser.role === 'CUSTOMER') {
            actions.push(`<button class="btn btn-primary btn-small" onclick="app.showReviewModal('${booking.id}')">Write Review</button>`);
        }
        
        if (booking.status === 'PENDING' && this.currentUser.role === 'PROVIDER') {
            actions.push(`
                <button class="btn btn-primary btn-small" onclick="app.updateBookingStatus('${booking.id}', 'CONFIRMED')">Confirm</button>
                <button class="btn btn-secondary btn-small" onclick="app.updateBookingStatus('${booking.id}', 'REJECTED')">Reject</button>
            `);
        }
        
        if (booking.status === 'CONFIRMED' && this.currentUser.role === 'PROVIDER') {
            actions.push(`<button class="btn btn-primary btn-small" onclick="app.updateBookingStatus('${booking.id}', 'COMPLETED')">Mark Complete</button>`);
        }
        
        return actions.length > 0 ? `
            <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                ${actions.join('')}
            </div>
        ` : '';
    }

    async updateBookingStatus(bookingId, status) {
        let rejectionReason = null;
        
        if (status === 'REJECTED') {
            rejectionReason = prompt('Please provide a reason for rejection:');
            if (!rejectionReason) return;
        }
        
        this.showLoading(true);
        
        try {
            await graphqlClient.execute(GraphQLQueries.UPDATE_BOOKING_STATUS, {
                id: bookingId,
                status,
                rejectionReason
            });
            
            this.showToast(`Booking ${status.toLowerCase()} successfully`, 'success');
            await this.loadBookings();
        } catch (error) {
            console.error('Failed to update booking status:', error);
            this.showToast(error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async cancelBooking(bookingId) {
        if (!confirm('Are you sure you want to cancel this booking?')) {
            return;
        }
        
        this.showLoading(true);
        
        try {
            await this.updateBookingStatus(bookingId, 'REJECTED');
        } catch (error) {
            console.error('Failed to cancel booking:', error);
            this.showToast(error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    filterBookings(status) {
        if (status) {
            const filteredBookings = this.bookings.filter(booking => booking.status === status);
            this.renderBookings(filteredBookings);
        } else {
            this.renderBookings(this.bookings);
        }
    }

    // Profile Methods
    renderProfile() {
        const profileContent = document.getElementById('profileContent');
        
        if (!this.currentUser) {
            profileContent.innerHTML = '<p>Please login to view your profile.</p>';
            return;
        }
        
        profileContent.innerHTML = `
            <div class="profile-header">
                <div class="profile-avatar">
                    ${Utils.generateInitials(this.currentUser.name)}
                </div>
                <div class="profile-info">
                    <h3>${this.currentUser.name}</h3>
                    <span class="profile-role">${Utils.getRoleDisplayName(this.currentUser.role)}</span>
                    <div style="color: #64748b; margin-top: 0.5rem;">${this.currentUser.email}</div>
                    ${this.currentUser.phone ? `<div style="color: #64748b;">${this.currentUser.phone}</div>` : ''}
                </div>
            </div>
            
            <div class="profile-stats">
                <div class="stat-card">
                    <span class="stat-number">${this.bookings.length}</span>
                    <span class="stat-label">Total Bookings</span>
                </div>
                <div class="stat-card">
                    <span class="stat-number">${this.bookings.filter(b => b.status === 'COMPLETED').length}</span>
                    <span class="stat-label">Completed</span>
                </div>
                <div class="stat-card">
                    <span class="stat-number">${this.bookings.filter(b => b.status === 'PENDING').length}</span>
                    <span class="stat-label">Pending</span>
                </div>
            </div>
            
            ${this.currentUser.role === 'PROVIDER' ? this.renderProviderServices() : ''}
            
            <div style="margin-top: 2rem;">
                <h4 style="margin-bottom: 1rem;">Account Information</h4>
                <div style="background-color: #f8fafc; padding: 1.5rem; border-radius: 12px;">
                    <div style="display: grid; gap: 1rem;">
                        <div><strong>Member since:</strong> ${Utils.formatDate(this.currentUser.createdAt)}</div>
                        ${this.currentUser.address ? `<div><strong>Address:</strong> ${this.currentUser.address}</div>` : ''}
                        ${this.currentUser.specialization ? `<div><strong>Specialization:</strong> ${this.currentUser.specialization}</div>` : ''}
                        ${this.currentUser.experience ? `<div><strong>Experience:</strong> ${this.currentUser.experience}</div>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    renderProviderServices() {
        const providerServices = this.services.filter(service => service.provider.id === this.currentUser.id);
        
        return `
            <div class="provider-services">
                <h4>My Services</h4>
                <div class="provider-service-list">
                    ${providerServices.length === 0 ? 
                        '<p style="color: #64748b; text-align: center; padding: 2rem;">No services created yet.</p>' :
                        providerServices.map(service => `
                            <div class="provider-service-item">
                                <div class="provider-service-info">
                                    <div class="provider-service-title">${service.title}</div>
                                    <div class="provider-service-category">${service.category}</div>
                                </div>
                                <div class="provider-service-price">${Utils.formatPrice(service.price)}</div>
                            </div>
                        `).join('')
                    }
                </div>
            </div>
        `;
    }

    // Modal Management
    showLoginModal() {
        document.getElementById('modalTitle').textContent = 'Login';
        document.getElementById('nameField').style.display = 'none';
        document.getElementById('roleField').style.display = 'none';
        document.getElementById('switchToRegister').style.display = 'block';
        document.getElementById('switchToLogin').style.display = 'none';
        document.querySelector('#authForm button[type="submit"]').textContent = 'Login';
        document.getElementById('authForm').reset();
        document.getElementById('loginModal').style.display = 'block';
    }

    showRegisterModal(defaultRole = 'CUSTOMER') {
        document.getElementById('modalTitle').textContent = 'Register';
        document.getElementById('nameField').style.display = 'block';
        document.getElementById('roleField').style.display = 'block';
        document.getElementById('switchToRegister').style.display = 'none';
        document.getElementById('switchToLogin').style.display = 'block';
        document.querySelector('#authForm button[type="submit"]').textContent = 'Register';
        document.getElementById('authForm').reset();
        document.getElementById('role').value = defaultRole;
        document.getElementById('loginModal').style.display = 'block';
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    // Utility Methods
    showLoading(show) {
        document.getElementById('loadingSpinner').style.display = show ? 'flex' : 'none';
    }

    showToast(message, type = 'info', duration = 5000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div>${message}</div>
            <button class="toast-close">&times;</button>
        `;
        
        const container = document.getElementById('toastContainer');
        container.appendChild(toast);
        
        // Auto remove
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, duration);
        
        // Manual close
        toast.querySelector('.toast-close').addEventListener('click', () => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});