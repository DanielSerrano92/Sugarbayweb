"use client";

import Image from "next/image";
import { useState } from "react";

import AppModal from "@/components/ui/app-modal";
import { resolveImageUrl } from "@/lib/services/imagekit";

type BandBioModalKey = "biography" | "members" | null;

type BiographySection = {
  id: string;
  label: string;
  title: string;
  imageUrl: string;
  imageAlt: string;
  content: string[];
};

type MemberGroup = "MAIN" | "COLLAB";

type MemberProfile = {
  id: string;
  group: MemberGroup;
  name: string;
  role: string;
  area: string;
  relation: string;
  contribution: string;
  imageUrl: string;
  imageAlt: string;
  content: string[];
};

const BIOGRAPHY_SECTIONS: BiographySection[] = [
  {
    id: "origen-sugarbay",
    label: "Origen de Sugarbay",
    title: "Origen de Sugarbay",
    imageUrl: "https://ik.imagekit.io/gq1enkszp/fotos/bio.png?tr=w-1200,h-1200,cm-extract,fo-top",
    imageAlt: "Cabecera retro de biografia oficial de Sugarbay",
    content: [
      "Sugarbay nace como una iniciativa artistica concebida para unir musica y narrativa visual en una misma experiencia. El proyecto aparece en un entorno creativo marcado por la cultura nocturna, la pasion por el sonido analogico y la influencia de la iconografia digital de los noventa.",
      "Desde su etapa inicial, la banda planteo una hoja de ruta clara: crear canciones con identidad propia y, al mismo tiempo, construir un universo estetico reconocible. Esa base permitio definir una propuesta que combina energia escenica, memoria retro y una lectura contemporanea del pop electronico.",
      "El origen de Sugarbay no se resume en un unico lanzamiento, sino en una vision de largo recorrido. Cada pieza publicada forma parte de una arquitectura creativa que da continuidad a su relato musical y fortalece la personalidad del grupo.",
    ],
  },
  {
    id: "primeras-influencias",
    label: "Primeras influencias",
    title: "Primeras influencias",
    imageUrl: "https://ik.imagekit.io/gq1enkszp/fotos/canciones.png?tr=w-1100,h-1100,cm-extract,fo-top",
    imageAlt: "Entorno musical con referencias disco, funk y synthwave",
    content: [
      "Las primeras referencias de Sugarbay parten del cruce entre disco clasico, funk de groove marcado y sintetizadores inspirados en el synthwave. A esa base se suman patrones ritmicos de la musica ochentera y una atencion especial por el detalle melodico.",
      "Tambien resultan claves los codigos culturales vinculados al formato VHS, a los videoclips de alto contraste cromatico y a la estetica de club nocturno. Estas influencias no se usan como cita literal, sino como material para desarrollar un lenguaje propio.",
      "La combinacion de estas fuentes dio forma a un estilo reconocible desde el inicio: canciones con pulso dinamico, atmosfera retro y un enfoque de produccion que equilibra nostalgia y pegada moderna.",
    ],
  },
  {
    id: "evolucion-musical",
    label: "Evolucion musical",
    title: "Evolucion musical",
    imageUrl: "https://ik.imagekit.io/gq1enkszp/fotos/album.png",
    imageAlt: "Portada musical de Sugarbay con elementos sinteticos",
    content: [
      "A medida que avanza su trayectoria, Sugarbay amplia su paleta sonora sin perder su nucleo identitario. El bajo con groove sigue ocupando un lugar central, mientras la banda incorpora capas de sintetizador mas elaboradas y arreglos ritmicos con mayor contraste dinamico.",
      "La evolucion tambien se percibe en el trabajo de guitarras funk, baterias con pulso disco y texturas electronicas tratadas con precision contemporanea. El resultado es un sonido mas robusto, capaz de convivir entre la escucha detallada y la inmediatez del directo.",
      "Este proceso de crecimiento no implica ruptura, sino refinamiento. Sugarbay mantiene sus raices retro y las proyecta hacia una produccion actual, consiguiendo una firma sonora coherente en cada etapa del proyecto.",
    ],
  },
  {
    id: "identidad-visual",
    label: "Identidad visual",
    title: "Identidad visual",
    imageUrl: "https://ik.imagekit.io/gq1enkszp/fotos/home.png?tr=w-1200,h-1200,cm-extract,fo-top",
    imageAlt: "Paisaje neon retrofuturista asociado a la marca visual de Sugarbay",
    content: [
      "La identidad visual de Sugarbay articula una estetica retrofuturista basada en neon magenta, morado profundo y azul electrico. Este sistema cromatico se complementa con texturas VHS, brillos difusos y composiciones que evocan interfaces de entorno Windows 90.",
      "Palmeras, atardeceres sinteticos y arquitectura urbana nocturna se convierten en elementos recurrentes de su iconografia. En conjunto, estos recursos crean continuidad entre portadas, noticias, videos y material promocional de la banda.",
      "La imagen no actua como ornamento aislado, sino como parte del discurso artistico. Cada decision visual acompana la narrativa musical y refuerza una personalidad estetica reconocible dentro del panorama retro y vaporwave.",
    ],
  },
  {
    id: "concepto-narrativo",
    label: "Concepto narrativo",
    title: "Concepto narrativo",
    imageUrl: "https://ik.imagekit.io/gq1enkszp/fotos/noticia.png",
    imageAlt: "Panel narrativo de lanzamiento dentro del universo de Sugarbay",
    content: [
      "Sugarbay se plantea como un universo narrativo en expansion y no unicamente como un catalogo de canciones. Cada lanzamiento se concibe como una escena dentro de una historia mayor, con personajes, contextos visuales y una progresion tonal definida.",
      "Este enfoque permite conectar noticias, piezas audiovisuales, directos y publicaciones especiales dentro de una misma linea argumental. El publico no solo escucha temas individuales, sino que interpreta una narrativa que evoluciona en paralelo a la musica.",
      "La coherencia de este concepto narrativo es uno de los rasgos distintivos del proyecto. Gracias a el, Sugarbay construye una experiencia inmersiva que combina relato, estetica y presencia escenica.",
    ],
  },
  {
    id: "lanzamientos-destacados",
    label: "Lanzamientos destacados",
    title: "Lanzamientos destacados",
    imageUrl: "https://ik.imagekit.io/gq1enkszp/fotos/noticia-2.png",
    imageAlt: "Anuncio de estreno musical de Sugarbay con enfoque promocional",
    content: [
      "La trayectoria reciente de Sugarbay se caracteriza por una estrategia de lanzamientos escalonados que combina singles, teaser videos y contenido promocional de alto impacto visual. Este modelo mantiene activa la conversacion con la audiencia y amplifica cada estreno.",
      "Piezas como Midnight Frequency consolidan la linea sonora del proyecto, mientras propuestas como Discomaniacs amplian su alcance narrativo y estetico en colaboracion con nuevos perfiles artisticos.",
      "La planificacion de cada lanzamiento se trabaja como un evento completo: anuncio, identidad grafica, activacion en noticias y presencia en el ecosistema multimedia de la banda.",
    ],
  },
  {
    id: "directos-escenario",
    label: "Directos y escenario",
    title: "Directos y escenario",
    imageUrl:
      "https://ik.imagekit.io/gq1enkszp/fotos/proximos-conciertos.png?tr=w-1300,h-1300,cm-extract,fo-top",
    imageAlt: "Escena de concierto con iluminacion retro y energia de directo",
    content: [
      "El directo de Sugarbay se disena como una experiencia audiovisual integral donde musica, visuales y transiciones escenicas comparten una misma dramaturgia. La banda estructura sus actuaciones para generar recorrido emocional y mantener una energia sostenida.",
      "La iluminacion retro, los recursos de escenario y la lectura cinematografica de los cambios de bloque contribuyen a una atmosfera inmersiva. Esta puesta en escena permite que cada cancion gane una dimension distinta respecto a su version de estudio.",
      "La conexion con el publico es un eje central de la experiencia en vivo. Sugarbay prioriza la cercania, la interaccion y la intensidad interpretativa para convertir cada concierto en una extension organica de su universo creativo.",
    ],
  },
  {
    id: "colaboraciones",
    label: "Colaboraciones",
    title: "Colaboraciones",
    imageUrl: "https://ik.imagekit.io/gq1enkszp/fotos/videos.png?tr=w-1100,h-1100,cm-extract,fo-top",
    imageAlt: "Escena audiovisual representando colaboraciones musicales de Sugarbay",
    content: [
      "Las colaboraciones forman parte estructural de la propuesta de Sugarbay y funcionan como via de expansion sonora y narrativa. Integrar nuevas voces y perfiles creativos permite explorar registros diferentes sin perder la coherencia del proyecto.",
      "En el ecosistema de la banda destacan nombres y alianzas presentes en su propio universo, como OS TOXOS DA RUE, Wazoo, Mitch Bucano y Johnny Funk, que aportan matices tanto en produccion como en identidad escenica.",
      "Cada colaboracion se aborda como una construccion conjunta, no como un recurso puntual. Esta metodologia fortalece la evolucion artistica de Sugarbay y amplia su capacidad de dialogo con audiencias diversas.",
    ],
  },
  {
    id: "comunidad-fanclub",
    label: "Comunidad y fanclub",
    title: "Comunidad y fanclub",
    imageUrl: "https://ik.imagekit.io/gq1enkszp/fotos/fanclub.png?tr=w-1200,h-1200,cm-extract,fo-top",
    imageAlt: "Espacio digital de comunidad y fanclub de Sugarbay",
    content: [
      "La comunidad de Sugarbay participa de forma activa en la vida del proyecto a traves de noticias, avances, actividades y contenidos especiales. Esta relacion continua convierte a la audiencia en parte del proceso creativo y comunicativo.",
      "El fanclub cumple una funcion clave como nucleo de participacion, con acceso a dinamicas de lanzamiento, material exclusivo y acciones que refuerzan el sentimiento de pertenencia en torno a la banda.",
      "Gracias a esta base comunitaria, Sugarbay mantiene un canal de retroalimentacion constante que favorece la evolucion del proyecto y consolida una identidad cercana, participativa y sostenida en el tiempo.",
    ],
  },
  {
    id: "etapa-actual",
    label: "Etapa actual",
    title: "Etapa actual",
    imageUrl: "https://ik.imagekit.io/gq1enkszp/fotos/noticias.png?tr=w-1200,h-1200,cm-extract,fo-top",
    imageAlt: "Estado actual de noticias y novedades del proyecto Sugarbay",
    content: [
      "En su etapa actual, Sugarbay articula de forma coordinada lanzamientos musicales, actualizaciones en la seccion de noticias, preparacion de directos y desarrollo de piezas audiovisuales. El proyecto opera como una plataforma creativa activa y en constante renovacion.",
      "La web de la banda refleja este momento de expansion con contenido distribuido en musica, noticias, conciertos y media, permitiendo que cada area alimente la narrativa general del universo Sugarbay.",
      "El objetivo inmediato es sostener este crecimiento con una linea artistica estable: nuevas canciones, mas colaboraciones y una evolucion visual coherente que preserve la esencia retro del proyecto mientras amplifica su alcance.",
    ],
  },
];

