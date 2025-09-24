const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static('.'));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://kbayramoglu80_db_user:L0MsFgRR3qKkrKfk@cluster0.p7rixhv.mongodb.net/eagd_donations?retryWrites=true&w=majority&appName=Cluster0';

console.log('🔍 MongoDB URI:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Güvenlik için şifreyi gizle
console.log('🔍 Environment:', process.env.NODE_ENV);
console.log('🔍 MongoDB URI exists:', !!process.env.MONGODB_URI);

mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
.then(() => {
    console.log('✅ Connected to MongoDB');
})
.catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    console.log('⚠️  Server will continue without database functionality');
    console.log('🔧 Please check MongoDB Atlas IP whitelist settings');
});

// Models
const DonationSchema = new mongoose.Schema({
    // Help options
    helpOptions: [{
        type: String,
        enum: ['donate_device', 'sponsor', 'participate_events', 'create_project', 'participate_training']
    }],
    
    // Device information
    deviceContent: String,
    deviceType: {
        type: String,
        enum: ['laptop', 'desktop', 'tablet', 'smartphone', 'monitor', 'printer', 'other', '']
    },
    deviceCondition: {
        type: String,
        enum: ['working', 'partially_working', 'broken', 'unknown', '']
    },
    deviceBrand: String,
    deviceModel: String,
    estimatedValue: {
        type: String,
        enum: ['0-500', '500-1000', '1000-2000', '2000+', '']
    },
    deviceAge: {
        type: String,
        enum: ['0-1', '1-3', '3-5', '5+', '']
    },
    
    // Contact information
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    city: String,
    address: String,
    
    // Additional information
    message: String,
    privacyPolicy: {
        type: Boolean,
        required: true
    },
    
    // System fields
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'cancelled'],
        default: 'pending'
    },
    adminNotes: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
DonationSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Donation = mongoose.model('Donation', DonationSchema);

// Admin Schema
const AdminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    role: {
        type: String,
        enum: ['admin', 'super_admin'],
        default: 'admin'
    },
    lastLogin: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
AdminSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

const Admin = mongoose.model('Admin', AdminSchema);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'eagd_super_secret_jwt_key_2024_!@#$%^&*()';

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Check if it's a temporary admin token
        if (decoded.adminId === 'temp_admin_id') {
            req.admin = {
                _id: 'temp_admin_id',
                username: 'admin',
                email: 'admin@eagd.org',
                role: 'super_admin'
            };
            return next();
        }
        
        // Try to find admin in MongoDB
        try {
            const admin = await Admin.findById(decoded.adminId);
            if (!admin) {
                return res.status(401).json({ error: 'Invalid token' });
            }
            req.admin = admin;
            next();
        } catch (dbError) {
            // If MongoDB is not available, return error
            return res.status(401).json({ error: 'Invalid token' });
        }
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

// Routes

// Test endpoint to create a sample donation
app.post('/api/test-donation', async (req, res) => {
    try {
        const testDonation = new Donation({
            fullName: 'Test Kullanıcı',
            phone: '05551234567',
            email: 'test@example.com',
            city: 'İstanbul',
            deviceType: 'laptop',
            deviceCondition: 'working',
            deviceContent: 'Test cihaz içeriği',
            deviceBrand: 'Apple',
            deviceModel: 'MacBook Pro',
            message: 'Test mesajı',
            privacyPolicy: true,
            helpOptions: ['donate_device'],
            status: 'pending'
        });
        
        await testDonation.save();
        
        res.json({
            success: true,
            message: 'Test donation created',
            donation: testDonation
        });
    } catch (error) {
        console.error('Error creating test donation:', error);
        res.status(500).json({ error: 'Failed to create test donation' });
    }
});

