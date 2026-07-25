import * as cheerio from "cheerio";
import { isSafeUrl } from "../ratelimit";

export async function extractUrl(url: string) {
  if (!isSafeUrl(url)) throw new Error("Refusing to fetch this URL (blocked or invalid).");

  const res = await fetch(url, {
    headers: { "User-Agent": "PustakLM/1.0 (+research-assistant)" },
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
