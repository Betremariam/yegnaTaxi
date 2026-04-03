const prisma = require("../config/database");
const { hashPassword } = require("../utils/bcrypt");
const { generateUserId } = require("./authController");

const registerDriver = async (req, res, next) => {
  try {
    const { name, phone, nationalId, licensePlate, carModel, bankAccount, bankName, accountName, fermataIds, fermataId } = req.body;
    const createdBy = req.user.id;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phone },
          ...(nationalId ? [{ nationalId }] : [])
        ],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this phone or national ID already exists",
      });
    }

    // Generate temporary password
    const tempPassword = `Temp${Date.now()}`;
    const hashedPassword = await hashPassword(tempPassword);
    const userId = generateUserId("DRIVER");

    // Create driver
    const driver = await prisma.user.create({
      data: {
        name,
        phone,
        nationalId,
        password: hashedPassword,
        role: "DRIVER",
        userId,
        isFirstLogin: true,
        isVerified: true,
        createdBy,
        licensePlate,
        carModel,
        fermatas: {
          connect: fermataIds ? (Array.isArray(fermataIds) ? fermataIds.map(id => ({ id })) : [{ id: fermataIds }]) : (fermataId ? [{ id: fermataId }] : [])
        },
      },
      include: {
        fermatas: true
      }
    });

    // Create driver earnings record
    await prisma.driverEarnings.create({
      data: {
        driverId: driver.id,
        bankAccount: bankAccount || null,
        bankName: bankName || null,
        accountName: accountName || null,
      },
    });

    res.status(201).json({
      success: true,
      message: "Driver registered successfully",
      data: {
        driver: {
          id: driver.id,
          name: driver.name,
          phone: driver.phone,
          nationalId: driver.nationalId,
          userId: driver.userId,
          licensePlate: driver.licensePlate,
          carModel: driver.carModel,
          fermatas: driver.fermatas,
          tempPassword,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const registerPassengerByAdmin = async (req, res, next) => {
  try {
    const { name, phone, nationalId } = req.body;
    const adminId = req.user.id;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phone },
          { nationalId }
        ]
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this phone or national ID already exists",
      });
    }

    // No password needed for passenger if they don't have an app
    // But we create one just in case or as a placeholder
    const tempPassword = `Temp${Date.now()}`;
    const hashedPassword = await hashPassword(tempPassword);
    const userId = generateUserId("PASSENGER");

    // Create passenger
    const passenger = await prisma.user.create({
      data: {
        name,
        phone,
        nationalId,
        password: hashedPassword,
        role: "PASSENGER",
        userId,
        isFirstLogin: false,
        isVerified: true,
        createdBy: adminId,
      },
    });

    // Create balance
    await prisma.balance.create({
      data: {
        userId: passenger.id,
        currentBalance: 0,
      },
    });

    res.status(201).json({
      success: true,
      message: "Passenger registered successfully",
      data: {
        passenger: {
          id: passenger.id,
          name: passenger.name,
          phone: passenger.phone,
          nationalId: passenger.nationalId,
          userId: passenger.userId,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;

    const where = {};
    if (role) {
      where.role = role;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { userId: { contains: search, mode: "insensitive" } },
        { nationalId: { contains: search, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        balance: true,
        driverEarnings: true,
        fermatas: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        balance: true,
        driverEarnings: true,
        fermatas: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const getPassengerByNationalId = async (req, res, next) => {
  try {
    const { nationalId } = req.body;
    console.log(`[Lookup] Searching for passenger with National ID: "${nationalId}"`);

    if (!nationalId) {
      return res.status(400).json({
        success: false,
        message: "National ID is required",
      });
    }

    const trimmedId = nationalId.trim();

    const passenger = await prisma.user.findUnique({
      where: { nationalId: trimmedId },
      include: {
        balance: true,
      },
    });

    if (!passenger) {
      console.log(`[Lookup] No passenger found for National ID: "${trimmedId}"`);
      return res.status(404).json({
        success: false,
        message: `Passenger with ID "${trimmedId}" not found`,
      });
    }

    if (passenger.role !== "PASSENGER") {
      return res.status(400).json({
        success: false,
        message: "National ID does not belong to a passenger",
      });
    }

    res.json({
      success: true,
      data: {
        id: passenger.id,
        name: passenger.name,
        phone: passenger.phone,
        nationalId: passenger.nationalId,
        userId: passenger.userId,
        photoUrl: passenger.photoUrl,
        balance: passenger.balance?.currentBalance || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, phone, nationalId, role, licensePlate, carModel, fermataIds, fermataId } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        name,
        phone,
        nationalId,
        role,
        licensePlate,
        carModel,
        fermatas: (fermataIds || fermataId) ? {
          set: fermataIds ? (Array.isArray(fermataIds) ? fermataIds.map(id => ({ id })) : [{ id: fermataIds }]) : [{ id: fermataId }]
        } : undefined,
      },
      include: {
        balance: true,
        driverEarnings: true,
        fermatas: true,
      },
    });

    res.json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerDriver,
  registerPassengerByAdmin,
  getAllUsers,
  getUserById,
  getPassengerByNationalId,
  updateUser,
};
