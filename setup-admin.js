const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

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

const Admin = mongoose.model('Admin', AdminSchema);

async function setupDefaultAdmin() {
    try {
        // Connect to MongoDB
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eagd_donations';
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ username: 'admin_eagd_2024' });
        if (existingAdmin) {
            console.log('⚠️  Admin already exists!');
            console.log('Username: admin_eagd_2024');
            console.log('Email:', existingAdmin.email);
            console.log('Role:', existingAdmin.role);
            process.exit(0);
        }

        // Create default admin
        const adminData = {
            username: 'admin_eagd_2024',
            password: 'EAGD_Admin_2024!@#$%^&*()_+Secure_Password_987654321',
            email: 'admin@eagd.org',
            role: 'super_admin'
        };

        const admin = new Admin(adminData);
        await admin.save();

        console.log('🎉 Default admin created successfully!');
        console.log('=====================================');
        console.log('Username: admin_eagd_2024');
        console.log('Password: EAGD_Admin_2024!@#$%^&*()_+Secure_Password_987654321');
        console.log('Email: admin@eagd.org');
        console.log('Role: super_admin');
        console.log('=====================================');
        console.log('⚠️  Please change the password after first login!');

    } catch (error) {
        console.error('❌ Error setting up admin:', error);
    } finally {
        await mongoose.connection.close();
        console.log('📦 MongoDB connection closed');
        process.exit(0);
    }
}

// Run the setup
setupDefaultAdmin();

