// Parses a WebVTT file into { text, start }[] cues, so we can attribute
// chunks back to a timestamp for the Source Viewer.
export function extractVtt(raw: string) {
  const lines = raw.replace(/\r/g, "").split("\n");
  const cues: { text: string; start: number }[] = [];

  const timeRegex = /(\d{2}):(\d{2}):(\d{2})[.,](\d{3})\s*-->/;

  let currentStart: number | null = null;
  let buffer: string[] = [];

  const flush = () => {
    if (currentStart !== null && buffer.length) {
      cues.push({ text: buffer.join(" ").trim(), start: currentStart });
    }
    buffer = [];
  };

  for (const line of lines) {
    const match = line.match(timeRegex);
    if (match) {
      flush();
      const [, h, m, s] = match;
      currentStart = Number(h) * 3600 + Number(m) * 60 + Number(s);
    } else if (line.trim() && !/^WEBVTT/i.test(line) && !/^\d+$/.test(line.trim())) {
      buffer.push(line.trim());
    }
  }
  flush();

  if (!cues.length) throw new Error("Could not parse any cues from this VTT file.");
  return cues;
}
