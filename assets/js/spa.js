// /assets/js/spa.js
(function () {
  const CONTENT_ID = "spa-content";

  function normalizePath(pathname) {
    // Ensure trailing slash for consistent comparisons
    if (!pathname.endsWith("/")) return pathname + "/";
    return pathname;
  }

  function resolveHref(href) {
    // Root-notation links like "/about/" resolve correctly from origin
    return new URL(href, window.location.origin);
  }

  function isSameOrigin(url) {
    return url.origin === window.location.origin;
  }

  function isFileLink(url) {
    // Treat direct file links as normal navigation
    return /\.[a-z0-9]+$/i.test(url.pathname);
  }

  function shouldHandleLink(a) {
    if (!a) return false;

    const href = a.getAttribute("href");
    if (!href) return false;

    // Ignore hash-only links
    if (href.startsWith("#")) return false;

    // Ignore new tab, downloads, mailto, tel
    if (a.target && a.target.toLowerCase() === "_blank") return false;
    if (a.hasAttribute("download")) return false;
    if (href.startsWith("mailto:") || href.startsWith("tel:")) return false;

    const url = resolveHref(href);
    if (!isSameOrigin(url)) return false;
    if (isFileLink(url)) return false;

    return true;
  }

  function setActiveNav() {
    const links = document.querySelectorAll(".navlist a[href]");
    const current = normalizePath(window.location.pathname);

    links.forEach((a) => {
      const href = a.getAttribute("href");
      if (!href) return;

      const url = resolveHref(href);
      const target = normalizePath(url.pathname);

      if (target === current) a.classList.add("is-active");
      else a.classList.remove("is-active");
    });

    setActiveHomeLink();
  }

  function setActiveHomeLink() {
    const home = document.getElementById("home-link");
    if (!home) return;

    const current = normalizePath(window.location.pathname);
    const isHome = current === "/";

    if (isHome) home.classList.add("is-active");
    else home.classList.remove("is-active");
  }

  async function navigateTo(url, { push = true } = {}) {
    const currentMain = document.getElementById(CONTENT_ID);
    if (!currentMain) {
      window.location.href = url.href;
      return;
    }

    try {
      const res = await fetch(url.href, {
        method: "GET",
        credentials: "same-origin",
        headers: { "X-Requested-With": "spa" },
      });

      if (!res.ok) {
        window.location.href = url.href;
        return;
      }

      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, "text/html");

      const incomingMain = doc.getElementById(CONTENT_ID);
      if (!incomingMain) {
        window.location.href = url.href;
        return;
      }

      // Swap only the content panel
      currentMain.innerHTML = incomingMain.innerHTML;

      // Update title
      if (doc.title) document.title = doc.title;

      // Update URL
      if (push) history.pushState({}, "", url.href);

      // Scroll to top
      window.scrollTo(0, 0);

      // Update active styling
      setActiveNav();

      // Accessibility focus
      const h1 = currentMain.querySelector("h1");
      if (h1) {
        h1.setAttribute("tabindex", "-1");
        h1.focus({ preventScroll: true });
        h1.addEventListener("blur", () => h1.removeAttribute("tabindex"), {
          once: true,
        });
      }
    } catch (e) {
      window.location.href = url.href;
    }
  }

  // Intercept internal link clicks
  document.addEventListener("click", (ev) => {
    const a = ev.target.closest("a");
    if (!shouldHandleLink(a)) return;

    const href = a.getAttribute("href");
    const url = resolveHref(href);

    const current = normalizePath(window.location.pathname);
    const target = normalizePath(url.pathname);

    // If clicking current page, do nothing
    if (target === current) {
      ev.preventDefault();
      return;
    }

    ev.preventDefault();
    navigateTo(url, { push: true });
  });

  // Back/forward
  window.addEventListener("popstate", () => {
    navigateTo(new URL(window.location.href), { push: false });
  });

  // Initial state
  setActiveNav();
})();
