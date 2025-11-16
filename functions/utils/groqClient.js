const functions = require("firebase-functions");
const Groq = require("groq-sdk");

let groq;

try {
  const apiKey = functions.config().groq.key;
  if (!apiKey) {
    console.error("Groq API key is not set in function configuration.");
    // The function will fail gracefully if the key is missing.
  }
  groq = new Groq({ apiKey });
} catch (e) {
  console.error("Could not initialize Groq SDK. Make sure to set the groq.key config.", e);
}


const getGroqCompletion = async (text) => {
  if (!groq) {
    throw new Error("Groq SDK not initialized. Check function logs for configuration errors.");
  }
  
  const systemPrompt = `You are an expert note-processing AI. Analyze the user's text and structure it into a clean JSON object.
- 'cleaned': The original text with typos and formatting errors corrected.
- 'summary': A concise, one-paragraph summary.
- 'keypoints': An array of the most important bullet points or takeaways.
- 'definitions': An array of objects, each with a 'term' and its 'definition'.
- 'formulas': An array of objects, each with a 'formula' and its 'result' or explanation. If none, return an empty array.
Your response MUST be a valid JSON object matching this structure precisely. Do not include any text outside the JSON object.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      model: "llama3-8b-8192", // Use a model suitable for JSON output
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const responseContent = chatCompletion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error("Groq API returned an empty response.");
    }

    return JSON.parse(responseContent);
  } catch (error) {
    console.error("Error calling Groq API:", error);
    // Fallback logic could be implemented here if needed.
    throw new Error("Failed to get completion from Groq API.");
  }
};

const getGroqChatCompletion = async (processedNotes, history, question) => {
    if (!groq) {
        throw new Error("Groq SDK not initialized.");
    }

    const context = `
        You are Luna, a helpful AI assistant. Your knowledge is strictly limited to the following notes. Do not use any external information.
        
        **NOTES SUMMARY:**
        ${processedNotes.summary}
        
        **KEY POINTS:**
        ${processedNotes.keypoints.map(p => `- ${p}`).join("\n")}
        
        **DEFINITIONS:**
        ${processedNotes.definitions.map(d => `- ${d.term}: ${d.definition}`).join("\n")}
        
        Answer the user's question based only on these notes. Be friendly and concise.
    `;

    const messages = [
        { role: "system", content: context }
    ];

    // Add previous history
    history.forEach(turn => {
        messages.push({ role: "user", content: turn.question });
        messages.push({ role: "assistant", content: turn.answer });
    });

    // Add the new question
    messages.push({ role: "user", content: question });

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages,
            model: "llama3-8b-8192",
            temperature: 0.5,
        });

        return chatCompletion.choices[0]?.message?.content || "I'm not sure how to answer that based on the notes.";
    } catch (error) {
        console.error("Error calling Groq Chat API:", error);
        throw new Error("Failed to get chat completion from Groq API.");
    }
};


module.exports = { getGroqCompletion, getGroqChatCompletion };
