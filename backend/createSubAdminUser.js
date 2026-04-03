require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createSubAdminUser() {
  try {
    // Sub Admin details - MODIFY THESE VALUES AS NEEDED
    const subAdminDetails = {
      name: 'Sub Admin User',
      phone: '0987654321', // Replace with desired phone number
      phone: '0987654321', // Replace with desired phone number
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