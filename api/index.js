let appPromise;

module.exports = async (req, res) => {
  try {
    if (!appPromise) {
      appPromise = import("../backend/src/server.js").then(
        (module) => module.default
      );
    }

    const app = await appPromise;

    return app(req, res);
  } catch (error) {
    console.error("API handler error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};