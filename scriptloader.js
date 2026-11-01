// ==UserScript==
// @name         clarIP
// @namespace    https://github.com/clarskee/clarIP
// @version      0.67
// @description  ome.tv overlay with notifications
// @author       clara
// @match        https://ome.tv/*
// @match        https://www.ome.tv/*
// @run-at       document-idle
// @icon         https://www.google.com/s2/favicons?domain=ome.tv
// @updateURL    https://raw.githubusercontent.com/clarskee/clarIP/main/scriptloader.js
// @downloadURL  https://raw.githubusercontent.com/clarskee/clarIP/main/scriptloader.js
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    if (window.__clarIPLoaderStarted) {
        return;
    }
    window.__clarIPLoaderStarted = true;

    const baseURL = "https://raw.githubusercontent.com/clarskee/clarIP/main/";

    const fetchText = async (file, required) => {
        const url = baseURL + file + "?t=" + Date.now();
        try {
            const response = await fetch(url, { cache: "no-store" });
            if (!response.ok) {
                throw new Error("HTTP " + response.status + " for " + url);
            }
            return await response.text();
        } catch (error) {
            if (required) {
                throw error;
            }
            console.warn("clarIP: could not load " + file, error);
            return null;
        }
    };

    const run = async () => {
        let scriptSource;
        try {
            scriptSource = await fetchText("script.js", true);
        } catch (error) {
            console.error("clarIP: could not load script.js", error);
            return;
        }

        let notifSource = null;
        try {
            notifSource = await fetchText("notif.js", true);
        } catch (error) {
            console.warn("clarIP: notification system is unavailable", error);
        }

        const [template, markup, style] = await Promise.all([
            fetchText("notification.html"),
            fetchText("index.html"),
            fetchText("style.css"),
        ]);

        window.__clarIPAssets = {};
        if (template) {
            window.__clarIPAssets.notificationTemplate = template;
        }
        if (markup) {
            window.__clarIPAssets.markup = markup;
        }
        if (style) {
            window.__clarIPAssets.style = style;
        }

        if (notifSource) {
            try {
                (0, eval)(notifSource);
            } catch (error) {
                console.warn("clarIP: notification system failed to start", error);
            }
        }

        try {
            (0, eval)(scriptSource);
        } catch (error) {
            console.error("clarIP: script.js failed to start", error);
        }
    };

    run().catch((error) => console.error("clarIP: loader failed", error));
})();
