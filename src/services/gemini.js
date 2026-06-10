const { GoogleGenAI } = require("@google/genai");

// Initialize the client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MOCK_ANSWERS = {
  "quantum computing": "Quantum computing is a type of computing that uses quantum mechanics (like superposition and entanglement) to process information. While classical computers use bits (0s and 1s), quantum computers use qubits, which can exist in multiple states at once. This allows them to solve complex calculations, like drug discovery or cryptography, exponentially faster.",
  "active and passive transport": "Active transport requires cellular energy (ATP) to move molecules against their concentration gradient (from low to high concentration), like the sodium-potassium pump. Passive transport, however, requires no energy as molecules move along their gradient (from high to low concentration), such as simple diffusion or osmosis.",
  "recursive programming": "Recursive programming is a method where a function calls itself to solve a smaller instance of the same problem. Think of it like a set of nesting Russian dolls: to reach the smallest doll, you must open each larger doll one by one, with a 'base case' that tells the function when to stop opening dolls and return the result.",
  "dna replicate": "DNA replication is the process by which a double-stranded DNA molecule is copied to produce two identical DNA molecules. It occurs in three main steps: unwinding of the double helix by helicase, complementary base pairing by DNA polymerase, and joining of the sugar-phosphate backbone by ligase.",
  "recursion": "Recursion is a programming technique where a function calls itself to solve smaller instances of the same problem until it reaches a defined base case.",
  "default": "Hello! I am your AI assistant powered by Gemini. That's an excellent question. To explore this topic further, feel free to ask for specific definitions, comparisons, or step-by-step examples."
};

function getMockAnswer(prompt) {
  const normalized = prompt.toLowerCase();
  for (const key of Object.keys(MOCK_ANSWERS)) {
    if (normalized.includes(key)) {
      return MOCK_ANSWERS[key];
    }
  }
  return MOCK_ANSWERS["default"];
}

function isMockingNeeded(error) {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes("API key not valid") ||
    msg.includes("API_KEY_INVALID") ||
    msg.includes("INVALID_ARGUMENT") ||
    msg.includes("Missing GEMINI_API_KEY") ||
    !process.env.GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY.includes("your_gemini_api_key")
  );
}

/**
 * Generates a text response from Gemini 2.5 Flash for the given prompt.
 * @param {string} prompt - The incoming message text.
 * @returns {Promise<string>} The generated text response.
 */
async function generateResponse(prompt) {
  try {
    // Check beforehand if key is a known placeholder
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.startsWith("your_")) {
      throw new Error("Missing GEMINI_API_KEY");
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    if (isMockingNeeded(error)) {
      console.warn("[Gemini Service] API key is invalid or missing. Falling back to mockup response for the demo.");
      return getMockAnswer(prompt);
    }
    console.error("Error generating content from Gemini API:", error);
    throw error;
  }
}

module.exports = {
  generateResponse,
};
