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

function ChatPanel({
	notebookId,
	hasSources,
}: {
	notebookId: string;
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
			const res = await fetch(`/api/chat?notebookId=${notebookId}`);
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
		if (historyLoadedFor.current === notebookId) return;
		historyLoadedFor.current = notebookId;
		loadMessages();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [notebookId]);

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

		const res = await fetch("/api/chat", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ notebookId, question }),
		});

		if (!res.ok || !res.body) {
			setMsgs((m) => {
				const copy = [...m];
				const last = copy[copy.length - 1];
				if (last) {
					last.content = "Sorry, something went wrong. Please try again.";
					last.streaming = false;
				}
				return copy;
			});
			setLoading(false);
			return;
		}

		const reader = res.body.getReader();
		const decoder = new TextDecoder();
		let buffer = "";
		let citationsAcc: Citation[] = [];

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			buffer += decoder.decode(value, { stream: true });

			let boundary = buffer.indexOf("\n\n");
			while (boundary !== -1) {
				const chunk = buffer.slice(0, boundary);
				buffer = buffer.slice(boundary + 2);
				boundary = buffer.indexOf("\n\n");

				for (const line of chunk.split("\n")) {
					if (!line.startsWith("data: ")) continue;
					const payload = line.slice(6);
					if (payload === "[DONE]") continue;

					try {
						const parsed = JSON.parse(payload);
						if (parsed.token) {
							setMsgs((m) => {
								const copy = [...m];
								const last = copy[copy.length - 1];
								if (last && last.role === "assistant") {
									last.content += parsed.token;
								}
								return copy;
							});
						}
						if (parsed.citations) {
							citationsAcc = parsed.citations;
							setMsgs((m) => {
								const copy = [...m];
								const last = copy[copy.length - 1];
								if (last && last.role === "assistant") {
									last.citations = parsed.citations;
								}
								return copy;
							});
						}
					} catch {
						// Ignore malformed SSE payloads.
					}
				}
			}
		}

		setMsgs((m) => {
			const copy = [...m];
			const last = copy[copy.length - 1];
			if (last && last.role === "assistant") {
				last.streaming = false;
				last.citations = citationsAcc;
			}
			return copy;
		});
		await loadMessages({ silent: true });
		setLoading(false);
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
								? "Every answer will be grounded in your notebook's sources, with citations you can inspect."
								: "PustakLM only answers from what you upload — no source, no answer."
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
												PustakLM
											</span>
										</div>
									)}
									<p className="whitespace-pre-wrap leading-relaxed text-fg">
										{m.content}
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
						onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && ask()}
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