// Create donation
app.post('/api/donations', async (req, res) => {
    try {
        console.log('Raw request body:', JSON.stringify(req.body, null, 2));
        console.log('Device Type from request:', req.body.device_type);
        console.log('Device Condition from request:', req.body.device_condition);
        console.log('Device Content from request:', req.body.device_content);
        console.log('Device Brand from request:', req.body.device_brand);
        console.log('Device Model from request:', req.body.device_model);
        
        // Basic validation
        const { full_name, phone, privacy_policy } = req.body;
        
        if (!full_name || full_name.trim().length < 2) {
            return res.status(400).json({ 
                error: 'Ad Soyad en az 2 karakter olmalıdır' 
            });
        }
        
        if (!phone || phone.trim().length < 10) {
            return res.status(400).json({ 
                error: 'Telefon numarası en az 10 karakter olmalıdır' 
            });
        }
        
        if (!privacy_policy) {
            return res.status(400).json({ 
                error: 'Gizlilik politikasını kabul etmelisiniz' 
            });
        }

        // Transform data to match schema
        const donationData = {
            ...req.body,
            fullName: req.body.full_name,
            privacyPolicy: req.body.privacy_policy,
            helpOptions: req.body.help_options || [],
            deviceType: req.body.device_type || '',
            deviceCondition: req.body.device_condition || '',
            deviceContent: req.body.device_content || '',
            deviceBrand: req.body.device_brand || '',
            deviceModel: req.body.device_model || '',
            email: req.body.email || '',
            city: req.body.city || '',
            message: req.body.message || ''
        };
        
        // Remove the old field names
        delete donationData.full_name;
        delete donationData.privacy_policy;
        delete donationData.device_type;
        delete donationData.device_condition;
        delete donationData.device_content;
        delete donationData.device_brand;
        delete donationData.device_model;
        
        console.log('Transformed donation data:', JSON.stringify(donationData, null, 2));
        console.log('Device Type:', donationData.deviceType);
        console.log('Device Condition:', donationData.deviceCondition);
        console.log('Device Content:', donationData.deviceContent);
        console.log('Device Brand:', donationData.deviceBrand);
        console.log('Device Model:', donationData.deviceModel);
        
        const donation = new Donation(donationData);
        await donation.save();

        res.status(201).json({
            success: true,
            message: 'Donation submitted successfully',
            donationId: donation._id
        });
    } catch (error) {
        console.error('Error creating donation:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            code: error.code,
            errors: error.errors
        });
        res.status(500).json({ 
            error: 'Failed to create donation',
            message: 'Please try again later',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get all donations (Admin only)
app.get('/api/donations', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        
        const filter = {};
        if (status) {
            filter.status = status;
        }

        const donations = await Donation.find(filter)
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('-__v');

        const total = await Donation.countDocuments(filter);

        res.json({
            success: true,
            data: donations,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total: total
            }
        });
    } catch (error) {
        console.error('Error fetching donations:', error);
        res.status(500).json({ error: 'Failed to fetch donations' });
    }
});

// Get donation by ID (Admin only)
app.get('/api/donations/:id', authenticateToken, async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id);
        if (!donation) {
            return res.status(404).json({ error: 'Donation not found' });
        }
        res.json({ success: true, data: donation });
    } catch (error) {
        console.error('Error fetching donation:', error);
        res.status(500).json({ error: 'Failed to fetch donation' });
    }
});

// Update donation (Admin only)
app.put('/api/donations/:id', authenticateToken, [
    body('status').optional().isIn(['pending', 'processing', 'completed', 'cancelled']),
    body('adminNotes').optional().isLength({ max: 1000 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                error: 'Validation failed', 
                details: errors.array() 
            });
        }

        const donation = await Donation.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        if (!donation) {
            return res.status(404).json({ error: 'Donation not found' });
        }

        res.json({
            success: true,
            message: 'Donation updated successfully',
            data: donation
        });
    } catch (error) {
        console.error('Error updating donation:', error);
        res.status(500).json({ error: 'Failed to update donation' });
    }
});

