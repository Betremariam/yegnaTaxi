const prisma = require("../config/database");

const manualTopUp = async (req, res, next) => {
  try {
    const { passengerId, amount, nationalId, phone } = req.body;
    const adminId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    // Find passenger by any of the provided identifiers
    const passenger = await prisma.user.findFirst({
      where: {
        OR: [
          ...(passengerId ? [{ id: passengerId }] : []),
          ...(nationalId ? [{ nationalId }] : []),
          ...(phone ? [{ phone }] : [])
        ],
        role: "PASSENGER"
      }
    });

    if (!passenger) {
      return res.status(404).json({
        success: false,
        message: "Passenger not found",
      });
    }

    // Process top-up
    await prisma.$transaction(async (tx) => {
      // Add to passenger balance
      await tx.balance.update({
        where: { userId: passenger.id },
        data: {
          currentBalance: {
            increment: amount,
          },
        },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId: passenger.id,
          type: "TOP_UP",
          amount: amount,
          description: `Manual top-up by admin`,
          relatedUserId: adminId,
        },
      });
    });

    const updatedBalance = await prisma.balance.findUnique({
      where: { userId: passenger.id },
    });

    res.json({
      success: true,
      message: "Top-up successful",
      data: {
        passengerName: passenger.name,
        amount: amount,
        newBalance: updatedBalance.currentBalance,
      },
    });
  } catch (error) {
    next(error);
  }
};

