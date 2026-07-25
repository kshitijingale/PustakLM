export default function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center animate-fadeUp">
      <div className="text-4xl">{icon}</div>
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="max-w-sm text-sm text-parchment-100/60">{description}</p>
      {action}
    </div>
  );
}
