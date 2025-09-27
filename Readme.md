# Smart Service Booking System (SSBS)
<img width="1103" height="602" alt="image" src="https://github.com/user-attachments/assets/ca84fa7e-a2c4-419e-8c59-cd8960154fd0" />


<img width="1099" height="601" alt="image" src="https://github.com/user-attachments/assets/e0724c5b-826f-4185-8dfd-649b7605afbd" />

<img width="1099" height="601" alt="image" src="https://github.com/user-attachments/assets/e1b1cc5a-bbb1-469f-a7c3-0395d0a70f39" />


A full-stack GraphQL-powered service booking platform built with Node.js backend and vanilla HTML/CSS/JS frontend.

## 🌟 Features

### Core Functionality
- **User Authentication** - Register/Login with JWT tokens
- **Role-based Access Control** - Customer, Provider, and Admin roles
- **Service Management** - Create, view, and manage services
- **Smart Booking System** - Book available time slots
- **Real-time Status Updates** - Track booking status (Pending → Confirmed → Completed)
- **Review System** - Leave reviews after service completion

### User Roles
- **Customers** - Browse services, make bookings, leave reviews
- **Service Providers** - Create services, manage availability, handle bookings
- **Administrators** - Oversee the entire platform

### Service Categories
- Plumbing
- Electrical
- Healthcare
- Tutoring
- Cleaning
- Automotive
- Beauty

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Apollo Server** - GraphQL server
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling (with modern features like Grid, Flexbox, CSS Variables)
- **Vanilla JavaScript** - Interactivity
- **GraphQL** - API communication

### Data Storage
- **In-memory JavaScript objects** - Mock database (no external DB required)
- Pre-populated with realistic sample data

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone/Create the project directory**
   ```bash
   mkdir smart-service-booking
   cd smart-service-booking
   ```

2. **Create the files** (copy the provided code into respective files)
   ```
   smart-service-booking/
   ├── package.json
   ├── server.js
   ├── schema.js
   ├── data.js
   ├── .env
   ├── README.md
   └── public/
       ├── index.html
       ├── styles.css
       ├── app.js
       └── graphql-client.js
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - **Frontend**: http://localhost:4000
   - **GraphQL Playground**: http://localhost:4000/graphql

## 📊 Sample Data

The application comes pre-loaded with sample data:

### Users
- **john@example.com** (Customer) - Password: `password123`
- **sarah@example.com** (Provider - Plumber) - Password: `password123`
- **emily.chen@example.com** (Provider - Doctor) - Password: `password123`
- **mike@example.com** (Provider - Electrician) - Password: `password123`
- **admin@example.com** (Admin) - Password: `password123`

### Services
- Emergency Plumbing Repair ($150)
- General Health Checkup ($200)
- Home Electrical Inspection ($180)
- And more...

## 🔧 GraphQL API

### Key Queries
```graphql
# Get all services
query {
  services {
    id
    title
    category
    price
    provider {
      name
    }
  }
}

# Get user's bookings
query {
  myBookings {
    id
    status
    service {
      title
    }
    slot {
      startTime
      endTime
    }
  }
}
```

### Key Mutations
```graphql
# Login
mutation {
  login(email: "john@example.com", password: "password123") {
    token
    user {
      id
      name
      role
    }
  }
}

# Book a service
mutation {
  bookService(serviceId: "1", slotId: "1", notes: "Urgent repair needed") {
    id
    status
    totalAmount
  }
}
```

## 🎨 UI Features

### Modern Design
- **Responsive Layout** - Works on desktop, tablet, and mobile
- **Gradient Backgrounds** - Beautiful visual effects
- **Card-based Interface** - Clean, organized content
- **Interactive Elements** - Hover effects, animations
- **Dark Mode Support** - Automatic system preference detection

### User Experience
- **Toast Notifications** - Real-time feedback
- **Loading Spinners** - Visual loading states
- **Modal Dialogs** - Clean popup interfaces
- **Form Validation** - Client-side input validation
- **Dynamic Content** - Real-time updates without page refresh

## 📱 Responsive Design

The application is fully responsive with breakpoints at:
- **Mobile**: < 480px
- **Tablet**: < 768px
- **Desktop**: > 768px

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with salt rounds
- **Input Validation** - Client and server-side validation
- **Role-based Access** - Proper authorization checks
