/**
 * Lìonra – CookieConsent
 * TypeScript declarations
 */

export interface CookieConsentOptions {
  /**
   * Nom affiché dans le texte du bandeau (remplace `{company}`).
   * @default document.title
   */
  companyName?: string;

  /** URL de la politique de confidentialité, affichée en lien. @default null */
  privacyPolicyUrl?: string | null;

  /** URL de la politique cookies, affichée en lien. @default null */
  cookiePolicyUrl?: string | null;

  /**
   * Délai (ms) avant l'apparition automatique du bandeau si aucun
   * consentement valide n'est déjà enregistré.
   * @default 600
   */
  delay?: number;

  /**
   * Si `false`, le bandeau n'apparaît jamais automatiquement — utile pour
   * ne l'ouvrir que via un bouton (`trigger`) ou `CookieConsent.open()`.
   * @default true
   */
  autoShow?: boolean;

  /**
   * Si `true` et que le navigateur envoie `Do Not Track: 1`, applique
   * automatiquement un refus des catégories non essentielles sans
   * afficher le bandeau.
   * @default false
   */
  respectDNT?: boolean;

  /**
   * Présentation du bandeau initial.
   * - `'bar'`   : bandeau pleine largeur (haut ou bas)
   * - `'box'`   : carte flottante en coin d'écran
   * - `'modal'` : alias de `'box'`
   * @default 'bar'
   */
  layout?: 'bar' | 'box' | 'modal';

  /**
   * Position du bandeau quand `layout: 'bar'`.
   * @default 'bottom'
   */
  position?: 'bottom' | 'top';

  /** Thème du widget. @default 'auto' (suit `html[data-theme]`) */
  theme?: 'dark' | 'light' | 'auto';

  /** Couleur d'accent (bouton "Tout accepter", switches actifs). @default '#00e676' */
  accent?: string;

  /** Couleur du texte sur la couleur d'accent. @default '#000' */
  accentText?: string;

  /**
   * Langue de l'interface.
   * - `'en'` : anglais (par défaut)
   * - `'fr'` : français
   * - objet  : chaînes personnalisées, fusionnées avec la locale anglaise
   */
  locale?: 'en' | 'fr' | LocaleStrings;

  /**
   * Remplace la liste par défaut des 4 catégories
   * (`necessary`, `preferences`, `analytics`, `marketing`).
   * @default null
   */
  categories?: ConsentCategory[] | null;

  /**
   * Sélecteur CSS du/des bouton(s) permettant de rouvrir le panneau de
   * préférences à tout moment (obligation légale de retrait facile).
   * @default '#btn-cookie-settings'
   */
  trigger?: string;

  /**
   * Affiche une bulle flottante persistante permettant de rouvrir les
   * préférences après la première décision.
   * @default true
   */
  showFloatingButton?: boolean;

  /** Position de la bulle flottante et du bandeau `layout: 'box'`. @default 'bottom-left' */
  floatingPosition?: 'bottom-left' | 'bottom-right';

  /** Clé utilisée dans `localStorage`. @default 'cc-consent' */
  storageKey?: string;

  /**
   * Version du consentement. Incrémentez cette valeur pour forcer tous
   * les visiteurs à re-consentir (ex: changement de politique cookies).
   * @default '1'
   */
  consentVersion?: string | number;

  /** Nombre de jours avant qu'un consentement stocké soit considéré expiré. @default 365 */
  expireDays?: number;

  /** Appelé à chaque sauvegarde de consentement (accept/reject/save). */
  onChange?: (consent: ConsentResult) => void;

  /** Appelé uniquement lors d'un "Tout accepter". */
  onAcceptAll?: (consent: ConsentResult) => void;

  /** Appelé uniquement lors d'un "Tout refuser". */
  onRejectAll?: (consent: ConsentResult) => void;
}

/** Définition d'une catégorie de consentement. */
export interface ConsentCategory {
  /** Identifiant unique, utilisé comme clé dans l'objet de consentement. */
  key: string;
  /**
   * Si `true`, la catégorie est toujours active et non désactivable
   * (typiquement les cookies strictement nécessaires).
   * @default false
   */
  locked?: boolean;
  /** Valeur par défaut proposée avant tout choix explicite. @default false */
  default?: boolean;
  /** Libellé affiché. Si omis, utilise la locale intégrée pour cette clé. */
  label?: string;
  /** Description affichée. Si omis, utilise la locale intégrée pour cette clé. */
  description?: string;
}

/** Résultat renvoyé par les callbacks et `getConsent()`. */
export interface ConsentResult {
  /** État de chaque catégorie (`true` = autorisée). */
  categories: Record<string, boolean>;
  /** Version du consentement au moment de l'enregistrement. */
  version: string | number;
  /** Timestamp (ms) de l'enregistrement. */
  timestamp: number;
}

/** Chaînes traduisibles par catégorie. */
export interface LocaleCategoryEntry {
  label?: string;
  description?: string;
}

/** Ensemble complet des chaînes traduisibles de l'interface. */
export interface LocaleStrings {
  bannerTitle?: string;
  /** Utilise `{company}` comme variable, remplacée par `companyName`. */
  bannerText?: string;
  btnAcceptAll?: string;
  btnRejectAll?: string;
  btnCustomize?: string;
  btnSave?: string;
  panelTitle?: string;
  panelIntro?: string;
  privacyLink?: string;
  cookieLink?: string;
  ariaClose?: string;
  ariaCookie?: string;
  alwaysActive?: string;
  categories?: Record<string, LocaleCategoryEntry>;
}

/** Interface publique de CookieConsent */
export interface CookieConsentInstance {
  /**
   * Initialise le widget : injecte le CSS/HTML, lit le consentement
   * stocké, programme l'affichage automatique du bandeau et lie les
   * boutons `trigger`. Peut être rappelé pour ré-initialiser.
   */
  init(options?: CookieConsentOptions): CookieConsentInstance;

  /** Ouvre le panneau détaillé des préférences. */
  open(): void;

  /** Ferme le panneau détaillé des préférences. */
  close(): void;

  /** Accepte toutes les catégories et enregistre le consentement. */
  acceptAll(): void;

  /** Refuse toutes les catégories non verrouillées et enregistre le consentement. */
  rejectAll(): void;

  /**
   * Enregistre un consentement partiel ou complet.
   * Les catégories omises reprennent leur valeur `default`.
   */
  save(categories: Record<string, boolean>): void;

  /** Retourne le consentement actuellement appliqué, ou `null` si aucun. */
  getConsent(): ConsentResult | null;

  /** Raccourci pour vérifier si une catégorie précise est autorisée. */
  has(categoryKey: string): boolean;

  /** `true` si un consentement valide est actuellement stocké. */
  hasConsented(): boolean;

  /** Efface le consentement stocké et ré-affiche le bandeau (utile pour tester ou pour un lien "Effacer mes préférences"). */
  reset(): void;
}

/** Named export — `import { CookieConsent } from 'lionra-cookieconsent'` */
export declare const CookieConsent: CookieConsentInstance;

/** Default export — `import CookieConsent from 'lionra-cookieconsent'` */
export default CookieConsent;
