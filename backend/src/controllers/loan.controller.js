import prisma from "../prisma.js";

export async function getMyLoans(req, res) {
  try {
    const loans = await prisma.loan.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        book: {
          include: {
            category: true,
            rack: true,
          },
        },
        reservation: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      message: "Data peminjaman berhasil diambil",
      data: loans,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil data peminjaman",
      error: error.message,
    });
  }
}

export async function getAllLoans(req, res) {
  try {
    const loans = await prisma.loan.findMany({
      include: {
        user: {
          select: {
            id: true,
            nama: true,
            email: true,
            role: true,
            nimNidn: true,
            prodi: true,
          },
        },
        book: true,
        reservation: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      message: "Semua data peminjaman berhasil diambil",
      data: loans,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil data peminjaman",
      error: error.message,
    });
  }
}