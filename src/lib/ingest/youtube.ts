import { YoutubeTranscript } from "youtube-transcript";

export function extractVideoId(url: string) {
  const match = url.match(/(?:youtu\.be\/|v=|\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (!match) throw new Error("Could not find a video ID in that YouTube URL.");
  return match[1];
}

// Returns transcript segments with start time (seconds) so chunks can be
// deep-linked back to "YouTube opens at the referenced timestamp".
export async function extractYoutube(url: string) {
  const videoId = extractVideoId(url);
  const segments = await YoutubeTranscript.fetchTranscript(videoId);
  if (!segments.length) throw new Error("No transcript available for this video.");

  return {
    videoId,
    segments: segments.map((s) => ({
      text: s.text,
      start: Math.floor(s.offset / 1000), // seconds
    })),
  };
}
