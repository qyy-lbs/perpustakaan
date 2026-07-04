import prisma from "../prisma.js";

function getDateRange(startDate, endDate) {
  const where = {};

  if (startDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    where.gte = start;
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    where.lte = end;
  }

  return Object.keys(where).length > 0 ? where : undefined;
}

export async function getReportSummary(req, res) {
  try {
    const [
      totalBuku,
      totalMahasiswa,
      totalDosen,
      peminjamanAktif,
      totalReservasiAktif,
      totalUsulanMenunggu,
      totalDendaBelumDibayar,
      totalDendaDibayar,
    ] = await Promise.all([
      prisma.book.count({
        where: {
          deletedAt: null,
        },
      }),

      prisma.user.count({
        where: {
          role: "MAHASISWA",
        },
      }),

      prisma.user.count({
        where: {
          role: "DOSEN",
        },
      }),

      prisma.loan.count({
        where: {
          status: {
            in: ["AKTIF", "TERLAMBAT"],
          },
        },
      }),

      prisma.bookReservation.count({
        where: {
          status: "MENUNGGU_PENGAMBILAN",
        },
      }),

      prisma.bookSuggestion.count({
        where: {
          status: "MENUNGGU",
        },
      }),

      prisma.fine.count({
        where: {
          status: "BELUM_DIBAYAR",
        },
      }),

      prisma.fine.count({
        where: {
          status: "DIBAYAR",
        },
      }),
    ]);

    res.json({
      message: "Ringkasan laporan berhasil diambil",
      data: {
        totalBuku,
        totalMahasiswa,
        totalDosen,
        peminjamanAktif,
        totalReservasiAktif,
        totalUsulanMenunggu,
        totalDendaBelumDibayar,
        totalDendaDibayar,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil ringkasan laporan",
      error: error.message,
    });
  }
}

export async function getLoanReport(req, res) {
  try {
    const { startDate, endDate, status } = req.query;

    const loans = await prisma.loan.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(getDateRange(startDate, endDate)
          ? {
              tanggalPinjam: getDateRange(startDate, endDate),
            }
          : {}),
      },
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
        book: {
          include: {
            category: true,
            rack: true,
          },
        },
        fine: {
          include: {
            payment: true,
          },
        },
      },
      orderBy: {
        tanggalPinjam: "desc",
      },
    });

    res.json({
      message: "Laporan peminjaman berhasil diambil",
      data: loans,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil laporan peminjaman",
      error: error.message,
    });
  }
}

export async function getReturnReport(req, res) {
  try {
    const { startDate, endDate } = req.query;

    const loans = await prisma.loan.findMany({
      where: {
        status: "SELESAI",
        tanggalKembali: getDateRange(startDate, endDate),
      },
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
        book: {
          include: {
            category: true,
            rack: true,
          },
        },
        fine: {
          include: {
            payment: true,
          },
        },
      },
      orderBy: {
        tanggalKembali: "desc",
      },
    });

    res.json({
      message: "Laporan pengembalian berhasil diambil",
      data: loans,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil laporan pengembalian",
      error: error.message,
    });
  }
}

export async function getFineReport(req, res) {
  try {
    const { status } = req.query;

    const fines = await prisma.fine.findMany({
      where: {
        ...(status ? { status } : {}),
      },
      include: {
        loan: {
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
          },
        },
        payment: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalNominal = fines.reduce((total, item) => total + item.jumlah, 0);

    res.json({
      message: "Laporan denda berhasil diambil",
      data: {
        totalNominal,
        fines,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil laporan denda",
      error: error.message,
    });
  }
}

export async function getSuggestionReport(req, res) {
  try {
    const { status } = req.query;

    const suggestions = await prisma.bookSuggestion.findMany({
      where: {
        ...(status ? { status } : {}),
      },
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
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      message: "Laporan usulan buku berhasil diambil",
      data: suggestions,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil laporan usulan buku",
      error: error.message,
    });
  }
}