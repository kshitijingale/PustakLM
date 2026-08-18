import * as cheerio from "cheerio";
import { Firecrawl } from "firecrawl";
import { isSafeUrl } from "../ratelimit";

async function extractUrlFallback(url: string) {
  const res = await fetch(url, {
    headers: { "User-Agent": "LearnForge/1.0 (+research-assistant)" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`Failed to fetch URL: ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);
  $("script, style, nav, footer, noscript").remove();

  const title = $("title").first().text().trim() || url;
  const text = $("body").text().replace(/\s+/g, " ").trim();

  if (!text || text.length < 50) throw new Error("Could not extract readable content from this page.");

  return { title, text };
}

export async function extractUrl(url: string) {
  if (!isSafeUrl(url)) throw new Error("Refusing to fetch this URL (blocked or invalid).");

  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    return extractUrlFallback(url);
  }

  try {
    const app = new Firecrawl({ apiKey });
    const result = await app.scrape(url, { formats: ["markdown"] });

    const title = result.metadata?.title || url;
    const text = result.markdown || "";

    if (!text || text.length < 50) {
      throw new Error("Could not extract readable content from this page.");
    }

    return { title, text };
  } catch (err: any) {
    // If Firecrawl fails or the API key is invalid, fall back to the basic
    // cheerio scraper so the app keeps working without a working Firecrawl key.
    console.warn("Firecrawl scrape failed, falling back:", err?.message);
    return extractUrlFallback(url);
  }
}
