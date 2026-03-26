import Head from 'next/head';

/**
 * PMAction SEO/AEO Header Component
 * Implements structured data for Answer Engine Optimization (AEO).
 */
export const SEOHead = ({ title, description, keywords, articleData }) => {
    const siteTitle = title ? `${title} | PMAction` : "PMAction - Positive Mental Action & Neurodiversity Platform";
    const siteDescription = description || "The first neuro-inclusive wellness platform tracking mood, habits, and growth for ADHD & Autistic minds.";

    const schemaData = articleData ? {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": articleData.title,
        "description": articleData.excerpt || siteDescription,
        "author": {
            "@type": "Organization",
            "name": "PMAction"
        },
        "publisher": {
            "@type": "Organization",
            "name": "PMAction",
            "logo": {
                "@type": "ImageObject",
                "url": "https://pmaction.io/logo.png"
            }
        },
        "datePublished": articleData.published_at || new Date().toISOString(),
        "keywords": keywords?.join(', ') || "ADHD, Autism, Neurodiversity, Positive Mental Action"
    } : {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "PMAction",
        "applicationCategory": "HealthApplication",
        "description": siteDescription,
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        }
    };

    return (
        <Head>
            <title>{siteTitle}</title>
            <meta name="description" content={siteDescription} />
            <meta name="keywords" content={keywords?.join(', ') || "ADHD, Autism, Neurodiversity, Mental Wellness, Habit Tracking"} />
            
            {/* OpenGraph for MEO social visibility */}
            <meta property="og:title" content={siteTitle} />
            <meta property="og:description" content={siteDescription} />
            <meta property="og:type" content={articleData ? "article" : "website"} />
            <meta property="og:site_name" content="PMAction" />
            
            {/* Answer Engine Optimization (AEO) JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
            />
        </Head>
    );
};

export default SEOHead;
