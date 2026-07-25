import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { sources } from "../schema";
import { chunkText } from "../chunk";
import { embedTexts } from "../openai";
import { ensureUserCollection, upsertChunks, type ChunkPayload } from "../qdrant";
import { extractPdf } from "./pdf";
import { extractUrl } from "./url";
import { extractYoutube } from "./youtube";
import { extractVtt } from "./vtt";

type Segment = { text: string; page?: number; timestamp?: number };

// Every source type is normalized into a list of (text, locator) segments
// before chunking. This keeps the chunking + embedding step identical for
// all source types, and is what lets citations point back to a page or
// timestamp regardless of where the content came from.
async function extractSegments(
  type: string,
  originRef: string,
  rawText?: string
): Promise<{ segments: Segment[]; title: string; metadata: Record<string, unknown> }> {
  switch (type) {
    case "text": {
      return { segments: [{ text: rawText || "" }], title: "Text note", metadata: {} };
    }
    case "pdf": {
      const buffer = Buffer.from(rawText || "", "base64"); // originRef holds storage path in a real deployment
      const pages = await extractPdf(buffer);
      return {
        segments: pages.map((text, i) => ({ text, page: i + 1 })),
        title: "PDF document",
        metadata: { pageCount: pages.length },
      };
    }
    case "url": {
      const { title, text } = await extractUrl(originRef);
      return { segments: [{ text }], title, metadata: { url: originRef } };
    }
    case "youtube": {
      const { videoId, segments } = await extractYoutube(originRef);
      return {
        segments: segments.map((s) => ({ text: s.text, timestamp: s.start })),
        title: `YouTube video (${videoId})`,
        metadata: { videoId, url: originRef },
      };
    }
    case "vtt": {
      const cues = extractVtt(rawText || "");
      return {
        segments: cues.map((c) => ({ text: c.text, timestamp: c.start })),
        title: "Transcript",
        metadata: {},
      };
    }
    default:
      throw new Error(`Unsupported source type: ${type}`);
  }
}

// Main entry point: called right after a source row is created with status
// "uploading". Runs extraction + chunking + embedding, then flips status to
// "ready" (or "failed" with an error message the UI can show).
export async function indexSource(params: {
  sourceId: string;
  notebookId: string;
  userId: string;
  qdrantCollection: string;
  type: string;
  originRef: string;
  rawText?: string;
  titleOverride?: string;
}) {
  const { sourceId, notebookId, qdrantCollection, type, originRef, rawText, titleOverride } = params;

  await db.update(sources).set({ status: "indexing" }).where(eq(sources.id, sourceId));

  try {
    const { segments, title, metadata } = await extractSegments(type, originRef, rawText);
    const finalTitle = titleOverride || title;

    // Flatten every segment into chunks, keeping the segment's locator
    // (page / timestamp) attached to every chunk that comes from it.
    const chunks: { text: string; page?: number; timestamp?: number }[] = [];
    for (const seg of segments) {
      const pieces = await chunkText(seg.text);
      for (const piece of pieces) chunks.push({ text: piece, page: seg.page, timestamp: seg.timestamp });
    }

    if (!chunks.length) throw new Error("No extractable content found in this source.");

    await ensureUserCollection(qdrantCollection);

    const vectors = await embedTexts(chunks.map((c) => c.text));
    const points = chunks.map((c, i) => ({
      id: uuidv4(),
      vector: vectors[i],
      payload: {
        notebookId,
        sourceId,
        sourceTitle: finalTitle,
        sourceType: type,
        chunkIndex: i,
        text: c.text,
        page: c.page,
        timestamp: c.timestamp,
      } satisfies ChunkPayload,
    }));

    await upsertChunks(qdrantCollection, points);

    await db
      .update(sources)
      .set({ status: "ready", chunkCount: chunks.length, title: finalTitle, metadata })
      .where(eq(sources.id, sourceId));
  } catch (err: any) {
    await db
      .update(sources)
      .set({ status: "failed", errorMessage: err?.message || "Indexing failed" })
      .where(eq(sources.id, sourceId));
    throw err;
  }
}
