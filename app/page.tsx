"use client"
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "@/app/components/home.navbar/layout";

const Homepage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const router = useRouter();

  const extractKeywords = (query: string): string[] => {
    const stopWords = [
      "saya", "ingin", "mencari", "yang", "untuk", "dengan", "dan", 
      "atau", "di", "ke", "dari", "cari", "tolong", "bantuan", "bagaimana",
      "carikan", "mau", "seperti", "mirip", "bagus", "terbaik", "gratis", "free",
      "premium", "berbayar", "a", "the", "an", "of", "in", "on", "at", "by",
      "to", "for", "about", "is", "are", "was", "were", "be", "been", "being",
      "have", "has", "had", "do", "does", "did", "akan", "sedang", "telah",
      "sudah", "belum", "not", "no", "yes", "dapat", "bisa", "mampu", "ini", "itu"
    ];

    const importantTerms = [
      "ai", "gpt", "chatgpt", "gpt-4", "claude", "bard", "gemini", "dall-e", 
      "midjourney", "stable diffusion", "copilot", "assistant", "llm",
      "bing", "google", "openai", "huggingface", "video", "audio", "image",
      "gambar", "foto", "editing", "generator", "text", "tulisan", "code",
      "kode", "programming", "coding", "machine learning", "ml", "nlp",
      "suara", "musik", "lagu", "youtube", "conversation", "chat", "percakapan",
      "education", "belajar", "learning", "pendidikan", "writing", "tulis"
    ];

    const query_lower = query.toLowerCase().trim();
    const words = query_lower.split(/\s+/);
    const processedWords = [...words];
    for (const term of importantTerms) {
      if (term.includes(" ") && query_lower.includes(term)) {
        processedWords.push(term);
      }
    }

    const keywords = processedWords.filter(word => {
      if (importantTerms.includes(word)) return true;
      return !stopWords.includes(word) && word.length >= 3;
    });

    return [...new Set(keywords)];
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    
    // Extract keywords Google-style
    const keywords = extractKeywords(searchQuery);
    const params = new URLSearchParams();
    
    // Store original query for context
    params.set("query", searchQuery);
    
    // Store extracted keywords for search
    if (keywords.length > 0) {
      params.set("keywords", keywords.join(","));
    }
    
    // Store search terms for matching
    if (keywords.length > 0) {
      params.set("q", keywords.join(" "));
    }
    
    console.log("Search parameters:", {
      fullQuery: searchQuery,
      keywords,
      url: `/home/?${params.toString()}`
    });
    
    router.push(`/home/?${params.toString()}`);
    setIsSearching(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const exampleQueries = [
    "AI untuk edit video",
    "AI mirip ChatGPT",
    "AI untuk membuat gambar",
    "AI coding assistant",
    "AI untuk edit musik"
  ];

  return (
    <Layout>
      <div
      className="absolute top-0 left-0 right-0 w-full h-full z-0 flex items-center justify-center"
      style={{
        backgroundImage: "url('/background/2 copy.png')",
        backgroundSize: 'cover',
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >
      <div className="flex flex-col items-center justify-center w-full px-4">
        <div className="mb-8">
          <h1 className="text-white text-5xl font-sans font-bold text-center">
            Ai Free
          </h1>
          <p className="text-white font-sans text-center">
            Temukan Ai yang kamu cari!
          </p>
        </div>
        
        <div className="w-full max-w-2xl relative mb-6">
          <form onSubmit={handleSubmit} role="search">
            <div className="flex items-center bg-gray-700 rounded-full p-3 px-5 w-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="search"
                name="q"
                className="bg-transparent flex-grow outline-none border-none text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Coba: 'saya ingin mencari ai video yang gratis'..."
                autoComplete="off"
                autoFocus
              />
              <button 
                type="submit" 
                className="flex items-center ml-2 p-2 hover:bg-gray-600 rounded-full transition-colors"
                aria-label="Cari"
                disabled={isSearching}
              >
                {isSearching ? (
                  <svg className="animate-spin h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-400 hover:text-blue-300 transition-colors"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            </div>
          </form>
        </div>
        
        {/* Example searches */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {exampleQueries.map((query, index) => (
            <button
              key={index}
              onClick={() => {
                setSearchQuery(query);
                setTimeout(() => handleSearch(), 100);
              }}
              className="bg-gray-700 hover:bg-gray-600 text-white rounded-full px-4 py-2 text-sm transition-colors"
            >
              {query}
            </button>
          ))}
        </div>
      </div>
    </div>
    </Layout>
  )
}
export default Homepage;