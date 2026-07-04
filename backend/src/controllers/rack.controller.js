import prisma from "../prisma.js";

export async function getRacks(req, res) {
  try {
    const racks = await prisma.rack.findMany({
      orderBy: {
        kodeRak: "asc",
      },
    });

    res.json({
      message: "Data rak berhasil diambil",
      data: racks,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil rak",
      error: error.message,
    });
  }
}

export async function createRack(req, res) {
  try {
    const { kodeRak, lokasi } = req.body;

    if (!kodeRak) {
      return res.status(400).json({
        message: "Kode rak wajib diisi",
      });
    }

    const rack = await prisma.rack.create({
      data: {
        kodeRak,
        lokasi,
      },
    });

    res.status(201).json({
      message: "Rak berhasil dibuat",
      data: rack,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal membuat rak",
      error: error.message,
    });
  }
}