const processFarePayment = async (req, res, next) => {
  try {
    const { nationalId } = req.body;
    let { amount } = req.body;
    const driverId = req.user.id;

    console.log(`[FarePayment] Request from driver ${driverId} for passenger ID ${nationalId}, amount: ${amount}`);

    // Convert amount to Number early
    if (amount) {
      amount = Number(amount);
      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid fare amount",
        });
      }
    }

    // Get driver to check for assigned Fermatas
    const driver = await prisma.user.findUnique({
      where: { id: driverId },
      include: { fermatas: true },
    });

    if (!driver || driver.role !== "DRIVER") {
      return res.status(403).json({
        success: false,
        message: "Only drivers can process fare payments",
      });
    }

    // Use tariff as the maximum allowed amount if any fermata is assigned
    const { stationId } = req.body; // Driver can specify which station they are currently at
    const activeFermata = stationId
      ? driver.fermatas.find(f => f.id === stationId)
      : driver.fermatas[0];
    const tariff = activeFermata ? Number(activeFermata.fare) : null;

    if (tariff) {
      if (!amount) {
        amount = tariff; // Use full tariff if no amount specified
      } else if (amount > tariff) {
        console.warn(`[FarePayment] Fare ${amount} exceeds driver tariff ${tariff}`);
        return res.status(400).json({
          success: false,
          message: `Fare amount (${amount} ETB) exceeds your station's maximum tariff of ${tariff} ETB.`,
        });
      }
    } else if (!amount) {
      console.warn(`[FarePayment] No amount provided and driver has no assigned tariff`);
      return res.status(400).json({
        success: false,
        message: "Please enter a fare amount (no tariff assigned to your station)",
      });
    }

    console.log(`[FarePayment] Executing deduction: Passenger NatID ${nationalId}, Amount ${amount} ETB`);

    // Validate Passenger by National ID
    const passenger = await prisma.user.findUnique({
      where: { nationalId },
      include: {
        balance: true,
      },
    });

    if (!passenger || passenger.role !== "PASSENGER") {
      console.warn(`[FarePayment] Invalid passenger search: ${nationalId}`);
      return res.status(404).json({
        success: false,
        message: "Invalid National ID or passenger not found",
      });
    }

    if (!passenger.balance) {
      console.error(`[FarePayment] Passenger ${passenger.id} has no balance record`);
      return res.status(400).json({
        success: false,
        message: "Passenger balance not initialized",
      });
    }

    const passengerBalance = Number(passenger.balance.currentBalance);
    if (passengerBalance < amount) {
      console.warn(`[FarePayment] Insufficient balance: Available ${passengerBalance}, requested ${amount}`);
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Available: ${passengerBalance} ETB`,
      });
    }

    // Process payment
    await prisma.$transaction(async (tx) => {
      // Deduct from passenger balance
      await tx.balance.update({
        where: { userId: passenger.id },
        data: {
          currentBalance: {
            decrement: amount,
          },
        },
      });

      // Add to driver earnings
      await tx.driverEarnings.upsert({
        where: { driverId },
        create: {
          driverId,
          totalEarnings: amount,
        },
        update: {
          totalEarnings: {
            increment: amount,
          },
        },
      });

      // Create transactions
      await tx.transaction.createMany({
        data: [
          {
            userId: passenger.id,
            type: "FARE_PAYMENT",
            amount: -amount,
            description: `Fare payment to driver`,
            relatedUserId: driverId,
            fermataId: activeFermata ? activeFermata.id : null,
          },
          {
            userId: driverId,
            type: "FARE_PAYMENT",
            amount: amount,
            description: `Fare payment from ${passenger.name}`,
            relatedUserId: passenger.id,
            fermataId: activeFermata ? activeFermata.id : null,
          },
        ],
      });
    });

    // Get updated driver earnings
    const driverEarnings = await prisma.driverEarnings.findUnique({
      where: { driverId },
    });

    console.log(`[FarePayment] Deduction successful for ${nationalId}. New driver earnings: ${driverEarnings.totalEarnings}`);

    res.json({
      success: true,
      message: "Fare payment processed successfully",
      data: {
        passenger: {
          name: passenger.name,
          userId: passenger.userId,
          nationalId: passenger.nationalId,
        },
        amount: amount.toString(),
        driverTotalEarnings: driverEarnings ? driverEarnings.totalEarnings.toString() : "0.00",
      },
    });
  } catch (error) {
    next(error);
  }
};

const processRefund = async (req, res, next) => {
  try {
    const { nationalId, amount } = req.body;
    const driverId = req.user.id;

    if (!nationalId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid National ID or amount",
      });
    }

    const passenger = await prisma.user.findUnique({
      where: { nationalId },
      include: {
        balance: true,
      },
    });

    if (!passenger || passenger.role !== "PASSENGER") {
      return res.status(404).json({
        success: false,
        message: "Passenger not found",
      });
    }

    const driverEarningsRecord = await prisma.driverEarnings.findUnique({
      where: { driverId },
    });

    if (!driverEarningsRecord || driverEarningsRecord.totalEarnings < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient driver earnings to process refund",
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.balance.update({
        where: { userId: passenger.id },
        data: {
          currentBalance: {
            increment: amount,
          },
        },
      });

      await tx.driverEarnings.update({
        where: { driverId },
        data: {
          totalEarnings: {
            decrement: amount,
          },
        },
      });

      await tx.transaction.createMany({
        data: [
          {
            userId: passenger.id,
            type: "REFUND",
            amount: amount,
            description: `Refund received from driver`,
            relatedUserId: driverId,
          },
          {
            userId: driverId,
            type: "REFUND",
            amount: -amount,
            description: `Refund issued to passenger ${passenger.name}`,
            relatedUserId: passenger.id,
          },
        ],
      });
    });

    const updatedDriverEarnings = await prisma.driverEarnings.findUnique({
      where: { driverId },
    });

    res.json({
      success: true,
      message: "Refund processed successfully",
      data: {
        passenger: {
          name: passenger.name,
          userId: passenger.userId,
        },
        amount: amount.toString(),
        driverTotalEarnings: updatedDriverEarnings.totalEarnings.toString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getTransactionHistory = async (req, res, next) => {
  try {
    const {
      type,
      startDate,
      endDate,
      limit = 50,
      userId: queryUserId,
    } = req.query;
    let userId = req.user.id;

    if (
      (req.user.role === "SUB_ADMIN" || req.user.role === "SUPER_ADMIN") &&
      queryUserId
    ) {
      userId = queryUserId;
    }

    const where = { userId };

    if (type) {
      where.type = type;
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        relatedUser: {
          select: {
            name: true,
            userId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: parseInt(limit),
    });

    res.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  manualTopUp,
  processFarePayment,
  getTransactionHistory,
  processRefund,
};
