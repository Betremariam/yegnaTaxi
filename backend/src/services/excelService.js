const XLSX = require('xlsx');
const prisma = require('../config/database');

const generateDriverPaymentsExcel = async () => {
  try {
    const drivers = await prisma.user.findMany({
      where: { role: 'DRIVER' },
      include: {
        driverEarnings: true,
      },
      orderBy: { name: 'asc' },
    });

    const data = drivers.map((driver) => ({
      'Driver Name': driver.name,
      'User ID': driver.userId,
      'Phone': driver.phone,
      'Total Amount Earned': driver.driverEarnings?.totalEarnings || 0,
      'Bank Account': driver.driverEarnings?.bankAccount || '',
      'Bank Name': driver.driverEarnings?.bankName || '',
      'Account Name': driver.driverEarnings?.accountName || '',
      'Payment Status': driver.driverEarnings?.paymentStatus || 'PENDING',
      'Last Paid Date': driver.driverEarnings?.lastPaidAt
        ? new Date(driver.driverEarnings.lastPaidAt).toLocaleDateString()
        : '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Driver Payments');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  } catch (error) {
    throw new Error(`Failed to generate driver payments Excel: ${error.message}`);
  }
};

const updateDriverPaymentStatus = async (driverIds, status) => {
  try {
    const result = await prisma.driverEarnings.updateMany({
      where: {
        driverId: { in: driverIds },
      },
      data: {
        paymentStatus: status,
        lastPaidAt: status === 'PAID' ? new Date() : null,
        totalEarnings: status === 'PAID' ? 0 : undefined,
      },
    });

    return result;
  } catch (error) {
    throw new Error(`Failed to update driver payment status: ${error.message}`);
  }
};

module.exports = {
  generateDriverPaymentsExcel,
  updateDriverPaymentStatus,
};

