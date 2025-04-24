"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Layout } from "@/app/components/layout";
import { FaFacebookF, FaXTwitter, FaPinterestP } from "react-icons/fa6";
import { getAiMostFavorite, incrementClick } from "@/app/api/AiCard/route";
import { AiProps } from "@/app/data/AiData";
import DeskripsiCard from "../Deskripsi";
import "aos/dist/aos.css";
import AOS from "aos";
import Head from "next/head";

interface ProductData {
  name: string;
  shortDesc: string;
  longDesc: string;
  gambar: string;
  url: string;
  kategoriId: string;
}

const ProductPage = () => {
  const { shortLink } = useParams();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [aiTools, setAiTools] = useState<AiProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState("");

  const stripHtml = (html: string): string => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  // Set current URL setelah halaman dimuat
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const getDisplayLink = (shortLink?: string) => {
    if (shortLink) {
      return `/aff/${shortLink}`;
    }
    return shortLink || "/404";
  };

  const shareToFacebook = () => {
    if (!product) return;

    // Ambil URL halaman saat ini
    const shareUrl = encodeURIComponent(currentUrl);
    
    // Extract plain text dari longDesc yang berisi HTML
    const cleanDesc = stripHtml(product.longDesc);
    
    // Batasi deskripsi ke 300 karakter untuk preview yang baik
    const truncatedDesc = cleanDesc.length > 300 
      ? cleanDesc.substring(0, 297) + '...' 
      : cleanDesc;
      
    const quote = encodeURIComponent(truncatedDesc);
    
    // Tambahkan parameter hashtag jika diinginkan
    const hashtag = encodeURIComponent(`AI${product.kategoriId.replace(/\s+/g, '')}`);
    
    // URL share Facebook dengan parameter lengkap
    const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${quote}&hashtag=%23${hashtag}`;

    // Buka popup window dengan ukuran yang sesuai
    window.open(fbShareUrl, "_blank", "width=600,height=530,scrollbars=yes");
  };

  // Twitter share function
  const shareToTwitter = () => {
    if (!product) return;
    
    const shareUrl = encodeURIComponent(currentUrl);
    const cleanDesc = stripHtml(product.shortDesc);
    const truncatedDesc = cleanDesc.length > 200 ? cleanDesc.substring(0, 197) + '...' : cleanDesc;
    const text = encodeURIComponent(`${product.name}: ${truncatedDesc}`);
    
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`;
    window.open(twitterUrl, "_blank", "width=600,height=300");
  };

  // Pinterest share function
  const shareToPinterest = () => {
    if (!product) return;
    
    const shareUrl = encodeURIComponent(currentUrl);
    const description = encodeURIComponent(stripHtml(product.shortDesc));
    const media = encodeURIComponent(product.gambar || "/placeholder-image.jpg");
    
    const pinterestUrl = `https://pinterest.com/pin/create/button/?url=${shareUrl}&media=${media}&description=${description}`;
    window.open(pinterestUrl, "_blank", "width=750,height=550");
  };

  const handleClick = async () => {
    if (shortLink) {
      try {
        const linkValue = Array.isArray(shortLink) ? shortLink[0] : shortLink;
        await incrementClick(linkValue);
      } catch (error) {
        console.error("Error tracking click:", error);
      }
    }
  };

  useEffect(() => {
    if (shortLink) {
      setIsLoading(true);
      fetch(`/api/Deskripsi/${shortLink}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(res.statusText);
          }
          return res.json();
        })
        .then((data) => {
          if (data.error) {
            throw new Error(data.error);
          }
          if (data.nama && data.nama[0]) {
            setProduct(data.nama[0]);
          } else {
            throw new Error("Product data not found");
          }
        })
        .catch((err) => {
          console.error("Error fetching data:", err);
          setError(err.message || "Error fetching data");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [shortLink]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAiMostFavorite();
        setAiTools(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching AI tools:", error);
        setError("Failed to load AI tools");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    AOS.init({ duration: 1000 });
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <section className="relative min-h-screen">
          <div className="container mx-auto px-4 pt-24 md:pt-48">
            <p className="text-white text-center">Loading...</p>
          </div>
        </section>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <section className="relative min-h-screen">
          <div className="container mx-auto px-4 pt-24 md:pt-48">
            <p className="text-white text-center">{error}</p>
          </div>
        </section>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <section className="relative min-h-screen">
          <div className="container mx-auto px-4 pt-24 md:pt-48">
            <p className="text-white text-center">Product was not found</p>
          </div>
        </section>
      </Layout>
    );
  }

  // Fallback image jika gambar kosong
  const imageUrl = product.gambar || "/placeholder-image.jpg";
  // Get absolute URL for image
  const absoluteImageUrl = product.gambar ? 
    (product.gambar.startsWith('http') ? product.gambar : `${process.env.NEXT_PUBLIC_SITE_URL || ''}${product.gambar}`) 
    : `${process.env.NEXT_PUBLIC_SITE_URL || ''}/placeholder-image.jpg`;

  return (
    <Layout>
      <Head>
        <title>{product.name}</title>
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={stripHtml(product.shortDesc)} />
        <meta property="og:image" content={absoluteImageUrl} />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:type" content="article" />
        {/* Add Facebook App ID if you have one */}
        {/* <meta property="fb:app_id" content="YOUR_FB_APP_ID" /> */}
      </Head>
      
      <section className="relative min-h-screen">
        <div className="relative z-10">
          <div className="container mx-auto px-4 sm:px-6 pt-24 md:pt-48">
            <div className="flex flex-col items-center mb-4">
              {product.gambar && (
                <div className="w-40 h-40 md:w-52 md:h-52 relative mb-4">
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    style={{ objectFit: 'contain' }}
                    className="rounded-lg"
                  />
                </div>
              )}
              <h2 className="text-xl md:text-2xl text-white font-bold text-center">{product.name}</h2>
              <p className="text-white flex items-center gap-2 mt-2 text-sm md:text-base">
                <span>📂</span> {product.kategoriId}
              </p>
              <div className="mt-6">
                <Link
                  href={getDisplayLink(shortLink as string)}
                  target="_blank"
                  onClick={handleClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 sm:px-6 py-2 rounded-lg inline-block text-sm md:text-base"
                >
                  Visit Website
                </Link>
              </div>
              <p className="text-white mt-4 text-sm md:text-base text-center px-4">{product.shortDesc}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 py-6">
        {/* Deskripsi Lengkap */}
        <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-5xl mx-auto">
          <div className="mt-2 md:mt-4">
            <h2 className="text-black text-xl md:text-2xl font-bold">Deskripsi Lengkap</h2>
          </div>
          <div className="mt-4 md:mt-8">
            {/* Render HTML content safely using dangerouslySetInnerHTML */}
            <div
              className="text-black text-base md:text-xl text-justify leading-relaxed font-medium suneditor-content"
              dangerouslySetInnerHTML={{ __html: product.longDesc }}
            />
          </div>
          {/* Social Share Buttons */}
          <div className="mt-6 md:mt-8">
            <span className="text-black text-lg md:text-2xl font-bold flex items-center">
              Share this post
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 md:gap-3">
            <button
              onClick={shareToFacebook}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-1 md:gap-2 hover:bg-black transition text-sm md:text-base"
            >
              <FaFacebookF size={16} />
              <span className="hidden sm:inline">Facebook</span>
            </button>
            <button 
              onClick={shareToTwitter}
              className="bg-black text-white px-3 py-2 rounded-lg flex items-center gap-1 md:gap-2 hover:bg-gray-800 transition text-sm md:text-base"
            >
              <FaXTwitter size={16} />
              <span className="hidden sm:inline">Twitter</span>
            </button>
            <button 
              onClick={shareToPinterest}
              className="bg-red-600 text-white px-3 py-2 rounded-lg flex items-center gap-1 md:gap-2 hover:bg-black transition text-sm md:text-base"
            >
              <FaPinterestP size={16} />
              <span className="hidden sm:inline">Pinterest</span>
            </button>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 py-6">
        {/* Related Jobs */}
        <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-5xl my-4 md:mt-8 mx-auto">
          <div className="mt-2 md:mt-4">
            <h2 className="text-black text-xl md:text-2xl font-bold">Related Jobs</h2>
          </div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 mt-4">
            {aiTools.map((tool) => (
              <DeskripsiCard
                key={tool.id}
                logo={tool.gambar}
                name={tool.name}
                category={tool.kategori.nama}
                shortDesc={tool.shortDesc}
                url={tool.url}
                shortLink={tool.shortLink || ""}
              />
            ))}
          </div>
        </div>
      </section>

      <style jsx global>{`
        .suneditor-content a {
          color: #2563eb;
          text-decoration: none;
          font-weight: 500;
        }

        .suneditor-content a:hover {
          color: #1d4ed8;
          text-decoration: underline;
          cursor: pointer;
        }

        /* Styling tambahan lainnya untuk elemen SunEditor */
        .suneditor-content h1,
        .suneditor-content h2,
        .suneditor-content h3 {
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          font-weight: bold;
        }

        .suneditor-content h1 {
          font-size: 1.5rem;
        }

        .suneditor-content h2 {
          font-size: 1.3rem;
        }

        .suneditor-content h3 {
          font-size: 1.1rem;
        }

        .suneditor-content ul,
        .suneditor-content ol {
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }

        .suneditor-content ul {
          list-style-type: disc;
        }

        .suneditor-content ol {
          list-style-type: decimal;
        }

        /* Styling untuk tabel */
        .suneditor-content table {
          width: 100%;
          table-layout: auto;
          border-collapse: collapse;
          margin: 1rem 0;
          overflow-x: auto;
          display: block;
        }

        .suneditor-content table,
        .suneditor-content th,
        .suneditor-content td {
          border: 1px solid black;
        }

        .suneditor-content th,
        .suneditor-content td {
          border: 1px solid black;
          padding: 6px;
          text-align: left;
          vertical-align: top;
          word-wrap: break-word;
        }

        .suneditor-content th {
          background-color: #f3f4f6;
          font-weight: bold;
        }

        .suneditor-content tr:nth-child(even) {
          background-color: #f9fafb;
        }

        @media (max-width: 640px) {
          .suneditor-content {
            font-size: 0.9rem;
          }
          
          .suneditor-content h1 {
            font-size: 1.3rem;
          }
          
          .suneditor-content h2 {
            font-size: 1.2rem;
          }
          
          .suneditor-content h3 {
            font-size: 1.1rem;
          }
          
          .suneditor-content table {
            font-size: 0.8rem;
          }
          
          .suneditor-content th,
          .suneditor-content td {
            padding: 4px;
          }
        }
      `}</style>
    </Layout>
  );
};

export default ProductPage;