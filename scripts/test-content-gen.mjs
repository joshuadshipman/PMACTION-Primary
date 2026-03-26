import { contentGenerator } from '../lib/ai/contentGenerator.js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
    console.log("🚀 Starting AI Content Generator Test (ESM)...");
    
    try {
        // Test 1: Assessment
        console.log("\n1. Testing Assessment Generation...");
        const assessment = await contentGenerator.createAssessment("Digital Wellbeing for Developers");
        console.log("✅ Assessment Created:", assessment.name, assessment.slug);

        // Test 2: Challenge
        console.log("\n2. Testing 3-Day Challenge Generation...");
        const challenge = await contentGenerator.createChallenge("Reducing Screen Fatigue", 3);
        console.log("✅ Challenge Created:", challenge.title, challenge.slug);

        // Test 3: Blog Post
        console.log("\n3. Testing Blog Post Generation...");
        const post = await contentGenerator.createBlogPost("The Science of Flow States");
        console.log("✅ Blog Post Created:", post.title, post.slug);

        console.log("\n✨ All tests passed successfully!");
    } catch (error) {
        console.error("\n❌ Test Failed:", error);
    }
}

test();
