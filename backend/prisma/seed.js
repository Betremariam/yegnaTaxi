require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
    try {
        // Admin details
        const adminDetails = {
            name: 'Admin User',
            phone: '0912345678', // Replace with desired phone number, // Replace with desired phone number
            password: '12345678', // Replace with desired password
            role: 'SUPER_ADMIN' // Can be 'SUPER_ADMIN' or 'SUB_ADMIN'
        };

        // Generate user ID based on role
        const generateUserId = (role) => {
            const prefix = {
                PASSENGER: 'P',
                DRIVER: 'D',
                AGENT: 'A',
                SUB_ADMIN: 'SA',
                SUPER_ADMIN: 'SUA',
            };
            return `${prefix[role]}${Date.now()}${Math.floor(Math.random() * 1000)}`;
        };

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminDetails.password, salt);

        // Generate user ID
        const userId = generateUserId(adminDetails.role);

        // Create the admin user
        const adminUser = await prisma.user.create({
            data: {
                name: adminDetails.name,
                phone: adminDetails.phone,
                password: hashedPassword,
                role: adminDetails.role,
                userId: userId,
                isFirstLogin: false
            }
        });

        console.log('Admin user created successfully!');
        console.log('User ID:', adminUser.userId);
        console.log('Phone:', adminUser.phone);
        console.log('Role:', adminUser.role);
        console.log('NOTE: Remember to keep your password secure!');

    } catch (error) {
        console.error('Error creating admin user:', error.message || error);
        if (error.code) {
            console.error('Error code:', error.code);
            console.error('Meta:', error.meta);
        }
    } finally {
        await prisma.$disconnect();
    }
}

// Run the function
createAdminUser();

/*
 * SUB ADMIN USER CREATION INSTRUCTIONS:
 * 
 * To create a SUB_ADMIN user instead of SUPER_ADMIN:
 * 1. Change line 14 from 'SUPER_ADMIN' to 'SUB_ADMIN'
 * 2. Optionally modify the name, phone, email, and password values
 * 3. Run the script with: node createAdminUser.js
 * 
 * Alternatively, you can use the dedicated script:
 * node createSubAdminUser.js
 */


async function createSubAdminUser() {
    try {
        // Sub Admin details - MODIFY THESE VALUES AS NEEDED
        const subAdminDetails = {
            name: 'Sub Admin User',
            phone: '0987654321', // Replace with desired phone number // Replace with desired phone number
            password: '12345678', // Replace with desired password
            role: 'SUB_ADMIN'
        };

        // Generate user ID based on role
        const generateUserId = (role) => {
            const prefix = {
                PASSENGER: 'P',
                DRIVER: 'D',
                AGENT: 'A',
                SUB_ADMIN: 'SA',
                SUPER_ADMIN: 'SUA',
            };
            return `${prefix[role]}${Date.now()}${Math.floor(Math.random() * 1000)}`;
        };

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(subAdminDetails.password, salt);

        // Generate user ID
        const userId = generateUserId(subAdminDetails.role);

        // Create the sub admin user
        const subAdminUser = await prisma.user.create({
            data: {
                name: subAdminDetails.name,
                phone: subAdminDetails.phone,
                password: hashedPassword,
                role: subAdminDetails.role,
                userId: userId,
                isFirstLogin: false
            }
        });

        console.log('Sub Admin user created successfully!');
        console.log('User ID:', subAdminUser.userId);
        console.log('Phone:', subAdminUser.phone);
        console.log('Role:', subAdminUser.role);
        console.log('NOTE: Remember to keep your password secure!');

    } catch (error) {
        console.error('Error creating sub admin user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the function
createSubAdminUser();