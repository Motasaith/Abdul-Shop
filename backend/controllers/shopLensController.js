const { GoogleGenerativeAI } = require("@google/generative-ai");
const Product = require("../models/Product");

// Initialize Gemini
// Ensure GEMINI_API_KEY is in your .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.analyzeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const { mode } = req.body; // "fashion", "decor", or "repair"

    // Prepare image for Gemini
    const imagePart = {
      inlineData: {
        data: req.file.buffer.toString("base64"),
        mimeType: req.file.mimetype,
      },
    };

    // System Prompt
    const systemInstruction = `
**ROLE:**
You are ShopLens, an intelligent multi-modal shopping assistant capable of three distinct personalities. You analyze images and recommend products from a store inventory by generating precise search tags.

**MODES:**
1.  **"fashion"**: You are a Trendy Stylist. Focus on face shape, skin tone, and color theory.
2.  **"decor"**: You are a Sophisticated Interior Designer. Focus on room atmosphere and textures.
3.  **"repair"**: You are a Grumpy but Helpful Mechanic. Focus on the specific broken tool or part.

**TASK:**
1.  Identify the "mode".
2.  Analyze the image (face shape, room style, or broken part).
3.  Generate a "personality_comment" speaking to the user.
4.  **CRITICAL:** Generate 3-5 **BROAD, SINGLE-WORD or TWO-WORD** "search_keywords" to find products in a standard database. 
    *   BAD: "Men's Modern Fit Chinos", "Light Blue Oxford Shirt", "Matte White Ceramic Vase"
    *   GOOD: "Chinos", "Blue Shirt", "Vase", "Sneakers", "Aviator", "Wrench"
    *   EXPLAINED: The database names are simple (e.g., "White Sneakers"). Complex keywords will fail.
5.  Provide a short "reason_badge" (max 5 words).

**OUTPUT FORMAT (STRICT JSON ONLY):**
{
  "mode": "fashion",,
  "analysis": "...",
  "personality_comment": "...",
  "recommendations": [
    { "search_keyword": "Aviator", "reason_badge": "Softens jawline" },
    { "search_keyword": "Blue Shirt", "reason_badge": "Matches eyes" }
  ]
}
`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction
    });

    const prompt = `This is the user's image. The mode is: ${mode}. Return the JSON response as defined in your system instructions.`;

    // 1. Get AI Analysis with Retry Logic
    let result;
    let retries = 3;
    while (retries > 0) {
      try {
        result = await model.generateContent([prompt, imagePart]);
        break;
      } catch (err) {
        if (err.status === 503 && retries > 1) {
          console.log(`AI Overloaded (503). Retrying... (${retries - 1} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
          retries--;
        } else {
          throw err;
        }
      }
    }

    const response = await result.response;
    const text = response.text();

    // Clean up if Gemini adds markdown code blocks despite instructions
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const aiData = JSON.parse(jsonString);

    // 2. Search Database (The "Matchmaker")
    const searchKeywords = aiData.recommendations.map(rec => rec.search_keyword);

    // Strategy: Use MongoDB Text Search if available, otherwise fallback to broad regex
    // We construct a space-separated string of all keywords for a broad $text OR search
    const textSearchQuery = searchKeywords.join(" "); // "Aviator Blue Shirt"

    let products = [];

    try {
      // Try Text Search first (Requires text index on name/description/tags)
      // This ranks results by relevance score
      products = await Product.find(
        { $text: { $search: textSearchQuery } },
        { score: { $meta: "textScore" } }
      )
        .sort({ score: { $meta: "textScore" } })
        .limit(10);

    } catch (err) {
      console.log("Text search failed (missing index?), falling back to Regex:", err.message);
      // Fallback: Regex OR search for each keyword
      const regexConditions = searchKeywords.map(k => ({
        $or: [
          { name: { $regex: k, $options: 'i' } },
          { tags: { $in: [new RegExp(k, 'i')] } }
        ]
      }));
      products = await Product.find({ $or: regexConditions }).limit(10);
    }

    // Fallback if Text Search returned nothing (strict/weird keywords?)
    if (products.length === 0) {
      console.log("No text matches, trying broad regex fallback...");
      const regexConditions = searchKeywords.map(k => ({
        $or: [
          { name: { $regex: k, $options: 'i' } },
          { tags: { $in: [new RegExp(k, 'i')] } },
          { category: { $regex: k, $options: 'i' } }
        ]
      }));
      products = await Product.find({ $or: regexConditions }).limit(10);
    }

    // Map products back to recommendations to attach the "reason_badge"
    // This is tricky because one product might match multiple keywords or vice versa.
    // Let's attach the first matching badge we find for simplicity.
    const productsWithBadges = products.map(p => {
      const productObj = p.toObject();
      // Find matched recommendation
      const matchedRec = aiData.recommendations.find(rec => {
        const k = rec.search_keyword.toLowerCase();
        const n = p.name.toLowerCase();
        const t = p.tags.map(tag => tag.toLowerCase());
        return n.includes(k) || t.some(tag => tag === k || tag.includes(k)); // Loose matching
      });

      return {
        ...productObj,
        reason_badge: matchedRec ? matchedRec.reason_badge : "Great Match"
      };
    });

    // 3. Return combined data to Frontend
    res.json({
      ai_comment: aiData.personality_comment,
      analysis: aiData.analysis,
      products: productsWithBadges,
      raw_recommendations: aiData.recommendations
    });

  } catch (error) {
    console.error("ShopLens AI Error:", error);
    res.status(500).send("AI Overload: " + error.message);
  }
};
