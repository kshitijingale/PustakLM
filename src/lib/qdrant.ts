import { QdrantClient } from "@qdrant/js-client-rest";

if (!process.env.QDRANT_URL || !process.env.QDRANT_API_KEY) {
  throw new Error("QDRANT_URL / QDRANT_API_KEY missing. Add them to your .env file.");
}

export const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

const EMBEDDING_DIM = 1536; // text-embedding-3-small

// Every user gets their own collection (e.g. "user_<uuid>") so one user's
// notebooks can never leak into another user's vector search. Inside a
// collection, we further scope by notebookId + sourceId in the point payload
// so each notebook's retrieval only searches its own sources.
export async function ensureUserCollection(collectionName: string) {
  const collections = await qdrant.getCollections();
  const exists = collections.collections.some((c) => c.name === collectionName);
  if (!exists) {
    await qdrant.createCollection(collectionName, {
      vectors: { size: EMBEDDING_DIM, distance: "Cosine" },
    });
  }
}

export type ChunkPayload = {
  notebookId: string;
  sourceId: string;
  sourceTitle: string;
  sourceType: string;
  chunkIndex: number;
  text: string;
  // optional locators used by the Source Viewer to jump to the right spot
  page?: number;
  timestamp?: number; // seconds, for YouTube / VTT
};

export async function upsertChunks(
  collectionName: string,
  points: { id: string; vector: number[]; payload: ChunkPayload }[]
) {
  await qdrant.upsert(collectionName, { wait: true, points });
}

export async function searchChunks(
  collectionName: string,
  notebookId: string,
  vector: number[],
  limit = 6
) {
  const result = await qdrant.search(collectionName, {
    vector,
    limit,
    filter: { must: [{ key: "notebookId", match: { value: notebookId } }] },
    with_payload: true,
  });
  return result.map((r) => ({ score: r.score, payload: r.payload as unknown as ChunkPayload }));
}

export async function deleteSourceChunks(collectionName: string, sourceId: string) {
  await qdrant.delete(collectionName, {
    filter: { must: [{ key: "sourceId", match: { value: sourceId } }] },
  });
}
