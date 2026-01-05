"use client";

import { useState } from "react";
import { InputSection } from "@/components/input-section";
import { Dashboard } from "@/components/dashboard";
import { ScanResponse } from "@/lib/types";

export default function Home() {
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50 selection:bg-indigo-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-5xl">
        <header className="mb-12 text-center space-y-4">
          <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-4">
            AI Visibility Tracker
          </div>
          <h1 className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
            Are you visible in AI Search?
          </h1>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            Track your brand&apos;s visibility on ChatGPT. Analyze citation share, sentiment, and ranking against competitors in seconds.
          </p>
        </header>

        <div className="space-y-8">
          <InputSection
            onScanComplete={setScanResult}
            isScanning={isScanning}
            setIsScanning={setIsScanning}
          />
          <Dashboard data={scanResult} isScanning={isScanning} />
        </div>
      </div>
    </main>
  );
}
