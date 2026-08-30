/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║  Lìonra – CookieConsent  ·  cookieconsent.js               ║
 * ╠═══════════════════════════════════════════════════════════╣
 * ║  Format : Universal UMD                                   ║
 * ║  · <script src="cookieconsent.js"> → window.CookieConsent  ║
 * ║  · require('./cookieconsent.js')    → CommonJS            ║
 * ║  · import CookieConsent from '…'    → ESM default         ║
 * ║  · import { CookieConsent } from '…'→ ESM named           ║
 * ║  · define(['CookieConsent'], fn)    → AMD / RequireJS     ║
 * ╠═══════════════════════════════════════════════════════════╣
 * ║  Minimal usage:                                           ║
 * ║                                                           ║
 * ║    <script src="cookieconsent.js"></script>                ║
 * ║    <script>                                               ║
 * ║    CookieConsent.init({                                    ║
 * ║      companyName : 'Mon Site',                             ║
 * ║      trigger      : '#btn-cookie-settings',                ║
 * ║    });                                                     ║
 * ║    </script>                                               ║
 * ╠═══════════════════════════════════════════════════════════╣
 * ║  Full options (see README.md for the complete list):      ║
 * ║                                                           ║
 * ║  companyName        ''            Used in banner text     ║
 * ║  privacyPolicyUrl   null          Link in banner/panel     ║
 * ║  cookiePolicyUrl    null          Link in banner/panel     ║
 * ║  delay              600           ms before auto-show      ║
 * ║  autoShow           true          auto-display the banner  ║
 * ║  respectDNT         false         auto-reject if DNT=1     ║
 * ║  layout             'bar'         'bar'|'box'|'modal'      ║
 * ║  position           'bottom'      'bottom'|'top'           ║
 * ║                                   (layout 'bar' only)      ║
 * ║  theme              'auto'        'dark'|'light'|'auto'    ║
 * ║  accent             '#00e676'     Accent color             ║
 * ║  accentText         '#000'        Text color on accent     ║
 * ║  locale             'en'          'en'|'fr'|object         ║
 * ║  categories         null          Array to override the    ║
 * ║                                   default 4 categories     ║
 * ║  trigger            '#btn-cookie-settings'                 ║
 * ║                                   Selector(s) always bound ║
 * ║                                   to re-open the panel     ║
 * ║  showFloatingButton true          Persistent reopen bubble ║
 * ║  floatingPosition   'bottom-left' 'bottom-left'|            ║
 * ║                                   'bottom-right'           ║
 * ║  storageKey         'cc-consent'  localStorage key         ║
 * ║  consentVersion     '1'           bump to force re-consent ║
 * ║  expireDays         365           re-ask after N days      ║
 * ║  onChange(consent)  null          fired on every save      ║
 * ║  onAcceptAll(c)     null                                   ║
 * ║  onRejectAll(c)     null                                   ║
 * ╚═══════════════════════════════════════════════════════════╝
 *
 * NOTE : cet outil facilite la mise en conformité technique (bannière,
 * consentement granulaire, retrait possible à tout moment) mais ne
 * constitue pas un avis juridique. Vérifiez les textes et la logique
 * de chargement de vos scripts tiers avec votre conseil (RGPD / ePrivacy).
 */

