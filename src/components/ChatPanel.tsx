"use client";

import { memo, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Sparkles } from "lucide-react";
import CitationBadge, { type Citation } from "./CitationBadge";
import SourceViewer from "./SourceViewer";
import EmptyState from "./EmptyState";
import { EmptyChat } from "@/components/icons/EmptyChat";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type ChatMessage = {
	id: string;
	role: "user" | "assistant";
	content: string;
	citations: Citation[];
	streaming?: boolean;
	createdAt?: string;
};

function renderContentWithCitations(
	content: string,
	citations: Citation[],
	onOpen: (c: Citation) => void
) {
	const citationMap = new Map(citations.map((c) => [c.index, c]));
	const parts = content.split(/(\[\d+\])/g);
	return parts.map((part, i) => {
		const match = part.match(/^\[(\d+)\]$/);
		if (match) {
			const index = Number(match[1]);
			const citation = citationMap.get(index);
			if (citation) {
				return (
					<button
						key={`${i}-${index}`}
						onClick={() => onOpen(citation)}
						className="relative -top-0.5 mx-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-accent/15 text-[10px] font-semibold text-accent transition-colors hover:bg-accent/25"
						aria-label={`Open citation ${index}`}
					>
						{index}
					</button>
				);
			}
		}
		return <span key={i}>{part}</span>;
	});
}

function updateLastAssistant(
	messages: ChatMessage[],
	patch: (last: ChatMessage) => ChatMessage,
): ChatMessage[] {
	const last = messages[messages.length - 1];
	if (!last || last.role !== "assistant") return messages;
	return [...messages.slice(0, -1), patch(last)];
}