const DEFAULT_BIOGRAPHY_SECTION_ID = BIOGRAPHY_SECTIONS[0]?.id ?? "";
const MEMBER_GROUP_LABEL: Record<MemberGroup, string> = {
  MAIN: "Miembros principales",
  COLLAB: "Colaboradores",
};

const MEMBER_PROFILES: MemberProfile[] = [
  {
    id: "johnny-funk",
    group: "MAIN",
    name: "Johnny Funk",
    role: "Voz principal, guitarra funk y direccion musical",
    area: "Musica y direccion escenica",
    relation: "Miembro principal del nucleo Sugarbay",
    contribution: "Pulso funk, liderazgo creativo y energia en directo",
    imageUrl: "https://ik.imagekit.io/gq1enkszp/fotos/noticia.png",
    imageAlt: "Johnny Funk en una escena neon del universo Sugarbay",
    content: [
      "Johnny Funk actua como uno de los motores artisticos de Sugarbay. Su enfoque combina interpretacion vocal con una lectura ritmica de la guitarra orientada al groove y a la dinamica de escenario.",
      "En el estudio participa en la definicion del tono general de las canciones, priorizando estribillos con identidad y estructuras que funcionen tanto en escucha individual como en directo.",
      "Su presencia escenica conecta de manera inmediata con el publico y ayuda a trasladar la narrativa retro del proyecto a un formato vivo, energetico y reconocible.",
    ],
  },
  {
    id: "mitch-bucano",
    group: "MAIN",
    name: "Mitch Bucano",
    role: "Produccion, sintetizadores y concepto sonoro",
    area: "Produccion y arquitectura musical",
    relation: "Miembro principal en la evolucion sonora",
    contribution: "Diseno synthwave, texturas retro y cohesion de mezcla",
    imageUrl: "https://ik.imagekit.io/gq1enkszp/fotos/cancion.png",
    imageAlt: "Mitch Bucano representado con visuales de sintetizador",
    content: [
      "Mitch Bucano dirige gran parte del trabajo de produccion y construccion de atmosferas dentro de Sugarbay. Su aportacion se centra en sintetizadores, capas armonicas y recursos electronicos con estetica ochentera.",
      "Tambien interviene en la seleccion timbrica y en la organizacion de arreglos para mantener una identidad sonora consistente entre lanzamientos, teasers y versiones de directo.",
      "Gracias a su criterio tecnico y creativo, el proyecto conserva una mezcla equilibrada entre nostalgia analogica y acabado contemporaneo.",
    ],
  },
  {
    id: "wazoo",
    group: "MAIN",
    name: "Wazoo",
    role: "Colaboracion vocal, arreglos y presencia creativa",
    area: "Voces, arreglos y dinamica interpretativa",
    relation: "Figura estable en la expansion creativa de la banda",
    contribution: "Matices vocales y refuerzo de personalidad musical",
    imageUrl: "https://ik.imagekit.io/gq1enkszp/fotos/album.png",
    imageAlt: "Wazoo asociado a una portada musical retro de Sugarbay",
    content: [
      "Wazoo aporta versatilidad vocal y sensibilidad para los arreglos, especialmente en pasajes donde Sugarbay busca contrastar energia ritmica con capas melodicas mas atmosfericas.",
      "Su colaboracion ayuda a ampliar el registro expresivo de la banda y a consolidar una identidad que combina impacto comercial con un relato sonoro cuidado.",
      "En escena, su presencia complementa al nucleo principal y refuerza la sensacion de banda expandida, cohesionada y orientada a la experiencia colectiva.",
    ],
  },
  {
    id: "toxos-da-rue",
    group: "COLLAB",
    name: "Toxos da Rue",
    role: "Colaboradores musicales y energia de directo",
    area: "Colaboraciones y atmosfera de banda",
    relation: "Aliados recurrentes del universo Sugarbay",
    contribution: "Intensidad interpretativa y expansion del repertorio",
    imageUrl: "https://ik.imagekit.io/gq1enkszp/fotos/videos.png?tr=w-1100,h-1100,cm-extract,fo-top",
    imageAlt: "Toxos da Rue en una escena audiovisual vinculada a Sugarbay",
    content: [
      "Toxos da Rue se integra como colaborador clave en proyectos donde Sugarbay busca ampliar su dimension colectiva y su impacto en vivo.",
      "Su aportacion fortalece la energia de conjunto, tanto en piezas de estudio como en contextos escenicos donde la interaccion entre perfiles artisticos resulta central.",
      "Esta colaboracion consolida un puente entre el nucleo de la banda y otras sensibilidades musicales compatibles con su estetica retro-funk.",
    ],
  },
  {
    id: "borja",
    group: "COLLAB",
    name: "Borja",
    role: "Apoyo creativo y produccion visual",
    area: "Visual, narrativa y contenido promocional",
    relation: "Colaborador en construccion de imagen de proyecto",
    contribution: "Coherencia grafica y desarrollo de piezas visuales",
    imageUrl: "https://ik.imagekit.io/gq1enkszp/fotos/home.png?tr=w-1200,h-1200,cm-extract,fo-top",
    imageAlt: "Borja vinculado al entorno visual neon de Sugarbay",
    content: [
      "Borja participa en el desarrollo visual del universo Sugarbay, colaborando en decisiones de direccion artistica para piezas promocionales, anuncios y material digital.",
      "Su trabajo contribuye a mantener una linea grafica consistente entre musica, noticias y presencia en medios, reforzando la identidad retro del proyecto.",
      "La articulacion entre sonido e imagen gana solidez gracias a su participacion en procesos creativos transversales.",
    ],
  },
  {
    id: "martin",
    group: "COLLAB",
    name: "Martin",
    role: "Apoyo tecnico, sonido y directo",
    area: "Tecnica de escenario y soporte de produccion",
    relation: "Colaborador operativo en directos y sesiones",
    contribution: "Estabilidad tecnica y calidad sonora en ejecucion",
    imageUrl:
      "https://ik.imagekit.io/gq1enkszp/fotos/proximos-conciertos.png?tr=w-1300,h-1300,cm-extract,fo-top",
    imageAlt: "Martin representado en un contexto tecnico de concierto",
    content: [
      "Martin se encarga de tareas tecnicas vinculadas al sonido y al montaje de directo, garantizando que la propuesta artistica de Sugarbay se traduzca con fidelidad en escenario.",
      "Su aportacion incluye soporte de preparacion, coordinacion tecnica y control operativo en actuaciones y sesiones especiales.",
      "Este perfil asegura continuidad entre la intencion de produccion y el resultado final percibido por el publico.",
    ],
  },
  {
    id: "garrido",
    group: "COLLAB",
    name: "Garrido",
    role: "Diseno, comunicacion y contenido",
    area: "Comunicacion visual y materiales editoriales",
    relation: "Colaborador en identidad publica de la banda",
    contribution: "Mensajes, piezas graficas y consistencia de marca",
    imageUrl: "https://ik.imagekit.io/gq1enkszp/fotos/noticia-2.png",
    imageAlt: "Garrido en una composicion grafica promocional de Sugarbay",
    content: [
      "Garrido desarrolla contenido y recursos de comunicacion que ayudan a traducir la narrativa de Sugarbay en formatos claros para su audiencia.",
      "Su labor combina diseno y enfoque editorial para alinear noticias, campanas y materiales de apoyo con la identidad retro del proyecto.",
      "Con ello, contribuye a una presencia publica mas cohesionada, reconocible y eficaz en la relacion diaria con la comunidad.",
    ],
  },
];

