"use server"
import { prisma } from "../prisma";

export async function getKategori() {
    try {
      const kategori = await prisma.kategori.findMany({
        select: {
          id: true,
          nama: true,
        },
      });
      return kategori;
    } catch (error) {
      console.error("Error fetching kategori:", error);
      throw new Error("Gagal mengambil data kategori");
    }
  }
  
  export async function getAi() {
    try {
      const ais = await prisma.ai.findMany({
        include: {
          kategori: true,
        },
      });
      return ais.map((ai) => ({
        ...ai,
        kategori: {
          id: ai.kategori.id,
          nama: ai.kategori.nama,
        },
      }));
    } catch (error) {
      console.error("Error fetching AI data:", error);
      throw new Error("Gagal mengambil data");
    }
  }
  

export async function incrementClick(shortLink: string) {
  try {
    await prisma.ai.updateMany({
      where: {
        shortLink: shortLink,
      },
      data: {
        click: {
          increment: 1,
        },
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Error incrementing click:", error);
    return { success: false };
  }
}
