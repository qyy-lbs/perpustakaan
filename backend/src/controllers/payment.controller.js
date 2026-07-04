import prisma from "../prisma.js";

export async function createPayment(req, res) {
  try {
    const { fineId, metode, jumlahBayar } = req.body;

    if (!fineId || jumlahBayar === undefined) {
      return res.status(400).json({
        message: "fineId dan jumlahBayar wajib diisi",
      });
    }

    const fine = await prisma.fine.findUnique({
      where: {
        id: Number(fineId),
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
    });

    if (!fine) {
      return res.status(404).json({
        message: "Data denda tidak ditemukan",
      });
    }

    if (fine.status === "DIBAYAR") {
      return res.status(400).json({
        message: "Denda sudah dibayar sebelumnya",
      });
    }

    if (fine.payment) {
      return res.status(400).json({
        message: "Pembayaran untuk denda ini sudah pernah dibuat",
      });
    }

    const finalJumlahBayar = Number(jumlahBayar);

    if (finalJumlahBayar < fine.jumlah) {
      return res.status(400).json({
        message: "Jumlah bayar kurang dari nominal denda",
      });
    }

    const kembalian = finalJumlahBayar - fine.jumlah;

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          fineId: fine.id,
          metode: metode || "TUNAI",
          nominalDenda: fine.jumlah,
          jumlahBayar: finalJumlahBayar,
          kembalian,
        },
      });

      const updatedFine = await tx.fine.update({
        where: {
          id: fine.id,
        },
        data: {
          status: "DIBAYAR",
        },
      });

      return {
        payment,
        fine: updatedFine,
      };
    });

    res.status(201).json({
      message: "Pembayaran denda berhasil",
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal memproses pembayaran",
      error: error.message,
    });
  }
}