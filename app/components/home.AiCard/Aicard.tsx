import React from "react";
import { AiCardProps } from "@/app/types/aiCardProps";
import { incrementClick } from "@/app/api/AiCard/route";
import Link from "next/link";
import Image from "next/image";

const AiCard: React.FC<AiCardProps> = ({
  logo,
  name,
  category,
  shortDesc,
  url,
  shortLink,
}) => {

  const getDisplayLink = (shortLink?: string) => {
    if (shortLink) {
      return `/aff/${shortLink}`;
    }
    return url || "/404";
  };

  const handleClick = async () => {
    if (shortLink) {
      try {
        await incrementClick(shortLink);
      } catch (error) {
        console.error("Error tracking click:", error);
      }
    }
    window.open(getDisplayLink(shortLink), "_blank", "noopener,noreferrer");
  };

  return (
    <Link href={`/pages/Deskripsi/${shortLink}`}>
      <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row items-start gap-3 md:gap-4">
          <div className="w-12 h-12 flex-shrink-0 mx-auto sm:mx-0">
            <Image
              src={logo}
              alt={name}
              className="w-full h-full rounded-lg object-cover"
              width={100}
              height={100}
              />
          </div>
          <div className="flex-1 w-full">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h3 className="font-medium text-gray-900 hover:text-blue-600 hover:underline text-center sm:text-left">
                {name}
              </h3>
            </div>
            <div className="mt-1 text-sm text-gray-600 text-center sm:text-left">
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
            <p className="mt-2 text-sm text-gray-600 text-center sm:text-left">
              {shortDesc}
            </p>
            <div className="mt-3 flex justify-center sm:hidden">
              <button
                onClick={handleClick}
                className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors w-full text-center"
              >const 
                Visit Website
              </button>
            </div>
          </div>
          <button
            onClick={handleClick}
            className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors whitespace-nowrap"
          >
            Visit Website
          </button>
        </div>
      </div>
    </Link>
  );
};

export default AiCard;
