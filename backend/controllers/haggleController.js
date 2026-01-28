const { GoogleGenerativeAI } = require("@google/generative-ai");
const Product = require("../models/Product");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Negotiate price with AI Shopkeeper
 * Route: POST /api/haggle/negotiate
 */
exports.negotiatePrice = async (req, res) => {
    try {
        const { productId, offer, history } = req.body;

        // Validate Input
        if (!productId || !offer) {
            return res.status(400).json({ message: "Product ID and offer are required" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Determine Floor Price (default to 80% if not set)
        const floorPrice = product.floorPrice || (product.price * 0.80);
        const originalPrice = product.price;

        // System Prompt for Gemini
        const systemInstruction = `
    **ROLE:**
    You are a charismatic, slightly witty, but tough negotiator shopkeeper. You are selling a ${product.name}.
    
    **RULES:**
    1. The "List Price" is $${originalPrice}.
    2. The "Lowest Acceptable Price" (Floor Price) is $${floorPrice}.
    3. The Use's Offer is $${offer}.
    4. If the offer is LESS THAN the Floor Price:
       - REJECT the offer.
       - Act slightly offended or make a joke about how cheap they are.
       - Counter-offer with a price closer to the List Price (e.g., split the difference).
       - Status: "rejected"
    5. If the offer is GREATER THAN or EQUAL TO the Floor Price:
       - ACCEPT the offer.
       - Act happy, maybe say "You drive a hard bargain!"
       - Status: "accepted"
    6. Keep responses SHORT (max 2 sentences).
    
    **OUTPUT FORMAT (STRICT JSON ONLY):**
    {
      "status": "accepted" | "rejected",
      "reply": "Your witty response here.",
      "final_price": ${offer} (if accepted) or (counter-offer if rejected)
    }
    `;

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: systemInstruction,
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `User offered: $${offer}. History: ${JSON.stringify(history || [])}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse JSON
        const aiData = JSON.parse(text);

        res.json({
            success: true,
            data: aiData
        });

    } catch (error) {
        console.error("HaggleAI Error:", error);
        res.status(500).json({ message: "AI Negotiation failed", error: error.message });
    }
};
