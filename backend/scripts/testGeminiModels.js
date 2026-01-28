const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const findWorkingModel = async () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("❌ NO API KEY FOUND");
        return;
    }

    const genAI = new GoogleGenerativeAI(key);

    try {
        // 1. Fetch valid models first
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();

        if (!data.models) {
            console.log("No models found.");
            return;
        }

        // Filter for Gemini 3 models
        const candidates = data.models
            .filter(m => m.name.includes("gemini-3")) // Target Gemini 3
            .map(m => m.name.replace("models/", ""));

        console.log(`Found ${candidates.length} Gemini 3 candidates. Testing...`);

        for (const modelName of candidates) {
            process.stdout.write(`Testing ${modelName}... `);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Test");
                const response = await result.response;
                const text = response.text();
                if (text) {
                    console.log("✅ SUCCESS!");
                    // Continue testing others to find Gemini 3
                }
            } catch (error) {
                if (error.status === 429) console.log("LB 429 (Quota)");
                else if (error.message.includes("404")) console.log("LB 404 (Not Found)");
                else console.log(`❌ Fail: ${error.message.split('\n')[0]}`);
            }
        }
        console.log("No working models found.");

    } catch (e) {
        console.error("Script Error:", e);
    }
};

findWorkingModel();
