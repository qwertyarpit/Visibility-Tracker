// This service now uses local logic (Regex/Templates) instead of Gemini API
// to avoid API key dependencies and costs.

export async function generatePrompts(category: string): Promise<string[]> {
  // Return static, high-value prompt templates
  return [
    `Best ${category} for startups`,
    `Top rated ${category} 2024`,
    `Performance comparison of top ${category}`,
    `Cheapest ${category} with good reviews`,
    `What are the most popular ${category}?`
  ];
}

export async function analyzeResponse(response: string, brands: string[]) {
  const brandStats = brands.map(brand => {
    // Escaping regex special characters in brand name to avoid crashes
    const escapedBrand = brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedBrand}\\b`, 'gi'); // Word boundary, case insensitive

    // Find all matches
    const matches = [...response.matchAll(regex)];
    const mentioned = matches.length > 0;

    // Simple verification of context (first mentions)
    let context = "";
    let rank = -1;
    let sentiment: "positive" | "neutral" | "negative" = "neutral";

    if (mentioned) {
      // "Rank" approximation: Where does it appear in the text?
      // We can sort brands by their first appearance index later if needed,
      // but for now, let's just use the index of the first match relative to other brands.
      // Actually, the calling function doesn't easily sort cross-brand here without more logic.
      // We'll return the index of first match to help ranking.
      rank = matches[0].index!;

      // Grab context around the first match
      const start = Math.max(0, rank - 60);
      const end = Math.min(response.length, rank + 60 + brand.length);
      context = "..." + response.slice(start, end).replace(/\s+/g, ' ').trim() + "...";

      // Very naive sentiment analysis based on context keywords
      const contextLower = context.toLowerCase();
      if (contextLower.match(/good|best|great|top|excellent|recommend|amazing|perfect|love/)) {
        sentiment = "positive";
      } else if (contextLower.match(/bad|worst|avoid|terrible|slow|expensive|hate|issues/)) {
        sentiment = "negative";
      }
    }

    return {
      name: brand,
      mentioned,
      sentiment,
      rank, // This is technically char index, we will normalize it to ordinal rank in the scraper if needed
      context,
      rawIndex: rank // Helper for sorting
    };
  });

  // Calculate ordinal rank (1st, 2nd, 3rd mentioned)
  // Filter mentioned brands, sort by rawIndex
  const mentionedBrands = brandStats.filter(b => b.mentioned).sort((a, b) => a.rawIndex - b.rawIndex);

  // Assign ordinal ranks
  mentionedBrands.forEach((b, idx) => {
    b.rank = idx + 1;
  });

  // Extract dummy citations (DeepSeek often lacks clear URL citations in text, 
  // but we can look for http links)
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const citationMatches = [...response.matchAll(urlRegex)];
  const citations = citationMatches.map(m => ({
    url: m[0],
    title: m[0].replace('https://', '').split('/')[0] // Simple domain as title
  }));

  return {
    brands: brandStats,
    citations,
    summary: "Analysis performed via keyword matching."
  };
}
