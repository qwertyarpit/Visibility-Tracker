"use server";

import { generatePrompts } from "@/lib/gemini";
import { runScan } from "@/lib/scraper"; // We will implement this next

export async function generatePromptsAction(category: string) {
    if (!process.env.GEMINI_API_KEY) {
        // Fallback if no key (for demo purposes without key)
        return [
            `Best ${category} for startups`,
            `Top 5 ${category} tools 2026`,
            `Cheap ${category} alternatives`,
            `Best ${category} for enterprise`,
            `Pros and cons of top ${category} software`
        ];
    }
    return await generatePrompts(category);
}

export async function startScanAction(prompts: string[], brands: string[]) {
    // This will trigger the Playwright scraper
    return await runScan(prompts, brands);
}
