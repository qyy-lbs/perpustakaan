import prisma from "../prisma.js";

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function subDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d;
}

function formatDateLabel(date) {
  return date.toLocaleDateString("id-ID", {
    weekday: "short",
  });
}

export async function getDashboardSummary(req, res) {
  try {
    const todayStart = startOfDay();
    const todayEnd = endOfDay();
    const now = new Date();

    const [
      peminjamanHariIni,
      pengembalianHariIni,
      bookingAktif,
      terlambat,
    ] = await Promise.all([
      prisma.loan.count({
        where: {
          tanggalPinjam: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      }),

      prisma.loan.count({
        where: {
          tanggalKembali: {
            gte: todayStart,
            lte: todayEnd,
          },
          status: "SELESAI",
        },
      }),

      prisma.bookReservation.count({
        where: {
          status: "MENUNGGU_PENGAMBILAN",
          berlakuSampai: {
            gte: now,
          },
        },
      }),

      prisma.loan.count({
        where: {
          status: {
            in: ["AKTIF", "TERLAMBAT"],
          },
          jatuhTempo: {
            lt: now,
          },
        },
      }),
    ]);

    res.json({
      message: "Ringkasan dashboard berhasil diambil",
      data: {
        peminjamanHariIni,
        pengembalianHariIni,
        bookingAktif,
        terlambat,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal mengambil ringkasan dashboard",
      error: error.message,
    });
  }
}

export async function getLoanChart(req, res) {
  try {
    const today = new Date();
    const startDate = startOfDay(subDays(today, 6));
    const endDate = endOfDay(today);

    const loans = await prisma.loan.findMany({
      where: {
        tanggalPinjam: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        tanggalPinjam: true,
      },
    });

    const result = [];

    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      const total = loans.filter((loan) => {
        const loanDate = new Date(loan.tanggalPinjam);
        return loanDate >= dayStart && loanDate <= dayEnd;
      }).length;

      result.push({
        hari: formatDateLabel(date),
        tanggal: dayStart.toISOString(),
        total,
      });
    }

    res.json({
      message: "Grafik peminjaman 7 hari terakhir berhasil diambil",
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal mengambil grafik peminjaman",
      error: error.message,
    });
  }
}

export async function getCategoryChart(req, res) {
  try {
    const loans = await prisma.loan.findMany({
      include: {
        book: {
          include: {
            category: true,
          },
        },
      },
    });

    const categoryMap = {};

    loans.forEach((loan) => {
      const categoryName = loan.book?.category?.nama || "Tanpa Kategori";

      if (!categoryMap[categoryName]) {
        categoryMap[categoryName] = 0;
      }

      categoryMap[categoryName] += 1;
    });

    const total = loans.length;

    const categories = Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value,
      total: value,
      percentage: total > 0 ? Math.round((value / total) * 100) : 0,
      persentase: total > 0 ? Math.round((value / total) * 100) : 0,
    }));

    res.json({
      message: "Grafik kategori berhasil diambil",
      data: {
        total,
        categories,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil grafik kategori",
      error: error.message,
    });
  }
}