function ChatPanel({
	workspaceId,
	hasSources,
}: {
	workspaceId: string;
	hasSources: boolean;
}) {
	const [msgs, setMsgs] = useState<ChatMessage[]>([]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [historyLoading, setHistoryLoading] = useState(true);
	const [openCitation, setOpenCitation] = useState<Citation | null>(null);
	const bottomRef = useRef<HTMLDivElement>(null);
	const historyLoadedFor = useRef<string | null>(null);

	async function loadMessages({ silent = false }: { silent?: boolean } = {}) {
		try {
			if (!silent) setHistoryLoading(true);
			const res = await fetch(`/api/chat?workspaceId=${workspaceId}`);
			if (!res.ok) return;
			const data = await res.json();
			if (Array.isArray(data.messages)) {
				const sorted = [...data.messages]
					.map((m: any) => ({
						id: m.id,
						role: m.role,
						content: m.content,
						citations: m.citations || [],
						createdAt: m.createdAt,
					}))
					.sort(
						(a, b) =>
							new Date(a.createdAt || 0).getTime() -
							new Date(b.createdAt || 0).getTime(),
					);
				setMsgs((prev) => {
					const unchanged =
						prev.length === sorted.length &&
						prev.every(
							(p, i) =>
								p.role === sorted[i].role &&
								p.content === sorted[i].content &&
								JSON.stringify(p.citations) ===
									JSON.stringify(sorted[i].citations),
						);
					return unchanged ? prev : sorted;
				});
			}
		} catch {
			// Ignore load failures and keep the current UI state.
		} finally {
			if (!silent) setHistoryLoading(false);
		}
	}

	useEffect(() => {
		if (historyLoadedFor.current === workspaceId) return;
		historyLoadedFor.current = workspaceId;
		loadMessages();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [workspaceId]);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [msgs]);

	async function ask() {
		const question = input.trim();
		if (!question || loading) return;
		setInput("");
		setLoading(true);

		setMsgs((m) => [
			...m,
			{ id: `u-${Date.now()}`, role: "user", content: question, citations: [] },
			{
				id: `a-${Date.now()}`,
				role: "assistant",
				content: "",
				citations: [],
				streaming: true,
			},
		]);

		let streamedContent = "";

		try {
			const res = await fetch("/api/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ workspaceId, question }),
			});

			const contentType = res.headers.get("content-type") || "";

			if (!res.ok) {
				setMsgs((m) =>
					updateLastAssistant(m, (last) => ({
						...last,
						content: "Sorry, something went wrong. Please try again.",
						streaming: false,
					})),
				);
				return;
			}

			// Some chat paths (e.g. no matching sources) return JSON instead of SSE.
			if (contentType.includes("application/json")) {
				const data = await res.json();
				setMsgs((m) =>
					updateLastAssistant(m, (last) => ({
						...last,
						content:
							data.answer ||
							data.error ||
							"Sorry, something went wrong. Please try again.",
						citations: data.citations || [],
						streaming: false,
					})),
				);
				return;
			}

			if (!res.body) {
				setMsgs((m) =>
					updateLastAssistant(m, (last) => ({
						...last,
						content: "Sorry, something went wrong. Please try again.",
						streaming: false,
					})),
				);
				return;
			}

			const reader = res.body.getReader();
			const decoder = new TextDecoder();
			let buffer = "";
			let citationsAcc: Citation[] = [];

			const consumeSseChunk = (chunk: string) => {
				for (const line of chunk.split("\n")) {
					if (!line.startsWith("data: ")) continue;
					const payload = line.slice(6);
					if (payload === "[DONE]") continue;

					try {
						const parsed = JSON.parse(payload);
						if (parsed.token) {
							streamedContent += parsed.token;
							setMsgs((m) =>
								updateLastAssistant(m, (last) => ({
									...last,
									content: last.content + parsed.token,
								})),
							);
						}
						if (parsed.citations) {
							citationsAcc = parsed.citations;
							setMsgs((m) =>
								updateLastAssistant(m, (last) => ({
									...last,
									citations: parsed.citations,
								})),
							);
						}
					} catch {
						// Ignore malformed SSE payloads.
					}
				}
			};

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				buffer += decoder.decode(value, { stream: true });

				let boundary = buffer.indexOf("\n\n");
				while (boundary !== -1) {
					const chunk = buffer.slice(0, boundary);
					buffer = buffer.slice(boundary + 2);
					consumeSseChunk(chunk);
					boundary = buffer.indexOf("\n\n");
				}
			}

			if (buffer.trim()) consumeSseChunk(buffer);

			setMsgs((m) =>
				updateLastAssistant(m, (last) => ({
					...last,
					streaming: false,
					citations: citationsAcc,
				})),
			);

			// Stream dropped or returned no tokens, but the server may have saved
			// the assistant message already — pull it from history.
			if (!streamedContent) {
				await loadMessages({ silent: true });
			}
		} catch {
			if (!streamedContent) {
				await loadMessages({ silent: true });
			}
			setMsgs((m) => {
				const last = m[m.length - 1];
				if (last?.role === "assistant" && last.streaming) {
					return updateLastAssistant(m, (msg) => ({
						...msg,
						content:
							msg.content ||
							"Sorry, something went wrong. Please try again.",
						streaming: false,
					}));
				}
				return updateLastAssistant(m, (msg) => ({ ...msg, streaming: false }));
			});
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="flex h-full flex-col bg-bg">
			<div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
				{historyLoading ? (
					<div className="flex h-full items-center justify-center">
						<div className="flex animate-fadeUp flex-col items-center gap-3 rounded-2xl border border-border bg-surface px-6 py-5 text-center shadow-soft">
							<Loader2 className="h-8 w-8 animate-spin text-accent" />
							<div>
								<p className="text-sm font-medium text-fg">
									Loading conversation...
								</p>
								<p className="text-xs text-fg-tertiary">
									Fetching your chat history
								</p>
							</div>
						</div>
					</div>
				) : msgs.length === 0 ? (
					<EmptyState
						icon={<EmptyChat className="h-24 w-32" />}
						title={
							hasSources
								? "Ask anything about your sources"
								: "Add a source to get started"
						}
						description={
							hasSources
								? "Every answer will be grounded in your workspace's sources, with citations you can inspect."
								: "LearnForge only answers from what you upload — no source, no answer."
						}
					/>
				) : (
					<div className="mx-auto max-w-3xl space-y-6">
						{msgs.map((m, i) => (
							<div
								key={m.id}
								className={cn(
									"flex",
									m.role === "user" ? "justify-end" : "justify-start",
								)}
							>
								<div
									className={cn(
										"max-w-[90%] sm:max-w-[85%]",
										m.role === "user"
											? "rounded-2xl rounded-br-sm bg-accent px-4 py-2.5 text-sm text-white shadow-glow"
											: "rounded-2xl rounded-bl-sm border border-border bg-surface px-4 py-3 text-sm shadow-soft",
									)}
								>
									{m.role === "assistant" && (
										<div className="mb-1.5 flex items-center gap-1.5">
											<span className="flex h-5 w-5 items-center justify-center rounded-md bg-accent/15 text-accent">
												<Sparkles className="h-3 w-3" />
											</span>
											<span className="text-xs font-medium text-fg-tertiary">
												LearnForge
											</span>
										</div>
									)}
									<p className="whitespace-pre-wrap leading-relaxed text-fg">
										{renderContentWithCitations(m.content, m.citations, setOpenCitation)}
										{m.streaming && (
											<span className="ml-1 inline-block h-4 w-1 animate-blink bg-accent align-middle" />
										)}
									</p>
									{m.citations?.length > 0 && (
										<div className="mt-3 flex flex-wrap gap-2">
											{m.citations.map((c) => (
												<CitationBadge
													key={c.index}
													citation={c}
													onOpen={() => setOpenCitation(c)}
												/>
											))}
										</div>
									)}
								</div>
							</div>
						))}
						<div ref={bottomRef} />
					</div>
				)}
			</div>

			<div className="border-t border-border bg-surface p-3 sm:p-4">
				<div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-border bg-surface-elevated px-3 py-2.5 shadow-soft transition-colors duration-200 focus-within:border-accent/40">
					<input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								ask();
							}
						}}
						placeholder={
							hasSources
								? "Ask a question about your sources..."
								: "Add a source first to start chatting"
						}
						disabled={!hasSources}
						className="max-h-32 flex-1 resize-none bg-transparent py-1.5 text-sm text-fg outline-none placeholder:text-fg-tertiary disabled:cursor-not-allowed focus:border-none focus:ring-0 focus:ring-offset-0"
					/>
					<Button
						size="icon"
						onClick={ask}
						disabled={loading || !input.trim() || !hasSources}
						className="shrink-0 rounded-xl"
					>
						{loading ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Send className="h-4 w-4" />
						)}
					</Button>
				</div>
				<p className="mx-auto mt-2 max-w-3xl text-center text-[10px] text-fg-tertiary">
					Answers are grounded in your sources. Always verify important details.
				</p>
			</div>

			<AnimatePresence>
				{openCitation && (
					<SourceViewer
						citation={openCitation}
						onClose={() => setOpenCitation(null)}
					/>
				)}
			</AnimatePresence>
		</div>
	);
}

export default memo(ChatPanel);
