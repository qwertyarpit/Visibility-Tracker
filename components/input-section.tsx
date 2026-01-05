"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Sparkles, Play } from "lucide-react";

import { generatePromptsAction, startScanAction } from "@/app/actions";
import { ScanResponse } from "@/lib/types";

interface InputSectionProps {
    onScanComplete: (results: ScanResponse) => void;
    isScanning: boolean;
    setIsScanning: (isScanning: boolean) => void;
}

export function InputSection({ onScanComplete, isScanning, setIsScanning }: InputSectionProps) {
    const [category, setCategory] = useState("");
    const [brands, setBrands] = useState<string[]>([]);
    const [currentBrand, setCurrentBrand] = useState("");
    const [prompts, setPrompts] = useState<string[]>([]);
    const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);

    const handleAddBrand = (e?: React.KeyboardEvent) => {
        if (e && e.key !== "Enter") return;
        if (currentBrand.trim()) {
            if (!brands.includes(currentBrand.trim())) {
                setBrands([...brands, currentBrand.trim()]);
            }
            setCurrentBrand("");
        }
    };

    const removeBrand = (brandToRemove: string) => {
        setBrands(brands.filter((b) => b !== brandToRemove));
    };

    const handleGeneratePrompts = async () => {
        setIsLoadingPrompts(true);
        try {
            const generatedPrompts = await generatePromptsAction(category);
            setPrompts(generatedPrompts);
        } catch (error) {
            console.error("Failed to generate prompts", error);
        } finally {
            setIsLoadingPrompts(false);
        }
    };

    const handleRunScan = async () => {
        if (!prompts.length || !brands.length) return;
        setIsScanning(true);
        try {
            const result = await startScanAction(prompts, brands);
            onScanComplete(result);
        } catch (error) {
            console.error("Scan failed", error);
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
            <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-300">Category</label>
                        <Input
                            placeholder="e.g. CRM, Project Management"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="bg-neutral-950 border-neutral-800 focus:ring-indigo-500/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-300">Brands to Track</label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Add brand and press Enter"
                                value={currentBrand}
                                onChange={(e) => setCurrentBrand(e.target.value)}
                                onKeyDown={handleAddBrand}
                                className="bg-neutral-950 border-neutral-800 focus:ring-indigo-500/50"
                            />
                            <Button
                                onClick={() => handleAddBrand()}
                                variant="outline"
                                className="border-neutral-800 hover:bg-neutral-800"
                            >
                                Add
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {brands.map((brand) => (
                                <Badge
                                    key={brand}
                                    variant="secondary"
                                    className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 px-2 py-1 flex items-center gap-1"
                                >
                                    {brand}
                                    <X
                                        className="w-3 h-3 cursor-pointer hover:text-indigo-300"
                                        onClick={() => removeBrand(brand)}
                                    />
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
                    <Button
                        onClick={handleGeneratePrompts}
                        disabled={!category || isLoadingPrompts || isScanning}
                        variant="outline"
                        className="border-neutral-700 hover:bg-neutral-800 text-neutral-300 hover:text-white"
                    >
                        <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
                        {isLoadingPrompts ? "Generating..." : "Generate Prompts"}
                    </Button>

                    <Button
                        onClick={handleRunScan}
                        disabled={!prompts.length || !brands.length || isScanning}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                    >
                        <Play className="w-4 h-4 mr-2" />
                        {isScanning ? "Scanning..." : "Run Visibility Scan"}
                    </Button>
                </div>

                {prompts.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-neutral-800 animate-in fade-in slide-in-from-top-4">
                        <h3 className="text-sm font-medium text-neutral-400">Generated Prompts used for analysis</h3>
                        <div className="grid gap-2">
                            {prompts.map((prompt, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-md bg-neutral-950/50 border border-neutral-800/50 text-sm text-neutral-300">
                                    <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-xs text-neutral-500">
                                        {i + 1}
                                    </div>
                                    {prompt}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
