"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScanResponse } from "@/lib/types";
import { CheckCircle2, XCircle, AlertCircle, BarChart3, TrendingUp, Users } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface DashboardProps {
    data: ScanResponse | null;
    isScanning: boolean;
}

export function Dashboard({ data, isScanning }: DashboardProps) {
    const [selectedBrand, setSelectedBrand] = useState<string>("all");

    const brandStats = useMemo(() => {
        if (!data || !data.success) return {};
        const stats: Record<string, { mentions: number, sentiment: number, citations: number }> = {};
        data.results.forEach(r => {
            r.analysis.brands.forEach(b => {
                if (!stats[b.name]) {
                    stats[b.name] = { mentions: 0, sentiment: 0, citations: 0 };
                }
                if (b.mentioned) {
                    stats[b.name].mentions++;
                    if (b.sentiment === "positive") stats[b.name].sentiment++;
                }
            });
        });
        return stats;
    }, [data]);

    const allBrands = Object.keys(brandStats);
    const sortedBrands = Object.entries(brandStats).sort(([, a], [, b]) => b.mentions - a.mentions);

    if (isScanning) {
        return (
            <Card className="bg-neutral-900/50 border-neutral-800 animate-pulse">
                <CardContent className="p-12 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin mx-auto" />
                    <p className="text-lg text-neutral-300 font-medium">Analyzing AI Visibility...</p>
                    <p className="text-neutral-500">Scraping ChatGPT and processing responses with Gemini</p>
                </CardContent>
            </Card>
        );
    }

    if (!data) {
        return (
            <Card className="bg-neutral-900/50 border-neutral-800">
                <CardHeader>
                    <CardTitle className="text-neutral-100 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-indigo-400" />
                        Visibility Dashboard
                    </CardTitle>
                    <CardDescription>
                        Results will appear here after running a scan.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (!data.success) {
        return (
            <Card className="bg-red-950/20 border-red-900/50">
                <CardContent className="p-6 text-red-400 flex items-center gap-3">
                    <AlertCircle className="w-6 h-6" />
                    <div>
                        <h3 className="font-bold">Scan Failed</h3>
                        <p className="text-sm opacity-90">{data.error || "Unknown error occurred"}</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const results = data.results;
    const totalPrompts = results.length;

    // Logic for highlighting
    const currentBrandStats = selectedBrand !== "all" ? brandStats[selectedBrand] : null;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header with Competitor Select */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-indigo-100">
                    Performance Overview
                </h2>
                <div className="flex items-center gap-3 bg-neutral-900/80 p-1.5 rounded-lg border border-neutral-800">
                    <Users className="w-4 h-4 text-neutral-400 ml-2" />
                    <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                        <SelectTrigger className="w-[180px] bg-neutral-950 border-none h-8 text-neutral-200">
                            <SelectValue placeholder="View as..." />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-900 border-neutral-800 text-neutral-200">
                            <SelectItem value="all">Overview (All Brands)</SelectItem>
                            {allBrands.map(b => (
                                <SelectItem key={b} value={b}>View as {b}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-neutral-900/50 border-neutral-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-400">Total Prompts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{totalPrompts}</div>
                    </CardContent>
                </Card>

                {selectedBrand === "all" ? (
                    <>
                        <Card className="bg-neutral-900/50 border-neutral-800">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-neutral-400">Most Visible Brand</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-indigo-400">
                                    {sortedBrands.length > 0 ? sortedBrands[0][0] : "-"}
                                </div>
                                {sortedBrands.length > 0 && (
                                    <p className="text-xs text-neutral-500 mt-1">
                                        Mentioned in {Math.round((sortedBrands[0][1].mentions / totalPrompts) * 100)}% of queries
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                        <Card className="bg-neutral-900/50 border-neutral-800">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-neutral-400">Avg Sentiment</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-emerald-400">
                                    Positive
                                </div>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <>
                        <Card className={`bg-neutral-900/50 border-neutral-800 ${currentBrandStats ? 'border-indigo-500/50 bg-indigo-500/5' : ''}`}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-neutral-400">"{selectedBrand}" Visibility</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-indigo-400">
                                    {currentBrandStats ? Math.round((currentBrandStats.mentions / totalPrompts) * 100) : 0}%
                                </div>
                                <p className="text-xs text-neutral-500 mt-1">
                                    Mentioned in {currentBrandStats?.mentions || 0} / {totalPrompts} queries
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-neutral-900/50 border-neutral-800">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-neutral-400">Rank Position</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-white">
                                    #{sortedBrands.findIndex(b => b[0] === selectedBrand) + 1}
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* Prompts Table */}
            <h3 className="text-xl font-bold text-white mt-8 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                Prompt Analysis
            </h3>
            <div className="space-y-4">
                {results.map((result, idx) => (
                    <Card key={idx} className="bg-neutral-900/50 border-neutral-800 overflow-hidden">
                        <div className="p-4 border-b border-neutral-800 bg-neutral-950/30 flex justify-between items-center">
                            <h4 className="font-medium text-neutral-200">{result.prompt}</h4>
                            <Badge variant="outline" className="text-neutral-500 border-neutral-700">Prompt {idx + 1}</Badge>
                        </div>
                        <CardContent className="p-4">
                            <div className="grid gap-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                    {result.analysis.brands.sort((a, b) => a.rank - b.rank).map((brand, bIdx) => {
                                        const isFocused = selectedBrand !== "all" && brand.name === selectedBrand;
                                        const isDimmed = selectedBrand !== "all" && brand.name !== selectedBrand;

                                        return (
                                            <div key={bIdx} className={`
p-3 rounded-md border flex flex-col gap-1 transition-all duration-300
                                        ${isFocused
                                                    ? 'bg-indigo-500/10 border-indigo-500 ring-1 ring-indigo-500/50 scale-[1.02]'
                                                    : brand.mentioned
                                                        ? 'bg-indigo-950/10 border-indigo-500/20'
                                                        : 'bg-neutral-950/50 border-neutral-800'
                                                }
                                        ${isDimmed && !isFocused ? 'opacity-40 grayscale-[0.5]' : 'opacity-100'}
`}>
                                                <div className="flex justify-between items-center">
                                                    <span className={`font-semibold ${brand.mentioned ? 'text-indigo-300' : 'text-neutral-500'} ${isFocused ? 'text-indigo-200' : ''} `}>
                                                        {brand.name}
                                                    </span>
                                                    {brand.mentioned ?
                                                        <CheckCircle2 className={`w-4 h-4 ${isFocused ? 'text-indigo-400' : 'text-emerald-500'} `} /> :
                                                        <XCircle className="w-4 h-4 text-neutral-600" />
                                                    }
                                                </div>
                                                {brand.mentioned && (
                                                    <>
                                                        <div className="text-xs text-neutral-400 mt-1 line-clamp-2">
                                                            "{brand.context}"
                                                        </div>
                                                        <div className="flex gap-2 mt-2">
                                                            <Badge variant="secondary" className="text-[10px] h-5 bg-neutral-800 text-neutral-400">
                                                                Rank #{brand.rank}
                                                            </Badge>
                                                            <Badge variant="secondary" className={`text-[10px] h-5 ${brand.sentiment === 'positive' ? 'bg-emerald-500/10 text-emerald-400' :
                                                                brand.sentiment === 'negative' ? 'bg-red-500/10 text-red-400' :
                                                                    'bg-yellow-500/10 text-yellow-400'
                                                                } `}>
                                                                {brand.sentiment}
                                                            </Badge>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                                {result.analysis.citations.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-neutral-800/50">
                                        <p className="text-xs text-neutral-500 mb-2 font-medium">Citations found:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {result.analysis.citations.map((cite, cIdx) => (
                                                <a key={cIdx} href={cite.url} target="_blank" rel="noopener noreferrer"
                                                    className="text-xs text-indigo-400 hover:underline bg-indigo-500/5 px-2 py-1 rounded border border-indigo-500/10 truncate max-w-[200px]">
                                                    {cite.title || cite.url}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
