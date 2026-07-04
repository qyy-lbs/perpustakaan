import prisma from "../prisma.js";

function toBoolean(value) {
  return value === true || value === "true";
}

function getBookStatus(stokTersedia) {
  return Number(stokTersedia) > 0 ? "TERSEDIA" : "TIDAK_TERSEDIA";
}

export async function getBooks(req, res) {
  try {
    const { search, categoryId } = req.query;

    const books = await prisma.book.findMany({
      where: {
        deletedAt: null,
        AND: [
          search
            ? {
                OR: [
                  {
                    judul: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                  {
                    pengarang: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                  {
                    isbn: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                ],
              }
            : {},
          categoryId
            ? {
                categoryId: Number(categoryId),
              }
            : {},
        ],
      },
      include: {
        category: true,
        rack: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      message: "Data buku berhasil diambil",
      data: books,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil data buku",
      error: error.message,
    });
  }
}

export async function getBookById(req, res) {
  try {
    const { id } = req.params;

const book = await prisma.book.findFirst({
  where: {
    id: Number(id),
    deletedAt: null,
  },
  include: {
    category: true,
    rack: true,
  },
});

    if (!book) {
      return res.status(404).json({
        message: "Buku tidak ditemukan",
      });
    }

    res.json({
      message: "Detail buku berhasil diambil",
      data: book,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil detail buku",
      error: error.message,
    });
  }
}

export async function createBook(req, res) {
  try {
    const {
      isbn,
      judul,
      pengarang,
      penerbit,
      tahunTerbit,
      bahasa,
      jumlahHalaman,
      deskripsi,
      coverUrl,
      stokTotal,
      stokTersedia,
      stokMinimum,
      categoryId,
      rackId,
      jenisKoleksi,
      isDigital,
      fileUrl,
    } = req.body;

    if (!judul || !pengarang) {
      return res.status(400).json({
        message: "Judul buku dan pengarang wajib diisi",
      });
    }

    const finalStokTotal = Number(stokTotal || 0);
    const finalStokTersedia = Number(stokTersedia ?? finalStokTotal);

    const book = await prisma.book.create({
      data: {
        isbn,
        judul,
        pengarang,
        penerbit,
        tahunTerbit: tahunTerbit ? Number(tahunTerbit) : null,
        bahasa,
        jumlahHalaman: jumlahHalaman ? Number(jumlahHalaman) : null,
        deskripsi,
        coverUrl,
        stokTotal: finalStokTotal,
        stokTersedia: finalStokTersedia,
        stokMinimum: Number(stokMinimum || 1),
        status: getBookStatus(finalStokTersedia),
        categoryId: categoryId ? Number(categoryId) : null,
        rackId: rackId ? Number(rackId) : null,
        jenisKoleksi: jenisKoleksi || "FISIK",
        isDigital: toBoolean(isDigital),
        fileUrl,
      },
      include: {
        category: true,
        rack: true,
      },
    });

    res.status(201).json({
      message: "Buku berhasil ditambahkan",
      data: book,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal menambahkan buku",
      error: error.message,
    });
  }
}

export async function updateBook(req, res) {
  try {
    const { id } = req.params;

    const existingBook = await prisma.book.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existingBook) {
      return res.status(404).json({
        message: "Buku tidak ditemukan",
      });
    }

    const {
      isbn,
      judul,
      pengarang,
      penerbit,
      tahunTerbit,
      bahasa,
      jumlahHalaman,
      deskripsi,
      coverUrl,
      stokTotal,
      stokTersedia,
      stokMinimum,
      categoryId,
      rackId,
    } = req.body;

    const finalStokTersedia =
      stokTersedia !== undefined
        ? Number(stokTersedia)
        : existingBook.stokTersedia;

    const book = await prisma.book.update({
      where: {
        id: Number(id),
      },
      data: {
        isbn,
        judul,
        pengarang,
        penerbit,
        tahunTerbit: tahunTerbit ? Number(tahunTerbit) : null,
        bahasa,
        jumlahHalaman: jumlahHalaman ? Number(jumlahHalaman) : null,
        deskripsi,
        coverUrl,
        stokTotal: stokTotal !== undefined ? Number(stokTotal) : undefined,
        stokTersedia:
          stokTersedia !== undefined ? Number(stokTersedia) : undefined,
        stokMinimum:
          stokMinimum !== undefined ? Number(stokMinimum) : undefined,
        status: getBookStatus(finalStokTersedia),
        categoryId: categoryId ? Number(categoryId) : null,
        rackId: rackId ? Number(rackId) : null,
      },
      include: {
        category: true,
        rack: true,
      },
    });

    res.json({
      message: "Buku berhasil diperbarui",
      data: book,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal memperbarui buku",
      error: error.message,
    });
  }
}

export async function deleteBook(req, res) {
  try {
    const { id } = req.params;

    const existingBook = await prisma.book.findFirst({
      where: {
        id: Number(id),
        deletedAt: null,
      },
    });

    if (!existingBook) {
      return res.status(404).json({
        message: "Buku tidak ditemukan",
      });
    }

    await prisma.book.update({
      where: {
        id: Number(id),
      },
      data: {
        deletedAt: new Date(),
      },
    });

    res.json({
      message: "Buku berhasil dihapus",
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal menghapus buku",
      error: error.message,
    });
  }
}