// Catchouse ChatBot - Property Search Assistant
// Extracted from index.html for modular use

(() => {
    /* ───────────── CONFIG (fill these in or leave blank) ───────────── */
    const ALGOLIA_APP_ID = "T3J6BKODKM";
    const ALGOLIA_API_KEY = "85be8167f9237efc6997e81f8af59f73";
    const INDEX_NAME = "demo_catchouse_ns";
    let OPENAI_API_KEY = "";
    
    /* ───────────── CONFIG LOADING ───────────── */
    async function loadConfig() {
        try {
            const response = await fetch('./config.js');
            const config = await response.json();
            OPENAI_API_KEY = config.OPENAI_API_KEY;
        } catch (error) {
            console.error('Failed to load config:', error);
            throw new Error('Configuration loading failed. Please ensure config.js exists.');
        }
    }

    const maxSearchResults = 20;
    const maxHitsDisplay = 5; // Increased to show more results
    const attributesForHitCard = ["price", "bed_bath", "property_type", "square_footage", "year_built"];
    const numAttributes = ["price", "bathrooms", "bedrooms", "year_built, days_on_market"];
    const logoImg = "https://catchouse.com/wp-content/uploads/2025/07/catchouse_primary_ff6680-1.svg";
    const companyName = "Catchouse";
    const companyContext =
        "Catchouse Inc. is a newly formed real estate tech firm in Burlingame, CA, focused on developing software that transforms the homebuying process—likely through search engines and analytics. It has an inspiring slogan that emphasizes turning homeownership from a mere transaction into a meaningful journey of discovery, possibility, and belonging.";
    const chatbotName = "Hunter";
    const hitImageAttribute = "image_url";
    const hitUrlAttribute = "url";
    const hitTitleAttribute = "formatted_address";
    const collapseIcon =
        "https://catchouse.com/wp-content/uploads/fbrfg/favicon-96x96.png";

    /* ─────────────── Context settings ─────────────── */
    const CTX_LOCALSTORAGE_KEY = "enhanced_qp_ctx_v1";
    const CTX_MAX_TURNS = 6;
    const CTX_SUMMARY_BUL_MIN = 3;
    const CTX_SUMMARY_BUL_MAX = 6;

    /* ─────────────── Context Manager ─────────────── */
    class ContextManager {
        constructor({ key = CTX_LOCALSTORAGE_KEY, maxTurns = CTX_MAX_TURNS } = {}) {
            this.key = key;
            this.maxTurns = maxTurns;
            let saved = {};
            try {
                saved = JSON.parse(localStorage.getItem(this.key) || "{}");
            } catch { }
            this.turns = Array.isArray(saved.turns) ? saved.turns : [];
            this.summary = typeof saved.summary === "string" ? saved.summary : "";
        }
        _save() {
            try {
                localStorage.setItem(
                    this.key,
                    JSON.stringify({ turns: this.turns, summary: this.summary })
                );
            } catch { }
        }
        clear() {
            this.turns = [];
            this.summary = "";
            this._save();
        }
        async addTurn(turn) {
            this.turns.push(turn);
            if (this.turns.length > this.maxTurns) {
                const overflow = this.turns.splice(0, 2);
                const chunk = overflow
                    .map((t) => `${t.role.toUpperCase()}: ${t.content}`)
                    .join("\n");
                this.summary = await this._summarizeChunk(chunk, this.summary);
            }
            this._save();
        }
        buildMessages({ systemPrompt, newUserText }) {
            const msgs = [{ role: "system", content: systemPrompt }];
            if (this.summary?.trim()) {
                msgs.push({
                    role: "system",
                    content: `Conversation summary so far:\n${this.summary}`,
                });
            }
            msgs.push(...this.turns);
            msgs.push({ role: "user", content: newUserText });
            return msgs;
        }
        async _summarizeChunk(chunk, priorSummary) {
            const bullets = Math.max(
                CTX_SUMMARY_BUL_MIN,
                Math.min(CTX_SUMMARY_BUL_MAX, 5)
            );
            const messages = [
                {
                    role: "system",
                    content:
                        "You are a concise minutes bot. Compress dialogue into crisp bullets.",
                },
                {
                    role: "user",
                    content: `Prior summary (may be empty): ${priorSummary || "(none)"}

                    New dialogue to fold in:
                    ${chunk}

                    Update the running summary in ${bullets} bullet points. Keep names, intents, decisions, and follow-ups.`,
                },
            ];
            const text = await chatOpenAI(messages, 0.2);
            return (text || "").trim();
        }
    }

    /* ───────────── NEW: collapse icon (emoji or image) ───────────── */
    const COLLAPSE_ICON = collapseIcon;

    /* ─────────────────────────── UI helpers ────────────────────────── */
    function injectUI() {
        const div = document.createElement("div");
        div.innerHTML = `
        <div class="floating-chat" id="floatingChat">
          <div class="close-btn" id="closeChat">&times;</div>
          <div class="reset-btn" id="resetChat">&lt;&lt;</div>
          <div id="chat"></div>
          <div id="inputBox">
            <input id="userInput" type="text" placeholder="Ask me about listed properties..." autocomplete="off"/>
            <button id="sendButton">Search</button>
          </div>
        </div>`;
        document.body.appendChild(div);

        const toggle = document.createElement("div");
        toggle.id = "chatToggle";
        if (COLLAPSE_ICON.startsWith("http")) {
            toggle.innerHTML = `<img src="${COLLAPSE_ICON}" style="width:48px;height:48px"/>`;
        } else {
            toggle.textContent = COLLAPSE_ICON;
            toggle.style.fontSize = "48px";
        }
        document.body.appendChild(toggle);

        div.querySelector("#resetChat").onclick = () => {
            document.dispatchEvent(new CustomEvent("enhanced-fitrag:reset-context"));
            const chat = div.querySelector("#chat");
            chat.innerHTML = "";
            if (logoImg) {
                appendMessage(
                    div,
                    `<img src="${logoImg}" style="max-width:120px;display:block;margin:0 auto">`,
                    "bot"
                );
            }
            appendMessage(
                div,
                `Hi, I'm <b>${chatbotName}</b> — your ${companyName} property finder. I search through the Catchouse database to find your ideal home. Ask me about different properties!`,
                "bot"
            );
        };

        div.querySelector("#closeChat").onclick = () => {
            div.style.display = "none";
            toggle.style.display = "block";
        };
        toggle.onclick = () => {
            div.style.display = "flex";
            toggle.style.display = "none";
        };

        return div;
    }

    /* Format text with basic markdown-style formatting */
    const formatBotText = (text) => {
        return text
            // Bold text **text** or __text__
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/__(.*?)__/g, '<strong>$1</strong>')
            // Italic text *text* or _text_
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/_(.*?)_/g, '<em>$1</em>')
            // Line breaks
            .replace(/\n\n/g, '<br><br>')
            .replace(/\n/g, '<br>')
            // Numbered lists
            .replace(/^(\d+)\.\s(.+)$/gm, '<div class="list-item"><span class="list-number">$1.</span> $2</div>')
            // Bullet points
            .replace(/^[-*]\s(.+)$/gm, '<div class="list-item"><span class="list-bullet">•</span> $1</div>')
            // Dash points
            .replace(/^-\s(.+)$/gm, '<div class="list-item"><span class="list-dash">–</span> $1</div>');
    };

    const appendMessage = (container, html, cls) => {
        const chat = container.querySelector("#chat");
        const el = document.createElement("div");
        el.className = `message ${cls}`;
        
        // Format bot messages for better display
        if (cls === 'bot' && typeof html === 'string' && !html.includes('<')) {
            el.innerHTML = formatBotText(html);
        } else {
            el.innerHTML = html;
        }
        
        chat.appendChild(el);
        chat.scrollTop = chat.scrollHeight;
        return el;
    };

    /* Format seconds to HH:MM:SS */
    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return "Unknown";
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
    };

    /* Enhanced hit cards with selection reasoning */
    const appendCards = (container, hits, reasoning = {}) => {
        const imgKey = hitImageAttribute || "image_link";
        const urlKey = hitUrlAttribute || "url";
        const titleKey = hitTitleAttribute || "title";

        const chat = container.querySelector("#chat");
        const res = document.createElement("div");
        res.className = "results";

        if (!hits.length) {
            const noResults = document.createElement("div");
            noResults.className = "no-results";
            noResults.innerHTML = "No mixes found matching your criteria.<br>Try adjusting your search terms.";
            res.appendChild(noResults);
        } else {
            hits.forEach((h, index) => {
                const a = document.createElement("a");
                a.href = h[urlKey] || "#";
                a.target = "_blank";
                a.className = "result-card";

                if (h[imgKey]) {
                    const img = document.createElement("img");
                    img.src = h[imgKey];
                    img.alt = h[titleKey] || "Image";
                    a.appendChild(img);
                }

                const title = document.createElement("div");
                title.className = "title";
                title.textContent = h[titleKey] || "Address Not Available";
                a.appendChild(title);

                (attributesForHitCard.length ? attributesForHitCard : []).forEach((k) => {
                    // Special handling for composite or renamed attributes
                    const shouldShow = k === "bed_bath" || k === "property_type" || k === "square_footage" || k === "year_built" || h[k];
                    if (shouldShow) {
                        const d = document.createElement("div");
                        d.className = "attr";
                        
                        if (k === "price") {
                            d.innerHTML = `<span class="attr-label">Price:</span> <span class="duration-badge">$${h[k].toLocaleString()}</span>`;
                        } else if (k === "bed_bath") {
                            const beds = h.bedrooms || 0;
                            const baths = h.bathrooms || 0;
                            d.innerHTML = `<div style="display: flex; gap: 6px; align-items: center; font-family: 'Soria', sans-serif;"><span style="display: flex; align-items: center; gap: 4px; font-weight: 600; color: #1a1a1a;"><span style="font-size: 1.1em;">${beds}</span><span style="font-size: 0.8em; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">bed</span></span><span style="color: #ddd; font-size: 1.2em;">•</span><span style="display: flex; align-items: center; gap: 4px; font-weight: 600; color: #1a1a1a;"><span style="font-size: 1.1em;">${baths}</span><span style="font-size: 0.8em; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">bath</span></span></div>`;
                        } else if (k === "property_type") {
                            const type = h[k] ? h[k].replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown';
                            d.innerHTML = `<span class="attr-label">Type:</span> <span style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 0.2em 0.6em; border-radius: 12px; font-size: 0.75em; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; font-family: 'Soria', sans-serif;">${type}</span>`;
                        } else if (k === "square_footage") {
                            d.innerHTML = `<span class="attr-label">Size:</span> <span style="background: linear-gradient(135deg, #20bf6b 0%, #01a3a4 100%); color: white; padding: 0.2em 0.6em; border-radius: 12px; font-size: 0.8em; font-weight: 600; font-family: 'Soria', sans-serif;">${h[k].toLocaleString()} sq ft</span>`;
                        } else if (k === "year_built") {
                            d.innerHTML = `<span class="attr-label">Built:</span> <span style="font-weight: 600; color: #363A5A;">${h[k]}</span>`;
                        } else {
                            d.innerHTML = `<span class="attr-label">${k.toUpperCase()}:</span> ${h[k]}`;
                        }
                        a.appendChild(d);
                    }
                });

                // Add match reasoning if available
                if (reasoning[h.objectID]) {
                    const matchDiv = document.createElement("div");
                    matchDiv.className = "match-reason";
                    matchDiv.textContent = `Why selected: ${reasoning[h.objectID]}`;
                    a.appendChild(matchDiv);
                }

                res.appendChild(a);
            });
        }

        chat.appendChild(res);
        chat.scrollTop = chat.scrollHeight;
    };

    /* ─────────────── OpenAI helper ─────────────── */
    async function chatOpenAI(messages, temperature = 0.3) {
        const r = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({ model: "gpt-4o-mini", messages, temperature }),
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.error?.message || "OpenAI API error");
        return data.choices[0].message.content.trim();
    }

    /* Enhanced numeric filter extraction */
    async function extractNumericFilters(userText, allowedAttributes = []) {
        const messages = [
            {
                role: "system",
                content:
                    "Extract numeric constraints from a property/home search. Consider price hints: 'cheap'=<$400000, 'moderate'>$400000 and < $800000, 'expensive'>=$800000. Only use attributes provided. Return ONLY a JSON array of objects with keys: attribute (one of the provided), op (one of <, <=, >, >=, =), value (number). If none, return []. No prose.",
            },
            {
                role: "user",
                content: `Attributes: ${JSON.stringify(allowedAttributes)}
        Query: ${userText}`,
            },
        ];

        let parsed = [];
        try {
            const raw = await chatOpenAI(messages, 0);
            parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) parsed = [];
        } catch {
            parsed = [];
        }

        const ops = new Set(["<", "<=", ">", ">=", "="]);
        const filters = (parsed || [])
            .filter(
                (f) =>
                    f &&
                    allowedAttributes.includes(f.attribute) &&
                    ops.has(f.op) &&
                    isFinite(Number(f.value))
            )
            .map((f) => `${f.attribute} ${f.op} ${Number(f.value)}`);

        return filters.join(" AND ");
    }

    /* ───────────── Main chat logic ───────────── */
    function setupChat(container) {
        const ctx = new ContextManager({
            key: CTX_LOCALSTORAGE_KEY,
            maxTurns: CTX_MAX_TURNS,
        });

        document.addEventListener("enhanced-fitrag:reset-context", () => ctx.clear());

        const input = container.querySelector("#userInput");
        const button = container.querySelector("#sendButton");
        const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);

        if (logoImg) {
            appendMessage(
                container,
                `<img src="${logoImg}" style="max-width:120px;display:block;margin:0 auto">`,
                "bot"
            );
        }
        appendMessage(
            container,
                `Hi, I'm <b>${chatbotName}</b> — your ${companyName} property finder. I search through the Catchouse database to find your ideal home. Ask me about different properties!`,
                "bot"
        );

        async function handleSubmit() {
            const userText = input.value.trim();
            input.value = "";
            if (!userText) return;
            appendMessage(container, userText, "user");
            await ctx.addTurn({ role: "user", content: userText });
            
            const thinking = appendMessage(
                container,
                `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`,
                "bot"
            );

            try {
                // Enhanced keyword extraction for music search
                const keywordCsv = await chatOpenAI(
                    [
                        {
                            role: "system",
                            content:
                                "Extract property-related keywords from home/property queries. Focus on city, neighborhood, bathrooms/bedrooms, boolean attributes (such as waterfront, pool, heating), price (cheap, moderate, expensive, in budget). Return at most 8 keywords.",
                        },
                        {
                            role: "user",
                            content: `Property Search: "${userText}"\nReturn comma separated keywords only.`,
                        },
                    ],
                    0
                );
                const keywordQuery = keywordCsv
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .join(" ");

                // Extract numeric filters
                const numericFilters = await extractNumericFilters(
                    userText,
                    Array.isArray(numAttributes) ? numAttributes : []
                );

                // Enhanced Algolia search
                const { results } = await client.search([
                    {
                        indexName: INDEX_NAME,
                        query: userText,
                        params: Object.assign(
                            { hitsPerPage: maxSearchResults },
                            numericFilters ? { filters: numericFilters } : {}
                        ),
                    },
                    {
                        indexName: INDEX_NAME,
                        query: keywordQuery,
                        params: Object.assign(
                            { hitsPerPage: maxSearchResults },
                            numericFilters ? { filters: numericFilters } : {}
                        ),
                    },
                ]);
                
                const hits = [...results[0].hits, ...results[1].hits].filter(
                    (h, i, a) => a.findIndex((x) => x.objectID === h.objectID) === i
                );

                if (!hits.length) {
                    thinking.textContent =
                        "Let me search our catalog with broader terms to find the best properties for you!";
                    // Try a broader search
                    const { results: broadResults } = await client.search([
                        {
                            indexName: INDEX_NAME,
                            query: "popular properties",
                            params: { hitsPerPage: maxSearchResults }
                        }
                    ]);
                    hits = broadResults[0].hits.slice(0, maxHitsDisplay);
                    if (!hits.length) {
                        thinking.textContent = "Let me show you some of our most popular properties";
                        return;
                    }
                }

                const hitsForDisplay = hits.slice(0, maxHitsDisplay);

                // Enhanced system prompt focusing on Algolia results only
                const systemPrompt = `You are ${chatbotName}, the ${companyName} property finder assistant. ${companyContext}

        CRITICAL CONSTRAINTS:
        - You can ONLY recommend properties that exist in the search results provided below
        - NEVER create theoretical, imaginary, or generic results
        - NEVER suggest properties that aren't in the results
        - Always explain WHY you selected each specific property based on user criteria
        - Reference specific attributes: Price, Bedrooms, Bathrooms, Location,
        - If results don't perfectly match, explain what's available instead

        SEARCH RESULTS FROM ALGOLIA:
        ${hitsForDisplay.map((hit, index) => {
            const title = hit.formatted_address || "Property Address Not Available";
            const price = hit.price ? `$${hit.price.toLocaleString()}` : "Price not listed";
            const bedrooms = hit.bedrooms || "Unknown";
            const bathrooms = hit.bathrooms || "Unknown";
            const sqft = hit.square_footage || "Unknown";
            const year_built = hit.year_built || "Unknown";
            const description = hit.public_remarks || "No description available";
            
            return `${index + 1}. "${hit.formatted_address}"
           - Price: ${price}
           - Bedrooms: ${bedrooms}
           - Bathrooms: ${bathrooms}
           - Square Feet: ${sqft}
           - Year Built: ${year_built}
           - Neighborhood: ${hit.neighborhood || "Unknown"}
           - City: ${hit.city || "Unknown"}
           - Property Type: ${hit.property_type || "Unknown"}
           - Lot Size: ${hit.lot_size ? hit.lot_size + ' sq ft' : "Unknown"}
           - HOA: ${hit.hoa ? '$' + hit.hoa + '/mo' : "No HOA"}
           - Days on Market: ${hit.days_on_market || "Unknown"}
           - Description: ${description}
           - MLS#: ${hit.mls_number || "N/A"}
           - ID: ${hit.objectID}`;
        }).join('\n\n')}

        Your response should:
        1. Only reference the properties listed above
        2. Always make positive recommendations - focus on what works rather than what doesn't
        3. Explain why each recommended property is great for the user's request
        4. Consider budget when matching (affordable options vs luxury properties)
        5. Mention specific attributes that make it suitable (price, bedrooms, bathrooms, square footage, location, year built)
        6. Be conversational, enthusiastic, and factual
        7. Frame any compromises positively (e.g., "This property offers great value" rather than "this doesn't match perfectly")`;

                const messages = ctx.buildMessages({
                    systemPrompt,
                    newUserText: userText,
                });

                const answer = await chatOpenAI(messages, 0.1);
                await ctx.addTurn({ role: "assistant", content: answer });

                // Remove the thinking indicator and create a new properly formatted message
                thinking.remove();
                const responseEl = appendMessage(container, answer, "bot");
                
                // Add typing effect by gradually revealing the formatted content
                const formattedHTML = formatBotText(answer);
                responseEl.innerHTML = "";
                responseEl.style.opacity = "0";
                
                // Fade in the formatted response
                setTimeout(() => {
                    responseEl.innerHTML = formattedHTML;
                    responseEl.style.transition = "opacity 0.5s ease";
                    responseEl.style.opacity = "1";
                    setTimeout(() => appendCards(container, hitsForDisplay), 500);
                }, 100);
            } catch (err) {
                thinking.textContent = "Error searching properties: " + err.message;
            }
        }
        
        button.onclick = handleSubmit;
        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") handleSubmit();
        });
    }

    /* ───── Ensure Algolia client (Trusted Types-safe) ───── */
    function ensureAlgolia(cb) {
        if (typeof algoliasearch !== "undefined") return cb();
        const url =
            "https://cdn.jsdelivr.net/npm/algoliasearch/dist/algoliasearch-lite.umd.js";
        const s = document.createElement("script");
        if (window.trustedTypes?.createPolicy) {
            const policy = trustedTypes.createPolicy("algolia-cdn", {
                createScriptURL: (u) => u,
            });
            s.src = policy.createScriptURL(url);
        } else s.src = url;
        s.onload = cb;
        document.head.appendChild(s);
    }
    
    /* ─── boot ─── */
    async function initializeChatbot() {
        try {
            await loadConfig();
            ensureAlgolia(() => setupChat(injectUI()));
        } catch (error) {
            console.error('Chatbot initialization failed:', error);
        }
    }
    
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeChatbot);
    } else {
        initializeChatbot();
    }
})();