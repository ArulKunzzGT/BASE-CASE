const { tiktokdl } = require('@bochilteam/scraper-tiktok');

/**
 * Fungsi untuk mengunduh video TikTok dari URL
 * @param {string} url - URL video TikTok yang akan diunduh
 * @param {Function} reply - Fungsi untuk mengirim pesan balasan
 */
const downloadTikTokVideo = async (url, reply) => {
  // Fungsi validasi URL TikTok
  const isValidTikTokUrl = (url) => {
    const regex = /^https?:\/\/(www\.)?tiktok\.com\/.+/;
    return regex.test(url);
  };

  // Periksa apakah URL valid
  if (!isValidTikTokUrl(url)) {
    reply("❌ URL tidak valid. Harap masukkan URL TikTok yang benar.");
    return;
  }

  try {
    // Ambil data video dari TikTok
    const data = await tiktokdl(url);

    // Kirim balasan dengan detail video
    reply("✅ Video TikTok berhasil diproses!");
    reply(`
📛 Username: ${data.author || "Tidak Diketahui"}
📹 Judul: ${data.title || "Tidak Diketahui"}
👀 Ditonton: ${data.played || "Tidak Diketahui"}
🔗 Link Unduh (Tanpa Watermark): ${data.video.no_watermark || "Tidak Tersedia"}
🔗 Link Unduh (Dengan Watermark): ${data.video.with_watermark || "Tidak Tersedia"}
    `);
  } catch (error) {
    console.error("❌ Error saat memproses URL TikTok:", error);
    reply("❌ Terjadi kesalahan saat memproses URL TikTok. Pastikan URL valid dan coba lagi.");
  }
};

module.exports = {
  downloadTikTokVideo,
};
