import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

// One splitter config for the whole app keeps retrieval quality predictable.
// ~800 chars with 120 overlap is a good default for short-answer RAG.
export async function chunkText(text: string, chunkSize = 800, chunkOverlap = 120) {
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize, chunkOverlap });
  const docs = await splitter.createDocuments([text]);
  return docs.map((d) => d.pageContent.trim()).filter(Boolean);
}
