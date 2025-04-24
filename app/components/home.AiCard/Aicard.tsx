"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { AiCardProps } from "@/app/data/AiData";
import { incrementClick } from "@/app/api/AiCard/route";
import Image from "next/image";

const AiCard: React.FC<AiCardProps> = ({
  logo,
  name,
  category,
  shortDesc,
  url,
  shortLink,
}) => {
  const router = useRouter();
  const getExternalLink = (shortLink?: string) => {
    if (shortLink) {
      return `/aff/${shortLink}`;
    }
    return url || "/404";
  };

  const handleCardClick = () => {
    if (shortLink) {
      router.push(`/page/Deskripsi/${shortLink}`);
    } else {
      router.push("/404");
    }
  };

  const handleLinkClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
    if (shortLink) {
      try {
        await incrementClick(shortLink);
      } catch (error) {
        console.error("Error tracking click (link):", error);
      }
    }
  };

  const externalLink = getExternalLink(shortLink);

  return (
    <div
      onClick={handleCardClick}
      className="cursor-pointer bg-white rounded-lg p-3 md:p-4 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="flex flex-col items-center sm:items-start sm:flex-row gap-3 md:gap-4">
        <div className="w-12 h-12 flex-shrink-0">
          <Image
            src={logo}
            alt={name}
            className="w-full h-full rounded-lg object-cover"
            width={100}
            height={100}
          />
        </div>
        <div className="flex-1 w-full text-center sm:text-left">
          <div className="sm:flex sm:items-start sm:justify-between">
            <div>
              <h3 className="font-medium text-gray-900 hover:text-blue-600 hover:underline">
                {name}
              </h3>
              <div className="mt-1 text-sm text-gray-600">
                <span className="flex items-center justify-center sm:justify-start gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  {category}
                </span>
              </div>
            </div>
            {/* Desktop button */}
            <a
              href={externalLink}
              onClick={handleLinkClick}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center justify-center gap-1 bg-gradient-to-r from-blue-500 to-blue-700 text-white text-sm px-4 py-2 rounded-full hover:from-blue-600 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-sm mt-0 self-center"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <span>Visit</span>
              <svg 
                className="w-3.5 h-3.5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </a>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            {shortDesc}
          </p>
          {/* Mobile button */}
          <div className="mt-3 flex justify-center sm:hidden">
            <a
              href={externalLink}
              onClick={handleLinkClick}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-gradient-to-r from-blue-500 to-blue-700 text-white text-sm px-5 py-2 rounded-full hover:from-blue-600 hover:to-blue-800 transition-all duration-300 transform hover:scale-102 shadow-sm w-full text-center flex items-center justify-center gap-2"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <span>Visit Website</span>
              <svg 
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiCard;