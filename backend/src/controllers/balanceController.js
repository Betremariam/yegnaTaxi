const prisma = require("../config/database");

const getBalance = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const balance = await prisma.balance.findUnique({
      where: { userId },
    });

    if (!balance) {
      // Create balance if doesn't exist
      const newBalance = await prisma.balance.create({
        data: {
          userId,
          currentBalance: 0,
        },
      });

      return res.json({
        success: true,
        data: {
          currentBalance: newBalance.currentBalance.toString(),
          totalEarnings: "0",
        },
      });
    }

    const userDetails = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        driverEarnings: true,
      },
    });

    res.json({
      success: true,
      data: {
        currentBalance: balance.currentBalance.toString(),
        totalEarnings: userDetails.driverEarnings?.totalEarnings.toString() || "0",
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBalance,
};
