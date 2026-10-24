import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const systemPrompt = `Anda adalah Muara AI, asisten layanan pelanggan cerdas dan ramah untuk platform MuaraKu (muaraku.id), platform lost and found terpercaya di Indonesia.
Pedoman Anda:
1. Membantu pengguna memahami cara melaporkan barang hilang (Seeker) atau barang temuan (Finder).
2. Menjelaskan pentingnya verifikasi kepemilikan anti-fraud: bukti ciri privat (nomor seri, isi tersembunyi) disimpan rahasia dan tidak boleh dibagikan di ruang publik.
3. Memberikan tips serah terima fisik yang aman: bertemu di pos petugas resmi, lobi umum kampus, atau pos polisi; jangan pernah mengirimkan uang tebusan.
4. Jangan pernah menyatakan bahwa AI adalah penentu mutlak kepemilikan barang. Keputusan akhir selalu diverifikasi oleh manusia.
5. Gunakan bahasa Indonesia yang santun, menenangkan, jelas, dan ringkas (maksimal 2-3 paragraf pendek).`;

    // Try OpenAI API if key is available
    const openAiKey = process.env.OPENAI_API_KEY;
    if (openAiKey && openAiKey.startsWith("sk-")) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: message },
            ],
            max_tokens: 350,
            temperature: 0.7,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const reply = data.choices?.[0]?.message?.content;
          if (reply) {
            return NextResponse.json({ reply });
          }
        }
      } catch (openAiErr) {
        console.warn("OpenAI API call notice:", openAiErr);
      }
    }

    // Try Gemini API if key is available
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const geminiModel = process.env.GEMINI_MODEL || "gemini-1.5-flash";
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    { text: `${systemPrompt}\n\nPertanyaan pengguna: ${message}` },
                  ],
                },
              ],
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            return NextResponse.json({ reply });
          }
        }
      } catch (geminiErr) {
        console.warn("Gemini API call notice:", geminiErr);
      }
    }

    // Intelligent civic rule-based fallback
    let fallbackReply =
      "Halo! Saya Muara AI. Ada yang bisa saya bantu seputar tata cara lapor barang hilang, etika serah terima, atau verifikasi kepemilikan?";
    const lower = message.toLowerCase();

    if (lower.includes("lapor") || lower.includes("hilang")) {
      fallbackReply =
        "Untuk melaporkan barang hilang, buka menu Seeker atau klik '+ Buat Laporan'. Isikan atribut umum yang boleh tampak publik, lalu tuliskan rincian rahasia di brankas bukti privat agar aman dari klaim palsu.";
    } else if (lower.includes("serah") || lower.includes("aman") || lower.includes("tips")) {
      fallbackReply =
        "Tips serah terima aman di MuaraKu: 1) Selalu bertemu di tempat umum yang ramai seperti pos satpam atau lobi kampus. 2) Jangan pernah mentransfer uang tebusan. 3) Cocokkan ciri rahasia sebelum barang diserahkan.";
    } else if (lower.includes("klaim") || lower.includes("verifikasi")) {
      fallbackReply =
        "Verifikasi kepemilikan dilakukan secara privat. Pengklaim wajib membuktikan ciri khusus barang yang tidak tampak di foto publik sebelum kontak pelapor dibagikan.";
    }

    return NextResponse.json({ reply: fallbackReply });
  } catch (error: unknown) {
    console.error("AI API Error:", error);
    return NextResponse.json(
      { reply: "Maaf, terjadi gangguan sementara pada koneksi AI. Anda tetap dapat menggunakan seluruh fitur navigasi MuaraKu." },
      { status: 500 }
    );
  }
}
