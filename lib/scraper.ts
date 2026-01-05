import { chromium } from "playwright";
import { analyzeResponse } from "@/lib/gemini";

interface ScanResult {
    prompt: string;
    response: string;
    analysis: any;
}

export async function runScan(prompts: string[], brands: string[]) {
    const results: ScanResult[] = [];

    // Launch browser in headful mode 
    const browser = await chromium.launch({
        headless: false,
        args: [
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
            '--disable-infobars',
            '--window-position=0,0'
        ]
    });

    const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();

    try {
        console.log("Navigating to DeepSeek...");
        await page.goto("https://chat.deepseek.com/", { timeout: 60000 });

        console.log("Waiting for interface to load...");
        // DeepSeek usually has a textarea right away.
        // Selector strategy: look for 'textarea' or specific ID/Class.
        // DeepSeek typically uses a textarea with id like `chat-input` or similar, 
        // but generic `textarea` is safest first guess.

        await page.waitForSelector('textarea', { timeout: 30000 });
        console.log("DeepSeek Ready.");

        for (const prompt of prompts) {
            console.log(`[Step] Processing prompt: ${prompt}`);

            const inputSelector = 'textarea';

            console.log("[Step] Focusing input...");
            await page.focus(inputSelector);

            console.log("[Step] Clearing input...");
            // DeepSeek often retains text if not sent.
            await page.evaluate((sel) => {
                const el = document.querySelector(sel) as HTMLTextAreaElement;
                if (el) el.value = '';
            }, inputSelector);

            console.log("[Step] Typing prompt...");
            await page.keyboard.type(prompt, { delay: 30 });
            await page.waitForTimeout(500);

            console.log("[Step] Sending...");
            await page.keyboard.press("Enter");

            console.log("[Step] Waiting for response generation...");

            // Wait for generation.
            // DeepSeek is fast. We need to wait for the "Stop generating" icon/text to appear and then disappear?
            // Or just wait for a new message bubble to appear.

            await page.waitForTimeout(2000); // Wait for start
            // Wait for 10s roughly for full text. DeepSeek streams fast.
            await page.waitForTimeout(8000);

            // Extract Response
            console.log("[Step] Extracting response...");
            const responseText = await page.evaluate(() => {
                // Look for message bubbles.
                // DeepSeek classes: usually div like .ds-markdown or similar.
                // We can try to grab the last element that looks like a bot response.
                // Or all text that isn't the user prompt.

                // Fallback: Get all text from the main chat container.
                // This is a bit risky but easiest generic way.
                const bodyText = document.body.innerText;
                // We can try to split by the prompt?
                return bodyText;
            });

            console.log("[Step] Analyzing...");

            const analysis = await analyzeResponse(responseText, brands);
            results.push({ prompt, response: responseText, analysis });

            // Wait before next prompt
            await page.waitForTimeout(1000);
        }

    } catch (error) {
        console.error("Scraping failed:", error);
        return { success: false, results, error: String(error) };
    } finally {
        await browser.close();
    }

    return { success: true, results };
}