/* ─── UMD wrapper ────────────────────────────────────────────────────── */
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    var _cc = factory();
    module.exports = _cc;
    module.exports.default = _cc;
    module.exports.CookieConsent = _cc;
  } else if (typeof define === "function" && define.amd) {
    define("CookieConsent", [], factory);
  } else {
    root.CookieConsent = factory();
  }
})(
  typeof globalThis !== "undefined"
    ? globalThis
    : typeof window !== "undefined"
      ? window
      : typeof global !== "undefined"
        ? global
        : this,
  function () {
    "use strict";

    var CookieConsent = (function () {
      /* ── Icons ──────────────────────────────────────── */
      // Fixed warm palette (not theme-dependent) so it always reads as an
      // actual cookie, whatever the accent color or light/dark theme.
      function _cookieSVG(size) {
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9.6" fill="#e0a663"/>
        <circle cx="12" cy="12" r="9.6" fill="#000" fill-opacity=".06"/>
        <circle cx="8.3" cy="9" r="1.3" fill="#6b3f1d"/>
        <circle cx="15.2" cy="8.6" r="1.1" fill="#6b3f1d"/>
        <circle cx="16.2" cy="13.6" r="1.35" fill="#6b3f1d"/>
        <circle cx="10.2" cy="15.3" r="1.15" fill="#6b3f1d"/>
        <circle cx="13.3" cy="11.6" r=".9" fill="#6b3f1d"/>
        <circle cx="7.3" cy="13.4" r=".7" fill="#6b3f1d"/>
      </svg>`;
      }
      const ICON_COOKIE = _cookieSVG(20);

      /* ── Default categories (order matters) ────────── */
      const DEFAULT_CATEGORIES = [
        { key: "necessary", locked: true, default: true },
        { key: "preferences", locked: false, default: false },
        { key: "analytics", locked: false, default: false },
        { key: "marketing", locked: false, default: false },
      ];

      /* ── Locales ────────────────────────────────────── */
      const LOCALES = {
        en: {
          bannerTitle: "We value your privacy",
          bannerText:
            "{company} uses cookies to run the site, measure audience and, with your permission, personalize content. You can accept, reject, or choose per category.",
          btnAcceptAll: "Accept all",
          btnRejectAll: "Reject all",
          btnCustomize: "Customize",
          btnSave: "Save my choices",
          panelTitle: "Cookie preferences",
          panelIntro:
            "Choose which categories of cookies you allow. You can change your mind at any time from this page.",
          privacyLink: "Privacy policy",
          cookieLink: "Cookie policy",
          ariaClose: "Close",
          ariaCookie: "Cookie settings",
          alwaysActive: "Always active",
          categories: {
            necessary: {
              label: "Necessary",
              description:
                "Required for the site to function (navigation, security, load balancing). Cannot be disabled.",
            },
            preferences: {
              label: "Preferences",
              description:
                "Remember your choices (language, region, display) to personalize your visit.",
            },
            analytics: {
              label: "Analytics",
              description:
                "Anonymized statistics to understand how the site is used and improve it.",
            },
            marketing: {
              label: "Marketing",
              description:
                "Used by us and our partners to show relevant ads and measure their performance.",
            },
          },
        },
        fr: {
          bannerTitle: "Le respect de votre vie privée",
          bannerText:
            "{company} utilise des cookies pour faire fonctionner le site, mesurer l'audience et, avec votre accord, personnaliser le contenu. Vous pouvez tout accepter, tout refuser, ou choisir par catégorie.",
          btnAcceptAll: "Tout accepter",
          btnRejectAll: "Tout refuser",
          btnCustomize: "Personnaliser",
          btnSave: "Enregistrer mes choix",
          panelTitle: "Préférences des cookies",
          panelIntro:
            "Choisissez les catégories de cookies que vous autorisez. Vous pouvez changer d'avis à tout moment depuis cette page.",
          privacyLink: "Politique de confidentialité",
          cookieLink: "Politique de cookies",
          ariaClose: "Fermer",
          ariaCookie: "Gérer les cookies",
          alwaysActive: "Toujours actif",
          categories: {
            necessary: {
              label: "Nécessaires",
              description:
                "Indispensables au fonctionnement du site (navigation, sécurité, répartition de charge). Ne peuvent pas être désactivés.",
            },
            preferences: {
              label: "Préférences",
              description:
                "Mémorisent vos choix (langue, région, affichage) pour personnaliser votre visite.",
            },
            analytics: {
              label: "Statistiques",
              description:
                "Statistiques anonymisées pour comprendre l'usage du site et l'améliorer.",
            },
            marketing: {
              label: "Marketing",
              description:
                "Utilisés par nous et nos partenaires pour afficher des publicités pertinentes et en mesurer la performance.",
            },
          },
        },
      };

      /* ── CSS ──────────────────────────────────────────
       * Prefix "cc-" everywhere. Colors driven by CSS vars so the whole
       * widget can be re-themed with 2-3 lines of override CSS.
       * ────────────────────────────────────────────────── */
      const CSS = `
    .cc-root, .cc-root * { box-sizing:border-box; font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; }
    .cc-root {
      --cc-bg:#111318; --cc-bg2:#181b22; --cc-text:#f2f2f4; --cc-muted:rgba(255,255,255,.6);
      --cc-border:rgba(255,255,255,.1); --cc-accent:#00e676; --cc-accent-text:#000;
      --cc-track-off:rgba(255,255,255,.18); --cc-shadow:0 10px 40px rgba(0,0,0,.4);
    }
    .cc-root.cc-light {
      --cc-bg:#ffffff; --cc-bg2:#f5f6f8; --cc-text:#15171c; --cc-muted:rgba(0,0,0,.6);
      --cc-border:rgba(0,0,0,.1); --cc-track-off:rgba(0,0,0,.18);
      --cc-shadow:0 10px 40px rgba(0,0,0,.15);
    }

    /* === BANNER === */
    .cc-banner {
      position:fixed; z-index:99998;
      opacity:0; pointer-events:none; transition:opacity .3s ease, transform .3s ease;
    }
    .cc-banner.cc-show { opacity:1; pointer-events:all; }

    /* Bar & box layouts: the outer .cc-banner element IS the visible card. */
    .cc-banner.cc-layout-bar, .cc-banner.cc-layout-box {
      background:var(--cc-bg); color:var(--cc-text);
      border:1px solid var(--cc-border); box-shadow:var(--cc-shadow);
    }

    /* === LAYOUT : BAR (bandeau pleine largeur) === */
    .cc-banner.cc-layout-bar {
      left:0; right:0; width:100%; border-left:none; border-right:none;
      padding:1rem 1.25rem calc(1rem + env(safe-area-inset-bottom));
    }
    .cc-banner.cc-layout-bar.cc-pos-bottom { bottom:0; border-bottom:none; transform:translateY(12px); }
    .cc-banner.cc-layout-bar.cc-pos-bottom.cc-show { transform:translateY(0); }
    .cc-banner.cc-layout-bar.cc-pos-top { top:0; border-top:none; transform:translateY(-12px); }
    .cc-banner.cc-layout-bar.cc-pos-top.cc-show { transform:translateY(0); }
    .cc-banner.cc-layout-bar .cc-banner-inner {
      max-width:1080px; margin:0 auto; display:flex; align-items:center; gap:1.25rem; flex-wrap:wrap;
    }
    /* Only the bar's row layout needs the paragraph to flex-grow horizontally.
       Applying this same flex-basis in a column layout (box/modal) would force
       a tall min-height and create a large empty gap, so it's scoped here. */
    .cc-banner.cc-layout-bar .cc-banner-text { flex:1 1 320px; min-width:220px; }

    /* === LAYOUT : BOX (petite carte flottante en coin, non bloquante) === */
    .cc-banner.cc-layout-box {
      max-width:360px; bottom:1.1rem; border-radius:16px; padding:1.1rem;
      transform:translateY(12px) scale(.98);
    }
    .cc-banner.cc-layout-box.cc-float-left { left:1.1rem; }
    .cc-banner.cc-layout-box.cc-float-right { right:1.1rem; }
    .cc-banner.cc-layout-box.cc-show { transform:translateY(0) scale(1); }
    .cc-banner.cc-layout-box .cc-banner-inner { display:flex; flex-direction:column; gap:.85rem; }

    /* === LAYOUT : MODAL (dialogue centré, fond assombri, bloquant) === */
    .cc-banner.cc-layout-modal {
      inset:0; display:flex; align-items:center; justify-content:center;
      background:rgba(0,0,0,.55); backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px);
      padding:1rem;
    }
    .cc-banner.cc-layout-modal .cc-banner-inner {
      width:100%; max-width:440px; background:var(--cc-bg); color:var(--cc-text);
      border:1px solid var(--cc-border); border-radius:18px; box-shadow:var(--cc-shadow);
      padding:1.4rem 1.4rem calc(1.4rem + env(safe-area-inset-bottom));
      display:flex; flex-direction:column; gap:1rem;
      transform:scale(.96); transition:transform .28s cubic-bezier(.34,1.56,.64,1);
    }
    .cc-banner.cc-layout-modal.cc-show .cc-banner-inner { transform:scale(1); }

    .cc-banner-head { display:flex; align-items:center; gap:.5rem; }
    .cc-banner-head svg { flex-shrink:0; }
    .cc-banner-title { font-weight:700; font-size:.95rem; margin:0; }
    .cc-banner-text { font-size:.83rem; line-height:1.5; color:var(--cc-muted); margin:0; }
    .cc-banner-text a { color:var(--cc-text); text-decoration:underline; }
    .cc-banner-actions { display:flex; gap:.55rem; flex-wrap:wrap; flex-shrink:0; }
    .cc-layout-box .cc-banner-actions, .cc-layout-modal .cc-banner-actions { flex-direction:column-reverse; }
    .cc-layout-box .cc-banner-actions .cc-btn, .cc-layout-modal .cc-banner-actions .cc-btn { width:100%; }

    /* === BUTTONS === */
    .cc-btn {
      font-size:.82rem; font-weight:600; padding:.6rem 1rem; border-radius:9px;
      cursor:pointer; border:1px solid var(--cc-border); background:transparent; color:var(--cc-text);
      transition:background .15s,border-color .15s,color .15s,transform .1s; white-space:nowrap;
    }
    .cc-btn:hover { background:rgba(255,255,255,.06); }
    .cc-root.cc-light .cc-btn:hover { background:rgba(0,0,0,.05); }
    .cc-btn:active { transform:scale(.96); }
    .cc-btn.cc-btn-primary { background:var(--cc-accent); color:var(--cc-accent-text); border-color:var(--cc-accent); }
    .cc-btn.cc-btn-primary:hover { filter:brightness(1.08); }
    .cc-btn.cc-btn-ghost { border-color:transparent; color:var(--cc-muted); }
    /* Outline style: same visual weight as the other two buttons, so "Save my
       choices" doesn't disappear next to "Accept all" — customizable via
       config.saveButtonStyle ('outline' | 'solid' | 'ghost'). */
    .cc-btn.cc-btn-outline { border-color:var(--cc-accent); color:var(--cc-accent); background:transparent; font-weight:700; }
    .cc-btn.cc-btn-outline:hover { background:var(--cc-accent); color:var(--cc-accent-text); }

    /* === OVERLAY + PANEL (preferences) === */
    .cc-overlay {
      position:fixed; inset:0; z-index:99999; background:rgba(0,0,0,.55);
      backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px);
      display:flex; align-items:center; justify-content:center; padding:1rem;
      opacity:0; pointer-events:none; transition:opacity .25s ease;
    }
    .cc-overlay.cc-open { opacity:1; pointer-events:all; }
    .cc-panel {
      width:100%; max-width:480px; max-height:min(640px,86vh); background:var(--cc-bg); color:var(--cc-text);
      border:1px solid var(--cc-border); border-radius:18px; box-shadow:var(--cc-shadow);
      display:flex; flex-direction:column; overflow:hidden;
      transform:translateY(16px) scale(.97); transition:transform .28s cubic-bezier(.34,1.56,.64,1);
    }
    .cc-overlay.cc-open .cc-panel { transform:translateY(0) scale(1); }
    .cc-panel-header {
      display:flex; align-items:center; justify-content:space-between; gap:.75rem;
      padding:1.1rem 1.25rem .85rem; border-bottom:1px solid var(--cc-border); flex-shrink:0;
    }
    .cc-panel-header h2 { font-size:1.02rem; margin:0; font-weight:700; }
    .cc-panel-close {
      width:30px; height:30px; border-radius:50%; border:none; cursor:pointer; flex-shrink:0;
      background:var(--cc-border); color:var(--cc-text);
      display:flex; align-items:center; justify-content:center; transition:background .15s;
    }
    .cc-panel-close-x {
      font-size:20px; font-weight:700; line-height:1; color:inherit;
      transform:translateY(-1.5px); /* optically center the × glyph */
      user-select:none;
    }
    .cc-panel-close:hover { background:rgba(255,255,255,.18); }
    .cc-root.cc-light .cc-panel-close:hover { background:rgba(0,0,0,.12); }
    .cc-panel-intro { font-size:.82rem; line-height:1.5; color:var(--cc-muted); margin:.9rem 1.25rem 0; }
    .cc-panel-intro a { color:var(--cc-text); text-decoration:underline; }
    .cc-panel-body { overflow-y:auto; padding:.5rem 1.25rem 1rem; flex:1 1 auto; }
    .cc-row { padding:.9rem 0; border-bottom:1px solid var(--cc-border); }
    .cc-row:last-child { border-bottom:none; }
    .cc-row-head { display:flex; align-items:center; justify-content:space-between; gap:1rem; }
    .cc-row-label { font-weight:600; font-size:.9rem; }
    .cc-row-desc { font-size:.79rem; line-height:1.5; color:var(--cc-muted); margin:.35rem 0 0; }
    .cc-badge {
      font-size:.66rem; font-weight:700; text-transform:uppercase; letter-spacing:.03em;
      color:var(--cc-muted); background:var(--cc-bg2); border:1px solid var(--cc-border);
      padding:.28rem .55rem; border-radius:20px; flex-shrink:0;
    }

    /* Toggle switch */
    .cc-switch { position:relative; display:inline-block; width:40px; height:23px; flex-shrink:0; }
    .cc-switch input { opacity:0; width:0; height:0; position:absolute; }
    .cc-slider {
      position:absolute; inset:0; background:var(--cc-track-off); border-radius:999px; cursor:pointer;
      transition:background .18s;
    }
    .cc-slider::before {
      content:''; position:absolute; width:17px; height:17px; left:3px; top:3px;
      background:#fff; border-radius:50%; transition:transform .18s;
      box-shadow:0 1px 3px rgba(0,0,0,.3);
    }
    .cc-switch input:checked + .cc-slider { background:var(--cc-accent); }
    .cc-switch input:checked + .cc-slider::before { transform:translateX(17px); }
    .cc-switch input:disabled + .cc-slider { opacity:.5; cursor:not-allowed; }
    .cc-switch input:focus-visible + .cc-slider { outline:2px solid var(--cc-accent); outline-offset:2px; }

    .cc-panel-footer {
      display:flex; gap:.6rem; padding:1rem 1.25rem calc(1rem + env(safe-area-inset-bottom));
      border-top:1px solid var(--cc-border); flex-wrap:wrap; flex-shrink:0;
    }
    .cc-panel-footer .cc-btn { flex:1 1 auto; }

    /* === FLOATING REOPEN BUBBLE === */
    .cc-float-btn {
      position:fixed; z-index:99997; bottom:1.2rem; width:54px; height:54px; border-radius:50%;
      background:var(--cc-bg); border:1px solid var(--cc-border);
      box-shadow:var(--cc-shadow); display:flex; align-items:center; justify-content:center;
      cursor:pointer; opacity:0; transform:scale(.7); pointer-events:none;
      transition:opacity .2s,transform .2s,background .15s;
      padding:0;
    }
    .cc-float-btn svg { width:30px; height:30px; }
    .cc-float-btn.cc-visible { opacity:1; transform:scale(1); pointer-events:all; }
    .cc-float-btn:hover { background:var(--cc-bg2); transform:scale(1.06); }
    .cc-float-btn.cc-float-left { left:1.2rem; }
    .cc-float-btn.cc-float-right { right:1.2rem; }

    @media (max-width:520px) {
      .cc-banner.cc-layout-bar .cc-banner-inner { flex-direction:column; align-items:stretch; }
      .cc-banner.cc-layout-bar .cc-banner-actions { flex-direction:column-reverse; }
      .cc-banner.cc-layout-bar .cc-banner-actions .cc-btn { width:100%; }
      .cc-banner.cc-layout-box { left:.6rem !important; right:.6rem !important; max-width:none; }
    }
  `;

      /* ── State ──────────────────────────────────────── */
      let _cfg = {};
      let _locale = LOCALES.en;
      let _categories = DEFAULT_CATEGORIES;
      let _injected = false;
      let _consent = null; // currently applied consent, or null

      function _t(key) {
        return _locale[key] != null ? _locale[key] : LOCALES.en[key] || key;
      }
      function _tCat(key, field) {
        const loc = (_locale.categories && _locale.categories[key]) || {};
        const fallback = (LOCALES.en.categories[key] || {})[field] || key;
        return loc[field] || fallback;
      }
      function _mergeLocale(base, override) {
        const out = Object.assign({}, base, override || {});
        out.categories = Object.assign(
          {},
          base.categories,
          (override && override.categories) || {},
        );
        return out;
      }

      /* ── Storage ────────────────────────────────────── */
      function _storageKey() {
        return _cfg.storageKey || "cc-consent";
      }
      function _readStored() {
        try {
          const raw = localStorage.getItem(_storageKey());
          if (!raw) return null;
          const data = JSON.parse(raw);
          if (!data || typeof data !== "object") return null;
          if (String(data.v) !== String(_cfg.consentVersion)) return null;
          const expireMs = (_cfg.expireDays || 365) * 86400000;
          if (Date.now() - (data.ts || 0) > expireMs) return null;
          return data;
        } catch (e) {
          return null;
        }
      }
      function _writeStored(categoriesObj) {
        const data = {
          v: _cfg.consentVersion,
          ts: Date.now(),
          categories: categoriesObj,
        };
        try {
          localStorage.setItem(_storageKey(), JSON.stringify(data));
        } catch (e) {
          /* storage unavailable (private mode, quota…) — consent still applies for this session */
        }
        return data;
      }

      /* ── HTML builders ──────────────────────────────── */
      function _bannerHTML() {
        const text = _t("bannerText").replace(
          /\{company\}/g,
          _cfg.companyName || "",
        );
        const links = [];
        if (_cfg.privacyPolicyUrl)
          links.push(
            `<a href="${_cfg.privacyPolicyUrl}" target="_blank" rel="noopener">${_t("privacyLink")}</a>`,
          );
        if (_cfg.cookiePolicyUrl)
          links.push(
            `<a href="${_cfg.cookiePolicyUrl}" target="_blank" rel="noopener">${_t("cookieLink")}</a>`,
          );
        const linksHTML = links.length
          ? ` <span class="cc-banner-links">${links.join(" · ")}</span>`
          : "";

        const posClass =
          _cfg.layout === "bar"
            ? _cfg.position === "top"
              ? "cc-pos-top"
              : "cc-pos-bottom"
            : _cfg.layout === "modal"
              ? "" // modal is centered, no corner positioning needed
              : _cfg.floatingPosition === "bottom-right"
                ? "cc-float-right"
                : "cc-float-left";

        return `
      <div id="cc-banner" class="cc-banner cc-layout-${_cfg.layout} ${posClass}" role="dialog" aria-live="polite" aria-label="${_t("bannerTitle")}">
        <div class="cc-banner-inner">
          <div class="cc-banner-head" ${_cfg.layout === "bar" ? 'style="display:none"' : ""}>
            ${_cookieSVG(20)}<p class="cc-banner-title">${_t("bannerTitle")}</p>
          </div>
          <p class="cc-banner-text">${text}${linksHTML}</p>
          <div class="cc-banner-actions">
            <button type="button" class="cc-btn" id="cc-btn-reject">${_t("btnRejectAll")}</button>
            <button type="button" class="cc-btn" id="cc-btn-customize">${_t("btnCustomize")}</button>
            <button type="button" class="cc-btn cc-btn-primary" id="cc-btn-accept">${_t("btnAcceptAll")}</button>
          </div>
        </div>
      </div>`;
      }

      function _rowHTML(cat, currentValue) {
        const label = cat.label || _tCat(cat.key, "label");
        const desc = cat.description || _tCat(cat.key, "description");
        const control = cat.locked
          ? `<span class="cc-badge">${_t("alwaysActive")}</span>`
          : `<label class="cc-switch">
               <input type="checkbox" data-cc-cat="${cat.key}" ${currentValue ? "checked" : ""}>
               <span class="cc-slider"></span>
             </label>`;
        return `
        <div class="cc-row">
          <div class="cc-row-head">
            <span class="cc-row-label">${label}</span>
            ${control}
          </div>
          <p class="cc-row-desc">${desc}</p>
        </div>`;
      }

      function _panelHTML() {
        const stored = (_consent && _consent.categories) || {};
        const rows = _categories
          .map((cat) =>
            _rowHTML(
              cat,
              cat.locked ? true : (stored[cat.key] ?? cat.default),
            ),
          )
          .join("");
        const links = [];
        if (_cfg.privacyPolicyUrl)
          links.push(
            `<a href="${_cfg.privacyPolicyUrl}" target="_blank" rel="noopener">${_t("privacyLink")}</a>`,
          );
        if (_cfg.cookiePolicyUrl)
          links.push(
            `<a href="${_cfg.cookiePolicyUrl}" target="_blank" rel="noopener">${_t("cookieLink")}</a>`,
          );
        const linksHTML = links.length ? ` — ${links.join(" · ")}` : "";

        // "Save my choices" is deliberately given the same visual weight as
        // the other two buttons by default (outline), so it doesn't read as
        // a low-priority afterthought next to the solid "Accept all" button.
        // Customizable via config.saveButtonStyle: 'outline' | 'solid' | 'ghost'.
        const saveClass =
          _cfg.saveButtonStyle === "solid"
            ? "cc-btn cc-btn-primary"
            : _cfg.saveButtonStyle === "ghost"
              ? "cc-btn cc-btn-ghost"
              : "cc-btn cc-btn-outline";

        return `
      <div id="cc-overlay" class="cc-overlay">
        <div class="cc-panel" role="dialog" aria-modal="true" aria-labelledby="cc-panel-title">
          <div class="cc-panel-header">
            <h2 id="cc-panel-title">${_t("panelTitle")}</h2>
            <button type="button" class="cc-panel-close" id="cc-panel-close" aria-label="${_t("ariaClose")}"><span class="cc-panel-close-x" aria-hidden="true">&times;</span></button>
          </div>
          <p class="cc-panel-intro">${_t("panelIntro")}${linksHTML}</p>
          <div class="cc-panel-body" id="cc-panel-body">${rows}</div>
          <div class="cc-panel-footer">
            <button type="button" class="cc-btn" id="cc-panel-reject">${_t("btnRejectAll")}</button>
            <button type="button" class="${saveClass}" id="cc-panel-save">${_t("btnSave")}</button>
            <button type="button" class="cc-btn cc-btn-primary" id="cc-panel-accept">${_t("btnAcceptAll")}</button>
          </div>
        </div>
      </div>`;
      }

      function _floatBtnHTML() {
        if (!_cfg.showFloatingButton) return "";
        const side =
          _cfg.floatingPosition === "bottom-right"
            ? "cc-float-right"
            : "cc-float-left";
        return `<button type="button" id="cc-float-btn" class="cc-float-btn ${side}" aria-label="${_t("ariaCookie")}">${_cookieSVG(30)}</button>`;
      }

      /* ── Theme resolution ───────────────────────────── */
      function _resolveTheme() {
        return _cfg.theme === "auto"
          ? document.documentElement.dataset.theme || "dark"
          : _cfg.theme;
      }
      function _applyTheme() {
        const light = _resolveTheme() === "light";
        document
          .querySelectorAll(".cc-root")
          .forEach((el) => el.classList.toggle("cc-light", light));
      }

      /* ── Inject / destroy ───────────────────────────── */
      function _destroy() {
        ["cc-banner", "cc-overlay", "cc-float-btn"].forEach((id) => {
          const el = document.getElementById(id);
          if (el) el.remove();
        });
        const style = document.getElementById("cc-style");
        if (style) style.remove();
        _injected = false;
      }

      function _inject() {
        if (_injected) return;

        const style = document.createElement("style");
        style.id = "cc-style";
        style.textContent = CSS;
        document.head.appendChild(style);

        const wrap = document.createElement("div");
        wrap.className = "cc-root";
        wrap.innerHTML =
          _bannerHTML() + _panelHTML() + _floatBtnHTML();
        document.body.appendChild(wrap);
        _applyTheme();
        wrap.style.setProperty("--cc-accent", _cfg.accent);
        wrap.style.setProperty("--cc-accent-text", _cfg.accentText);

        // Banner buttons
        document
          .getElementById("cc-btn-accept")
          .addEventListener("click", acceptAll);
        document
          .getElementById("cc-btn-reject")
          .addEventListener("click", rejectAll);
        document
          .getElementById("cc-btn-customize")
          .addEventListener("click", open);

        // Panel buttons
        document
          .getElementById("cc-panel-accept")
          .addEventListener("click", acceptAll);
        document
          .getElementById("cc-panel-reject")
          .addEventListener("click", rejectAll);
        document
          .getElementById("cc-panel-save")
          .addEventListener("click", _saveFromPanel);
        document
          .getElementById("cc-panel-close")
          .addEventListener("click", close);
        document
          .getElementById("cc-overlay")
          .addEventListener("click", (e) => {
            if (e.target.id === "cc-overlay") close();
          });
        document.addEventListener("keydown", (e) => {
          if (
            e.key === "Escape" &&
            document.getElementById("cc-overlay").classList.contains("cc-open")
          )
            close();
        });

        const floatBtn = document.getElementById("cc-float-btn");
        if (floatBtn) floatBtn.addEventListener("click", open);

        _injected = true;
      }

      /* ── Consent application ────────────────────────── */
      function _fullCategories(partial) {
        const out = {};
        _categories.forEach((cat) => {
          out[cat.key] = cat.locked
            ? true
            : partial && Object.prototype.hasOwnProperty.call(partial, cat.key)
              ? !!partial[cat.key]
              : !!cat.default;
        });
        return out;
      }

      function _apply(categoriesObj, meta) {
        const stored = _writeStored(categoriesObj);
        _consent = stored;
        _hideBanner();
        close();
        _toggleFloat(true);

        const bannerEl = document.getElementById("cc-banner");
        if (bannerEl) bannerEl.remove(); // banner is one-shot; float bubble takes over

        const detail = {
          categories: stored.categories,
          version: stored.v,
          timestamp: stored.ts,
        };
        document.dispatchEvent(
          new CustomEvent("cc:consent", { detail: detail }),
        );
        if (typeof _cfg.onChange === "function") _cfg.onChange(detail);
        if (meta === "acceptAll" && typeof _cfg.onAcceptAll === "function")
          _cfg.onAcceptAll(detail);
        if (meta === "rejectAll" && typeof _cfg.onRejectAll === "function")
          _cfg.onRejectAll(detail);
      }

      function acceptAll() {
        const all = {};
        _categories.forEach((cat) => (all[cat.key] = true));
        _apply(all, "acceptAll");
      }

      function rejectAll() {
        const none = {};
        _categories.forEach((cat) => (none[cat.key] = !!cat.locked));
        _apply(none, "rejectAll");
      }

      function save(partial) {
        _apply(_fullCategories(partial), "save");
      }

      function _saveFromPanel() {
        const body = document.getElementById("cc-panel-body");
        const partial = {};
        body.querySelectorAll("[data-cc-cat]").forEach((input) => {
          partial[input.dataset.ccCat] = input.checked;
        });
        save(partial);
      }

      function _hideBanner() {
        const el = document.getElementById("cc-banner");
        if (el) el.classList.remove("cc-show");
      }

      function _toggleFloat(visible) {
        const el = document.getElementById("cc-float-btn");
        if (el) el.classList.toggle("cc-visible", !!visible && _cfg.showFloatingButton);
      }

      /* ── Public API ─────────────────────────────────── */
      function init(config = {}) {
        if (typeof config.locale === "string") {
          _locale = LOCALES[config.locale] || LOCALES.en;
        } else if (typeof config.locale === "object" && config.locale !== null) {
          _locale = _mergeLocale(LOCALES.en, config.locale);
        } else {
          _locale = LOCALES.en;
        }

        _categories = Array.isArray(config.categories) && config.categories.length
          ? config.categories
          : DEFAULT_CATEGORIES;

        _cfg = {
          companyName: config.companyName || document.title || "",
          privacyPolicyUrl: config.privacyPolicyUrl || null,
          cookiePolicyUrl: config.cookiePolicyUrl || null,
          delay: config.delay != null ? config.delay : 600,
          autoShow: config.autoShow !== false,
          respectDNT: !!config.respectDNT,
          layout: ["bar", "box", "modal"].includes(config.layout)
            ? config.layout
            : "bar",
          position: config.position === "top" ? "top" : "bottom",
          floatingPosition:
            config.floatingPosition === "bottom-right"
              ? "bottom-right"
              : "bottom-left",
          theme: config.theme || "auto",
          accent: config.accent || "#00e676",
          accentText: config.accentText || "#000",
          trigger: config.trigger || "#btn-cookie-settings",
          // Opt-in: most sites already have a footer link, so the floating
          // bubble is off by default to avoid an extra element nobody asked for.
          showFloatingButton: config.showFloatingButton === true,
          saveButtonStyle: ["outline", "solid", "ghost"].includes(
            config.saveButtonStyle,
          )
            ? config.saveButtonStyle
            : "outline",
          storageKey: config.storageKey || "cc-consent",
          consentVersion: config.consentVersion != null ? config.consentVersion : "1",
          expireDays: config.expireDays != null ? config.expireDays : 365,
          onChange: config.onChange || null,
          onAcceptAll: config.onAcceptAll || null,
          onRejectAll: config.onRejectAll || null,
        };

        _destroy();

        const dnt =
          _cfg.respectDNT &&
          (navigator.doNotTrack === "1" || window.doNotTrack === "1");

        _consent = _readStored();

        _inject();

        // Always bind the "manage consent" trigger(s) — required so users can
        // withdraw or change consent at any time, as most privacy laws require.
        document.querySelectorAll(_cfg.trigger).forEach((el) => {
          el.removeEventListener("click", open);
          el.addEventListener("click", open);
        });

        if (_consent) {
          // Consent already known and valid: no banner, float bubble available.
          _hideBanner();
          const bannerEl = document.getElementById("cc-banner");
          if (bannerEl) bannerEl.remove();
          _toggleFloat(true);
        } else if (dnt) {
          rejectAll();
        } else if (_cfg.autoShow) {
          setTimeout(() => {
            const el = document.getElementById("cc-banner");
            if (el) el.classList.add("cc-show");
          }, _cfg.delay);
        }

        return CookieConsent;
      }

      function open() {
        _applyTheme();
        const panel = document.querySelector(".cc-panel");
        if (panel) {
          const stored = (_consent && _consent.categories) || {};
          _categories.forEach((cat) => {
            const input = panel.querySelector(`[data-cc-cat="${cat.key}"]`);
            if (input) input.checked = cat.locked ? true : !!(stored[cat.key] ?? cat.default);
          });
        }
        const overlay = document.getElementById("cc-overlay");
        if (overlay) overlay.classList.add("cc-open");
      }

      function close() {
        const overlay = document.getElementById("cc-overlay");
        if (overlay) overlay.classList.remove("cc-open");
      }

      function getConsent() {
        if (!_consent) return null;
        return {
          categories: Object.assign({}, _consent.categories),
          version: _consent.v,
          timestamp: _consent.ts,
        };
      }

      function has(categoryKey) {
        return !!(_consent && _consent.categories && _consent.categories[categoryKey]);
      }

      function hasConsented() {
        return !!_consent;
      }

      function reset() {
        try {
          localStorage.removeItem(_storageKey());
        } catch (e) {
          /* ignore */
        }
        _consent = null;
        _destroy();
        init(_cfg);
        const el = document.getElementById("cc-banner");
        if (el) el.classList.add("cc-show");
      }

      return {
        init,
        open,
        close,
        acceptAll,
        rejectAll,
        save,
        getConsent,
        has,
        hasConsented,
        reset,
      };
    })();

    return CookieConsent;
  },
);
