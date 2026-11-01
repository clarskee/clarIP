// ==UserScript==
// @name         clarIP
// @namespace    https://github.com/clarskee/clarIP
// @version      0.68
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

    const repo = "clarskee/clarIP";
    const fallbackBaseURL = "https://raw.githubusercontent.com/" + repo + "/main/";
    const commitAPI = "https://api.github.com/repos/" + repo + "/commits/main";
    const shaCacheKey = "clarIPLatestCommit";
    const shaCacheTTL = 60 * 1000;
    let baseURL = fallbackBaseURL;

    const resolveBaseURL = async () => {
        let cachedSHA = null;
        try {
            const cached = JSON.parse(localStorage.getItem(shaCacheKey) || "null");
            if (cached && cached.sha && Date.now() - cached.time < shaCacheTTL) {
                cachedSHA = cached.sha;
            }
        } catch (error) {
            console.warn("clarIP: could not read the commit cache", error);
        }

        if (cachedSHA) {
            return "https://raw.githubusercontent.com/" + repo + "/" + cachedSHA + "/";
        }

        try {
            const response = await fetch(commitAPI, {
                cache: "no-store",
                headers: { Accept: "application/vnd.github.sha" },
            });
            if (!response.ok) {
                throw new Error("HTTP " + response.status + " for " + commitAPI);
            }
            const sha = (await response.text()).trim();
            if (/^[0-9a-f]{40}$/i.test(sha)) {
                try {
                    localStorage.setItem(shaCacheKey, JSON.stringify({ sha, time: Date.now() }));
                } catch (error) {
                    console.warn("clarIP: could not cache the commit sha", error);
                }
                return "https://raw.githubusercontent.com/" + repo + "/" + sha + "/";
            }
            throw new Error("Unexpected commit response");
        } catch (error) {
            console.warn("clarIP: could not resolve the latest commit; using main", error);
            return fallbackBaseURL;
        }
    };

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
        baseURL = await resolveBaseURL();

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
