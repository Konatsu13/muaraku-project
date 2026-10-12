import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { report_id, text, target_language, title } = body;

    // Validate input text
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Field 'text' is required and cannot be empty." },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { error: "Text length exceeds maximum allowed limit (5000 characters)." },
        { status: 400 }
      );
    }

    // Validate target language
    const targetLang = (target_language || "en").toLowerCase();
    if (!["id", "en"].includes(targetLang)) {
      return NextResponse.json(
        { error: "Unsupported target_language. Allowed values: 'id', 'en'." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Check if translation is cached in public.report_translations
    if (report_id && typeof report_id === "string") {
      try {
        const { data: cached } = await supabase
          .from("report_translations")
          .select("translated_description, translated_title")
          .eq("report_id", report_id)
          .eq("target_language", targetLang)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (cached?.translated_description) {
          return NextResponse.json({
            translated_text: cached.translated_description,
            translated_title: cached.translated_title || null,
            source: "cache",
            cached: true,
          });
        }
      } catch (cacheErr) {
        console.warn("Translation cache lookup warning:", cacheErr);
      }
    }

    // 2. Cache Miss: Translate using Google Cloud Translation API v2
    const googleApiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    let translatedText = "";
    let translatedTitle = "";
    let provider = "fallback";

    if (googleApiKey && googleApiKey.trim().length > 0) {
      try {
        const textsToTranslate = [text];
        if (title && typeof title === "string") {
          textsToTranslate.push(title);
        }

        const res = await fetch(
          `https://translation.googleapis.com/language/translate/v2?key=${googleApiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              q: textsToTranslate,
              target: targetLang,
              format: "text",
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          const translations = data?.data?.translations;
          if (Array.isArray(translations) && translations.length > 0) {
            translatedText = translations[0]?.translatedText || text;
            if (translations.length > 1) {
              translatedTitle = translations[1]?.translatedText || title;
            }
            provider = "google_v2";
          }
        } else {
          const errData = await res.text();
          console.warn("Google Translate API error response:", errData);
        }
      } catch (apiErr) {
        console.warn("Google Translation API request failed:", apiErr);
      }
    }

    // If Google Translate was not available or failed, provide graceful fallback
    if (!translatedText) {
      if (targetLang === "en") {
        translatedText = `[Translated to English]: ${text}`;
        translatedTitle = title ? `[Translated]: ${title}` : "";
      } else {
        translatedText = `[Diterjemahkan ke Bahasa Indonesia]: ${text}`;
        translatedTitle = title ? `[Diterjemahkan]: ${title}` : "";
      }
      provider = "rule_based_fallback";
    }

    // 3. Cache the newly translated text into public.report_translations if report_id exists
    if (report_id && typeof report_id === "string" && provider === "google_v2") {
      try {
        // Find current report version if available
        const { data: rep } = await supabase
          .from("reports")
          .select("content_version")
          .eq("id", report_id)
          .maybeSingle();

        const contentVersion = rep?.content_version || 1;

        await supabase.from("report_translations").insert({
          report_id,
          source_content_version: contentVersion,
          target_language: targetLang,
          translated_title: translatedTitle || title || "Tanpa Judul",
          translated_description: translatedText,
          provider: "google_v2",
          model: "nmt",
        });
      } catch (insertErr) {
        console.warn("Could not cache translation to report_translations:", insertErr);
      }
    }

    return NextResponse.json({
      translated_text: translatedText,
      translated_title: translatedTitle || null,
      source: provider,
      cached: false,
    });
  } catch (error) {
    console.error("Translate route unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error processing translation." },
      { status: 500 }
    );
  }
}
