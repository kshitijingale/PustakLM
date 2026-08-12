"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import NotebookCard from "@/components/NotebookCard";
import EmptyState from "@/components/EmptyState";
import ThemeToggle from "@/components/ThemeToggle";
import LogoutButton from "@/components/LogoutButton";
import CreateNotebookDialog from "@/components/CreateNotebookDialog";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyNotebooks } from "@/components/icons/EmptyNotebooks";
import { Logo } from "@/components/icons/Logo";

type Notebook = { id: string; title: string; createdAt: string };

export default function HomePage() {
	const [notebooks, setNotebooks] = useState<Notebook[] | null>(null);
	const [showCreate, setShowCreate] = useState(false);

	async function load() {
		const res = await fetch("/api/notebooks");
		if (res.ok) setNotebooks((await res.json()).notebooks);
	}

	useEffect(() => {
		load();
	}, []);

	function deleteNotebook(id: string) {
		setNotebooks((prev) => prev?.filter((n) => n.id !== id) ?? prev);
	}

	function renameNotebook(id: string, title: string) {
		setNotebooks((prev) => prev?.map((n) => (n.id === id ? { ...n, title } : n)) ?? prev);
	}


	return (
		<main className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
			<header className="glass mb-8 flex items-center justify-between rounded-2xl px-4 py-3 sm:px-6 sm:py-4">
				<div className="flex items-center gap-3">
					<Logo className="h-8 w-8 sm:h-9 sm:w-9" />
					<div>
						<h1 className="font-serif text-lg font-semibold tracking-tight text-fg sm:text-xl">
							PustakLM
						</h1>
						<p className="hidden text-xs text-fg-tertiary sm:block">
							Your library. Now conversational.
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2 sm:gap-3">
					<ThemeToggle />
					<LogoutButton />
				</div>
			</header>

			<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="font-serif text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
						Your notebooks
					</h2>
					<p className="mt-1 text-sm text-fg-secondary">
						{notebooks === null
							? "Loading your notebooks..."
							: `${notebooks.length} notebook${notebooks.length === 1 ? "" : "s"}`}
					</p>
				</div>
				<Button onClick={() => setShowCreate(true)} className="w-full sm:w-auto">
					<Plus className="h-4 w-4" />
					New Notebook
				</Button>
			</div>

			{notebooks === null ? (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 6 }).map((_, i) => (
						<Skeleton key={i} className="h-40" />
					))}
				</div>
			) : notebooks.length === 0 ? (
				<motion.div
					initial={{ opacity: 0, scale: 0.98 }}
					animate={{ opacity: 1, scale: 1 }}
					className="card flex flex-col items-center justify-center gap-6 py-16 text-center"
				>
					<div className="relative">
						<div aria-hidden className="absolute -inset-8 rounded-full bg-accent/10 blur-3xl" />
						<EmptyNotebooks className="relative h-32 w-40" />
					</div>
					<div className="space-y-2">
						<h3 className="font-serif text-xl font-semibold tracking-tight text-fg">
							No notebooks yet
						</h3>
						<p className="mx-auto max-w-sm text-sm leading-relaxed text-fg-secondary">
							Create your first notebook to start uploading sources and asking questions grounded in your own library.
						</p>
					</div>
					<Button onClick={() => setShowCreate(true)}>
						<Plus className="h-4 w-4" />
						New Notebook
					</Button>
				</motion.div>
			) : (
				<motion.div
					initial="hidden"
					animate="visible"
					variants={{
						hidden: {},
						visible: { transition: { staggerChildren: 0.05 } },
					}}
					className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
				>
					{notebooks.map((n) => (
						<NotebookCard
							key={n.id}
							notebook={n}
							onDelete={deleteNotebook}
							onRename={renameNotebook}
						/>
					))}
				</motion.div>
			)}

			<CreateNotebookDialog
				open={showCreate}
				onOpenChange={setShowCreate}
				onCreated={(id) => (window.location.href = `/notebook/${id}`)}
			/>
		</main>
	);
}
