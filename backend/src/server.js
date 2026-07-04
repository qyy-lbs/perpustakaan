import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./prisma.js";
import authRoutes from "./routes/auth.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import rackRoutes from "./routes/rack.routes.js";
import bookRoutes from "./routes/book.routes.js";
import reservationRoutes from "./routes/reservation.routes.js";
import loanRoutes from "./routes/loan.routes.js";
import returnRoutes from "./routes/return.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import suggestionRoutes from "./routes/suggestion.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import reportRoutes from "./routes/report.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "API Perpustakaan Biah berjalan",
  });
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
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

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal mengambil data user",
      error: error.message,
    });
  }
});

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);


app.use("/api/categories", categoryRoutes);
app.use("/api/racks", rackRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/returns", returnRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/suggestions", suggestionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
  });
}

export default app;