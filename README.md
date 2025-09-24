# EAGD Donation Management System

A comprehensive Node.js and MongoDB-based donation management system for the Electronic Waste Recycling Support Association (EAGD).

## 🚀 Features

- **Donation Form**: Complete bilingual donation form with device details
- **Admin Panel**: Secure admin interface for managing donations
- **MongoDB Integration**: Persistent data storage with MongoDB
- **JWT Authentication**: Secure admin authentication system
- **Bilingual Support**: Turkish/English language switching
- **Responsive Design**: Works on desktop, tablet, and mobile
- **API Endpoints**: RESTful API for all operations

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## 🛠️ Installation

1. **Clone or download the project files**

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=3000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   MONGODB_URI=mongodb://localhost:27017/eagd_donations
   JWT_SECRET=your_super_secret_jwt_key_here
   ```

4. **Start MongoDB**:
   - **Local MongoDB**: Start MongoDB service
   - **MongoDB Atlas**: Use your connection string in `.env`

5. **Set up default admin** (first time only):
   ```bash
   node setup-admin.js
   ```

6. **Start the server**:
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

## 🌐 Access Points

- **Main Website**: http://localhost:3000
- **Donation Form**: http://localhost:3000/bagis-formu
- **Admin Panel**: http://localhost:3000/admin-panel
- **API Health Check**: http://localhost:3000/api/health

## 🔐 Admin Credentials

**Default Admin Account**:
- **Username**: `admin_eagd_2024`
- **Password**: `EAGD_Admin_2024!@#$%^&*()_+Secure_Password_987654321`

⚠️ **Important**: Change the default password after first login!

## 📊 API Endpoints

### Public Endpoints
- `POST /api/donations` - Submit donation form
- `GET /api/health` - Health check

### Admin Endpoints (Require Authentication)
- `POST /api/admin/login` - Admin login
- `GET /api/admin/verify` - Verify token
- `GET /api/donations` - Get all donations
- `GET /api/donations/:id` - Get donation by ID
- `PUT /api/donations/:id` - Update donation
- `DELETE /api/donations/:id` - Delete donation
- `GET /api/donations/stats/summary` - Get donation statistics

## 🗄️ Database Schema

### Donation Model
```javascript
{
  helpOptions: [String],           // Array of help options
  deviceContent: String,           // Device description
  deviceType: String,              // Device type
  deviceCondition: String,         // Device condition
  deviceBrand: String,             // Device brand
  deviceModel: String,             // Device model
  estimatedValue: String,          // Estimated value
  deviceAge: String,               // Device age
  fullName: String,                // Full name (required)
  phone: String,                   // Phone (required)
  email: String,                   // Email
  city: String,                    // City
  address: String,                 // Address
  message: String,                 // Additional message
  privacyPolicy: Boolean,          // Privacy policy acceptance (required)
  status: String,                  // Status: pending, processing, completed, cancelled
  adminNotes: String,              // Admin notes
  createdAt: Date,                 // Creation timestamp
  updatedAt: Date                  // Last update timestamp
}
```

### Admin Model
```javascript
{
  username: String,               // Username (unique)
  password: String,                // Hashed password
  email: String,                   // Email (unique)
  role: String,                    // Role: admin, super_admin
  lastLogin: Date,                 // Last login timestamp
  createdAt: Date                  // Creation timestamp
}
```

## 🔧 Configuration

### Environment Variables
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `FRONTEND_URL`: Frontend URL for CORS
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: JWT secret key for token signing

### Security Features
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API rate limiting
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt password hashing
- **Input Validation**: Express-validator for input validation

## 📱 Usage

### For Users
1. Visit the donation form
2. Fill out the form with device details
3. Submit the form
4. Receive confirmation

### For Admins
1. Access admin panel
2. Login with credentials
3. View, edit, and manage donations
4. Update donation status
5. Add admin notes

## 🚀 Deployment

### Production Deployment
1. Set `NODE_ENV=production` in `.env`
2. Use a production MongoDB instance
3. Set strong JWT secret
4. Use a reverse proxy (nginx)
5. Set up SSL certificates
6. Configure firewall rules

### Docker Deployment (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🛠️ Development

### Project Structure
```
eagd/
├── server.js              # Main server file
├── package.json           # Dependencies
├── setup-admin.js         # Admin setup script
├── env.example            # Environment variables example
├── index.html             # Main website
├── bagis-formu.html       # Donation form
├── admin-panel.html       # Admin panel
├── style.css              # Styles
└── README.md              # This file
```

### Adding New Features
1. Update API endpoints in `server.js`
2. Update frontend forms/panels
3. Update database models if needed
4. Test thoroughly

## 🐛 Troubleshooting

### Common Issues
1. **MongoDB Connection Error**: Check MongoDB is running and connection string is correct
2. **Port Already in Use**: Change PORT in `.env` or kill process using port 3000
3. **Admin Login Failed**: Run `node setup-admin.js` to create admin
4. **CORS Errors**: Check FRONTEND_URL in `.env`

### Logs
Check console output for detailed error messages and debugging information.

## 📄 License

This project is licensed under the MIT License.

## 🤝 Support

For support or questions, please contact the EAGD development team.

---

**EAGD - Electronic Waste Recycling Support Association**
