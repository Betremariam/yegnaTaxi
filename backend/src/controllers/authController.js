const prisma = require("../config/database");
const { hashPassword, comparePassword } = require("../utils/bcrypt");
const { generateToken } = require("../utils/jwt");

const generateUserId = (role) => {
  const prefix = {
    PASSENGER: "P",
    DRIVER: "D",
    SUB_ADMIN: "SA",
    SUPER_ADMIN: "SUA",
  };
  return `${prefix[role]}${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

const login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { phone },
      include: {
        balance: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid phone or password",
      });
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid phone or password",
      });
    }

    const token = generateToken({
      userId: user.id,
      role: user.role,
    });

    // Fetch complete user details after successful login
    const userWithDetails = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        balance: true,
        driverEarnings: true,
        fermatas: true,
      },
    });

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: userWithDetails.id,
          name: userWithDetails.name,
          phone: userWithDetails.phone,
          nationalId: userWithDetails.nationalId,
          role: userWithDetails.role,
          userId: userWithDetails.userId,
          isFirstLogin: userWithDetails.isFirstLogin,
          balance: userWithDetails.balance?.currentBalance || 0,
          totalEarnings: userWithDetails.driverEarnings?.totalEarnings || 0,
          photoUrl: userWithDetails.photoUrl,
          licensePlate: userWithDetails.licensePlate,
          carModel: userWithDetails.carModel,
          fermatas: userWithDetails.fermatas,
          fermata: userWithDetails.fermatas?.[0] || null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordValid = await comparePassword(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        isFirstLogin: false,
      },
    });

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    const profile = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      userId: user.userId,
      nationalId: user.nationalId,
      photoUrl: user.photoUrl,
      balance: user.balance?.currentBalance || 0,
      isVerified: user.isVerified,
    };

    if (user.role === "DRIVER") {
      profile.totalEarnings = user.driverEarnings?.totalEarnings || 0;
      profile.licensePlate = user.licensePlate;
      profile.carModel = user.carModel;
      profile.fermatas = user.fermatas;
      profile.fermata = user.fermatas?.[0] || null;
    }

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  changePassword,
  getProfile,
  generateUserId,
};