const DEFAULT_MEMBER_PROFILE_ID =
  MEMBER_PROFILES.find((profile) => profile.group === "MAIN")?.id ?? MEMBER_PROFILES[0]?.id ?? "";

type FolderLauncherProps = {
  label: string;
  ariaLabel: string;
  onOpen: () => void;
};

function FolderLauncher({ label, ariaLabel, onOpen }: FolderLauncherProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="retro-folder-button group mx-auto flex w-full max-w-[17rem] flex-col items-center justify-start gap-[1.35rem] px-2 pb-2 pt-6 text-center sm:gap-[1.55rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/85 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1b1538]"
      aria-label={ariaLabel}
    >
      <span
        className="retro-folder-icon pointer-events-none origin-bottom scale-[3.35] drop-shadow-[0_0_12px_rgba(255,95,225,0.34)] transition-transform duration-150 group-hover:scale-[3.38] sm:scale-[3.75] sm:group-hover:scale-[3.78]"
        aria-hidden="true"
      />
      <span className="relative z-10 font-retro-pixel text-[0.9rem] font-black uppercase tracking-[0.08em] text-[#f5f2ff] [text-shadow:0_0_8px_rgba(96,223,255,0.35),0_0_10px_rgba(255,101,225,0.28)] sm:text-[1rem]">
        {label}
      </span>
    </button>
  );
}

