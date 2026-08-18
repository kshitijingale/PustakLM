import { Firecrawl } from "firecrawl";
import { isSafeUrl } from "../ratelimit";

export async function extractUrl(url: string) {
  if (!isSafeUrl(url)) throw new Error("Refusing to fetch this URL (blocked or invalid).");

  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    throw new Error("FIRECRAWL_API_KEY is required to index web links.");
  }

  const app = new Firecrawl({ apiKey });
  const result = await app.scrape(url, { formats: ["markdown"] });

  const title = result.metadata?.title || url;
  const text = result.markdown || "";

  if (!text || text.length < 50) {
    throw new Error("Could not extract readable content from this page.");
  }

  return { title, text };
}
