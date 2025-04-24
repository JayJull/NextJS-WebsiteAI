import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  context: { params: { shortLink: string } }
) {
  try {
    const params = await context.params;
    const { shortLink } = params;
    console.log("Received shortLink:", shortLink);

    const product = await prisma.ai.findFirst({
      where: { 
        shortLink: shortLink 
      },
      select: {
        id: true,
        name: true,
        shortDesc: true,
        longDesc: true,
        gambar: true,
        url: true,
        kategori: {
          select: {
            nama: true
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await prisma.ai.update({
      where: { id: product.id },
      data: { click: { increment: 1 } }
    });

    const transformedProduct = {
      name: product.name,
      shortDesc: product.shortDesc,
      longDesc: product.longDesc,
      gambar: product.gambar,
      url: product.url,
      kategoriId: product.kategori.nama
    };

    return NextResponse.json({ nama: [transformedProduct] });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}