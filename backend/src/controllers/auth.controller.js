import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prisma.js";

const allowedRoles = ["MAHASISWA", "DOSEN", "PUSTAKAWAN"];

export async function register(req, res) {
  try {
    const { nama, email, password, role, nimNidn, noTelepon, prodi } = req.body;

    if (!nama || !email || !password || !role) {
      return res.status(400).json({
        message: "Nama, email, password, dan role wajib diisi",
      });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Role tidak valid",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email sudah digunakan",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        nama,
        email,
        password: hashedPassword,
        role,
        nimNidn,
        noTelepon,
        prodi,
      },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        nimNidn: true,
        noTelepon: true,
        prodi: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      message: "Registrasi berhasil",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Terjadi kesalahan server",
      error: error.message,
    });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email dan password wajib diisi",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        message: "Email atau password salah",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Email atau password salah",
      });
    }

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  return res.status(500).json({
    message: "JWT_SECRET belum diatur di file .env",
  });
}

const token = jwt.sign(
  {
    id: user.id,
    email: user.email,
    role: user.role,
  },
  jwtSecret,
  {
    expiresIn: "1d",
  }
);

    res.json({
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
        nimNidn: user.nimNidn,
        noTelepon: user.noTelepon,
        prodi: user.prodi,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Terjadi kesalahan server",
      error: error.message,
    });
  }
}

export async function me(req, res) {
  return res.json({
    message: "Data user login",
    user: req.user,
  });
}