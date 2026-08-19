import frameQuadrada from "@/assets/frame-quadrada-preta.png";
import frameAviador from "@/assets/frame-aviador-dourada.png";

export type Finalidade = "solar" | "grau";

export type Frame = {
  id: string;
  nome: string;
  marca: string;
  preco: number;
  estilo: "Clássico" | "Moderno" | "Fashion" | "Esportivo";
  cor: "Preto" | "Dourado" | "Tartaruga" | "Rosé" | "Prata";
  formato: "Quadrado" | "Redondo" | "Aviador" | "Gatinho" | "Hexagonal";
  imagem: string;
  finalidades: Finalidade[];
  material: string;
};

export const frames: Frame[] = [
  {
    id: "quadrada-preta",
    nome: "Ray-ban - JUSTIN CLASSIC",
    marca: "Ray-ban",
    preco: 890,
    estilo: "Moderno",
    cor: "Preto",
    formato: "Quadrado",
    imagem: frameQuadrada,
    finalidades: ["grau", "solar"],
    material: "Nylon",
  },
  {
    id: "aviador-dourada",
    nome: "Ray-ban - AVIATOR GRADIENT",
    marca: "Ray-ban",
    preco: 1050,
    estilo: "Clássico",
    cor: "Dourado",
    formato: "Aviador",
    imagem: frameAviador,
    finalidades: ["grau", "solar"],
    material: "Metal leve",
  }
];

export const estilos = ["Clássico", "Moderno", "Fashion", "Esportivo"] as const;
export const cores = ["Preto", "Dourado", "Tartaruga", "Rosé", "Prata"] as const;
export const formatos = ["Quadrado", "Redondo", "Aviador", "Gatinho", "Hexagonal"] as const;

export type TipoVisao = "simples" | "multifocal";

export type Lente = {
  id: string;
  marca: string;
  nome: string;
  descricao: string;
  preco: number;
  tratamentos: string[];
};

export const lentes: Record<TipoVisao, { marca: string; opcoes: Lente[] }[]> = {
  simples: [
    {
      marca: "Kodak",
      opcoes: [
        {
          id: "kodak-clean",
          marca: "Kodak",
          nome: "Kodak Clean&CleAR",
          descricao: "Antirreflexo de alta transparência para o dia a dia.",
          preco: 289,
          tratamentos: ["Antirreflexo", "Antirrisco"],
        },
        {
          id: "kodak-uvblue",
          marca: "Kodak",
          nome: "Kodak UVBlue",
          descricao: "Filtro de luz azul para quem passa horas em telas.",
          preco: 429,
          tratamentos: ["Filtro azul", "Antirreflexo"],
        },
        {
          id: "kodak-total-blue",
          marca: "Kodak",
          nome: "Kodak Total Blue",
          descricao: "Proteção máxima contra luz azul e UV400.",
          preco: 549,
          tratamentos: ["Filtro azul+", "UV400", "Antirreflexo"],
        },
        {
          id: "kodak-photofusion",
          marca: "Kodak",
          nome: "Kodak PhotoFusion",
          descricao: "Fotossensível: escurece no sol e clareia em ambientes internos.",
          preco: 749,
          tratamentos: ["Fotossensível", "UV400", "Antirreflexo"],
        },
      ],
    },
    {
      marca: "Eyezen",
      opcoes: [
        {
          id: "eyezen-start",
          marca: "Eyezen",
          nome: "Eyezen Start",
          descricao: "Alívio do cansaço visual para uso digital moderado.",
          preco: 469,
          tratamentos: ["Alívio visual", "Antirreflexo"],
        },
        {
          id: "eyezen-boost",
          marca: "Eyezen",
          nome: "Eyezen Boost",
          descricao: "Reforço de foco para leitura de perto e telas pequenas.",
          preco: 629,
          tratamentos: ["Boost de foco", "Filtro azul", "Antirreflexo"],
        },
        {
          id: "eyezen-kids",
          marca: "Eyezen",
          nome: "Eyezen Kids",
          descricao: "Desenvolvida para crianças e adolescentes conectados.",
          preco: 539,
          tratamentos: ["Resistência a impacto", "Filtro azul"],
        },
      ],
    },
  ],
  multifocal: [
    {
      marca: "Kodak",
      opcoes: [
        {
          id: "kodak-precise",
          marca: "Kodak",
          nome: "Kodak Precise",
          descricao: "Entrada em multifocal com adaptação rápida.",
          preco: 899,
          tratamentos: ["Antirreflexo", "Antirrisco"],
        },
        {
          id: "kodak-unique-hd",
          marca: "Kodak",
          nome: "Kodak Unique HD",
          descricao: "Campos de visão amplos com nitidez em alta definição.",
          preco: 1290,
          tratamentos: ["HD", "Antirreflexo"],
        },
        {
          id: "kodak-easy",
          marca: "Kodak",
          nome: "Kodak Easy",
          descricao: "Multifocal digital equilibrada para uso geral.",
          preco: 1090,
          tratamentos: ["Digital", "Antirreflexo"],
        },
        {
          id: "kodak-unique-photofusion",
          marca: "Kodak",
          nome: "Kodak Unique PhotoFusion",
          descricao: "Multifocal HD com tecnologia fotossensível.",
          preco: 1690,
          tratamentos: ["Fotossensível", "HD", "UV400"],
        },
      ],
    },
    {
      marca: "Varilux",
      opcoes: [
        {
          id: "varilux-comfort",
          marca: "Varilux",
          nome: "Varilux Comfort Max",
          descricao: "Conforto de adaptação com visão estável em movimento.",
          preco: 1590,
          tratamentos: ["Antirreflexo", "Antirrisco"],
        },
        {
          id: "varilux-xr",
          marca: "Varilux",
          nome: "Varilux XR Series",
          descricao: "A multifocal mais avançada, com resposta preditiva ao olhar.",
          preco: 2390,
          tratamentos: ["IA de design", "HD", "Antirreflexo"],
        },
      ],
    },
  ],
};

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
