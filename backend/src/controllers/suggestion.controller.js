import prisma from "../prisma.js";

function generateNomorUsulan() {
  const date = new Date();
  const year = date.getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);

  return `USL-${year}-${random}`;
}

export async function createSuggestion(req, res) {
  try {
    const {
      judul,
      penulis,
      penerbit,
      tahunTerbit,
      kategori,
      mataKuliah,
      alasan,
    } = req.body;

    if (!judul || !penulis) {
      return res.status(400).json({
        message: "Judul dan penulis wajib diisi",
      });
    }

    const suggestion = await prisma.bookSuggestion.create({
      data: {
        userId: req.user.id,
        nomorUsulan: generateNomorUsulan(),
        judul,
        penulis,
        penerbit,
        tahunTerbit: tahunTerbit ? Number(tahunTerbit) : null,
        kategori,
        mataKuliah,
        alasan,
        status: "MENUNGGU",
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
    });

    res.status(201).json({
      message: "Usulan buku berhasil dikirim",
      data: suggestion,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal membuat usulan buku",
      error: error.message,
    });
  }
}

export async function getMySuggestions(req, res) {
  try {
    const suggestions = await prisma.bookSuggestion.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      message: "Data usulan saya berhasil diambil",
      data: suggestions,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil usulan saya",
      error: error.message,
    });
  }
}

export async function getAllSuggestions(req, res) {
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
      message: "Data usulan buku berhasil diambil",
      data: suggestions,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil data usulan buku",
      error: error.message,
    });
  }
}

export async function getSuggestionById(req, res) {
  try {
    const { id } = req.params;

    const suggestion = await prisma.bookSuggestion.findUnique({
      where: {
        id: Number(id),
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
    });

    if (!suggestion) {
      return res.status(404).json({
        message: "Usulan buku tidak ditemukan",
      });
    }

    res.json({
      message: "Detail usulan buku berhasil diambil",
      data: suggestion,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil detail usulan buku",
      error: error.message,
    });
  }
}

export async function updateSuggestionStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, catatan } = req.body;

    const allowedStatus = [
      "MENUNGGU",
      "DITINJAU",
      "DISETUJUI",
      "DITOLAK",
      "TERSEDIA",
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: "Status usulan tidak valid",
      });
    }

    const existingSuggestion = await prisma.bookSuggestion.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existingSuggestion) {
      return res.status(404).json({
        message: "Usulan buku tidak ditemukan",
      });
    }

    const suggestion = await prisma.bookSuggestion.update({
      where: {
        id: Number(id),
      },
      data: {
        status,
        catatan,
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
    });

    res.json({
      message: "Status usulan buku berhasil diperbarui",
      data: suggestion,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal memperbarui status usulan buku",
      error: error.message,
    });
  }
}

export async function approveSuggestion(req, res) {
  try {
    const { id } = req.params;
    const { catatan } = req.body;

    const suggestion = await prisma.bookSuggestion.update({
      where: {
        id: Number(id),
      },
      data: {
        status: "DISETUJUI",
        catatan: catatan || "Usulan buku disetujui",
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
    });

    res.json({
      message: "Usulan buku berhasil disetujui",
      data: suggestion,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal menyetujui usulan buku",
      error: error.message,
    });
  }
}

export async function rejectSuggestion(req, res) {
  try {
    const { id } = req.params;
    const { catatan } = req.body;

    const suggestion = await prisma.bookSuggestion.update({
      where: {
        id: Number(id),
      },
      data: {
        status: "DITOLAK",
        catatan: catatan || "Usulan buku ditolak",
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
    });

    res.json({
      message: "Usulan buku berhasil ditolak",
      data: suggestion,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal menolak usulan buku",
      error: error.message,
    });
  }
}