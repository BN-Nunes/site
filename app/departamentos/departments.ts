export type Product = {
  id: string;
  sku?: string;
  name: string;
  description: string;
  price: string;
  image: string;
  available: boolean;
};

export type Department = {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  icon: string;
  className: string;
  productTypes: string[];
  products: Product[];
  featured?: boolean;
};

export const departments: Department[] = [
  {
    slug: "baloes",
    name: "Balões",
    shortDescription: "Cores, formatos e efeitos para transformar o ambiente.",
    description: "Encontre balões para pequenos detalhes, arranjos especiais e grandes cenários de festa.",
    icon: "🎈",
    className: "balloons",
    productTypes: ["Balões metalizados", "Balões de látex", "Números e letras"],
    products: [
      { id: "bal-buque-colorido", sku: "BAL-001", name: "Buquê de Balões Coloridos", description: "Composição alegre com balões de látex em cores variadas para aniversários e comemorações.", price: "Preço sob consulta", image: "/products/baloes-buque.jpg", available: true },
      { id: "bal-numeros-metalizados", sku: "BAL-002", name: "Balões Numéricos Metalizados", description: "Conjunto demonstrativo de números metalizados para destacar idades e datas especiais.", price: "Preço sob consulta", image: "/products/baloes-numeros.jpg", available: true },
    ],
  },
  {
    slug: "festas-tematicas",
    name: "Festas temáticas",
    shortDescription: "Temas e acessórios para comemorações com personalidade.",
    description: "Reúna os elementos certos para criar uma comemoração completa, divertida e inesquecível.",
    icon: "🎉",
    className: "themes",
    productTypes: ["Temas infantis", "Datas especiais", "Fantasias e acessórios"],
    products: [
      { id: "tema-unicornio", sku: "TEM-001", name: "Kit Festa Unicórnio", description: "Seleção temática colorida com itens coordenados para uma mesa infantil encantadora.", price: "Preço sob consulta", image: "/products/temas-unicornio.jpg", available: true },
      { id: "tema-dinossauro", sku: "TEM-002", name: "Kit Festa Dinossauros", description: "Artigos temáticos com estampas divertidas para montar uma comemoração jurássica.", price: "Preço sob consulta", image: "/products/temas-dinossauro.jpg", available: true },
    ],
  },
  {
    slug: "confeitaria",
    name: "Confeitaria",
    shortDescription: "Utensílios e detalhes para bolos e doces especiais.",
    description: "Tudo para preparar, decorar e apresentar bolos, doces e outras delícias da sua festa.",
    icon: "🧁",
    className: "bakery",
    productTypes: ["Formas e assadeiras", "Bicos e espátulas", "Toppers e enfeites"],
    products: [
      { id: "conf-kit-decoracao", sku: "CON-001", name: "Kit para Decorar Cupcakes", description: "Bicos, mangas, forminhas e toppers para finalizar cupcakes e doces com criatividade.", price: "Preço sob consulta", image: "/products/confeitaria-decoracao.jpg", available: true },
      { id: "conf-formas-utensilios", sku: "CON-002", name: "Conjunto de Formas e Utensílios", description: "Formas e acessórios essenciais para preparar bolos, cupcakes e outras receitas festivas.", price: "Preço sob consulta", image: "/products/confeitaria-formas.jpg", available: true },
    ],
  },
  {
    slug: "descartaveis",
    name: "Descartáveis",
    shortDescription: "Praticidade e combinações de cores para servir melhor.",
    description: "Copos, pratos, bandejas e acessórios que unem praticidade e beleza à mesa.",
    icon: "🥤",
    className: "disposables",
    productTypes: ["Copos e taças", "Pratos e bandejas", "Talheres e guardanapos"],
    products: [
      { id: "desc-kit-colorido", sku: "DES-001", name: "Kit Descartáveis Coloridos", description: "Pratos, copos, talheres e guardanapos em cores vibrantes para uma mesa descontraída.", price: "Preço sob consulta", image: "/products/descartaveis-coloridos.jpg", available: true },
      { id: "desc-kit-dourado", sku: "DES-002", name: "Kit Descartáveis Dourado e Branco", description: "Composição elegante de descartáveis para celebrações, jantares e ocasiões especiais.", price: "Preço sob consulta", image: "/products/descartaveis-dourados.jpg", available: true },
    ],
  },
  {
    slug: "decoracao",
    name: "Decoração",
    shortDescription: "Peças que transformam o ambiente e completam a festa.",
    description: "Crie cenários marcantes com peças decorativas para mesas, paredes e ambientes completos.",
    icon: "✨",
    className: "decor",
    productTypes: ["Painéis e cortinas", "Enfeites de mesa", "Luminárias e vasos"],
    products: [
      { id: "decor-arco-baloes", sku: "DEC-001", name: "Kit Arco de Balões", description: "Conjunto demonstrativo para criar um arco colorido e valorizar o cenário principal da festa.", price: "Preço sob consulta", image: "/products/decoracao-arco.jpg", available: true },
      { id: "decor-centros-mesa", sku: "DEC-002", name: "Centros de Mesa Festivos", description: "Enfeites coloridos para distribuir pelas mesas e completar a decoração do ambiente.", price: "Preço sob consulta", image: "/products/decoracao-centros.jpg", available: true },
    ],
  },
  {
    slug: "papelaria",
    name: "Papelaria",
    shortDescription: "Convites, embalagens e detalhes personalizados para celebrar.",
    description: "Complete sua comemoração com convites, lembranças, embalagens e artigos de papelaria para cada ocasião.",
    icon: "🎁",
    className: "stationery",
    productTypes: ["Convites e cartões", "Embalagens e lembrancinhas", "Tags e adesivos"],
    products: [
      { id: "pap-sacolas-tags", sku: "PAP-001", name: "Sacolas e Tags para Lembrancinhas", description: "Kit com sacolas coloridas e etiquetas para organizar lembranças e pequenos presentes.", price: "Preço sob consulta", image: "/products/papelaria-sacolas.jpg", available: true },
      { id: "pap-convites-adesivos", sku: "PAP-002", name: "Convites e Adesivos de Festa", description: "Conjunto alegre de convites, cartões e adesivos para personalizar cada detalhe.", price: "Preço sob consulta", image: "/products/papelaria-convites.jpg", available: true },
    ],
    featured: false,
  },
  {
    slug: "ofertas",
    name: "Ofertas",
    shortDescription: "Condições especiais para deixar sua festa completa.",
    description: "Acompanhe produtos selecionados e oportunidades especiais para economizar na comemoração.",
    icon: "%",
    className: "offers",
    productTypes: ["Kits promocionais", "Últimas unidades", "Seleção da semana"],
    products: [
      { id: "oferta-kit-basico", sku: "OFE-001", name: "Combo Festa Colorida", description: "Seleção promocional demonstrativa com itens básicos para montar uma comemoração alegre.", price: "Preço sob consulta", image: "/products/ofertas-kit-basico.jpg", available: true },
      { id: "oferta-kit-premium", sku: "OFE-002", name: "Combo Celebração Completa", description: "Conjunto demonstrativo com decoração e acessórios variados para uma festa mais completa.", price: "Preço sob consulta", image: "/products/ofertas-kit-premium.jpg", available: true },
    ],
  },
];

export function getDepartment(slug: string) {
  return departments.find((department) => department.slug === slug);
}
