/**
 * DSGVO & TKG 2021 Compliant Consent Manager for Google Analytics
 * Measurement ID: G-JLXYJPG360
 */

export const GA_MEASUREMENT_ID = 'G-JLXYJPG360';

export const isAnalyticsGranted = () => {
  try {
    return localStorage.getItem('dsg_cookie_consent') === 'granted';
  } catch(e) {
    return false;
  }
};

export const loadGoogleAnalytics = () => {
  if (window._gaLoaded) return;
  window._gaLoaded = true;

  // Dynamically inject gtag.js
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    anonymize_ip: true,
    cookie_flags: 'SameSite=None;Secure'
  });
};

export const setAnalyticsConsent = (granted) => {
  try {
    if (granted) {
      localStorage.setItem('dsg_cookie_consent', 'granted');
      loadGoogleAnalytics();
    } else {
      localStorage.setItem('dsg_cookie_consent', 'denied');
      // If user revokes consent, disable gtag tracking
      if (window[`ga-disable-${GA_MEASUREMENT_ID}`] !== undefined || window.gtag) {
        window[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
      }
    }
  } catch(e) {
    console.error('Consent storage error:', e);
  }
};

export const initConsentBanner = () => {
  const consent = localStorage.getItem('dsg_cookie_consent');
  const banner = document.getElementById('cookie-consent-banner');

  if (consent === 'granted') {
    loadGoogleAnalytics();
    if (banner) banner.style.display = 'none';
  } else if (consent === 'denied') {
    if (banner) banner.style.display = 'none';
  } else {
    // No choice made yet: show banner
    if (banner) {
      banner.style.display = 'block';
      setTimeout(() => banner.classList.add('visible'), 50);
    }
  }

  const acceptBtn = document.getElementById('cookie-accept-all');
  const rejectBtn = document.getElementById('cookie-reject-all');

  if (acceptBtn) {
    acceptBtn.onclick = () => {
      setAnalyticsConsent(true);
      if (banner) {
        banner.classList.remove('visible');
        setTimeout(() => banner.style.display = 'none', 350);
      }
    };
  }

  if (rejectBtn) {
    rejectBtn.onclick = () => {
      setAnalyticsConsent(false);
      if (banner) {
        banner.classList.remove('visible');
        setTimeout(() => banner.style.display = 'none', 350);
      }
    };
  }
};
