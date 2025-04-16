"use server"
import { NextResponse } from "next/server";
import { prisma } from "../prisma";
import { CreateAIData, UpdateAIData } from "@/app/data/AiData";

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

export async function createAi(data: CreateAIData) {
  try {
    if (
      !data.name ||
      !data.shortDesc ||
      !data.longDesc ||
      !data.url ||
      !data.shortLink ||
      data.click === undefined ||
      !data.gambar ||
      !data.kategoriId
    ) {
      throw new Error("Semua field harus diisi");
    }

    if (data.shortDesc.length > 100) {
      throw new Error("Deskripsi singkat tidak boleh lebih dari 100 karakter");
    }

    if (data.longDesc.length > 15000) {
      throw new Error(
        "Deskripsi panjang tidak boleh lebih dari 15000 karakter"
      );
    }

    const existingName = await prisma.ai.findUnique({
      where: {
        name: data.name
      }
    });

    if (existingName) {
      throw new Error("Nama AI sudah digunakan. Gunakan nama lain.");
    }

    const existingShortLink = await prisma.ai.findUnique({
      where: {
        shortLink: data.shortLink
      }
    });

    if (existingShortLink) {
      throw new Error("Short link sudah digunakan. Gunakan short link lain.");
    }

    const kategori = await prisma.kategori.findUnique({
      where: {
        id: data.kategoriId,
      },
    });

    if (!kategori) {
      throw new Error("Kategori tidak ditemukan");
    }

    const newAi = await prisma.ai.create({
      data: {
        name: data.name,
        shortDesc: data.shortDesc,
        longDesc: data.longDesc,
        url: data.url,
        shortLink: data.shortLink,
        click: data.click,
        gambar: data.gambar,
        kategoriId: data.kategoriId,
      },
      include: {
        kategori: true,
      },
    });

    return {
      id: newAi.id,
      name: newAi.name,
      shortDesc: newAi.shortDesc,
      longDesc: newAi.longDesc,
      url: newAi.url,
      shortLink: newAi.shortLink,
      click: newAi.click,
      gambar: newAi.gambar,
      kategori: {
        id: newAi.kategori.id,
        name: newAi.kategori.nama,
      },
    };
  } catch (error) {
    console.error("Error creating AI:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw error;
  }
}

export async function updateAi(data: UpdateAIData) {
  try {
    if (
      !data.name ||
      !data.shortDesc ||
      !data.longDesc ||
      !data.url ||
      !data.shortLink ||
      data.click === undefined ||
      !data.kategoriId
    ) {
      throw new Error("Semua field harus diisi");
    }

    const existingAi = await prisma.ai.findUnique({
      where: {
        id: data.id,
      },
    });

    if (!existingAi) {
      throw new Error("Data AI tidak ditemukan");
    }

    // Check if the name has changed
    if (existingAi.name !== data.name) {
      // Check if the new name is already in use by another record
      const existingName = await prisma.ai.findUnique({
        where: {
          name: data.name
        }
      });

      if (existingName && existingName.id !== data.id) {
        throw new Error("Nama AI sudah digunakan. Gunakan nama lain.");
      }
    }

    // Check if the shortLink has changed
    if (existingAi.shortLink !== data.shortLink) {
      // Check if the new shortLink is already in use by another record
      const existingShortLink = await prisma.ai.findUnique({
        where: {
          shortLink: data.shortLink
        }
      });

      if (existingShortLink && existingShortLink.id !== data.id) {
        throw new Error("Short link sudah digunakan. Gunakan short link lain.");
      }
    }

    const kategori = await prisma.kategori.findUnique({
      where: {
        id: data.kategoriId,
      },
    });

    if (!kategori) {
      throw new Error("Kategori tidak ditemukan");
    }

    const updatedAi = await prisma.ai.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        shortDesc: data.shortDesc,
        longDesc: data.longDesc,
        url: data.url,
        shortLink: data.shortLink,
        click: data.click,
        gambar: data.gambar,
        kategoriId: data.kategoriId,
      },
      include: {
        kategori: true,
      },
    });

    return {
      id: updatedAi.id,
      name: updatedAi.name,
      shortDesc: updatedAi.shortDesc,
      longDesc: updatedAi.longDesc,
      url: updatedAi.url,
      shortLink: updatedAi.shortLink,
      click: updatedAi.click,
      gambar: updatedAi.gambar,
      kategori: {
        id: updatedAi.kategori.id,
        nama: updatedAi.kategori.nama,
      },
    };
  } catch (error) {
    console.error("Error updating AI:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Gagal mengupdate data AI");
  }
}

export async function deleteAi(id: number) {
  try {
    const existingAi = await prisma.ai.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingAi) {
      throw new Error("Data AI tidak ditemukan");
    }

    await prisma.ai.delete({
      where: {
        id: id,
      },
    });

    return {
      message: "Data AI berhasil dihapus",
    };
  } catch (error) {
    console.error("Error deleting AI:", error);
    throw new Error("Gagal menghapus data AI");
  }
}

export async function importAi(request: Request) {
  try {
    const { data } = await request.json();

    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }

    const results = {
      imported: 0,
      skipped: 0,
      skippedItems: [] as string[]
    };

    await Promise.all(
      data.map(async (item) => {
        const name = item.name;
        const shortLink = item.shortLink || item.name.toLowerCase().replace(/\s+/g, "-");
        const defaultLongDesc =
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
        const existingWithName = await prisma.ai.findUnique({
          where: { name: name }
        });
        
        const existingWithShortLink = await prisma.ai.findUnique({
          where: { shortLink: shortLink }
        });
        
        if (existingWithName || existingWithShortLink) {
          results.skipped++;
          results.skippedItems.push(name);
          return null;
        }

        if (item.kategoriId) {
          const kategori = await prisma.kategori.findUnique({
            where: { id: item.kategoriId },
          });

          if (!kategori) {
            throw new Error(`Kategori with ID ${item.kategoriId} not found`);
          }
        }

        const newItem = await prisma.ai.create({
          data: {
            name: name,
            shortDesc: item.shortDesc,
            longDesc: item.longDesc || defaultLongDesc,
            url: item.url,
            shortLink: shortLink,
            click: parseInt(item.click) || 0,
            gambar: item.gambar,
            kategoriId: item.kategoriId || 1,
          },
        });
        
        results.imported++;
        return newItem;
      })
    );

    return NextResponse.json({
      message: "Import completed",
      imported: results.imported,
      skipped: results.skipped,
      skippedItems: results.skippedItems
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to import data" },
      { status: 500 }
    );
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

export async function getAiMostFavorite() {
  try {
    const ais = await prisma.ai.findMany({
      take: 4,
      orderBy: {
        click: 'desc'
      },
      include: {
        kategori: {
          select: {
            id: true,
            nama: true,
          }
        },
      },
    });
    
    return ais;
  } catch (error) {
    console.error("Error fetching AI data:", error);
    throw new Error("Failed to fetch AI data");
  }
}