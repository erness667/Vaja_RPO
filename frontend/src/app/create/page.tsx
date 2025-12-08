import { PageShell } from "@/components/layout/PageShell";

export default function CreatePage() {
  return (
    <PageShell maxWidthClass="max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-50 mb-6">
        Objavi oglas
      </h1>
      <div className="bg-gray-50 dark:bg-slate-900/60 rounded-xl border border-gray-200 dark:border-slate-700/60 p-6 transition-colors">
        <p className="text-gray-700 dark:text-slate-300">
          Forma za objavo oglasa bo kmalu na voljo.
        </p>
      </div>
    </PageShell>
  );
}

