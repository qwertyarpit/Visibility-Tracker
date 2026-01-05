## THOUGHT PROCESS

The objective of this project was to measure **AI search visibility** which is how frequently and in what context brands appear in AI-generated answers for a given category.

I approached the problem from a **product-first perspective**, focusing on accuracy, explainability, and real-world constraints rather than only implementation.

---

### Input Validation

The user inputs the **category and a list of brands**, which would first be sent to an LLM to ensure brands and category matches, if the match confidence was low, the user would be warned that the resulting visibility metrics may be inaccurate.

---

### Prompt Generation

The system automatically generates **five relevant prompts** for the given category using an LLM, while still allowing users to add or modify prompts manually.

---

### AI Response Collection (Design Choice)

- To capture **exact user-facing AI answers**, my preferred approach was to query ChatGPT via the **web UI** and use **Playwright** to scrape the rendered HTML including visible text, anchor tags, and structural elements.  
- Rather than directly counting occurrences in Playwright, this extracted HTML was sent to an LLM for contextual analysis, as simple counting can misinterpret meaning,or contextual references and lead to inaccurate visibility metrics.  
- This approach was chosen to closely mirror real user-visible responses while avoiding discrepancies between API outputs and UI behavior.


---

### Visibility Metrics & Ranking Logic

From each AI response, I'd extract brand mentions, citation counts, sentiment, and a short **“Why” clause** explaining brand–category association, with rankings computed using a weighted score where citations carry higher importance as an authority signal.

---

### Competitor Impersonation Mode

Competitor Impersonation Mode was designed as a **view-layer abstraction**, allowing the same visibility metrics to be analyzed from a selected competitor’s perspective without changing the underlying computation.

---

## PROBLEMS FACED & CONSTRAINTS

Despite having a clear system design, I encountered multiple **practical constraints** related to accessing AI-generated responses.

---

### 1. Crawling ChatGPT Web UI

- I Attempted to scrape ChatGPT using Playwright but ecountered repeated blocking, CAPTCHA challenges, and request throttling as the ChatGPT's UI was heavily protected against automated access

---

### 2. Alternative AI Platforms

Then I explored multiple options:

- **Gemini**
  - Blocked at the login / authentication screen during automation
- **DeepSeek**
  - Similar bot-detection and login issues
- **Direct API querying instead of crawling**
  - Gemini API rate limits got exhausted during testing

---

## What I Would Improve With More Time

- Using crawlers other than playwright like Cypress
- Use LLM APIs with higher or extended rate limits
  
---

## Final Note

Although a fully working implementation could not be completed due to AI access and rate-limit constraints, this README captures my end-to-end product thinking, system design decisions, and approach to handling real-world limitations.

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
