/**
 * Service centralisé pour la gestion et l'optimisation des URLs d'images via Cloudinary.
 * Dossier Cloudinary dédié : "lawtan-bio"
 */
export const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/drqsusznh/image/upload/lawtan-bio';

export const CLOUDINARY_IMAGES = {
  // Logos & Emblèmes
  logo: 'https://res.cloudinary.com/drqsusznh/image/upload/v1792806164/lawtan-bio/Logo-blue.png',
  logoOriginal: 'https://res.cloudinary.com/drqsusznh/image/upload/v1792788874/lawtan-bio/Logo.png',
  logoBlue: 'https://res.cloudinary.com/drqsusznh/image/upload/v1792806164/lawtan-bio/Logo-blue.png',
  emblemeSvg: 'https://res.cloudinary.com/drqsusznh/image/upload/v1792788860/lawtan-bio/lawtan-embleme-premium.svg',
  loginBg: 'https://res.cloudinary.com/drqsusznh/image/upload/v1792788872/lawtan-bio/login-bg.png',

  // Produits Laitiers & Élevage
  productLaitFrais: 'https://res.cloudinary.com/drqsusznh/image/upload/v1792788882/lawtan-bio/product-lait-frais.jpg',
  productLaitCaille: 'https://res.cloudinary.com/drqsusznh/image/upload/v1792788880/lawtan-bio/product-lait-caille.jpg',
  productFromage: 'https://res.cloudinary.com/drqsusznh/image/upload/v1792788879/lawtan-bio/product-fromage.jpg',
  productBeurre: 'https://res.cloudinary.com/drqsusznh/image/upload/v1792788877/lawtan-bio/product-beurre.jpg',
  produitsLaitiersFraisFerme: 'https://res.cloudinary.com/drqsusznh/image/upload/v1792788887/lawtan-bio/produits-laitiers-frais-ferme.png',
  laitQuiCoule: 'https://res.cloudinary.com/drqsusznh/image/upload/v1792788859/lawtan-bio/lait-qui-coule.png',
  imageLaitQuiCoule: 'https://res.cloudinary.com/drqsusznh/image/upload/v1792788857/lawtan-bio/imagelaitquicoule.png',

  // Fourrage & Aliment Bétail
  sonDeRiz: 'https://res.cloudinary.com/drqsusznh/image/upload/v1792788895/lawtan-bio/SondeRiz.png',
  paille: 'https://res.cloudinary.com/drqsusznh/image/upload/v1792788875/lawtan-bio/paille.jpg',

  // Ferme, Cheptel, Installations
  vacheHolsteinFerme: 'https://res.cloudinary.com/drqsusznh/image/upload/v1792788901/lawtan-bio/vache-holstein-ferme-moderne.png',
  farmHeroCinematic: 'https://res.cloudinary.com/drqsusznh/image/upload/v1792788854/lawtan-bio/farm-hero-cinematic.jpg',
  traiteLaitFrais: 'https://res.cloudinary.com/drqsusznh/image/upload/v1792788899/lawtan-bio/traite-lait-frais.png',
  sliderCows: 'https://res.cloudinary.com/drqsusznh/image/upload/v1792788889/lawtan-bio/slider-cows.jpg',
  sliderFacility: 'https://res.cloudinary.com/drqsusznh/image/upload/v1792788891/lawtan-bio/slider-facility.jpg',
  sliderProducts: 'https://res.cloudinary.com/drqsusznh/image/upload/v1792788894/lawtan-bio/slider-products.png',
  tracteurParcelles: 'https://res.cloudinary.com/drqsusznh/image/upload/v1792788897/lawtan-bio/tracteur-parcelles.png',

  // Curseur Zébu Bleu
  zebuCurseur128: 'https://res.cloudinary.com/drqsusznh/image/upload/v1792788905/lawtan-bio/zebu-curseur-bleu-128.png',
  zebuCurseur32: 'https://res.cloudinary.com/drqsusznh/image/upload/v1792788906/lawtan-bio/zebu-curseur-bleu-32.png',
  zebuCurseur48: 'https://res.cloudinary.com/drqsusznh/image/upload/v1792788907/lawtan-bio/zebu-curseur-bleu-48.png',
  zebuCurseur64: 'https://res.cloudinary.com/drqsusznh/image/upload/v1792788908/lawtan-bio/zebu-curseur-bleu-64.png'
} as const;

/**
 * Traduit automatiquement un chemin local /images/xxx ou un nom de fichier vers l'URL Cloudinary sécurisée
 */
export function getCloudinaryImageUrl(pathOrFilename: string | null | undefined): string {
  if (!pathOrFilename) return CLOUDINARY_IMAGES.productLaitFrais;
  if (pathOrFilename.startsWith('http://') || pathOrFilename.startsWith('https://')) {
    return pathOrFilename;
  }

  const normalized = pathOrFilename.replace(/^\/?(images\/)?/, '').trim().toLowerCase();

  if (normalized.includes('sonderiz')) return CLOUDINARY_IMAGES.sonDeRiz;
  if (normalized.includes('paille')) return CLOUDINARY_IMAGES.paille;
  if (normalized.includes('logo')) return CLOUDINARY_IMAGES.logo;
  if (normalized.includes('login-bg')) return CLOUDINARY_IMAGES.loginBg;
  if (normalized.includes('product-lait-frais')) return CLOUDINARY_IMAGES.productLaitFrais;
  if (normalized.includes('product-lait-caille')) return CLOUDINARY_IMAGES.productLaitCaille;
  if (normalized.includes('product-fromage')) return CLOUDINARY_IMAGES.productFromage;
  if (normalized.includes('product-beurre')) return CLOUDINARY_IMAGES.productBeurre;
  if (normalized.includes('vacheholstein') || normalized.includes('vache-holstein')) return CLOUDINARY_IMAGES.vacheHolsteinFerme;
  if (normalized.includes('produits-laitiers') || normalized.includes('produits laitiers')) return CLOUDINARY_IMAGES.produitsLaitiersFraisFerme;
  if (normalized.includes('traite-lait-frais')) return CLOUDINARY_IMAGES.traiteLaitFrais;
  if (normalized.includes('imagelaitquicoule') || normalized.includes('lait-qui-coule')) return CLOUDINARY_IMAGES.imageLaitQuiCoule;
  if (normalized.includes('farm-hero-cinematic')) return CLOUDINARY_IMAGES.farmHeroCinematic;

  // Fallback sécurisé vers Cloudinary
  return `https://res.cloudinary.com/drqsusznh/image/upload/f_auto,q_auto/lawtan-bio/${pathOrFilename.replace(/^\/?(images\/)?/, '')}`;
}