export default function BandBioModals() {
  const [openModal, setOpenModal] = useState<BandBioModalKey>(null);
  const [activeBiographySectionId, setActiveBiographySectionId] = useState(
    DEFAULT_BIOGRAPHY_SECTION_ID,
  );
  const [activeMemberProfileId, setActiveMemberProfileId] = useState(DEFAULT_MEMBER_PROFILE_ID);

  const activeBiographySection =
    BIOGRAPHY_SECTIONS.find((section) => section.id === activeBiographySectionId) ??
    BIOGRAPHY_SECTIONS[0];
  const activeMemberProfile =
    MEMBER_PROFILES.find((profile) => profile.id === activeMemberProfileId) ?? MEMBER_PROFILES[0];

  function handleOpenBiographyModal() {
    setActiveBiographySectionId(DEFAULT_BIOGRAPHY_SECTION_ID);
    setOpenModal("biography");
  }

  function handleOpenMembersModal() {
    setActiveMemberProfileId(DEFAULT_MEMBER_PROFILE_ID);
    setOpenModal("members");
  }

  return (
    <>
      <section className="mx-auto mt-20 grid max-w-[58rem] grid-cols-1 justify-items-center gap-14 sm:mt-24 sm:grid-cols-2 sm:gap-24 lg:mt-28 lg:gap-32" aria-label="Accesos de biografia y miembros">
        <FolderLauncher
          label={"BIOGRAF\u00CDA"}
          ariaLabel="Abrir biografia"
          onOpen={handleOpenBiographyModal}
        />
        <FolderLauncher
          label="MIEMBROS"
          ariaLabel="Abrir miembros"
          onOpen={handleOpenMembersModal}
        />
      </section>

      {openModal === "biography" ? (
        <AppModal
          title="Biografia"
          onClose={() => setOpenModal(null)}
          maxWidth="1040px"
          overlayOpacity={0.62}
          variant="win95"
          bodyClassName="retro-bio-read-modal-body p-3 sm:p-4 lg:p-5"
          heightMode="content"
        >
          <div className="retro-bio-read-modal-shell">
            <section className="retro-bio-read-modal-hero">
              <p className="retro-bio-read-modal-kicker">Seccion oficial</p>
              <h3 className="retro-bio-read-modal-title">Historia de Sugarbay</h3>
              <p className="retro-bio-read-modal-subline">
                Biografia musical en formato enciclopedia retro.
              </p>
            </section>

            <section className="grid gap-3 lg:grid-cols-[13.6rem_minmax(0,1fr)] lg:gap-3.5" aria-label="Contenido de biografia">
              <aside className="border-2 border-black bg-[linear-gradient(180deg,#d8d8d8_0%,#cecece_100%)] p-2 shadow-[inset_2px_2px_0_#ffffff,inset_-2px_-2px_0_#808080] sm:p-2.5 lg:sticky lg:top-0 lg:max-h-[30rem] lg:overflow-y-auto lg:pr-2">
                <p className="m-0 font-retro-pixel text-[0.58rem] font-black uppercase tracking-[0.08em] text-[#3d3d3d]">
                  Secciones
                </p>
                <nav className="mt-2" aria-label="Menu lateral de biografia">
                  <ul className="m-0 flex list-none gap-1.5 overflow-x-auto p-0 pb-1 lg:grid lg:grid-cols-1 lg:gap-1.5 lg:overflow-visible lg:pb-0">
                    {BIOGRAPHY_SECTIONS.map((section) => {
                      const isActive = section.id === activeBiographySection?.id;
                      return (
                        <li key={section.id} className="shrink-0 lg:shrink">
                          <button
                            type="button"
                            onClick={() => setActiveBiographySectionId(section.id)}
                            aria-pressed={isActive}
                            className={[
                              "win-button inline-flex h-[2.1rem] min-w-[10.7rem] items-center justify-start overflow-hidden text-ellipsis whitespace-nowrap px-2.5 py-1 text-left font-retro-pixel text-[0.54rem] font-black uppercase tracking-[0.05em] transition-colors lg:flex lg:w-full lg:min-w-0",
                              isActive
                                ? "bg-[#d6d6d6] text-[#121212] shadow-[inset_-1px_-1px_0_#f8f8f8,inset_1px_1px_0_#7e7e7e]"
                                : "text-black hover:bg-[#dddddd]",
                            ].join(" ")}
                          >
                            {section.label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </aside>

              {activeBiographySection ? (
                <article className="retro-bio-read-modal-block gap-2.5 sm:gap-3" aria-live="polite">
                  <h4 className="m-0 font-retro-ui text-[1.12rem] font-black uppercase leading-[1.12] tracking-[0.02em] text-[#141414] sm:text-[1.28rem]">
                    {activeBiographySection.title}
                  </h4>

                  <div className="grid gap-2.5 after:block after:clear-both after:content-['']">
                    <figure className="m-0 border-2 border-black bg-[linear-gradient(180deg,#dbdbdb_0%,#cecece_100%)] p-1.5 shadow-[inset_1px_1px_0_#ffffff,inset_-1px_-1px_0_#8a8a8a] sm:mx-auto sm:max-w-[14rem] md:float-right md:ml-4 md:mb-2 md:w-[12.25rem] md:max-w-none">
                      <div className="retro-news-image-frame relative aspect-[1/1] w-full overflow-hidden border-2 border-[#8f80d5] bg-[#ececf3]">
                        <Image
                          src={resolveImageUrl(activeBiographySection.imageUrl)}
                          alt={activeBiographySection.imageAlt}
                          fill
                          unoptimized
                          className="object-cover object-top"
                          sizes="(max-width: 768px) 100vw, 13rem"
                        />
                      </div>
                      <figcaption className="mt-1 font-retro-pixel text-[0.5rem] font-black uppercase tracking-[0.06em] text-[#4a4a4a]">
                        Archivo visual - Sugarbay
                      </figcaption>
                    </figure>

                    <div className="grid gap-2.5">
                      {activeBiographySection.content.map((paragraph, index) => (
                        <p key={`${activeBiographySection.id}-paragraph-${index + 1}`} className="retro-bio-read-modal-text">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </article>
              ) : null}
            </section>
          </div>
        </AppModal>
      ) : null}

      {openModal === "members" ? (
        <AppModal
          title="Miembros"
          onClose={() => setOpenModal(null)}
          maxWidth="1040px"
          overlayOpacity={0.62}
          variant="win95"
          bodyClassName="retro-bio-members-modal-body p-3 sm:p-4 lg:p-5"
          heightMode="content"
        >
          <div className="retro-bio-members-modal-shell">
            <section className="retro-bio-members-modal-hero">
              <p className="retro-bio-members-modal-kicker">Seccion oficial</p>
              <h3 className="retro-bio-members-modal-title">Archivo de miembros</h3>
              <p className="retro-bio-members-modal-subline">
                Fichas activas de integrantes y colaboradores de Sugarbay.
              </p>
            </section>

            <section className="grid gap-3 lg:grid-cols-[13.6rem_minmax(0,1fr)] lg:gap-3.5" aria-label="Contenido de miembros">
              <aside className="border-2 border-black bg-[linear-gradient(180deg,#d8d8d8_0%,#cecece_100%)] p-2 shadow-[inset_2px_2px_0_#ffffff,inset_-2px_-2px_0_#808080] sm:p-2.5 lg:sticky lg:top-0 lg:max-h-[30rem] lg:overflow-y-auto lg:pr-2">
                {(["MAIN", "COLLAB"] as const).map((group, groupIndex) => (
                  <section key={group} className={groupIndex > 0 ? "mt-3 border-t border-[#8e8e8e] pt-2.5" : ""}>
                    <p className="m-0 font-retro-pixel text-[0.55rem] font-black uppercase tracking-[0.08em] text-[#3d3d3d]">
                      {MEMBER_GROUP_LABEL[group]}
                    </p>
                    <nav className="mt-1.5" aria-label={`Menu ${MEMBER_GROUP_LABEL[group]}`}>
                      <ul className="m-0 flex list-none gap-1.5 overflow-x-auto p-0 pb-1 lg:grid lg:grid-cols-1 lg:gap-1.5 lg:overflow-visible lg:pb-0">
                        {MEMBER_PROFILES.filter((profile) => profile.group === group).map((profile) => {
                          const isActive = profile.id === activeMemberProfile?.id;
                          return (
                            <li key={profile.id} className="shrink-0 lg:shrink">
                              <button
                                type="button"
                                onClick={() => setActiveMemberProfileId(profile.id)}
                                aria-pressed={isActive}
                                className={[
                                  "win-button inline-flex h-[2.1rem] min-w-[10.7rem] items-center justify-start overflow-hidden text-ellipsis whitespace-nowrap px-2.5 py-1 text-left font-retro-pixel text-[0.54rem] font-black uppercase tracking-[0.05em] transition-colors lg:flex lg:w-full lg:min-w-0",
                                  isActive
                                    ? "bg-[#d6d6d6] text-[#121212] shadow-[inset_-1px_-1px_0_#f8f8f8,inset_1px_1px_0_#7e7e7e]"
                                    : "text-black hover:bg-[#dddddd]",
                                ].join(" ")}
                              >
                                {profile.name}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </nav>
                  </section>
                ))}
              </aside>

              {activeMemberProfile ? (
                <article className="retro-bio-members-modal-block gap-2.5 sm:gap-3" aria-live="polite">
                  <h4 className="m-0 font-retro-ui text-[1.12rem] font-black uppercase leading-[1.12] tracking-[0.02em] text-[#141414] sm:text-[1.28rem]">
                    {activeMemberProfile.name}
                  </h4>
                  <p className="m-0 inline-flex w-fit border border-[#8c8c8c] bg-[linear-gradient(180deg,#e0e0e0_0%,#d2d2d2_100%)] px-2 py-1 font-retro-pixel text-[0.52rem] font-black uppercase tracking-[0.06em] text-[#2c2c2c] shadow-[inset_1px_1px_0_#f4f4f4,inset_-1px_-1px_0_#a8a8a8]">
                    {activeMemberProfile.role}
                  </p>

                  <div className="grid gap-2.5 after:block after:clear-both after:content-['']">
                    <figure className="m-0 border-2 border-black bg-[linear-gradient(180deg,#dbdbdb_0%,#cecece_100%)] p-1.5 shadow-[inset_1px_1px_0_#ffffff,inset_-1px_-1px_0_#8a8a8a] sm:mx-auto sm:max-w-[14rem] md:float-right md:ml-4 md:mb-2 md:w-[12.25rem] md:max-w-none">
                      <div className="retro-news-image-frame relative aspect-[1/1] w-full overflow-hidden border-2 border-[#8f80d5] bg-[#ececf3]">
                        <Image
                          src={resolveImageUrl(activeMemberProfile.imageUrl)}
                          alt={activeMemberProfile.imageAlt}
                          fill
                          unoptimized
                          className="object-cover object-top"
                          sizes="(max-width: 768px) 100vw, 13rem"
                        />
                      </div>
                      <figcaption className="mt-1 font-retro-pixel text-[0.5rem] font-black uppercase tracking-[0.06em] text-[#4a4a4a]">
                        Archivo visual - Sugarbay
                      </figcaption>
                    </figure>

                    <div className="grid gap-2.5">
                      <dl className="m-0 grid gap-1 border border-[#9a9a9a] bg-[linear-gradient(180deg,#dcdcdc_0%,#d1d1d1_100%)] p-2 shadow-[inset_1px_1px_0_#f6f6f6,inset_-1px_-1px_0_#afafaf]">
                        <div className="grid gap-0.5">
                          <dt className="font-retro-pixel text-[0.5rem] font-black uppercase tracking-[0.06em] text-[#484848]">Area</dt>
                          <dd className="m-0 font-retro-ui text-[0.86rem] font-bold text-[#1f1f1f]">{activeMemberProfile.area}</dd>
                        </div>
                        <div className="grid gap-0.5">
                          <dt className="font-retro-pixel text-[0.5rem] font-black uppercase tracking-[0.06em] text-[#484848]">Relacion con Sugarbay</dt>
                          <dd className="m-0 font-retro-ui text-[0.86rem] font-bold text-[#1f1f1f]">{activeMemberProfile.relation}</dd>
                        </div>
                        <div className="grid gap-0.5">
                          <dt className="font-retro-pixel text-[0.5rem] font-black uppercase tracking-[0.06em] text-[#484848]">Aportacion principal</dt>
                          <dd className="m-0 font-retro-ui text-[0.86rem] font-bold text-[#1f1f1f]">{activeMemberProfile.contribution}</dd>
                        </div>
                      </dl>

                      {activeMemberProfile.content.map((paragraph, index) => (
                        <p key={`${activeMemberProfile.id}-paragraph-${index + 1}`} className="retro-bio-read-modal-text">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </article>
              ) : null}
            </section>
          </div>
        </AppModal>
      ) : null}
    </>
  );
}
