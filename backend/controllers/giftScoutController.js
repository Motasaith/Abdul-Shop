const { GoogleGenerativeAI } = require("@google/generative-ai");
const Product = require("../models/Product");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Analyze Profile Image for Gift Recommendations
 * Route: POST /api/gift-scout/analyze
 */
exports.analyzeProfile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No profile screenshot uploaded" });
        }

        // Prepare image for Gemini
        const imagePart = {
            inlineData: {
                data: req.file.buffer.toString("base64"),
                mimeType: req.file.mimetype,
            },
        };

        // System Prompt for Gift Scout
        const systemInstruction = `
    **ROLE:**
    You are "Gift Scout", an expert personal shopper who analyzes social media profiles to find the perfect gift.
    
    **TASK:**
    1. Analyze the uploaded Instagram/Social Media screenshot. 
    2. Identify the person's:
       - **Vibe/Aesthetic** (e.g., Minimalist, Outdoorsy, Gamer, Luxury, Vintage)
       - **Hobbies/Interests** (e.g., Hiking, Coffee, Tech, Fashion, Reading)
       - **Gender/Age Group** (Infer from visual cues)
    3. Generate 3 **Gift Categories** that would be perfect for them.
    4. Generate 5 **Specific Search Keywords** to find items in a general e-commerce store (e.g., "Backpack", "Espresso Machine", "Headphones").
    
    **OUTPUT FORMAT (STRICT JSON ONLY):**
    {
      "profile_summary": "This person seems to be an outdoorsy coffee lover who enjoys hiking and film photography.",
      "gift_categories": ["Outdoor Gear", "Specialty Coffee", "Camera Accessories"],
      "search_keywords": ["Backpack", "Tent", "Coffee Maker", "Mug", "Camera Strap"]
    }
    `;

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: systemInstruction,
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = "Analyze this profile and suggest gifts.";

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();
        const aiData = JSON.parse(text);

        // Search for Products based on Keywords
        const searchKeywords = aiData.search_keywords;

        // Construct Query OR logic
        // Reuse logic from ShopLens (Text search fallback to Regex)
        let products = [];

        if (searchKeywords.length > 0) {
            const regexConditions = searchKeywords.map(k => ({
                $or: [
                    { name: { $regex: k, $options: 'i' } },
                    { tags: { $in: [new RegExp(k, 'i')] } },
                    { category: { $regex: k, $options: 'i' } }
                ]
            }));

            products = await Product.find({ $or: regexConditions }).limit(6);
        }

        // Map AI summary to response
        res.json({
            success: true,
            profile_summary: aiData.profile_summary,
            gift_categories: aiData.gift_categories,
            recommended_products: products
        });

    } catch (error) {
        console.error("Gift Scout Error:", error);
        res.status(500).json({ message: "Gift Scout analysis failed", error: error.message });
    }
};
