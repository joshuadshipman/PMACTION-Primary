import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyPlaceholder');

/**
 * The Red Team Validator
 * Intercepts AI-generated content and critically audits it for legal, clinical, and safety compliance.
 * @param {string} generatedContent - The raw output from the primary generator agent.
 * @param {string} context - The context or prompt that created the content.
 * @returns {Promise<{passed: boolean, critique: string}>}
 */
export async function validateContent(generatedContent, context) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-preview-0409" });

        const prompt = `
        You are the 'Red Team' Verifier, a hostile medical auditor and legal compliance officer.
        Your job is to poke holes and find fatal flaws in the following AI-generated content before it goes live.
        
        CRITICAL FAILURE CONDITIONS:
        1. Unauthorized Practice of Law (UPL): Does the content give specific legal advice instead of citing public law?
        2. Medical Advice: Does the content prescribe medical treatment instead of general wellness routines?
        3. Formatting: Is the JSON or Markdown formatting broken?
        
        CONTEXT OF GENERATION:
        ${context}
        
        GENERATED CONTENT TO AUDIT:
        ${generatedContent}
        
        INSTRUCTIONS:
        If the content violates any rules or is dangerous, return a JSON object with "passed": false and a strict "critique" detailing exactly what failed.
        If the content is 100% safe, educational, and correctly formatted, return "passed": true and an empty critique.
        
        RESPOND ONLY IN VALID JSON: { "passed": boolean, "critique": string }
        `;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const responseText = result.response.text();
        const jsonResponse = JSON.parse(responseText);

        return {
            passed: jsonResponse.passed,
            critique: jsonResponse.critique || ''
        };

    } catch (error) {
        console.error("Red Team Validation Failed:", error);
        // Fail-safe: If the validator crashes, block the content from publishing.
        return {
            passed: false,
            critique: "Validation engine crashed. Content blocked for safety."
        };
    }
}
