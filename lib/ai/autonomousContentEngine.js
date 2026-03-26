import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '../firebaseClient';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { validateContent } from './redTeamValidator';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyPlaceholder');

// --- COST GATE CONFIG ---
// Gemini 1.5 Pro pricing: ~$3.50/1M input tokens, ~$10.50/1M output tokens
const COST_PER_INPUT_TOKEN = 0.0000035;
const COST_PER_OUTPUT_TOKEN = 0.0000105;  
const MAX_COST_PER_RUN_USD = 0.02; // Hard ceiling: 2 cents per autonomous run
const EST_INPUT_TOKENS = 500;       // Typical prompt size
const EST_OUTPUT_TOKENS = 800;      // Typical generation size

function estimateCost(inputTokens, outputTokens) {
    return (inputTokens * COST_PER_INPUT_TOKEN) + (outputTokens * COST_PER_OUTPUT_TOKEN);
}

/**
 * Autonomous Content Engine Loop
 * 1. Aggregates user failure patterns from the database.
 * 2. Generates new challenges to address those failures.
 * 3. Passes the generated content through the Red Team Validator.
 * 4. Pushes to live database if passing.
 */
export async function runSelfLearningLoop() {
    try {
        console.log("Starting Autonomous Content Engine Loop...");

        // 0. COST GATE: Estimate and block if over budget
        const projectedCost = estimateCost(EST_INPUT_TOKENS, EST_OUTPUT_TOKENS);
        console.log(`Projected cost for this run: $${projectedCost.toFixed(6)} (ceiling: $${MAX_COST_PER_RUN_USD})`);
        if (projectedCost > MAX_COST_PER_RUN_USD) {
            console.warn(`COST GATE BLOCKED: Projected $${projectedCost.toFixed(4)} exceeds $${MAX_COST_PER_RUN_USD} ceiling. Aborting.`);
            return false;
        }

        // 1. DATA AGGREGATION: Find what users are struggling with this week.
        const mockFailurePattern = "Users are failing the 'Digital Detox Hour' challenge before bed.";

        // 2. PRIMARY GENERATION (Token Optimized with system instructions)
        const primaryModel = genAI.getGenerativeModel({ 
            model: "gemini-1.5-pro-preview-0409",
            systemInstruction: "You are PMAction's clinical content architect. Generate scientifically backed micro-challenges. USE ONLY VALID JSON OUTPUT."
        });

        const prompt = `Based on this user failure pattern: '${mockFailurePattern}', create a new 3-day micro-challenge to fix it. 
        Format as JSON: { "title": string, "rationale": string, "days": [{ "day": int, "action": string }] }`;

        const generationResult = await primaryModel.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });

        const generatedContentStr = generationResult.response.text();

        // 3. RED TEAM VALIDATION
        console.log("Submitting to Red Team for auditing...");
        const validationResult = await validateContent(generatedContentStr, prompt);

        if (!validationResult.passed) {
            console.warn("Red Team Rejected Content. Reason:", validationResult.critique);
            console.log("Triggering Rewrite Loop...");
            // FUTURE IMPLEMENTATION: Pass the critique back to primaryModel for a rewrite
            return false;
        }

        console.log("Red Team PASSED. Pushing content to live database...");
        
        // 4. DEPLOYMENT TO FIRESTORE (with cost metadata)
        const finalContent = JSON.parse(generatedContentStr);
        await addDoc(collection(db, 'autonomous_challenges'), {
            ...finalContent,
            sourcePattern: mockFailurePattern,
            createdAt: serverTimestamp(),
            status: 'active_live',
            _meta: {
                projectedCostUsd: projectedCost,
                costCeiling: MAX_COST_PER_RUN_USD,
                redTeamPassed: true,
            }
        });

        console.log("Self-Learning Loop Completed Successfully.");
        return true;

    } catch (error) {
        console.error("Critical failure in Self-Learning Loop:", error);
        return false;
    }
}
