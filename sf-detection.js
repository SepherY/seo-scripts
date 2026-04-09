/**
 * SEO Monitor — Screaming Frog Detection Script
 *
 * Loaded via seoSpider.loadScript() from a single thin Extraction snippet.
 * All detection logic lives here — version-controlled, testable, no SF GUI editing.
 *
 * Captures:
 *   1. SEO Article API — was /api/v2/article/item called? (Performance API)
 *   2. Iframe domains — all iframes observed during page load (from Action hook)
 *   3. Current URL — window.location.href after JS rendering
 *
 * Results stored on window.__seoMonitor for the Extraction snippet to read.
 */

(function () {
    'use strict';

    var results = {
        // SEO Article API detection
        articleApiCalled: 'no',
        articleApiCount: 0,
        articleApiUrls: '',

        // Iframe detection (reads from Action hook if available)
        iframeCount: 0,
        iframeUrls: '',

        // Current URL after JS rendering
        currentUrl: '',
    };

    // ── SEO Article API (Performance API) ──────────────────────────────
    try {
        var entries = performance.getEntriesByType('resource');
        var article = entries.filter(function (e) {
            return e.name.includes('/api/v2/article/item');
        });
        results.articleApiCalled = article.length > 0 ? 'yes' : 'no';
        results.articleApiCount = article.length;
        results.articleApiUrls = article.map(function (e) { return e.name; }).join(' | ');
    } catch (e) {
        results.articleApiCalled = 'error: ' + e.message;
    }

    // ── Iframe detection ───────────────────────────────────────────────
    try {
        var iframes = window.__iframeWatcher;
        if (iframes instanceof Set) {
            results.iframeCount = iframes.size;
            results.iframeUrls = Array.from(iframes).join(' | ');
        } else {
            // Fallback: read iframes from DOM directly
            var domIframes = new Set();
            document.querySelectorAll('iframe').forEach(function (f) {
                if (f.src) domIframes.add(f.src);
            });
            results.iframeCount = domIframes.size;
            results.iframeUrls = Array.from(domIframes).join(' | ');
        }
    } catch (e) {
        results.iframeCount = -1;
        results.iframeUrls = 'error: ' + e.message;
    }

    // ── Current URL ────────────────────────────────────────────────────
    try {
        results.currentUrl = window.location.href;
    } catch (e) {
        results.currentUrl = 'error: ' + e.message;
    }

    // ── Expose results ─────────────────────────────────────────────────
    window.__seoMonitor = results;
})();
