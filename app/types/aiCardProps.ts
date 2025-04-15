export interface AiCardProps {
  logo: string;
  name: string;
  category: string;
  shortDesc: string;
  url: string;
  shortLink: string;
}

export interface Kategori {
  id: number;
  nama: string;
}

export interface AiProps {
  id: number;
  name: string;
  shortDesc: string;
  longDesc: string;
  url: string;
  shortLink: string | null;
  click: number;
  gambar: string;
  kategori: Kategori;
}