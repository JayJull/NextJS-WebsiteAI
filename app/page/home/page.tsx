"use client";

import { Layout } from "@/app/components/layout";
import React, { useEffect, useState, useRef, useCallback } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import AiCardComponents from "@/app/components/home.AiCard/Aicard";
import { getAi, getKategori } from "@/app/api/AiCard/route";
import { AiProps } from "@/app/types/aiCardProps";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { blockContent } from "@/app/data/blokContent";
import { news } from "@/app/data/news";
import Link from "next/link";
import { logos } from "@/app/data/logo";

const item_per_load = 5;
const search_delay_perMS = 200;
interface Category {
  id: number;
  nama: string;
  name?: string;
}

const AiCard: React.FC = () => {
  const Router = useRouter();
  const searchParams = useSearchParams();
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isCategory, setIsCategory] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<string>("All Categories");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [aiTools, setAiTools] = useState<AiProps[]>([]);
  const [filteredTools, setFilteredTools] = useState<AiProps[]>([]);
  const [visibleTools, setVisibleTools] = useState<AiProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [liveSearchActive, setLiveSearchActive] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(item_per_load);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const categoryKeywordMap: { [key: string]: string[] } = {
    ai_photos: [
      "photo",
      "photos",
      "image",
      "images",
      "gambar",
      "foto",
      "picture",
      "visual",
    ],
    ai_video: ["video", "videos", "film", "movie", "cinema", "animation"],
    ai_audio: [
      "audio",
      "sound",
      "music",
      "voice",
      "speech",
      "suara",
      "musik",
      "lagu",
    ],
    ai_text: [
      "text",
      "writing",
      "content",
      "tulisan",
      "tulis",
      "article",
      "blog",
    ],
    ai_chat: [
      "chat",
      "conversation",
      "message",
      "percakapan",
      "assistant",
      "chatbot",
    ],
    ai_code: ["code", "coding", "programming", "developer", "kode", "program"],
    ai_edit: ["edit", "editing", "editor", "modification", "enhance"],
    ai_translate: [
      "translate",
      "translation",
      "language",
      "bahasa",
      "terjemahan",
    ],
    ai_data: [
      "data",
      "analytics",
      "analysis",
      "statistics",
      "visualization",
      "chart",
    ],
    ai_design: [
      "design",
      "designer",
      "graphic",
      "desain",
      "grafis",
      "ui",
      "ux",
    ],
  };

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData: Category[] = await getKategori();
        setIsCategory([{ id: 0, nama: "All Categories" }, ...categoriesData]);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Failed to load categories");
      }
    };

    fetchCategories();
  }, []);

  const getCategoryForKeyword = (keyword: string): string | null => {
    const keywordLower = keyword.toLowerCase().trim();

    for (const [category, keywordList] of Object.entries(categoryKeywordMap)) {
      if (keywordList.some((k) => k === keywordLower)) {
        return category;
      }
    }

    return null;
  };

  const scoreSearchResult = (
    tool: AiProps,
    searchKeywords: string[]
  ): number => {
    if (!searchKeywords.length) return 0;

    let score = 0;
    const toolName = tool.name.toLowerCase();
    const toolCategory = tool.kategori.nama.toLowerCase();
    const toolDesc = (tool.shortDesc || "").toLowerCase();
    const allKeywordsPresent = searchKeywords.every((keyword) => {
      const keywordLower = keyword.toLowerCase();
      return (
        toolName.includes(keywordLower) ||
        toolCategory.includes(keywordLower) ||
        toolDesc.includes(keywordLower)
      );
    });

    if (allKeywordsPresent) {
      score += 100;
    }

    for (const keyword of searchKeywords) {
      const keywordLower = keyword.toLowerCase();
      if (toolName === keywordLower) {
        score += 80;
      } else if (toolName.includes(keywordLower)) {
        score += 40;
      }

      if (toolCategory === keywordLower) {
        score += 60;
      } else if (toolCategory.includes(keywordLower)) {
        score += 30;
      }

      if (toolDesc.includes(keywordLower)) {
        score += 20;
      }

      const keywordCategory = getCategoryForKeyword(keywordLower);
      if (keywordCategory) {
        let toolCategoryStandard = null;

        for (const [category, keywordList] of Object.entries(
          categoryKeywordMap
        )) {
          if (keywordList.some((k) => toolCategory.includes(k))) {
            toolCategoryStandard = category;
            break;
          }
        }
        if (
          toolCategoryStandard === keywordCategory ||
          toolCategory.includes(keywordCategory.replace("ai_", "")) ||
          toolName.includes(keywordCategory.replace("ai_", "")) ||
          toolDesc.includes(keywordCategory.replace("ai_", ""))
        ) {
          score += 50;
        }
      }
    }

    for (const keyword of searchKeywords) {
      const keywordCategory = getCategoryForKeyword(keyword.toLowerCase());

      if (keywordCategory) {
        const categoryType = keywordCategory.replace("ai_", "");

        if (toolCategory.includes(categoryType)) {
          score += 70;
        }
      }
    }

    const fullSearchQuery = searchKeywords.join(" ").toLowerCase();
    if (toolName.includes(fullSearchQuery)) {
      score += 60;
    }
    if (toolDesc.includes(fullSearchQuery)) {
      score += 30;
    }

    return score;
  };

  const extractKeywords = (query: string): string[] => {
    const query_lower = query.toLowerCase().trim();
    const stopWords = [
      "saya",
      "ingin",
      "mencari",
      "yang",
      "untuk",
      "dengan",
      "dan",
      "atau",
      "di",
      "ke",
      "dari",
      "cari",
      "tolong",
      "bantuan",
      "bagaimana",
      "carikan",
      "mau",
      "seperti",
      "mirip",
      "bagus",
      "terbaik",
      "gratis",
      "free",
      "premium",
      "berbayar",
      "a",
      "the",
      "an",
      "of",
      "in",
      "on",
      "at",
      "by",
      "to",
      "for",
      "about",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "being",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "akan",
      "sedang",
      "telah",
      "sudah",
      "belum",
      "not",
      "no",
      "yes",
      "dapat",
      "bisa",
      "mampu",
      "ini",
      "itu",
    ];

    const categoryTerms = Object.values(categoryKeywordMap).flat();
    const additionalTerms = [
      "ai",
      "gpt",
      "chatgpt",
      "gpt-4",
      "claude",
      "bard",
      "gemini",
      "dall-e",
      "midjourney",
      "stable diffusion",
      "copilot",
      "assistant",
      "llm",
      "bing",
      "google",
      "openai",
      "huggingface",
      "generator",
      "machine learning",
      "ml",
      "nlp",
      "youtube",
      "education",
      "belajar",
      "learning",
      "pendidikan",
      "production",
      "produksi",
      "enhancement",
      "restoration",
      "compress",
    ];

    const importantTerms = [...new Set([...categoryTerms, ...additionalTerms])];
    const originalTerms = query_lower.split(/\s+/);
    let processedQuery = query_lower;
    const multiWordTerms: string[] = [];

    for (const term of importantTerms) {
      if (term.includes(" ") && processedQuery.includes(term)) {
        multiWordTerms.push(term);
        processedQuery = processedQuery.replace(term, "");
      }
    }

    const singleWords = processedQuery.split(/\s+/).filter((word) => {
      if (importantTerms.includes(word)) return true;
      return !stopWords.includes(word) && word.length >= 3;
    });

    const allKeywords = [...multiWordTerms, ...singleWords];
    for (const term of categoryTerms) {
      if (originalTerms.includes(term) && !allKeywords.includes(term)) {
        allKeywords.push(term);
      }
    }

    const keywordMappings: Record<string, string> = {};
    Object.entries(categoryKeywordMap).forEach(([category, keywords]) => {
      if (keywords.length > 0) {
        const primaryTerm = keywords[0];
        keywords.slice(1).forEach((altTerm) => {
          keywordMappings[altTerm] = primaryTerm;
        });
      }
    });

    const normalizedKeywords = [...allKeywords];

    for (const keyword of allKeywords) {
      if (
        keywordMappings[keyword] &&
        !normalizedKeywords.includes(keywordMappings[keyword])
      ) {
        normalizedKeywords.push(keywordMappings[keyword]);
      }
    }

    return [...new Set(normalizedKeywords)];
  };

  useEffect(() => {
    setVisibleCount(item_per_load);
    setVisibleTools(filteredTools.slice(0, item_per_load));
    setHasMore(filteredTools.length > item_per_load);
  }, [filteredTools]);

  // Load more function
  const loadMore = () => {
    setLoadingMore(true);

    // Simulate network delay (remove in production)
    setTimeout(() => {
      const newVisibleCount = visibleCount + item_per_load;
      setVisibleCount(newVisibleCount);
      setVisibleTools(filteredTools.slice(0, newVisibleCount));
      setHasMore(newVisibleCount < filteredTools.length);
      setLoadingMore(false);
    }, 500);
  };

  // Fetch AI tools and apply filters
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAi();
        setAiTools(data);

        // Get search parameters from URL
        const urlQuery = searchParams.get("query") || "";
        const urlCategory = searchParams.get("category") || "All Categories";
        const urlKeywords = searchParams.get("keywords") || "";

        // Parse keywords from comma-separated string
        const keywordArray = urlKeywords ? urlKeywords.split(",") : [];
        setKeywords(keywordArray);

        // Update state with URL parameters
        setSearchQuery(urlQuery);
        setSelectedCategory(urlCategory);

        let filtered = [...data];

        // Apply category filter if selected
        if (urlCategory !== "All Categories") {
          filtered = filtered.filter(
            (tool) => tool.kategori.nama === urlCategory
          );
        }

        // Apply keyword filters and score results
        if (keywordArray.length > 0) {
          // Flag to check if any category-specific keywords are present
          let hasCategoryKeywords = false;

          // Check if any keywords map to specific categories
          for (const keyword of keywordArray) {
            const keywordCategory = getCategoryForKeyword(keyword);
            if (keywordCategory) {
              hasCategoryKeywords = true;
              break;
            }
          }

          // First compute a relevance score for each tool
          const scoredResults = filtered.map((tool) => ({
            tool,
            score: scoreSearchResult(tool, keywordArray),
          }));

          // Filter out irrelevant results (score of 0)
          let relevantResults = scoredResults.filter((item) => item.score > 0);

          // If no results but we have category keywords, try a broader approach
          if (relevantResults.length === 0 && hasCategoryKeywords) {
            console.log(
              "No results with strict matching, trying category-based matching"
            );

            // Extract categories from keywords
            const targetCategories = new Set<string>();

            for (const keyword of keywordArray) {
              const category = getCategoryForKeyword(keyword);
              if (category) {
                targetCategories.add(category);
              }
            }

            if (targetCategories.size > 0) {
              // For each tool, check if it matches any of the target categories
              relevantResults = data
                .map((tool) => {
                  let matchScore = 0;
                  const toolCategoryLower = tool.kategori.nama.toLowerCase();

                  for (const category of targetCategories) {
                    const categoryType = category.replace("ai_", "");
                    if (toolCategoryLower.includes(categoryType)) {
                      matchScore += 50;
                    }

                    // Check if tool name or description contains category keywords
                    for (const keyword of categoryKeywordMap[category] || []) {
                      if (
                        tool.name.toLowerCase().includes(keyword) ||
                        (tool.shortDesc &&
                          tool.shortDesc.toLowerCase().includes(keyword))
                      ) {
                        matchScore += 30;
                        break;
                      }
                    }
                  }

                  return {
                    tool,
                    score: matchScore,
                  };
                })
                .filter((item) => item.score > 0);
            }
          }

          // Sort by score (descending)
          relevantResults.sort((a, b) => b.score - a.score);

          // For debugging: log the top 5 results with their scores
          console.log(
            "Top 5 search results with scores:",
            relevantResults.slice(0, 5).map((item) => ({
              name: item.tool.name,
              category: item.tool.kategori.nama,
              score: item.score,
            }))
          );

          // Extract just the tools from the scored results
          filtered = relevantResults.map((item) => item.tool);
        }

        setFilteredTools(filtered);
      } catch (error) {
        console.error("Error fetching AI tools:", error);
        setError("Failed to load AI tools");
      } finally {
        setLoading(false);
        setSearchLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  // Live search implementation
  const performLiveSearch = useCallback(
    (query: string, category: string) => {
      if (!aiTools.length) return; // Skip if no tools data yet

      setLiveSearchActive(true);
      setSearchLoading(true);

      // Extract keywords from the query
      const keywordArray = extractKeywords(query);

      // Start with all tools or filtered by category
      let filtered = [...aiTools];

      // Apply category filter if selected
      if (category !== "All Categories") {
        filtered = filtered.filter((tool) => tool.kategori.nama === category);
      }

      // Apply keyword filters if query is not empty
      if (query.trim() !== "" && keywordArray.length > 0) {
        // Score the results
        const scoredResults = filtered.map((tool) => ({
          tool,
          score: scoreSearchResult(tool, keywordArray),
        }));

        // Filter out irrelevant results and sort by score
        const relevantResults = scoredResults
          .filter((item) => item.score > 0)
          .sort((a, b) => b.score - a.score);

        // Extract just the tools from the scored results
        filtered = relevantResults.map((item) => item.tool);
      }

      setFilteredTools(filtered);
      setSearchLoading(false);
    },
    [aiTools]
  );

  // Handle search input changes with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set a new timeout for the live search
    searchTimeoutRef.current = setTimeout(() => {
      performLiveSearch(query, selectedCategory);
    }, search_delay_perMS);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Handler for category selection
  const handleCategorySelect = (category: string): void => {
    setSelectedCategory(category);
    setIsDropdownOpen(false);

    // Perform live search with new category
    if (searchQuery.trim() !== "" || category !== "All Categories") {
      performLiveSearch(searchQuery, category);
    }
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    setSearchLoading(true);
    setLiveSearchActive(false);

    const keywordArray = extractKeywords(searchQuery);
    const params = new URLSearchParams();
    params.set("query", searchQuery);

    if (keywordArray.length > 0) {
      params.set("keywords", keywordArray.join(","));
      params.set("q", keywordArray.join(" "));
    }

    if (selectedCategory !== "All Categories") {
      params.set("category", selectedCategory);
    }

    Router.push(`/pages/ListAi?${params.toString()}`);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setLiveSearchActive(false);

    if (liveSearchActive) {
      performLiveSearch("", selectedCategory);
    }
  };

  return (
    <Layout>
      <div className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 pt-16 sm:pt-20 md:pt-40">
          <div className="max-w-4xl mx-auto text-center py-16 sm:py-24 md:py-32">
            <h3
              className="text-white font-sans text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 md:mb-8"
              data-aos="fade-up"
              data-aos-delay="300"
              data-aos-once="true"
            >
              Find The Best AI Tools
            </h3>
            <p
              className="text-xs sm:text-sm md:text-base mb-4 sm:mb-6 md:mb-10 text-white/90"
              data-aos="fade-up"
              data-aos-delay="500"
              data-aos-once="true"
            >
              Search from 25,700+ AI tools in our database
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Section - Improved spacing for different device sizes */}
      <section
        className="py-8 sm:py-16 md:py-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 -mt-10 sm:-mt-16 md:-mt-24 relative z-20"
        ref={resultsRef}
      >
        {/* Search Form - More compact on mobile, expands on larger screens */}
        <div
          className="max-w-xl mx-auto"
          data-aos="fade-up"
          data-aos-delay="700"
          data-aos-once="true"
        >
          <form
            className="bg-white/20 backdrop-blur-lg rounded-2xl shadow-2xl p-3 sm:p-4 transition-all duration-300 hover:bg-white/30 border border-white/30"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Dropdown Button - Full width on mobile, auto width on tablet/desktop */}
              <div className="relative w-full sm:w-auto order-2 sm:order-1">
                <button
                  id="dropdown-button"
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full sm:w-auto transition-all duration-300 inline-flex items-center justify-between py-2.5 sm:py-3 px-3 sm:px-4 text-sm font-medium text-gray-900 bg-gray-50/90 backdrop-blur-sm hover:bg-gray-100 border border-gray-200 rounded-xl hover:shadow-md"
                  disabled={searchLoading}
                >
                  <span className="truncate max-w-[150px]">
                    {selectedCategory}
                  </span>
                  {isDropdownOpen ? (
                    <ChevronUpIcon
                      className="w-4 h-4 ms-2"
                      aria-hidden="true"
                    />
                  ) : (
                    <ChevronDownIcon
                      className="w-4 h-4 ms-2"
                      aria-hidden="true"
                    />
                  )}
                </button>

                {/* Dropdown - Mobile-friendly positioning */}
                <div
                  id="dropdown"
                  className={`z-20 ${
                    isDropdownOpen ? "block" : "hidden"
                  } bg-white/95 backdrop-blur-md divide-y divide-gray-100 rounded-xl shadow-lg border border-gray-100 w-full sm:w-48 absolute mt-1 transition-all overflow-hidden`}
                >
                  <ul
                    className="py-1 text-sm text-gray-700 max-h-48 sm:max-h-60 overflow-y-auto"
                    aria-labelledby="dropdown-button"
                  >
                    {isCategory.map((category) => (
                      <li key={category.id}>
                        <button
                          type="button"
                          onClick={() => handleCategorySelect(category.nama)}
                          className="inline-flex w-full px-4 py-2.5 hover:bg-blue-50 transition-colors duration-200"
                        >
                          {category.nama}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Search Input - Full width on all devices */}
              <div className="relative flex-1 order-1 sm:order-2">
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 20"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                      />
                    </svg>
                  </div>
                  <input
                    type="search"
                    id="search-dropdown"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="block p-2.5 sm:p-3 ps-10 w-full text-sm text-gray-900 bg-gray-50/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-400 hover:shadow-md"
                    placeholder="Search AI tools, platforms, services..."
                    required
                    disabled={searchLoading}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
                      aria-label="Clear search"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        ></path>
                      </svg>
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm font-medium text-white bg-blue-600 rounded-lg p-2 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 transition-all duration-300 shadow-md hover:shadow-lg"
                  disabled={searchLoading}
                >
                  {searchLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <svg
                      className="w-4 h-4"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 20"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                      />
                    </svg>
                  )}
                  <span className="sr-only">
                    {searchLoading ? "Searching..." : "Search"}
                  </span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Results Section */}
        <div className="mt-6 sm:mt-8">
          {/* Results Header - Stack on mobile, row on desktop */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4 sm:mb-6">
            <p className="text-black text-sm sm:text-base">
              Showing {visibleTools.length} of {filteredTools.length} results
              {filteredTools.length > 0 &&
              visibleTools.length < filteredTools.length
                ? ` (${
                    filteredTools.length - visibleTools.length
                  } more available)`
                : ""}
            </p>
            {liveSearchActive && (
              <p className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Live search results
              </p>
            )}
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-10 flex items-center justify-center">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-blue-600 mr-2" />
              <span>Loading...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 sm:py-10 text-red-600 bg-red-50 rounded-xl p-4">
              <p className="font-medium">{error}</p>
              <p className="mt-2 text-sm text-red-500">
                Please try again later or contact support if the problem
                persists.
              </p>
            </div>
          ) : visibleTools.length === 0 ? (
            <div className="text-center py-8 sm:py-10 bg-gray-50 rounded-xl p-4">
              <p className="font-medium">
                No AI tools found matching your criteria.
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Try using different keywords or removing filters.
              </p>
              <button
                onClick={handleClearSearch}
                className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Search
              </button>
            </div>
          ) : (
            // Results Grid - Single column on all devices for list view
            <div className="grid gap-4 grid-cols-1">
              {visibleTools.map((tool) => (
                <div
                  key={tool.id}
                  className="border border-gray-200 hover:border-blue-300 transition-colors duration-300 rounded-xl overflow-hidden shadow-sm hover:shadow-md bg-white"
                  data-aos="fade-up"
                  data-aos-once="true"
                >
                  <AiCardComponents
                    logo={tool.gambar}
                    name={tool.name}
                    category={tool.kategori.nama}
                    shortDesc={tool.shortDesc}
                    url={tool.url}
                    shortLink={tool.shortLink || ""}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Load More Button - Responsive sizing */}
          {hasMore && !loading && visibleTools.length > 0 && (
            <div className="flex justify-center mt-6 sm:mt-8">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </button>
            </div>
          )}

          {/* Shown All Message - Responsive text size */}
          {!hasMore &&
            visibleTools.length > 0 &&
            visibleTools.length === filteredTools.length && (
              <div className="text-center mt-6 sm:mt-8 text-sm sm:text-base text-gray-600">
                All results have been loaded
              </div>
            )}
        </div>
      </section>

      <section aria-label="Content 2" className="mt-16 md:mt-36 py-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="font-sans font-bold tracking-wide text-xl sm:text-2xl">
              How It Works?
            </h2>
            <p className="font-sans font-extralight tracking-wide mt-2 text-sm sm:text-base">
              Ai for anyone, anywhere
            </p>
          </div>

          <div className="flex justify-center mt-4 md:mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full max-w-5xl">
              {blockContent.map((item) => (
                <div
                  className="process-block p-4 flex flex-col items-center bg-white/50 backdrop-blur-sm rounded-xl hover:shadow-md transition-all duration-300"
                  key={item.id}
                  data-aos="fade-up"
                  data-aos-delay={200 + item.id * 100}
                  data-aos-once="true"
                >
                  <div className="icon-box flex justify-center items-center w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40">
                    <Image
                      src={item.icon}
                      alt={`Step ${item.id}`}
                      className="object-contain"
                    />
                  </div>
                  <h4 className="text-md sm:text-lg font-semibold text-center mt-4 sm:mt-8">
                    {item.title}
                  </h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        aria-label="Article"
        className="py-12 md:py-16 bg-gray-100 mt-16 md:mt-40"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Recent News Articles
            </h2>
            <p className="mt-2 text-sm md:text-base text-gray-600">
              Fresh job related news content posted each day.
            </p>
          </div>

          {/* Articles Grid */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-8 md:mt-16"
            data-aos="fade-up"
            data-aos-once="true"
          >
            {news.map((article) => (
              <article
                key={article.id}
                className="flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                data-aos="fade-up"
                data-aos-delay={article.id * 100}
                data-aos-once="true"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={article.img}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform hover:scale-105 duration-300"
                    priority
                  />
                </div>

                <div className="p-4 md:p-6 flex-grow flex flex-col">
                  {/* Title */}
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                    <Link
                      href={article.link}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {article.title}
                    </Link>
                  </h3>

                  {/* Description */}
                  <p className="mt-2 text-sm md:text-base text-gray-600 line-clamp-2 flex-grow">
                    {article.blogSingleTitle}
                  </p>

                  <Link
                    aria-label={`Read more about ${article.title}`}
                    href={article.link}
                    className="mt-4 text-sm md:text-base text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center"
                  >
                    Read More
                    <svg
                      className="w-3.5 h-3.5 ms-2"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 14 10"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M1 5h12m0 0L9 1m4 4L9 9"
                      />
                    </svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        aria-label="Carousel"
        className="py-8 md:py-12 bg-white overflow-hidden"
      >
        <div className="container mx-auto px-4 mb-6">
          <p className="text-center text-sm md:text-base text-gray-500 mb-6">
            Trusted by leading companies
          </p>
        </div>
        <div className="w-full overflow-hidden">
          <div className="max-w-7xl mx-auto">
            {/* Using pause on hover for better mobile experience */}
            <div className="flex space-x-4 sm:space-x-6 md:space-x-8 overflow-hidden">
              <div className="flex animate-marquee whitespace-nowrap py-4 logos-container">
                {logos.map((logo) => (
                  <div
                    key={logo.id}
                    className="flex items-center justify-center mx-4 sm:mx-6 md:mx-8 min-w-[100px] sm:min-w-[140px] md:min-w-[180px]"
                  >
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      width={100}
                      height={100}
                      className="h-8 sm:h-10 md:h-12 w-auto object-contain"
                    />
                  </div>
                ))}

                {/* Duplicate set for seamless loop - with enough spacing to prevent overlap */}
                {logos.map((logo) => (
                  <div
                    key={`${logo.id}-duplicate`}
                    className="flex items-center justify-center mx-4 sm:mx-6 md:mx-8 min-w-[100px] sm:min-w-[140px] md:min-w-[180px]"
                  >
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      width={100}
                      height={100}
                      className="h-8 sm:h-10 md:h-12 w-auto object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AiCard;
