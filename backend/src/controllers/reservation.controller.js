import QRCode from "qrcode";
import prisma from "../prisma.js";

function generateKodeBooking() {
  const time = Date.now().toString().slice(-10);
  const random = Math.floor(100 + Math.random() * 900);
  return `BK${time}${random}`;
}

function addHours(date, hours) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function addDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

const reservationDetailInclude = {
  user: {
    select: {
      id: true,
      nama: true,
      email: true,
      role: true,
      nimNidn: true,
      noTelepon: true,
      prodi: true,
    },
  },
  book: {
    include: {
      category: true,
      rack: true,
    },
  },
};

function isReservationExpired(reservation) {
  if (!reservation?.berlakuSampai) return false;

  return new Date(reservation.berlakuSampai).getTime() < Date.now();
}

async function updateReservationIfExpired(reservation) {
  if (!reservation) return null;

  if (
    reservation.status === "MENUNGGU_PENGAMBILAN" &&
    isReservationExpired(reservation)
  ) {
    return await prisma.bookReservation.update({
      where: {
        id: reservation.id,
      },
      data: {
        status: "EXPIRED",
      },
      include: reservationDetailInclude,
    });
  }

  return reservation;
}

export async function createReservation(req, res) {
  try {
    const { bookId, tanggalAmbil } = req.body;

    if (!bookId || !tanggalAmbil) {
      return res.status(400).json({
        message: "bookId dan tanggalAmbil wajib diisi",
      });
    }

    const book = await prisma.book.findUnique({
      where: {
        id: Number(bookId),
      },
    });

    if (!book) {
      return res.status(404).json({
        message: "Buku tidak ditemukan",
      });
    }

    if (book.stokTersedia <= 0) {
      return res.status(400).json({
        message: "Buku sedang tidak tersedia",
      });
    }

    const tanggalAmbilDate = new Date(tanggalAmbil);

    if (Number.isNaN(tanggalAmbilDate.getTime())) {
      return res.status(400).json({
        message: "Format tanggalAmbil tidak valid",
      });
    }

    const kodeBooking = generateKodeBooking();
    const qrCodeData = await QRCode.toDataURL(kodeBooking);

    const reservation = await prisma.bookReservation.create({
      data: {
        userId: req.user.id,
        bookId: Number(bookId),
        kodeBooking,
        qrCodeData,
        tanggalAmbil: tanggalAmbilDate,
        berlakuSampai: addHours(tanggalAmbilDate, 24),
      },
      include: {
        book: {
          include: {
            category: true,
            rack: true,
          },
        },
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
    });

    res.status(201).json({
      message: "Booking buku berhasil dibuat",
      data: reservation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal membuat booking",
      error: error.message,
    });
  }
}

export async function getMyReservations(req, res) {
  try {
    await prisma.bookReservation.updateMany({
      where: {
        userId: req.user.id,
        status: "MENUNGGU_PENGAMBILAN",
        berlakuSampai: {
          lt: new Date(),
        },
      },
      data: {
        status: "EXPIRED",
      },
    });

    const reservations = await prisma.bookReservation.findMany({
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
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      message: "Data reservasi berhasil diambil",
      data: reservations,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil reservasi",
      error: error.message,
    });
  }
}

export async function getReservationByCode(req, res) {
  try {
    const { kodeBooking } = req.params;

    const reservation = await prisma.bookReservation.findUnique({
      where: {
        kodeBooking,
      },
      include: reservationDetailInclude,
    });

    if (!reservation) {
      return res.status(404).json({
        message: "Kode booking tidak ditemukan",
      });
    }

    const checkedReservation = await updateReservationIfExpired(reservation);

    res.json({
      message: "Detail booking berhasil diambil",
      data: checkedReservation,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil detail booking",
      error: error.message,
    });
  }
}

export async function validateReservation(req, res) {
  try {
    const { kodeBooking } = req.params;

    const reservation = await prisma.bookReservation.findUnique({
      where: {
        kodeBooking,
      },
      include: {
        book: true,
        user: true,
      },
    });

    if (!reservation) {
      return res.status(404).json({
        message: "Kode booking tidak ditemukan",
      });
    }

    if (
      reservation.status === "MENUNGGU_PENGAMBILAN" &&
      isReservationExpired(reservation)
    ) {
      await prisma.bookReservation.update({
        where: {
          id: reservation.id,
        },
        data: {
          status: "EXPIRED",
        },
      });

      return res.status(400).json({
        message: "Booking sudah kedaluwarsa dan tidak bisa divalidasi",
      });
    }

    if (reservation.status !== "MENUNGGU_PENGAMBILAN") {
      return res.status(400).json({
        message: `Booking tidak bisa divalidasi karena status saat ini ${reservation.status}`,
      });
    }

    if (reservation.book.stokTersedia <= 0) {
      return res.status(400).json({
        message: "Stok buku sudah tidak tersedia",
      });
    }

    const tanggalPinjam = new Date();
    const jatuhTempo = addDays(tanggalPinjam, 7);
    const stokBaru = reservation.book.stokTersedia - 1;

    const result = await prisma.$transaction(async (tx) => {
      const loan = await tx.loan.create({
        data: {
          reservationId: reservation.id,
          userId: reservation.userId,
          bookId: reservation.bookId,
          tanggalPinjam,
          jatuhTempo,
          status: "AKTIF",
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
          book: true,
        },
      });

      await tx.bookReservation.update({
        where: {
          id: reservation.id,
        },
        data: {
          status: "DIPINJAM",
        },
      });

      await tx.book.update({
        where: {
          id: reservation.bookId,
        },
        data: {
          stokTersedia: {
            decrement: 1,
          },
          status: stokBaru > 0 ? "TERSEDIA" : "TIDAK_TERSEDIA",
        },
      });

      return loan;
    });

    res.json({
      message: "Validasi booking berhasil. Buku berhasil dipinjamkan.",
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal validasi booking",
      error: error.message,
    });
  }
}

export async function rejectReservation(req, res) {
  try {
    const { kodeBooking } = req.params;

    const reservation = await prisma.bookReservation.findUnique({
      where: {
        kodeBooking,
      },
      include: reservationDetailInclude,
    });

    if (!reservation) {
      return res.status(404).json({
        message: "Booking tidak ditemukan",
      });
    }

    if (
      reservation.status === "MENUNGGU_PENGAMBILAN" &&
      isReservationExpired(reservation)
    ) {
      await prisma.bookReservation.update({
        where: {
          id: reservation.id,
        },
        data: {
          status: "EXPIRED",
        },
      });

      return res.status(400).json({
        message: "Booking sudah kedaluwarsa dan tidak bisa ditolak",
      });
    }

    if (reservation.status !== "MENUNGGU_PENGAMBILAN") {
      return res.status(400).json({
        message: `Booking ini sudah tidak bisa ditolak karena status saat ini ${reservation.status}`,
      });
    }

    const updatedReservation = await prisma.bookReservation.update({
      where: {
        id: reservation.id,
      },
      data: {
        status: "DIBATALKAN",
      },
      include: reservationDetailInclude,
    });

    res.json({
      message: "Booking berhasil ditolak",
      data: updatedReservation,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal menolak booking",
      error: error.message,
    });
  }
}

export async function getMyReservationById(req, res) {
  try {
    const { id } = req.params;

    const reservation = await prisma.bookReservation.findFirst({
      where: {
        id: Number(id),
        userId: req.user.id,
      },
      include: reservationDetailInclude,
    });

    if (!reservation) {
      return res.status(404).json({
        message: "Reservasi tidak ditemukan",
      });
    }

    const checkedReservation = await updateReservationIfExpired(reservation);

    res.json({
      message: "Detail reservasi berhasil diambil",
      data: checkedReservation,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil detail reservasi",
      error: error.message,
    });
  }
}
