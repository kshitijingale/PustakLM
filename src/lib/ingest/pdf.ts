import pdf from "pdf-parse";

// Returns text with page markers so we can later attribute a chunk to a page
// number for the Source Viewer ("PDF opens at the relevant section").
export async function extractPdf(buffer: Buffer) {
  const pages: string[] = [];
  await pdf(buffer, {
    pagerender: async (pageData) => {
      const content = await pageData.getTextContent();
      const text = content.items.map((item: any) => item.str).join(" ");
      pages.push(text);
      return text;
    },
  });
  return pages; // pages[i] = text of page i+1
}
