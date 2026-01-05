const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");

// Load .env.local manually
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function testConnection() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY is missing from .env.local");
        return;
    }

    console.log(`🔑 Found API Key: ${apiKey.substring(0, 5)}...`);
    console.log("🌐 Testing connection to Gemini API...");

    console.log("🌐 Listing available models...");

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        const models = await genAI.getGenerativeModel({ model: "gemini-pro" }).apiKey; // Hack to get client? No, need ModelService.
        // Actually the SDK has a way to list models, but it's often via a different manager or direct fetch.
        // Let's just try to fallback to a known stable model 'gemini-pro' in the test first to see if that works.
        // But wait, the error message literally suggested calling ListModels.
        // In the node SDK, it is not always straightforward on the main client.
        // Let's try to just run a generation with 'gemini-pro' which is the standard generic one.

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello?");
        console.log("✅ 'gemini-pro' works!");
        console.log(result.response.text());
    } catch (error) {
        console.error("❌ 'gemini-pro' failed:", error.message);
    }

    try {
        console.log("Trying 'gemini-2.0-flash'...");
        const model2 = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result2 = await model2.generateContent("Hello?");
        console.log("✅ 'gemini-2.0-flash' works!");
    } catch (error) {
        console.error("❌ 'gemini-2.0-flash' failed:", error.message);
    }
}

testConnection();
