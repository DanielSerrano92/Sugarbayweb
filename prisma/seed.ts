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
