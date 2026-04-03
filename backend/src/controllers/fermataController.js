const prisma = require("../config/database");

const getAllFermatas = async (req, res, next) => {
  try {
    const fermatas = await prisma.fermata.findMany({
      orderBy: { name: "asc" },
    });
    res.json({ success: true, data: fermatas });
  } catch (error) {
    next(error);
  }
};

const createFermata = async (req, res, next) => {
  try {
    const { name, fare } = req.body;
    const fermata = await prisma.fermata.create({
      data: { name, fare },
    });
    res.status(201).json({ success: true, data: fermata });
  } catch (error) {
    next(error);
  }
};

const updateFermata = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, fare } = req.body;
    const fermata = await prisma.fermata.update({
      where: { id },
      data: { name, fare },
    });
    res.json({ success: true, data: fermata });
  } catch (error) {
    next(error);
  }
};

const deleteFermata = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.fermata.delete({
      where: { id },
    });
    res.json({ success: true, message: "Fermata deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllFermatas,
  createFermata,
  updateFermata,
  deleteFermata,
};
