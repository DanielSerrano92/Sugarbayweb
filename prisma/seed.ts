import "dotenv/config";

import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  ConcertStatus,
  ContributorRole,
  MusicReleaseType,
  NewsStatus,
  PrismaClient,
  ProductType,
  VariantSize,
} from "../app/generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run prisma/seed.ts");
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({
  adapter,
});

async function clearDatabase() {
  await prisma.trackContributor.deleteMany();
  await prisma.releaseContributor.deleteMany();
  await prisma.videoItem.deleteMany();
  await prisma.videoCollection.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.photoAlbum.deleteMany();
  await prisma.track.deleteMany();
  await prisma.musicRelease.deleteMany();
  await prisma.musicContributor.deleteMany();
  await prisma.biographySection.deleteMany();
  await prisma.bandMember.deleteMany();
  await prisma.news.deleteMany();
  await prisma.concert.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
}

function addDays(base: Date, days: number, hour = 0, minutes = 0) {
  const date = new Date(base);
  date.setDate(date.getDate() + days);
  date.setHours(hour, minutes, 0, 0);
  return date;
}

async function main() {
  await clearDatabase();

  const now = new Date();
  const upcomingConcertDate = addDays(now, 45, 21, 0);
  const pastConcertDate = addDays(now, -120, 21, 0);
  const rodajeEventDate = new Date("2026-03-01T00:00:00.000Z");
  const rodajeAprilEventDate = new Date("2026-04-26T00:00:00.000Z");
  const releaseDate = addDays(now, -60, 0, 0);
  const newsPublishedAt = addDays(now, -7, 9, 0);

  const passwordHash = await bcrypt.hash("Sugarbay123!", 12);

  const fan = await prisma.user.create({
    data: {
      email: "fan@sugarbaymusic.com",
      username: "sugarbayfan_demo",
      passwordHash,
      firstName: "Daniel",
      lastName: "Solis",
      birthDate: new Date("1998-06-22T00:00:00.000Z"),
      country: "ES",
      termsAcceptedAt: now,
      role: "USER",
      phone: "+34600000000",
    },
  });

  await prisma.address.createMany({
    data: [
      {
        userId: fan.id,
        type: "SHIPPING",
        label: "Casa",
        recipientName: "Daniel Solis",
        line1: "Calle Gran Via 10",
        city: "Madrid",
        postalCode: "28013",
        region: "Madrid",
        country: "ES",
        phone: "+34600000000",
        isDefault: true,
      },
      {
        userId: fan.id,
        type: "BILLING",
        label: "Oficina",
        recipientName: "Daniel Solis",
        line1: "Paseo de la Castellana 80",
        city: "Madrid",
        postalCode: "28046",
        region: "Madrid",
        country: "ES",
        phone: "+34600000000",
        isDefault: true,
      },
    ],
  });

  const shopRoot = await prisma.productCategory.create({
    data: {
      name: "Tienda",
      slug: "tienda",
      description: "Categoria raiz de la tienda",
      sortOrder: 0,
    },
  });

  const apparelRoot = await prisma.productCategory.create({
    data: {
      name: "Ropa",
      slug: "ropa",
      parentId: shopRoot.id,
      sortOrder: 1,
    },
  });

  const accessoriesRoot = await prisma.productCategory.create({
    data: {
      name: "Accesorios",
      slug: "accesorios",
      parentId: shopRoot.id,
      sortOrder: 2,
    },
  });

  const mediaRoot = await prisma.productCategory.create({
    data: {
      name: "Media",
      slug: "media",
      parentId: shopRoot.id,
      sortOrder: 3,
    },
  });

  const tshirtsCategory = await prisma.productCategory.create({
    data: {
      name: "Camisetas",
      slug: "camisetas",
      parentId: apparelRoot.id,
      sortOrder: 1,
    },
  });

  const pinsCategory = await prisma.productCategory.create({
    data: {
      name: "Pines",
      slug: "pines",
      parentId: accessoriesRoot.id,
      sortOrder: 1,
    },
  });

  const cdsCategory = await prisma.productCategory.create({
    data: {
      name: "CDs",
      slug: "cds",
      parentId: mediaRoot.id,
      sortOrder: 1,
    },
  });

  await prisma.product.create({
    data: {
      categoryId: tshirtsCategory.id,
      name: "Sugarbay Tour Tee Black",
      slug: "sugarbay-tour-tee-black",
      description:
        "Camiseta oficial Sugarbay Tour 2026 en algodon organico. Corte unisex y acabado premium.",
      productType: ProductType.APPAREL,
      basePrice: 31.9,
      compareAtPrice: 36.9,
      isPublished: true,
      isFeatured: true,
      tags: ["tour", "ropa", "camiseta", "unisex"],
      metadata: {
        fabric: "100% organic cotton",
        fit: "regular",
        gender: "unisex",
      },
      images: {
        create: [
          {
            imageUrl: "https://ik.imagekit.io/sugarbay/products/tour-tee-black-main.jpg",
            altText: "Sugarbay Tour Tee Black frontal",
            isPrimary: true,
            sortOrder: 1,
          },
        ],
      },
      variants: {
        create: [
          {
            sku: "SB-TEE-BLK-M",
            title: "Black / M",
            size: VariantSize.M,
            color: "Black",
            stock: 45,
          },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      categoryId: pinsCategory.id,
      name: "Sugarbay Neon Pin Set",
      slug: "sugarbay-neon-pin-set",
      description:
        "Set de pines metalicos con acabado neon inspirado en la era Midnight Frequency.",
      productType: ProductType.ACCESSORY,
      basePrice: 14.9,
      compareAtPrice: 18.9,
      isPublished: true,
      isFeatured: true,
      tags: ["accesorios", "pin", "set", "neon", "coleccion"],
      metadata: {
        material: "zinc alloy + enamel",
        pieces: 3,
      },
      images: {
        create: [
          {
            imageUrl: "https://ik.imagekit.io/sugarbay/products/neon-pin-set-main.jpg",
            altText: "Sugarbay Neon Pin Set",
            isPrimary: true,
            sortOrder: 1,
          },
        ],
      },
      variants: {
        create: [
          {
            sku: "SB-PIN-SET-OS",
            title: "Set / OS",
            size: VariantSize.OS,
            color: "Multicolor",
            stock: 120,
          },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      categoryId: cdsCategory.id,
      name: "Neon Coastline CD Deluxe",
      slug: "neon-coastline-cd-deluxe",
      description:
        "Edicion CD deluxe con libreto de 16 paginas, arte retro y bonus track en directo.",
      productType: ProductType.MEDIA,
      basePrice: 22.9,
      compareAtPrice: 26.9,
      isPublished: true,
      isFeatured: true,
      tags: ["media", "cd", "album", "deluxe", "neon"],
      metadata: {
        mediaType: "cd",
        tracklist: [
          "Midnight Frequency",
          "Neon Coastline",
          "City Lights Radio",
          "Satellite Hearts",
          "Midnight Frequency (Live Edit)",
        ],
        linerNotes:
          "Edicion de coleccion con notas de produccion, letras seleccionadas y fotos de estudio.",
      },
      images: {
        create: [
          {
            imageUrl: "https://ik.imagekit.io/sugarbay/products/neon-coastline-cd-deluxe-main.jpg",
            altText: "Neon Coastline CD Deluxe",
            isPrimary: true,
            sortOrder: 1,
          },
        ],
      },
      variants: {
        create: [
          {
            sku: "SB-CD-NC-DELUXE",
            title: "CD / OS",
            size: VariantSize.OS,
            color: "Standard",
            stock: 80,
          },
        ],
      },
    },
  });

  await prisma.concert.createMany({
    data: [
      {
        title: "Sugarbay Live in Madrid",
        slug: "sugarbay-live-madrid-2026",
        status: ConcertStatus.SCHEDULED,
        startsAt: upcomingConcertDate,
        venueName: "Sala Riviera",
        venueAddress: "Paseo Bajo de la Virgen del Puerto S/N",
        city: "Madrid",
        region: "Madrid",
        country: "ES",
        ticketUrl: "https://www.ticketmaster.es/search?q=Sugarbay",
        externalEventUrl: "https://www.salariviera.com",
        description:
          "Concierto principal del tramo espanol de la gira Summer Lights 2026.",
        isFeatured: true,
      },
      {
        title: "Sugarbay Sunset Session Barcelona",
        slug: "sugarbay-barcelona-closing-night-2025",
        status: ConcertStatus.COMPLETED,
        startsAt: pastConcertDate,
        venueName: "Razzmatazz",
        venueAddress: "Carrer dels Almogavers 122",
        city: "Barcelona",
        region: "Catalonia",
        country: "ES",
        externalEventUrl: "https://www.salarazzmatazz.com",
        description:
          "Cierre especial de temporada con setlist ampliado y cronica disponible.",
      },
    ],
  });

  await prisma.news.create({
    data: {
      title: "Sugarbay anuncia nuevo single y fecha en Madrid",
      slug: "sugarbay-anuncia-single-y-fecha-madrid",
      summary:
        "La banda confirma el estreno de Midnight Frequency junto a una fecha especial en Madrid.",
      content:
        "Sugarbay confirma el lanzamiento digital de Midnight Frequency para abrir la nueva etapa de la gira.\n\nEl tema llega con produccion renovada y un set visual inspirado en la identidad synthwave de la banda.\n\nLa presentacion oficial sera en Madrid con repertorio especial, invitados y contenidos exclusivos para comunidad.\n\nEn los proximos dias se publicaran horarios, acceso y material adicional del directo.",
      status: NewsStatus.PUBLISHED,
      publishedAt: newsPublishedAt,
      authorName: "Sugarbay Team",
      tags: ["single", "tour", "madrid"],
      coverImageUrl: "https://ik.imagekit.io/sugarbay/news/midnight-frequency-announce.jpg",
    },
  });

  const contributorLucia = await prisma.musicContributor.create({
    data: {
      name: "Lucia Vega",
      slug: "lucia-vega-contributor-demo",
      primaryRole: ContributorRole.VOCALS,
      bio: "Lead vocal and topline writer.",
      avatarUrl: "https://ik.imagekit.io/sugarbay/contributors/lucia.jpg",
    },
  });

  const contributorIvan = await prisma.musicContributor.create({
    data: {
      name: "Ivan Ramos",
      slug: "ivan-ramos-contributor-demo",
      primaryRole: ContributorRole.PRODUCER,
      bio: "Producer and synth arranger.",
      avatarUrl: "https://ik.imagekit.io/sugarbay/contributors/ivan.jpg",
    },
  });

  const release = await prisma.musicRelease.create({
    data: {
      title: "Neon Coastline",
      slug: "neon-coastline",
      releaseType: MusicReleaseType.ALBUM,
      description:
        "Album de estudio con atmosfera nocturna, sintetizadores analogicos y enfoque cinematografico.",
      coverImageUrl: "https://ik.imagekit.io/gq1enkszp/fotos/album.png",
      releaseDate,
      labelName: "Sugarbay Records",
      catalogNumber: "SBR-ALB-003",
      isPublished: true,
      externalLinks: {
        spotify: "https://open.spotify.com/album/neon-coastline",
        appleMusic: "https://music.apple.com/album/neon-coastline",
        partitura:
          "https://ik.imagekit.io/sugarbay/music/sheet/midnight-frequency-sheet.pdf",
        bandcamp: "https://sugarbay.bandcamp.com/album/neon-coastline",
      },
    },
  });

  const track = await prisma.track.create({
    data: {
      musicReleaseId: release.id,
      title: "Midnight Frequency",
      slug: "midnight-frequency",
      trackNumber: 1,
      discNumber: 1,
      durationSeconds: 223,
      trackType: "ORIGINAL",
      isrc: "ESSBY2600101",
      lyrics:
        "Luces en la autopista, voces en el radar,\nlate la ciudad, late sin parar.\nCuando cae la noche volvemos a sonar,\nmidnight frequency, no nos va a apagar.",
      audioPreviewUrl:
        "https://ik.imagekit.io/sugarbay/music/sheet/midnight-frequency-sheet.pdf",
      spotifyUrl: "https://open.spotify.com/track/midnight-frequency",
      appleMusicUrl: "https://music.apple.com/track/midnight-frequency",
      youtubeUrl: "https://www.youtube.com/watch?v=midnight-frequency-live",
    },
  });

  await prisma.releaseContributor.createMany({
    data: [
      {
        musicReleaseId: release.id,
        musicContributorId: contributorLucia.id,
        role: ContributorRole.VOCALS,
        creditOrder: 1,
      },
      {
        musicReleaseId: release.id,
        musicContributorId: contributorIvan.id,
        role: ContributorRole.PRODUCER,
        creditOrder: 2,
      },
    ],
  });

  await prisma.trackContributor.createMany({
    data: [
      {
        trackId: track.id,
        musicContributorId: contributorLucia.id,
        role: ContributorRole.VOCALS,
        creditOrder: 1,
      },
      {
        trackId: track.id,
        musicContributorId: contributorIvan.id,
        role: ContributorRole.PRODUCER,
        creditOrder: 2,
      },
    ],
  });

  await prisma.photoAlbum.create({
    data: {
      title: "Sugarbay Sunset Session Barcelona",
      slug: "sugarbay-sunset-session-barcelona-gallery",
      description:
        "Galeria oficial del concierto Sunset Session con una seleccion de tomas de escenario.",
      coverImageUrl: "https://ik.imagekit.io/sugarbay/photos/barcelona-sunset-cover.jpg",
      eventDate: pastConcertDate,
      sortOrder: 1,
      photos: {
        create: [
          {
            title: "Escenario principal en Barcelona",
            caption: "Photo: Carla Moreno - Apertura con todo el recinto cantando.",
            imageUrl: "https://ik.imagekit.io/sugarbay/photos/barcelona-sunset-01.jpg",
            width: 1920,
            height: 1280,
            sortOrder: 1,
            isCover: true,
            takenAt: pastConcertDate,
          },
        ],
      },
    },
  });

  await prisma.photoAlbum.create({
    data: {
      title: "Rodaje",
      slug: "rodaje-1-3-26",
      description: "Coleccion oficial del rodaje realizado el 1/3/26.",
      coverImageUrl:
        "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Rodaje-1-3-26/ChatGPT%20Image%2014%20may%202026,%2018_35_07.png?updatedAt=1778780118772",
      eventDate: rodajeEventDate,
      sortOrder: 2,
      photos: {
        create: [
          {
            title: "Rodaje - Foto 1",
            caption: "Photo: Sugarbay Media Team - Rodaje 1/3/26.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Rodaje-1-3-26/WhatsApp%20Image%202026-03-01%20at%2018.59.256.jpeg?updatedAt=1778779821525",
            sortOrder: 1,
            isCover: true,
            takenAt: rodajeEventDate,
          },
          {
            title: "Rodaje - Foto 2",
            caption: "Photo: Sugarbay Media Team - Rodaje 1/3/26.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Rodaje-1-3-26/WhatsApp%20Image%202026-03-01%20at%2018.59.403.jpeg?updatedAt=1778779821518",
            sortOrder: 2,
            isCover: false,
            takenAt: rodajeEventDate,
          },
          {
            title: "Rodaje - Foto 3",
            caption: "Photo: Sugarbay Media Team - Rodaje 1/3/26.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Rodaje-1-3-26/WhatsApp%20Image%202026-03-01%20at%2018.59.252.jpeg?updatedAt=1778779821520",
            sortOrder: 3,
            isCover: false,
            takenAt: rodajeEventDate,
          },
          {
            title: "Rodaje - Foto 4",
            caption: "Photo: Sugarbay Media Team - Rodaje 1/3/26.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Rodaje-1-3-26/WhatsApp%20Image%202026-03-01%20at%2018.59.401.jpeg?updatedAt=1778779821515",
            sortOrder: 4,
            isCover: false,
            takenAt: rodajeEventDate,
          },
          {
            title: "Rodaje - Foto 5",
            caption: "Photo: Sugarbay Media Team - Rodaje 1/3/26.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Rodaje-1-3-26/WhatsApp%20Image%202026-03-01%20at%2018.59.40.jpeg?updatedAt=1778779821489",
            sortOrder: 5,
            isCover: false,
            takenAt: rodajeEventDate,
          },
          {
            title: "Rodaje - Foto 6",
            caption: "Photo: Sugarbay Media Team - Rodaje 1/3/26.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Rodaje-1-3-26/WhatsApp%20Image%202026-03-01%20at%2018.59.39.jpeg?updatedAt=1778779821451",
            sortOrder: 6,
            isCover: false,
            takenAt: rodajeEventDate,
          },
          {
            title: "Rodaje - Foto 7",
            caption: "Photo: Sugarbay Media Team - Rodaje 1/3/26.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Rodaje-1-3-26/WhatsApp%20Image%202026-03-01%20at%2018.59.25.jpeg?updatedAt=1778779821375",
            sortOrder: 7,
            isCover: false,
            takenAt: rodajeEventDate,
          },
          {
            title: "Rodaje - Foto 8",
            caption: "Photo: Sugarbay Media Team - Rodaje 1/3/26.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Rodaje-1-3-26/WhatsApp%20Image%202026-03-01%20at%2018.59.23.jpeg?updatedAt=1778779821409",
            sortOrder: 8,
            isCover: false,
            takenAt: rodajeEventDate,
          },
        ],
      },
    },
  });

  await prisma.photoAlbum.create({
    data: {
      title: "Rodaje",
      slug: "rodaje-26-4-26",
      description: "Coleccion oficial del rodaje realizado el 26/4/26.",
      coverImageUrl:
        "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Rodaje-26-4-26/ChatGPT%20Image%2014%20may%202026,%2018_39_08.png?updatedAt=1778780363443",
      eventDate: rodajeAprilEventDate,
      sortOrder: 3,
      photos: {
        create: [
          {
            title: "Rodaje 26/4/26 - Foto 1",
            caption: "Photo: Sugarbay Media Team - Rodaje 26/4/26.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Rodaje-26-4-26/WhatsApp%20Image%202026-04-26%20at%2021.54.15.jpeg?updatedAt=1778779807688",
            sortOrder: 1,
            isCover: true,
            takenAt: rodajeAprilEventDate,
          },
          {
            title: "Rodaje 26/4/26 - Foto 2",
            caption: "Photo: Sugarbay Media Team - Rodaje 26/4/26.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Rodaje-26-4-26/WhatsApp%20Image%202026-04-26%20at%2020.42.05.jpeg?updatedAt=1778779807669",
            sortOrder: 2,
            isCover: false,
            takenAt: rodajeAprilEventDate,
          },
          {
            title: "Rodaje 26/4/26 - Foto 3",
            caption: "Photo: Sugarbay Media Team - Rodaje 26/4/26.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Rodaje-26-4-26/WhatsApp%20Image%202026-04-26%20at%2020.42.22.jpeg?updatedAt=1778779807677",
            sortOrder: 3,
            isCover: false,
            takenAt: rodajeAprilEventDate,
          },
          {
            title: "Rodaje 26/4/26 - Foto 4",
            caption: "Photo: Sugarbay Media Team - Rodaje 26/4/26.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Rodaje-26-4-26/WhatsApp%20Image%202026-04-26%20at%2020.54.03.jpeg?updatedAt=1778779807667",
            sortOrder: 4,
            isCover: false,
            takenAt: rodajeAprilEventDate,
          },
          {
            title: "Rodaje 26/4/26 - Foto 5",
            caption: "Photo: Sugarbay Media Team - Rodaje 26/4/26.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Rodaje-26-4-26/WhatsApp%20Image%202026-04-26%20at%2020.42.32.jpeg?updatedAt=1778779807663",
            sortOrder: 5,
            isCover: false,
            takenAt: rodajeAprilEventDate,
          },
          {
            title: "Rodaje 26/4/26 - Foto 6",
            caption: "Photo: Sugarbay Media Team - Rodaje 26/4/26.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Rodaje-26-4-26/WhatsApp%20Image%202026-04-26%20at%2020.42.16.jpeg?updatedAt=1778779807648",
            sortOrder: 6,
            isCover: false,
            takenAt: rodajeAprilEventDate,
          },
          {
            title: "Rodaje 26/4/26 - Foto 7",
            caption: "Photo: Sugarbay Media Team - Rodaje 26/4/26.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Rodaje-26-4-26/WhatsApp%20Image%202026-04-26%20at%2020.51.34.jpeg?updatedAt=1778779807597",
            sortOrder: 7,
            isCover: false,
            takenAt: rodajeAprilEventDate,
          },
          {
            title: "Rodaje 26/4/26 - Foto 8",
            caption: "Photo: Sugarbay Media Team - Rodaje 26/4/26.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Rodaje-26-4-26/WhatsApp%20Image%202026-04-26%20at%2020.41.47.jpeg?updatedAt=1778779807453",
            sortOrder: 8,
            isCover: false,
            takenAt: rodajeAprilEventDate,
          },
        ],
      },
    },
  });

  await prisma.photoAlbum.create({
    data: {
      title: "Crime City",
      slug: "crime-city",
      description: "Coleccion oficial de fotos de Crime City.",
      coverImageUrl:
        "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Crime%20City/ChatGPT%20Image%2014%20may%202026,%2019_27_26.png",
      sortOrder: 4,
      photos: {
        create: [
          {
            title: "Crime City - Foto 1",
            caption: "Photo: Sugarbay Media Team - Crime City.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Crime%20City/IMG-20200729-WA0031.jpg?updatedAt=1778530808142",
            sortOrder: 1,
            isCover: true,
          },
          {
            title: "Crime City - Foto 2",
            caption: "Photo: Sugarbay Media Team - Crime City.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Crime%20City/S-108.JPG?updatedAt=1778530808329",
            sortOrder: 2,
            isCover: false,
          },
          {
            title: "Crime City - Foto 3",
            caption: "Photo: Sugarbay Media Team - Crime City.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Crime%20City/C-120.JPG?updatedAt=1778530808482",
            sortOrder: 3,
            isCover: false,
          },
          {
            title: "Crime City - Foto 4",
            caption: "Photo: Sugarbay Media Team - Crime City.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Crime%20City/S-121.JPG?updatedAt=1778530808417",
            sortOrder: 4,
            isCover: false,
          },
          {
            title: "Crime City - Foto 5",
            caption: "Photo: Sugarbay Media Team - Crime City.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Crime%20City/C-186.JPG?updatedAt=1778530863288",
            sortOrder: 5,
            isCover: false,
          },
          {
            title: "Crime City - Foto 6",
            caption: "Photo: Sugarbay Media Team - Crime City.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Crime%20City/S-149.JPG?updatedAt=1778530863546",
            sortOrder: 6,
            isCover: false,
          },
          {
            title: "Crime City - Foto 7",
            caption: "Photo: Sugarbay Media Team - Crime City.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Crime%20City/C-146.JPG?updatedAt=1778530863507",
            sortOrder: 7,
            isCover: false,
          },
          {
            title: "Crime City - Foto 8",
            caption: "Photo: Sugarbay Media Team - Crime City.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Crime%20City/C-151.JPG?updatedAt=1778530863503",
            sortOrder: 8,
            isCover: false,
          },
          {
            title: "Crime City - Foto 9",
            caption: "Photo: Sugarbay Media Team - Crime City.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Crime%20City/C-244.JPG?updatedAt=1778530964974",
            sortOrder: 9,
            isCover: false,
          },
          {
            title: "Crime City - Foto 10",
            caption: "Photo: Sugarbay Media Team - Crime City.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Crime%20City/S-171.JPG?updatedAt=1778530965110",
            sortOrder: 10,
            isCover: false,
          },
          {
            title: "Crime City - Foto 11",
            caption: "Photo: Sugarbay Media Team - Crime City.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Crime%20City/S-243.JPG?updatedAt=1778530965098",
            sortOrder: 11,
            isCover: false,
          },
          {
            title: "Crime City - Foto 12",
            caption: "Photo: Sugarbay Media Team - Crime City.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Crime%20City/C-322.JPG?updatedAt=1778530996612",
            sortOrder: 12,
            isCover: false,
          },
          {
            title: "Crime City - Foto 13",
            caption: "Photo: Sugarbay Media Team - Crime City.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Crime%20City/C-201.JPG?updatedAt=1778531027246",
            sortOrder: 13,
            isCover: false,
          },
          {
            title: "Crime City - Foto 14",
            caption: "Photo: Sugarbay Media Team - Crime City.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Crime%20City/S-199.JPG?updatedAt=1778531027195",
            sortOrder: 14,
            isCover: false,
          },
          {
            title: "Crime City - Foto 15",
            caption: "Photo: Sugarbay Media Team - Crime City.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Crime%20City/S-262.JPG?updatedAt=1778531027199",
            sortOrder: 15,
            isCover: false,
          },
          {
            title: "Crime City - Foto 16",
            caption: "Photo: Sugarbay Media Team - Crime City.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Crime%20City/C-221.JPG?updatedAt=1778531027210",
            sortOrder: 16,
            isCover: false,
          },
          {
            title: "Crime City - Foto 17",
            caption: "Photo: Sugarbay Media Team - Crime City.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Crime%20City/C-262.JPG?updatedAt=1778531027207",
            sortOrder: 17,
            isCover: false,
          },
          {
            title: "Crime City - Foto 18",
            caption: "Photo: Sugarbay Media Team - Crime City.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Crime%20City/S-234.JPG?updatedAt=1778531027269",
            sortOrder: 18,
            isCover: false,
          },
          {
            title: "Crime City - Foto 19",
            caption: "Photo: Sugarbay Media Team - Crime City.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Crime%20City/C-281.JPG?updatedAt=1778531068526",
            sortOrder: 19,
            isCover: false,
          },
          {
            title: "Crime City - Foto 20",
            caption: "Photo: Sugarbay Media Team - Crime City.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Crime%20City/S-282.JPG?updatedAt=1778531068544",
            sortOrder: 20,
            isCover: false,
          },
          {
            title: "Crime City - Foto 21",
            caption: "Photo: Sugarbay Media Team - Crime City.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Crime%20City/S-272.JPG?updatedAt=1778531068547",
            sortOrder: 21,
            isCover: false,
          },
          {
            title: "Crime City - Foto 22",
            caption: "Photo: Sugarbay Media Team - Crime City.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Crime%20City/C-283.JPG?updatedAt=1778531068621",
            sortOrder: 22,
            isCover: false,
          },
        ],
      },
    },
  });

  await prisma.photoAlbum.create({
    data: {
      title: "Fishville",
      slug: "fishville",
      description: "Coleccion oficial de fotos de Fishville.",
      coverImageUrl:
        "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Fishville/ChatGPT%20Image%2014%20may%202026,%2019_34_29.png",
      sortOrder: 5,
      photos: {
        create: [
          {
            title: "Fishville - Foto 1",
            caption: "Photo: Sugarbay Media Team - Fishville.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Fishville/P1000403.JPG?updatedAt=1778532167651",
            sortOrder: 1,
            isCover: true,
          },
          {
            title: "Fishville - Foto 2",
            caption: "Photo: Sugarbay Media Team - Fishville.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Fishville/P1000457.JPG?updatedAt=1778532167568",
            sortOrder: 2,
            isCover: false,
          },
          {
            title: "Fishville - Foto 3",
            caption: "Photo: Sugarbay Media Team - Fishville.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Fishville/P1000452.JPG?updatedAt=1778532167502",
            sortOrder: 3,
            isCover: false,
          },
          {
            title: "Fishville - Foto 4",
            caption: "Photo: Sugarbay Media Team - Fishville.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Fishville/P1000462.JPG?updatedAt=1778532167456",
            sortOrder: 4,
            isCover: false,
          },
          {
            title: "Fishville - Foto 5",
            caption: "Photo: Sugarbay Media Team - Fishville.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Fishville/P1000447.JPG?updatedAt=1778532167449",
            sortOrder: 5,
            isCover: false,
          },
          {
            title: "Fishville - Foto 6",
            caption: "Photo: Sugarbay Media Team - Fishville.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Fishville/IMG_20210608_191823.jpg?updatedAt=1778532167341",
            sortOrder: 6,
            isCover: false,
          },
          {
            title: "Fishville - Foto 7",
            caption: "Photo: Sugarbay Media Team - Fishville.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Fishville/P1000400.JPG?updatedAt=1778532167204",
            sortOrder: 7,
            isCover: false,
          },
          {
            title: "Fishville - Foto 8",
            caption: "Photo: Sugarbay Media Team - Fishville.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Fishville/P1000429.JPG?updatedAt=1778532167071",
            sortOrder: 8,
            isCover: false,
          },
          {
            title: "Fishville - Foto 9",
            caption: "Photo: Sugarbay Media Team - Fishville.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Fishville/P1000436.JPG?updatedAt=1778532167031",
            sortOrder: 9,
            isCover: false,
          },
          {
            title: "Fishville - Foto 10",
            caption: "Photo: Sugarbay Media Team - Fishville.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Fishville/P1000418.JPG?updatedAt=1778532167049",
            sortOrder: 10,
            isCover: false,
          },
          {
            title: "Fishville - Foto 11",
            caption: "Photo: Sugarbay Media Team - Fishville.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Fishville/P1000432.JPG?updatedAt=1778532167207",
            sortOrder: 11,
            isCover: false,
          },
          {
            title: "Fishville - Foto 12",
            caption: "Photo: Sugarbay Media Team - Fishville.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Fishville/P1000465.JPG?updatedAt=1778532167006",
            sortOrder: 12,
            isCover: false,
          },
          {
            title: "Fishville - Foto 13",
            caption: "Photo: Sugarbay Media Team - Fishville.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Fishville/P1000441.JPG?updatedAt=1778532166961",
            sortOrder: 13,
            isCover: false,
          },
          {
            title: "Fishville - Foto 14",
            caption: "Photo: Sugarbay Media Team - Fishville.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Fishville/P1000430.JPG?updatedAt=1778532167109",
            sortOrder: 14,
            isCover: false,
          },
          {
            title: "Fishville - Foto 15",
            caption: "Photo: Sugarbay Media Team - Fishville.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Fishville/P1000378.JPG?updatedAt=1778532166901",
            sortOrder: 15,
            isCover: false,
          },
          {
            title: "Fishville - Foto 16",
            caption: "Photo: Sugarbay Media Team - Fishville.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Fishville/P1000408.JPG?updatedAt=1778532167019",
            sortOrder: 16,
            isCover: false,
          },
          {
            title: "Fishville - Foto 17",
            caption: "Photo: Sugarbay Media Team - Fishville.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Fishville/P1000409.JPG?updatedAt=1778532166937",
            sortOrder: 17,
            isCover: false,
          },
          {
            title: "Fishville - Foto 18",
            caption: "Photo: Sugarbay Media Team - Fishville.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Fishville/P1000445.JPG?updatedAt=1778532166815",
            sortOrder: 18,
            isCover: false,
          },
          {
            title: "Fishville - Foto 19",
            caption: "Photo: Sugarbay Media Team - Fishville.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Fishville/P1000411.JPG?updatedAt=1778532166828",
            sortOrder: 19,
            isCover: false,
          },
          {
            title: "Fishville - Foto 20",
            caption: "Photo: Sugarbay Media Team - Fishville.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Fishville/P1000407.JPG?updatedAt=1778532166871",
            sortOrder: 20,
            isCover: false,
          },
          {
            title: "Fishville - Foto 21",
            caption: "Photo: Sugarbay Media Team - Fishville.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Fishville/WhatsApp%20Image%202021-06-10%20at%2014.57.17.jpeg?updatedAt=1778532166666",
            sortOrder: 21,
            isCover: false,
          },
          {
            title: "Fishville - Foto 22",
            caption: "Photo: Sugarbay Media Team - Fishville.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Fishville/toxos%20videoclip22319_websize.jpg?updatedAt=1778532166637",
            sortOrder: 22,
            isCover: false,
          },
          {
            title: "Fishville - Foto 23",
            caption: "Photo: Sugarbay Media Team - Fishville.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Fishville/P1000375.JPG?updatedAt=1778532166625",
            sortOrder: 23,
            isCover: false,
          },
          {
            title: "Fishville - Foto 24",
            caption: "Photo: Sugarbay Media Team - Fishville.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Fishville/toxos%20videoclip22331_websize.jpg?updatedAt=1778532166423",
            sortOrder: 24,
            isCover: false,
          },
          {
            title: "Fishville - Foto 25",
            caption: "Photo: Sugarbay Media Team - Fishville.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Fishville/toxos%20videoclip22317_websize.jpg?updatedAt=1778532166418",
            sortOrder: 25,
            isCover: false,
          },
          {
            title: "Fishville - Foto 26",
            caption: "Photo: Sugarbay Media Team - Fishville.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Fishville/toxos%20videoclip22312_websize.jpg?updatedAt=1778532165160",
            sortOrder: 26,
            isCover: false,
          },
          {
            title: "Fishville - Foto 27",
            caption: "Photo: Sugarbay Media Team - Fishville.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Fishville/toxos%20videoclip22313_websize.jpg?updatedAt=1778532165133",
            sortOrder: 27,
            isCover: false,
          },
          {
            title: "Fishville - Foto 28",
            caption: "Photo: Sugarbay Media Team - Fishville.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Fishville/toxos%20videoclip22318_websize.jpg?updatedAt=1778532165091",
            sortOrder: 28,
            isCover: false,
          },
          {
            title: "Fishville - Foto 29",
            caption: "Photo: Sugarbay Media Team - Fishville.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Fishville/toxos%20videoclip22330_websize.jpg?updatedAt=1778532165003",
            sortOrder: 29,
            isCover: false,
          },
          {
            title: "Fishville - Foto 30",
            caption: "Photo: Sugarbay Media Team - Fishville.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Fishville/toxos%20videoclip22316_websize.jpg?updatedAt=1778532164987",
            sortOrder: 30,
            isCover: false,
          },
          {
            title: "Fishville - Foto 31",
            caption: "Photo: Sugarbay Media Team - Fishville.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Fishville/toxos%20videoclip22314_websize.jpg?updatedAt=1778532165007",
            sortOrder: 31,
            isCover: false,
          },
          {
            title: "Fishville - Foto 32",
            caption: "Photo: Sugarbay Media Team - Fishville.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Fishville/toxos%20videoclip22315_websize.jpg?updatedAt=1778532164984",
            sortOrder: 32,
            isCover: false,
          },
          {
            title: "Fishville - Foto 33",
            caption: "Photo: Sugarbay Media Team - Fishville.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Fishville/toxos%20videoclip22327_websize.jpg?updatedAt=1778532164995",
            sortOrder: 33,
            isCover: false,
          },
          {
            title: "Fishville - Foto 34",
            caption: "Photo: Sugarbay Media Team - Fishville.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Fishville/toxos%20videoclip22326_websize.jpg?updatedAt=1778532165000",
            sortOrder: 34,
            isCover: false,
          },
          {
            title: "Fishville - Foto 35",
            caption: "Photo: Sugarbay Media Team - Fishville.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Fishville/toxos%20videoclip22328_websize.jpg?updatedAt=1778532164954",
            sortOrder: 35,
            isCover: false,
          },
          {
            title: "Fishville - Foto 36",
            caption: "Photo: Sugarbay Media Team - Fishville.",
            imageUrl:
              "https://ik.imagekit.io/gq1enkszp/fotos/media/fotos/Fishville/WhatsApp%20Image%202021-06-10%20at%2013.50.54.jpeg?updatedAt=1778532164749",
            sortOrder: 36,
            isCover: false,
          },
        ],
      },
    },
  });

  await prisma.videoCollection.createMany({
    data: [
      {
        title: "Mitch Bucano and Johnny Funk",
        slug: "mitch-bucano-and-johnny-funk",
        description:
          "Los mejores policias de Crime City tambien patrullan la pista de baile a ritmo de disco, funk y hip hop. Un homenaje musical al mejor cine policiaco de los 80.",
        coverImageUrl: "https://ik.imagekit.io/gq1enkszp/fotos/Tarjetas/cops.png",
        isPublished: true,
        sortOrder: 1,
      },
      {
        title: "Miscelanea",
        slug: "miscelanea",
        description:
          "Videoclips que exploran todas las facetas de Sugarbay: funk, hip hop, disco y nuevos sonidos por descubrir.",
        coverImageUrl: "https://ik.imagekit.io/gq1enkszp/fotos/Tarjetas/miscelanea.png",
        isPublished: true,
        sortOrder: 2,
      },
      {
        title: "Colaboraciones",
        slug: "colaboraciones",
        description:
          "Colaboraciones de Sugarbay con otras figuras de la escena musical, fusionando estilos para crear una experiencia sonora unica.",
        coverImageUrl: "https://ik.imagekit.io/gq1enkszp/fotos/Tarjetas/colabs.png",
        isPublished: true,
        sortOrder: 3,
      },
      {
        title: "Social",
        slug: "social",
        description:
          "Clips cortos, momentos sueltos y pequenas dosis de Sugarbay para redes sociales. Videos rapidos para seguir el ritmo de la banda entre cancion y cancion.",
        coverImageUrl: "https://ik.imagekit.io/gq1enkszp/fotos/Tarjetas/social.png",
        isPublished: true,
        sortOrder: 4,
      },
    ],
  });

  const videoCollections = await prisma.videoCollection.findMany({
    where: {
      slug: {
        in: [
          "mitch-bucano-and-johnny-funk",
          "miscelanea",
          "colaboraciones",
          "social",
        ],
      },
    },
    select: {
      id: true,
      slug: true,
    },
  });

  const collectionBySlug = new Map(videoCollections.map((item) => [item.slug, item.id]));

  await prisma.videoItem.createMany({
    data: [
      {
        videoCollectionId: collectionBySlug.get("mitch-bucano-and-johnny-funk")!,
        title: "Video 1",
        slug: "mitch-bucano-and-johnny-funk-video-1",
        platform: "YOUTUBE",
        videoUrl: "https://www.youtube.com/watch?v=F6yjN9jayLE",
        sortOrder: 1,
      },
      {
        videoCollectionId: collectionBySlug.get("mitch-bucano-and-johnny-funk")!,
        title: "Video 2",
        slug: "mitch-bucano-and-johnny-funk-video-2",
        platform: "YOUTUBE",
        videoUrl: "https://www.youtube.com/watch?v=gF6VhzT3DxQ",
        sortOrder: 2,
      },
      {
        videoCollectionId: collectionBySlug.get("mitch-bucano-and-johnny-funk")!,
        title: "Video 3",
        slug: "mitch-bucano-and-johnny-funk-video-3",
        platform: "YOUTUBE",
        videoUrl: "https://www.youtube.com/watch?v=rVa1pYE8W2g",
        sortOrder: 3,
      },
      {
        videoCollectionId: collectionBySlug.get("miscelanea")!,
        title: "Video 1",
        slug: "miscelanea-video-1",
        platform: "YOUTUBE",
        videoUrl: "https://www.youtube.com/watch?v=0AulJXgZSQM",
        sortOrder: 1,
      },
      {
        videoCollectionId: collectionBySlug.get("miscelanea")!,
        title: "Video 2",
        slug: "miscelanea-video-2",
        platform: "YOUTUBE",
        videoUrl: "https://www.youtube.com/watch?v=lSODxFDdUow",
        sortOrder: 2,
      },
      {
        videoCollectionId: collectionBySlug.get("miscelanea")!,
        title: "Video 3",
        slug: "miscelanea-video-3",
        platform: "YOUTUBE",
        videoUrl: "https://www.youtube.com/watch?v=YdUJrRBB3F8",
        sortOrder: 3,
      },
      {
        videoCollectionId: collectionBySlug.get("miscelanea")!,
        title: "Video 4",
        slug: "miscelanea-video-4",
        platform: "YOUTUBE",
        videoUrl: "https://www.youtube.com/watch?v=-dHxKmd00CY",
        sortOrder: 4,
      },
      {
        videoCollectionId: collectionBySlug.get("miscelanea")!,
        title: "Video 5",
        slug: "miscelanea-video-5",
        platform: "YOUTUBE",
        videoUrl: "https://www.youtube.com/watch?v=_tiiEzYHeGc",
        sortOrder: 5,
      },
      {
        videoCollectionId: collectionBySlug.get("colaboraciones")!,
        title: "Video 1",
        slug: "colaboraciones-video-1",
        platform: "YOUTUBE",
        videoUrl: "https://www.youtube.com/watch?v=tnNrKcXmKM8",
        sortOrder: 1,
      },
      {
        videoCollectionId: collectionBySlug.get("colaboraciones")!,
        title: "Video 2",
        slug: "colaboraciones-video-2",
        platform: "YOUTUBE",
        videoUrl: "https://www.youtube.com/watch?v=1Db7ZAQC7LQ",
        sortOrder: 2,
      },
      {
        videoCollectionId: collectionBySlug.get("social")!,
        title: "Video 1",
        slug: "social-video-1",
        platform: "YOUTUBE",
        videoUrl: "https://www.youtube.com/watch?v=RPKINeZww8c",
        sortOrder: 1,
      },
      {
        videoCollectionId: collectionBySlug.get("social")!,
        title: "YouTube Short 1",
        slug: "social-short-1",
        platform: "YOUTUBE",
        videoUrl: "https://www.youtube.com/shorts/TneUdef23Qc",
        sortOrder: 2,
      },
      {
        videoCollectionId: collectionBySlug.get("social")!,
        title: "YouTube Short 2",
        slug: "social-short-2",
        platform: "YOUTUBE",
        videoUrl: "https://www.youtube.com/shorts/NAzl5nh5nkg",
        sortOrder: 3,
      },
    ],
  });

  console.log("Seed completado con datos demo minimos y funcionales.");
  console.log("Usuario demo: fan@sugarbaymusic.com");
  console.log("Contrasena demo: Sugarbay123!");
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
