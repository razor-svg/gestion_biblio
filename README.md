# Library Management System - "01 Gestion d'une bibliothèque"

A comprehensive, production-ready Library Management System built with Node.js/Express backend and React frontend. This system digitizes the complete lifecycle of library resources, manages inventory, handles borrow/return processes, and provides advanced search capabilities.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Security Features](#security-features)
- [Business Logic](#business-logic)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Functionality
- **Complete CRUD Operations** for books, authors, and members
- **Transaction-Based Borrow/Return System** with race condition prevention
- **Advanced Search Engine** with filters for title, author, genre, and publication year
- **Real-time Dashboard** with KPIs and overdue book alerts
- **Member Management** with soft delete and account status tracking
- **Borrowing History** with overdue detection and notifications

### User Roles
- **Librarians (Admins)**: Full access to catalog management, user accounts, transactions, and analytics
- **Members (Students/Faculty)**: Read-only catalog access, advanced search, and personal borrowing history

### UI/UX Features
- **Responsive Design** with Tailwind CSS
- **Real-time Updates** with React Query
- **Color-coded Status Badges** (Green: Available, Yellow: Borrowed, Red: Overdue)
- **Interactive Search** with advanced filters
- **Visual Alerts** for overdue books and system notifications

## 🛠 Tech Stack

### Backend
- **Node.js** with Express.js
- **MySQL** with Sequelize ORM
- **Joi** for input validation
- **Helmet** for security headers
- **Rate Limiting** for API protection
- **JWT** for authentication (ready for implementation)

### Frontend
- **React.js** with React Router
- **Tailwind CSS** for styling
- **React Query** for data fetching and caching
- **Lucide React** for icons
- **Axios** for API communication

## 🗄 Database Schema

### Tables and Relationships

```sql
-- Authors Table
auteurs (
  auteur_id INT PRIMARY KEY AUTO_INCREMENT,
  nom_complet VARCHAR(150) NOT NULL,
  biographie TEXT NULL
);

-- Books Table (with B-Tree indexes)
livres (
  livre_id INT PRIMARY KEY AUTO_INCREMENT,
  titre VARCHAR(255) NOT NULL,
  auteur_id INT FOREIGN KEY REFERENCES auteurs(auteur_id),
  genre VARCHAR(100),
  annee_publication INT,
  statut ENUM('Available', 'Borrowed', 'Lost') DEFAULT 'Available',
  INDEX idx_titre (titre),
  INDEX idx_genre (genre)
);

-- Members Table
membres (
  membre_id INT PRIMARY KEY AUTO_INCREMENT,
  nom_complet VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  statut_compte ENUM('Active', 'Suspended', 'Inactive') DEFAULT 'Active'
);

-- Borrowing Records
emprunts (
  emprunt_id INT PRIMARY KEY AUTO_INCREMENT,
  livre_id INT FOREIGN KEY REFERENCES livres(livre_id),
  membre_id INT FOREIGN KEY REFERENCES membres(membre_id),
  date_emprunt DATETIME DEFAULT CURRENT_TIMESTAMP,
  date_retour_prevue DATETIME (calculated as +14 days),
  date_retour_reelle DATETIME NULL
);
```

## 📁 Project Structure

```
01 Gestion d'une bibliothèque/
├── backend/
│   ├── config/
│   │   └── database.js          # Database connection configuration
│   ├── controllers/
│   │   ├── auteurController.js  # Author CRUD operations
│   │   ├── livreController.js   # Book management and search
│   │   ├── membreController.js  # Member management with soft delete
│   │   └── empruntController.js # Borrow/return transaction logic
│   ├── middlewares/
│   │   ├── validation.js        # Input validation with Joi
│   │   └── errorHandler.js      # Centralized error handling
│   ├── models/
│   │   ├── Auteur.js           # Author model
│   │   ├── Livre.js            # Book model with indexes
│   │   ├── Membre.js           # Member model
│   │   ├── Emprunt.js          # Borrowing model with hooks
│   │   └── index.js            # Model associations
│   ├── routes/
│   │   ├── auteurs.js          # Author API routes
│   │   ├── livres.js           # Book API routes with search
│   │   ├── membres.js          # Member API routes
│   │   └── emprunts.js         # Borrowing API routes
│   ├── .env.example            # Environment variables template
│   ├── package.json            # Backend dependencies
│   └── server.js               # Express server setup
├── frontend/
│   ├── public/
│   │   └── index.html          # HTML template
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.js       # Main application layout
│   │   │   ├── SearchBar.js    # Advanced search with filters
│   │   │   └── StatusBadge.js  # Color-coded status indicators
│   │   ├── pages/
│   │   │   ├── Dashboard.js    # Librarian dashboard with KPIs
│   │   │   ├── Catalog.js      # Book catalog with search
│   │   │   └── MemberProfile.js # Member details and history
│   │   ├── services/
│   │   │   └── api.js          # API service layer
│   │   ├── App.js              # Main React application
│   │   ├── index.css           # Tailwind CSS with custom components
│   │   └── index.js            # React DOM entry point
│   ├── package.json            # Frontend dependencies
│   ├── tailwind.config.js      # Tailwind configuration
│   └── postcss.config.js       # PostCSS configuration
└── README.md                   # This file
```

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **MySQL** (v8.0 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "01 Gestion d'une bibliothèque"
```

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

## ⚙️ Configuration

### 1. Environment Variables
Copy the environment template and configure:
```bash
cd backend
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=library_management
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 2. Frontend Environment (Optional)
Create `.env` in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:3000/api
```

## 🗃 Database Setup

### 1. Create Database
```sql
CREATE DATABASE library_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Grant Permissions (Optional)
```sql
GRANT ALL PRIVILEGES ON library_management.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Automatic Schema Creation
The application will automatically create tables and relationships when started in development mode.

## 🏃 Running the Application

### 1. Start Backend Server
```bash
cd backend
npm run dev
```
The backend will start on `http://localhost:3000`

### 2. Start Frontend Development Server
```bash
cd frontend
npm start
```
The frontend will start on `http://localhost:3001`

### 3. Access the Application
Open your browser and navigate to `http://localhost:3001`

## 📚 API Documentation

### Books API
- `GET /api/livres` - Get all books
- `GET /api/livres/search` - Search books with filters
- `GET /api/livres/:id` - Get book by ID
- `POST /api/livres` - Create new book
- `PUT /api/livres/:id` - Update book
- `DELETE /api/livres/:id` - Delete book (soft delete)

### Authors API
- `GET /api/auteurs` - Get all authors
- `GET /api/auteurs/:id` - Get author by ID
- `POST /api/auteurs` - Create new author
- `PUT /api/auteurs/:id` - Update author
- `DELETE /api/auteurs/:id` - Delete author

### Members API
- `GET /api/membres` - Get all members
- `GET /api/membres/active` - Get active members only
- `GET /api/membres/:id` - Get member by ID
- `POST /api/membres` - Create new member
- `PUT /api/membres/:id` - Update member
- `DELETE /api/membres/:id` - Deactivate member (soft delete)
- `POST /api/membres/:id/suspend` - Suspend member
- `POST /api/membres/:id/reactivate` - Reactivate member

### Borrowing API
- `GET /api/emprunts` - Get all active borrows
- `GET /api/emprunts/overdue` - Get overdue books
- `GET /api/emprunts/member/:id` - Get member's borrowing history
- `POST /api/emprunts/borrow` - Borrow a book (transaction)
- `POST /api/emprunts/return` - Return a book (transaction)

### Health Check
- `GET /api/health` - Server health status

## 🔒 Security Features

### Backend Security
- **Input Validation**: Comprehensive Joi validation for all inputs
- **SQL Injection Prevention**: Sequelize ORM with parameterized queries
- **Rate Limiting**: API endpoint protection (100 requests per 15 minutes)
- **Security Headers**: Helmet middleware for HTTP security
- **Error Handling**: Centralized error handling without information leakage

### Transaction Safety
- **Atomic Operations**: All borrowing operations use database transactions
- **Race Condition Prevention**: Row-level locking during book status updates
- **Data Integrity**: Foreign key constraints and validation rules

## 🧠 Business Logic

### Borrowing Workflow (Transaction-Based)
1. **Validate Member**: Check if member account is 'Active'
2. **Check Availability**: Verify book status is 'Available' (with row lock)
3. **Duplicate Check**: Ensure member hasn't already borrowed this book
4. **Create Record**: Insert borrowing record with calculated due date (+14 days)
5. **Update Status**: Change book status to 'Borrowed'
6. **Commit Transaction**: Atomic commit or rollback on any failure

### Return Workflow
1. **Locate Record**: Find active borrowing record (NULL return date)
2. **Update Return**: Set actual return date to current timestamp
3. **Reset Status**: Change book status back to 'Available'
4. **Commit Changes**: Transaction-based updates

### Search Engine
- **Parameterized Queries**: LIKE operators with %keyword% patterns
- **Multi-field Search**: Combined search on title, author, and genre
- **Advanced Filters**: Genre checkboxes and year range dropdowns
- **Pagination**: Efficient result pagination with metadata

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style and structure
- Write comprehensive tests for new features
- Update documentation for API changes
- Ensure all database operations use transactions where appropriate

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database exists and user has permissions

**Frontend Build Errors**
- Delete `node_modules` and reinstall dependencies
- Clear npm cache: `npm cache clean --force`

**API Connection Issues**
- Verify backend server is running on port 3000
- Check CORS configuration in backend
- Ensure frontend proxy is configured correctly

**Tailwind CSS Not Working**
- Run `npm install` to ensure all dependencies are installed
- Verify PostCSS configuration is correct
- Restart development server

### Support

For additional support or questions, please open an issue in the repository or contact the development team.

---

**Built with ❤️ for Library Management**
