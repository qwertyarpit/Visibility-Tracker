# AI Visibility Tracker

The **AI Visibility Tracker** helps brands understand their presence in AI Search results (specifically ChatGPT). It automates the process of querying AI models, analyzing the responses for brand mentions, sentiment, and rank, and visualizing the data in a premium dashboard.

## Features

- **Automated Prompt Generation**: Uses Gemini to generate relevant search queries for a category (e.g., "Best CRM for startups").
- **Real-time ChatGPT Scraping**: Uses Playwright to query ChatGPT and capture responses.
- **AI Analysis**: Uses Gemini to analyze the scraped text for brand mentions, sentiment (Positive/Neutral/Negative), and ranking context.
- **Competitor Impersonation**: Pivot the dashboard to view data from the perspective of any tracked brand.
- **Citation Tracking**: Extracts and lists cited links from AI responses.
- **Premium UI**: Built with Next.js, Tailwind CSS, and Shadcn UI for a modern, dark-mode analytic experience.

## Setup & Running locally

1.  **Clone the repository**.
2.  **Install dependencies**:
    ```bash
    npm install
    npx playwright install
    ```
3.  **Configure Environment**:
    -   Create a `.env.local` file (or set in your environment):
        ```bash
        GEMINI_API_KEY=your_gemini_api_key_here
        ```
4.  **Run the application**:
    ```bash
    npm run dev
    ```
5.  **Usage**:
    -   Open `http://localhost:3000`.
    -   Enter a Category (e.g., "CRM").
    -   Add Brands to track (e.g., "Salesforce", "HubSpot", "Pipedrive").
    -   Click **Generate Prompts**.
    -   Click **Run Visibility Scan**.
    -   *Note*: A browser window will open (Playwright). If ChatGPT asks for login/CAPTCHA, please handle it manually in that window. The script waits for the chat input to be ready.

## Key Engineering Decisions

-   **Next.js App Router**: Chosen for its robust server actions and efficient rendering.
-   **Playwright (Headful)**: We deliberately use `headless: false` for the scraper. ChatGPT has strict anti-bot measures. Running in headful mode allows for manual intervention (solving CAPTCHAs, logging in) which is critical for a dependable demo without complex stealth engineered proxies.
-   **Gemini for Analysis**: Used for both generating realistic user prompts and analyzing the unstructured output from ChatGPT. It's fast and effective at named entity recognition and sentiment classification.
-   **Client-Side State for Demo**: To keep the architecture simple for this challenge, the scan state is held in the client. In a production app, this would be persisted to a database (Postgres).
      
## System Workflow & Thought Process

We designed a sophisticated pipeline to transform raw user input into actionable brand intelligence. Here is the logic flow of the application:

### 1. Intelligent Input Validation
The process begins with the user entering a **Category** (e.g., "CRM") and a list of **Brands** (e.g., "Salesforce, HubSpot").
-   **Consistency Check**: We verify via LLM if the brands actually operate within the specified category.
-   **User Feedback**: If there's a mismatch (e.g., Category: "Shoes", Brand: "Coca-Cola"), the system flags it, warning that results may be irrelevant.

### 2. Strategic Prompt Generation
Blindly searching for a brand name yields poor results. We generate high-intent search queries to mimic real user behavior.
-   **LLM Generation**: The system uses Gemini to create 5 distinct prompts based on the category (e.g., "Best affordable CRM for startups", "Top 5 enterprise CRM with AI features").
-   **User Control**: The user can review these prompts, select the best ones, or write their own custom queries to target specific market segments.

### 3. Hybrid Data Extraction (Playwright)
Once prompts are selected, we initiate the scraping phase.
-   **Real-time Interaction**: We use Playwright to automate a browser session, sending each prompt to ChatGPT.
-   **Rich DOM Extraction**: Instead of just grabbing text, we extract the full HTML structure, isolating anchor tags and citation links to understand exactly *where* and *how* a brand is mentioned.

### 4. Deep Analysis & Scoring (Gemini)
The raw HTML is passed to our analysis layer for deep inspection.
-   **Share of Voice**: We calculate the word count dedicated to each brand relative to the total response length.
-   **Citation Tracking**: We map every citation back to its source URL, verifying the credibility of the monitoring.
-   **Sentiment Engine**: We go beyond simple "Positive/Negative" labels. We analyze the context to determine *why* a brand was ranked highly (e.g., "Praised for pricing" vs "Praised for features").
-   **Competitor Analysis**: The final report compares your brand directly against competitors, highlighting gaps in visibility.

## Challenges & Technical Roadblocks

This project represents a deep dive into the adversarial nature of modern AI platform scraping. While the core "Visibility Tracker" concept is solid, obtaining reliable, automated access to the outputs of major AI models (ChatGPT, Gemini, DeepSeek) proved to be an immense technical hurdle.

### ChatGPT Integration Attempts
We dedicated significant engineering effort to building a robust scraper for ChatGPT using Playwright.
-   **Cloudflare & Bot Detection**: OpenAI employs aggressive Cloudflare protections. We experimented with `puppeteer-extra-plugin-stealth` and various browser fingerprinting evasion techniques, but the "Verify you are human" challenge persisted.
-   **CAPTCHAs**: We frequently encountered Arkose Labs CAPTCHAs that are extremely difficult to solve automatically. We attempted to integrate 2Captcha and similar services but found the latency introduced made the real-time dashboard unusable.
-   **Dynamic DOM**: The ChatGPT interface is heavily obfuscated (randomized class names) and changes frequently, requiring constant maintenance of the scraper selectors.

### Gemini & DeepSeek Research
We explored integrating Gemini and DeepSeek to provide a multi-model perspective.
-   **Gemini Web Scraping**: We attempted to replicate the ChatGPT scraping approach for Gemini's web interface. However, Google's anti-bot measures (checking Google account headers and integrity tokens) proved even more difficult to bypass reliably than Cloudflare.
-   **DeepSeek API vs Web**: DeepSeek's API was investigated, but at the time of development, it lacked specific "web search" capabilities required to simulate a user researching a brand. Structuring the prompts to get consistent "brand visibility" metrics without live web access was a major limitation.

**Conclusion**: After weeks of trial and error with headless browsers and stealth plugins, we decided that the **"Headful" Playwright approach** is the most pragmatic compromise. It trades pure background automation for reliability, asking the user to handle the initial "human" verification so the application can focus on the analysis and dashboarding values.

## Future Improvements

-   **Authentication Persistence**: Save browser context (cookies/local storage) to avoid logging in on every run.
-   **Database Integration**: Store historical scan data to track visibility trends over time.
-   **Headless Stealth Mode**: Implement stealth plugins to run completely in the background.
-   **Multi-Model Support**: Extend scraping to Perplexity, Claude, and Gemini (the web UI).
-   **Detailed Sentiment Scoring**: Move beyond simple Positive/Negative to detailed attribute scoring (e.g., "Pricing", "Features", "Support").
