'use client';

import { useState, useEffect, useCallback } from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { searchPatients, Patient } from '@/lib/patients-data';
import { Search, Stethoscope } from 'lucide-react';

export default function HomePage() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Patient[]>([]);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    setResults(searchPatients(query));
  }, [query]);

  const selectPatient = useCallback(
    (id: string) => {
      setOpen(false);
      router.push(`/patient/${id}`);
    },
    [router]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-amber-100">
      <header className="border-b border-amber-200/50 bg-white/30 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-7 w-7 text-amber-700" />
            <h1 className="text-xl font-semibold text-stone-800">PulseLens</h1>
          </div>
          <span className="text-sm text-stone-500">Clinical Dashboard</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-stone-800 sm:text-4xl">
            Patient Search
          </h2>
          <p className="mt-2 text-stone-600">
            Search by name, patient ID, or chief complaint
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-8 inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-white/60 px-6 py-3 text-stone-700 shadow-sm backdrop-blur-sm transition hover:bg-white/80"
          >
            <Search className="h-5 w-5" />
            Open command palette
            <kbd className="ml-2 rounded bg-stone-100 px-2 py-0.5 text-xs">⌘K</kbd>
          </button>
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {searchPatients('').slice(0, 6).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => selectPatient(p.id)}
              className="glass-card p-4 text-left transition hover:shadow-md"
            >
              <p className="font-medium text-stone-800">{p.name}</p>
              <p className="text-sm text-stone-500">{p.id}</p>
              <p className="mt-1 text-sm text-amber-800">{p.chief_complaint}</p>
            </button>
          ))}
        </div>
      </main>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div
            className="fixed left-1/2 top-[20%] w-full max-w-lg -translate-x-1/2 rounded-xl border border-amber-200 bg-white/95 shadow-2xl backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Command className="rounded-xl" shouldFilter={false}>
              <div className="flex items-center border-b border-amber-100 px-4">
                <Search className="mr-2 h-4 w-4 shrink-0 text-stone-400" />
                <Command.Input
                  value={query}
                  onValueChange={setQuery}
                  placeholder="Search patients..."
                  className="flex h-12 w-full bg-transparent py-3 text-sm outline-none"
                  autoFocus
                />
              </div>
              <Command.List className="max-h-72 overflow-y-auto p-2">
                <Command.Empty className="py-6 text-center text-sm text-stone-500">
                  No patients found.
                </Command.Empty>
                {results.slice(0, 15).map((p) => (
                  <Command.Item
                    key={p.id}
                    value={p.id}
                    onSelect={() => selectPatient(p.id)}
                    className="cursor-pointer rounded-lg px-3 py-2 aria-selected:bg-amber-100"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">{p.name}</span>
                      <span className="text-xs text-stone-400">{p.id}</span>
                    </div>
                    <p className="text-sm text-stone-500">{p.chief_complaint}</p>
                    {p.isSynthetic && (
                      <span className="text-xs text-amber-600">Synthetic record</span>
                    )}
                  </Command.Item>
                ))}
              </Command.List>
            </Command>
          </div>
        </div>
      )}

      <footer className="mt-16 border-t border-amber-200/50 py-6 text-center text-xs text-stone-400">
        PulseLens prototype — not for clinical use. AI suggestions are not verified medical facts.
      </footer>
    </div>
  );
}
