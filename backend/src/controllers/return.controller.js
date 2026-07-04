import prisma from "../prisma.js";

const DENDA_PER_HARI = 1000;

function calculateLateDays(jatuhTempo, tanggalKembali = new Date()) {
  const dueDate = new Date(jatuhTempo);
  const returnDate = new Date(tanggalKembali);

  const diffMs = returnDate.getTime() - dueDate.getTime();

  if (diffMs <= 0) {
    return 0;
  }

  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function getFineAmount(hariTerlambat) {
  return hariTerlambat * DENDA_PER_HARI;
}

export async function checkReturn(req, res) {
  try {
    const { loanId, isbn, nimNidn } = req.body;

    if (!loanId && !isbn) {
      return res.status(400).json({
        message: "loanId atau isbn wajib diisi",
      });
    }

    const cleanIsbn = isbn ? String(isbn).trim() : "";
    const cleanNimNidn = nimNidn ? String(nimNidn).trim() : "";

    const loan = await prisma.loan.findFirst({
      where: {
        ...(loanId
          ? {
              id: Number(loanId),
            }
          : {
              book: {
                isbn: cleanIsbn,
              },
            }),
        ...(cleanNimNidn
          ? {
              user: {
                nimNidn: cleanNimNidn,
              },
            }
          : {}),
        status: {
          in: ["AKTIF", "TERLAMBAT"],
        },
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
        fine: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!loan) {
      return res.status(404).json({
        message:
          "Data peminjaman aktif tidak ditemukan. Pastikan booking sudah divalidasi menjadi peminjaman.",
      });
    }

    const hariTerlambat = calculateLateDays(loan.jatuhTempo);
    const jumlahDenda = getFineAmount(hariTerlambat);

    let checkedLoan = loan;

    if (hariTerlambat > 0 && loan.status !== "TERLAMBAT") {
      checkedLoan = await prisma.loan.update({
        where: {
          id: loan.id,
        },
        data: {
          status: "TERLAMBAT",
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
          fine: true,
        },
      });
    }

    return res.json({
      message: "Detail pengembalian berhasil diambil",
      data: {
        loan: checkedLoan,
        hariTerlambat,

        // penting: frontend kamu membaca field ini
        denda: jumlahDenda,

        // tetap dikirim juga kalau ada halaman lain pakai jumlahDenda
        jumlahDenda,

        statusPengembalian:
          hariTerlambat > 0
            ? `Terlambat ${hariTerlambat} hari`
            : "Tidak terlambat",
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Gagal mengecek pengembalian",
      error: error.message,
    });
  }
}

export async function confirmReturn(req, res) {
  try {
    const { loanId } = req.params;

    const loan = await prisma.loan.findUnique({
      where: {
        id: Number(loanId),
      },
      include: {
        book: true,
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
        fine: true,
      },
    });

    if (!loan) {
      return res.status(404).json({
        message: "Data peminjaman tidak ditemukan",
      });
    }

    if (loan.status === "SELESAI") {
      return res.status(400).json({
        message: "Buku sudah dikembalikan sebelumnya",
      });
    }

    if (!["AKTIF", "TERLAMBAT"].includes(loan.status)) {
      return res.status(400).json({
        message: `Peminjaman tidak bisa dikembalikan karena status saat ini ${loan.status}`,
      });
    }

    const tanggalKembali = new Date();
    const hariTerlambat = calculateLateDays(loan.jatuhTempo, tanggalKembali);
    const jumlahDenda = getFineAmount(hariTerlambat);

    const result = await prisma.$transaction(async (tx) => {
      const updatedLoan = await tx.loan.update({
        where: {
          id: loan.id,
        },
        data: {
          tanggalKembali,
          status: "SELESAI",
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
          fine: true,
        },
      });

      await tx.book.update({
        where: {
          id: loan.bookId,
        },
        data: {
          stokTersedia: {
            increment: 1,
          },
          status: "TERSEDIA",
        },
      });

      let fine = null;

      if (jumlahDenda > 0) {
        fine = await tx.fine.upsert({
          where: {
            loanId: loan.id,
          },
          update: {
            hariTerlambat,
            jumlah: jumlahDenda,
            status: "BELUM_DIBAYAR",
          },
          create: {
            loanId: loan.id,
            hariTerlambat,
            jumlah: jumlahDenda,
            status: "BELUM_DIBAYAR",
          },
        });
      }

      return {
        loan: updatedLoan,
        fine,
        hariTerlambat,

        // penting: frontend kamu membaca field ini
        denda: jumlahDenda,

        // tetap dikirim juga kalau ada halaman lain pakai jumlahDenda
        jumlahDenda,

        statusPengembalian:
          hariTerlambat > 0
            ? `Terlambat ${hariTerlambat} hari`
            : "Tidak terlambat",
      };
    });

    return res.json({
      message:
        jumlahDenda > 0
          ? "Pengembalian berhasil, tetapi ada denda yang harus dibayar"
          : "Pengembalian berhasil. Tidak ada denda yang harus dibayar.",
      data: result,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Gagal memproses pengembalian",
      error: error.message,
    });
  }
}