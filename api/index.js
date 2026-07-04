let app;

export default async function handler(req, res) {
  try {
    if (!app) {
      const module = await import("../backend/src/server.js");
      app = module.default;
    }

    return app(req, res);
  } catch (error) {
    console.error("API handler error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
}