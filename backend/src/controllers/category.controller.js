import prisma from "../prisma.js";

export async function getCategories(req, res) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        nama: "asc",
      },
    });

    res.json({
      message: "Data kategori berhasil diambil",
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil kategori",
      error: error.message,
    });
  }
}

export async function createCategory(req, res) {
  try {
    const { nama } = req.body;

    if (!nama) {
      return res.status(400).json({
        message: "Nama kategori wajib diisi",
      });
    }

    const category = await prisma.category.create({
      data: {
        nama,
      },
    });

    res.status(201).json({
      message: "Kategori berhasil dibuat",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal membuat kategori",
      error: error.message,
    });
  }
}