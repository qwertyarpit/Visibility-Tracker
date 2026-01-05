export interface BrandAnalysis {
    name: string;
    mentioned: boolean;
    sentiment: "positive" | "neutral" | "negative";
    rank: number;
    context: string;
}

export interface AnalysisResult {
    brands: BrandAnalysis[];
    citations: { url: string; title?: string }[];
    summary: string;
}

export interface ScanResult {
    prompt: string;
    response: string;
    analysis: AnalysisResult;
}

export interface ScanResponse {
    success: boolean;
    results: ScanResult[];
    error?: string;
}
