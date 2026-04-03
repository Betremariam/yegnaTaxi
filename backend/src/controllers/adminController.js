const prisma = require('../config/database');
const {
  generateDriverPaymentsExcel,
  updateDriverPaymentStatus,
} = require('../services/excelService');
const { hashPassword } = require('../utils/bcrypt');
const { generateUserId } = require('./authController');

const getDriverPayments = async (req, res, next) => {
  try {
    const drivers = await prisma.user.findMany({
      where: { role: 'DRIVER' },
      include: {
        driverEarnings: true,
      },
      orderBy: { name: 'asc' },
    });

    const data = drivers.map((driver) => ({
      id: driver.id,
      name: driver.name,
      userId: driver.userId,
      phone: driver.phone,
      totalEarnings: driver.driverEarnings?.totalEarnings || 0,
      bankAccount: driver.driverEarnings?.bankAccount || '',
      bankName: driver.driverEarnings?.bankName || '',
      accountName: driver.driverEarnings?.accountName || '',
      paymentStatus: driver.driverEarnings?.paymentStatus || 'PENDING',
      lastPaidAt: driver.driverEarnings?.lastPaidAt,
    }));

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const downloadDriverPaymentsExcel = async (req, res, next) => {
  try {
    const buffer = await generateDriverPaymentsExcel();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=driver-payments.xlsx');

    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

const updateDriverPayments = async (req, res, next) => {
  try {
    const { driverIds, status } = req.body;

    if (!driverIds || !Array.isArray(driverIds) || driverIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Driver IDs array is required',
      });
    }

    if (!['PENDING', 'PAID'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status',
      });
    }

    await updateDriverPaymentStatus(driverIds, status);

    res.json({
      success: true,
      message: 'Driver payment status updated successfully',
    });
  } catch (error) {
    next(error);
  }
};


const getAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    } else {
      // Default to last 30 days if no dates provided
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      where.createdAt = { gte: thirtyDaysAgo };
    }

    // Daily transactions
    const dailyParams = [];
    let dailyWhere = "WHERE type IN ('TOP_UP', 'FARE_PAYMENT')";
    
    if (startDate) {
      dailyWhere += ` AND "createdAt" >= $${dailyParams.length + 1}`;
      dailyParams.push(new Date(startDate));
    }
    if (endDate) {
      dailyWhere += ` AND "createdAt" <= $${dailyParams.length + 1}`;
      dailyParams.push(new Date(endDate));
    }
    
    if (!startDate && !endDate) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dailyWhere += ` AND "createdAt" >= $${dailyParams.length + 1}`;
      dailyParams.push(thirtyDaysAgo);
    }

    let dailyQuery = `
      SELECT 
        DATE_TRUNC('day', "createdAt") as "createdAt",
        SUM(amount) as amount,
        COUNT(*) as count
      FROM "Transaction"
      ${dailyWhere}
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY "createdAt" DESC
    `;
    
    const dailyTransactionsRaw = await prisma.$queryRawUnsafe(dailyQuery, ...dailyParams);
    const dailyTransactions = dailyTransactionsRaw.map(item => ({
      createdAt: item.createdAt,
      _sum: { amount: item.amount || 0 },
      _count: { id: parseInt(item.count) || 0 }
    }));

    // Monthly transactions
    let monthlyQuery = `
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        SUM(amount) as total_amount,
        COUNT(*) as transaction_count
      FROM "Transaction"
      WHERE type IN ('TOP_UP', 'FARE_PAYMENT')
    `;
    const monthlyParams = [];
    if (startDate) {
      monthlyQuery += ` AND "createdAt" >= $${monthlyParams.length + 1}`;
      monthlyParams.push(new Date(startDate));
    }
    if (endDate) {
      monthlyQuery += ` AND "createdAt" <= $${monthlyParams.length + 1}`;
      monthlyParams.push(new Date(endDate));
    }
    monthlyQuery += ` GROUP BY DATE_TRUNC('month', "createdAt") ORDER BY month DESC`;
    const monthlyTransactions = await prisma.$queryRawUnsafe(monthlyQuery, ...monthlyParams);

    // User counts
    const userCounts = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true,
      },
    });

    // Registration trends
    const trendsParams = [];
    let trendsWhere = "WHERE 1=1";
    
    if (startDate) {
      trendsWhere += ` AND "createdAt" >= $${trendsParams.length + 1}`;
      trendsParams.push(new Date(startDate));
    }
    if (endDate) {
      trendsWhere += ` AND "createdAt" <= $${trendsParams.length + 1}`;
      trendsParams.push(new Date(endDate));
    }
    
    if (!startDate && !endDate) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      trendsWhere += ` AND "createdAt" >= $${trendsParams.length + 1}`;
      trendsParams.push(thirtyDaysAgo);
    }

    let trendsQuery = `
      SELECT 
        DATE_TRUNC('day', "createdAt") as date,
        role,
        COUNT(*) as count
      FROM "User"
      ${trendsWhere}
      GROUP BY DATE_TRUNC('day', "createdAt"), role
      ORDER BY date DESC
    `;
    const registrationTrends = await prisma.$queryRawUnsafe(trendsQuery, ...trendsParams);

    // Total statistics
    const totalTransactions = await prisma.transaction.aggregate({
      where: {
        ...where,
        type: { in: ['TOP_UP', 'FARE_PAYMENT'] },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    res.json({
      success: true,
      data: {
        dailyTransactions,
        monthlyTransactions,
        userCounts: userCounts.reduce((acc, item) => {
          acc[item.role] = item._count.id;
          return acc;
        }, {}),
        registrationTrends,
        totals: {
          totalAmount: totalTransactions?._sum?.amount || 0,
          totalCount: totalTransactions?._count?.id || 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const registerSubAdmin = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const createdBy = req.user.id;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { phone },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this phone already exists',
      });
    }

    // Generate temporary password
    const tempPassword = `SA${Date.now().toString().slice(-6)}`;
    const hashedPassword = await hashPassword(tempPassword);
    const userId = generateUserId('SUB_ADMIN');

    // Create sub-admin
    const subAdmin = await prisma.user.create({
      data: {
        name,
        phone,
        password: hashedPassword,
        role: 'SUB_ADMIN',
        userId,
        isFirstLogin: true,
        createdBy,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Sub-admin registered successfully',
      data: {
        subAdmin: {
          id: subAdmin.id,
          name: subAdmin.name,
          phone: subAdmin.phone,
          userId: subAdmin.userId,
          tempPassword,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getSubAdmins = async (req, res, next) => {
  try {
    const subAdmins = await prisma.user.findMany({
      where: { role: 'SUB_ADMIN' },
      select: {
        id: true,
        name: true,
        phone: true,
        userId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: subAdmins,
    });
  } catch (error) {
    next(error);
  }
};

const deleteSubAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if user is a sub-admin
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user || user.role !== 'SUB_ADMIN') {
      return res.status(404).json({
        success: false,
        message: 'Sub-admin not found',
      });
    }

    await prisma.user.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Sub-admin deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDriverPayments,
  downloadDriverPaymentsExcel,
  updateDriverPayments,
  getAnalytics,
  registerSubAdmin,
  getSubAdmins,
  deleteSubAdmin,
};

