import { generateFullAssessment, generateFullChallenge, generateBlogPost } from '../services/geminiService.js';
import { firestoreAdmin } from '../firebaseAdmin.js';

/**
 * PMAction AI Content Generator
 * Handles the generation and persistence of platform content.
 */
export const contentGenerator = {
    /**
     * Generates and saves a new assessment.
     */
    async createAssessment(topic, persona = null) {
        console.log(`🧪 Generating Assessment for: ${topic} (Persona: ${persona?.id || 'Default'})`);
        const data = await generateFullAssessment(topic, persona);
        if (!data) throw new Error("Failed to generate assessment data");

        const { assessment, questions } = data;
        const personaId = persona?.id || 'universal';
        const docId = persona ? `${assessment.slug}-${personaId}` : assessment.slug;

        // 1. Insert Assessment
        console.log(`📡 Saving to Firebase: ${assessment.name} (${personaId})...`);
        const assessmentRef = firestoreAdmin.collection('assessments').doc(docId);
        await assessmentRef.set({
            ...assessment,
            personaId,
            updatedAt: new Date().toISOString()
        });

        // 2. Insert Questions to Subcollection
        const questionsBatch = firestoreAdmin.batch();
        questions.forEach((q, idx) => {
            const qRef = assessmentRef.collection('questions').doc(`q${idx + 1}`);
            questionsBatch.set(qRef, {
                ...q,
                question_number: idx + 1
            });
        });
        await questionsBatch.commit();

        return { id: docId, ...assessment, personaId };
    },

    /**
     * Generates and saves a new challenge.
     */
    async createChallenge(topic, duration = 7, persona = null) {
        console.log(`🏆 Generating ${duration}-day Challenge for: ${topic} (Persona: ${persona?.id || 'Default'})`);
        const data = await generateFullChallenge(topic, duration, persona);
        if (!data) throw new Error("Failed to generate challenge data");

        const { challenge, tasks } = data;
        const personaId = persona?.id || 'universal';
        const docId = persona ? `${challenge.slug}-${personaId}` : challenge.slug;

        // 1. Insert Challenge
        console.log(`📡 Saving Challenge to Firebase: ${challenge.title} (${personaId})...`);
        const challengeRef = firestoreAdmin.collection('challenges').doc(docId);
        await challengeRef.set({
            ...challenge,
            personaId,
            updatedAt: new Date().toISOString()
        });

        // 2. Insert Tasks to Subcollection
        const tasksBatch = firestoreAdmin.batch();
        tasks.forEach((t, idx) => {
            const tRef = challengeRef.collection('tasks').doc(`day-${t.day_number || idx + 1}`);
            tasksBatch.set(tRef, t);
        });
        await tasksBatch.commit();

        return { id: docId, ...challenge, personaId };
    },

    /**
     * Generates and saves a new blog post.
     */
    async createBlogPost(topic, persona = null) {
        console.log(`📝 Generating Blog Post for: ${topic} (Persona: ${persona?.id || 'Default'})`);
        const content = await generateBlogPost(topic, persona);
        const personaId = persona?.id || 'universal';
        
        const slug = topic.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '') + '-' + personaId + '-' + Date.now();
        
        const blogRef = firestoreAdmin.collection('blog').doc(slug);
        await blogRef.set({
            title: topic,
            slug,
            content,
            personaId,
            category: 'AI Insights',
            publishedAt: new Date().toISOString(),
            status: 'published'
        });

        return { id: slug, title: topic, slug, personaId };
    }
};