// Delete donation (Admin only)
app.delete('/api/donations/:id', authenticateToken, async (req, res) => {
    try {
        const donation = await Donation.findByIdAndDelete(req.params.id);
        if (!donation) {
            return res.status(404).json({ error: 'Donation not found' });
        }

        res.json({
            success: true,
            message: 'Donation deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting donation:', error);
        res.status(500).json({ error: 'Failed to delete donation' });
    }
});

// Get donation statistics (Admin only)
app.get('/api/donations/stats/summary', authenticateToken, async (req, res) => {
    try {
        const stats = await Donation.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const total = await Donation.countDocuments();
        
        const statusCounts = {
            total: total,
            pending: 0,
            processing: 0,
            completed: 0,
            cancelled: 0
        };

        stats.forEach(stat => {
            statusCounts[stat._id] = stat.count;
        });

        res.json({
            success: true,
            data: statusCounts
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Password complexity validation
const validatePasswordComplexity = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    if (password.length < minLength) {
        return { valid: false, message: 'Şifre en az 8 karakter olmalıdır' };
    }
    if (!hasUpperCase) {
        return { valid: false, message: 'Şifre en az bir büyük harf içermelidir' };
    }
    if (!hasLowerCase) {
        return { valid: false, message: 'Şifre en az bir küçük harf içermelidir' };
    }
    if (!hasNumbers) {
        return { valid: false, message: 'Şifre en az bir rakam içermelidir' };
    }
    if (!hasSpecialChar) {
        return { valid: false, message: 'Şifre en az bir özel karakter içermelidir' };
    }
    
    return { valid: true };
};

// Admin authentication
app.post('/api/admin/login', [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                error: 'Validation failed', 
                details: errors.array() 
            });
        }

        const { username, password } = req.body;

        // Temporary admin credentials (when MongoDB is not available)
        const tempAdmin = {
            username: 'eagd_admin_2024',
            password: 'EAGD@Secure2024!@#$%^&*()',
            email: 'admin@eagd.org',
            role: 'super_admin'
        };

        // Check credentials
        if (username === tempAdmin.username && password === tempAdmin.password) {
            // Generate JWT token with short expiration for security
            const token = jwt.sign(
                { adminId: 'temp_admin_id', username: tempAdmin.username, role: tempAdmin.role },
                JWT_SECRET,
                { expiresIn: '2h' } // 2 hours instead of 24 hours
            );

            return res.json({
                success: true,
                message: 'Login successful',
                token: token,
                admin: {
                    id: 'temp_admin_id',
                    username: tempAdmin.username,
                    email: tempAdmin.email,
                    role: tempAdmin.role,
                    lastLogin: new Date()
                }
            });
        }

        // Try MongoDB connection if available
        try {
            const admin = await Admin.findOne({ username });
            if (!admin) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, admin.password);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Update last login
            admin.lastLogin = new Date();
            await admin.save();

            // Generate JWT token with short expiration for security
            const token = jwt.sign(
                { adminId: admin._id, username: admin.username, role: admin.role },
                JWT_SECRET,
                { expiresIn: '2h' } // 2 hours instead of 24 hours
            );

            res.json({
                success: true,
                message: 'Login successful',
                token: token,
                admin: {
                    id: admin._id,
                    username: admin.username,
                    email: admin.email,
                    role: admin.role,
                    lastLogin: admin.lastLogin
                }
            });
        } catch (dbError) {
            // If MongoDB is not available, return error
            return res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Create default admin (only if no admins exist)
app.post('/api/admin/setup', async (req, res) => {
    try {
        const adminCount = await Admin.countDocuments();
        if (adminCount > 0) {
            return res.status(400).json({ 
                error: 'Admin already exists. Use login endpoint instead.' 
            });
        }

        const { username, password, email } = req.body;

        if (!username || !password || !email) {
            return res.status(400).json({ 
                error: 'Username, password, and email are required' 
            });
        }

        // Validate password complexity
        const passwordValidation = validatePasswordComplexity(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({ 
                error: passwordValidation.message 
            });
        }

        const admin = new Admin({
            username,
            password,
            email,
            role: 'super_admin'
        });

        await admin.save();

        res.status(201).json({
            success: true,
            message: 'Default admin created successfully',
            admin: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({ error: 'Failed to create admin' });
    }
});

// Verify token endpoint
app.get('/api/admin/verify', authenticateToken, (req, res) => {
    res.json({
        success: true,
        admin: {
            id: req.admin._id,
            username: req.admin.username,
            email: req.admin.email,
            role: req.admin.role
        }
    });
});

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/bagis-formu', (req, res) => {
    res.sendFile(__dirname + '/bagis-formu.html');
});

app.get('/eagd-management-portal', (req, res) => {
    res.sendFile(__dirname + '/eagd-management-portal.html');
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        message: 'Something went wrong'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 EAGD Donation System Server running on port ${PORT}`);
    console.log(`📊 EAGD Management Portal: http://localhost:${PORT}/eagd-management-portal`);
    console.log(`📝 Donation Form: http://localhost:${PORT}/bagis-formu`);
    console.log(`🏠 Main Site: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    mongoose.connection.close(() => {
        console.log('MongoDB connection closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    mongoose.connection.close(() => {
        console.log('MongoDB connection closed');
        process.exit(0);
    });
});

