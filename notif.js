(function () {
    "use strict";

    // Used when notif.js is loaded on its own. The packaged userscript embeds
    // notification.html through window.__clarIPAssets.
    const FALLBACK_TEMPLATE = `
        <div class="notification-header">
            <i class="fa fa-bell" aria-hidden="true"></i> <b class="bold notification-title"></b>
        </div>
        <div class="notification-content"></div>
        <div class="notification-footer">
            <button class="button" type="button">CHECK OUT</button>
            <button class="button" type="button" data-notification-dismiss>DISMISS</button>
        </div>
    `;

    const assets = window.__clarIPAssets || {};
    const notificationTemplate = assets.notificationTemplate || FALLBACK_TEMPLATE;
    const notificationSound = new Audio("https://github.com/clarskee/clarIP/raw/main/notification-pretty-good.mp3");
    notificationSound.preload = "none";

    const notifications = [];
    let nextNotificationId = 0;
    let audioUnlocked = false;

    const unlockAudio = () => {
        audioUnlocked = true;
        document.removeEventListener("pointerdown", unlockAudio, true);
        document.removeEventListener("keydown", unlockAudio, true);
    };

    document.addEventListener("pointerdown", unlockAudio, true);
    document.addEventListener("keydown", unlockAudio, true);

    class ClarIPNotification {
        constructor(title, content, x, y, decay = 500) {
            this.title = title;
            this.content = content;
            this.x = Number.isFinite(x) ? x : 10;
            this.y = Number.isFinite(y) ? y : 0;
            this.decay = Number.isFinite(decay) ? Math.max(0, decay) : 500;
            this.id = nextNotificationId++;
            this.state = "new";
            this.element = null;
            this.closeTimer = null;
            this.removeTimer = null;
        }

        createElement() {
            const element = document.createElement("div");
            element.className = "notification";
            element.id = "notif-" + this.id;
            element.style.position = "absolute";
            element.style.left = this.x + "px";
            element.style.top = this.y + "px";
            element.style.opacity = "0";
            element.style.transition = "opacity 250ms ease";
            element.innerHTML = notificationTemplate;

            const title = element.querySelector(".notification-title");
            const content = element.querySelector(".notification-content");
            const dismiss = element.querySelector("[data-notification-dismiss]");

            if (title) {
                title.textContent = this.title;
            }
            if (content) {
                content.textContent = this.content;
            }
            if (dismiss) {
                dismiss.addEventListener("click", () => this.destroy());
            }

            this.element = element;
            return element;
        }

        inject() {
            if (!this.element || this.element.isConnected) {
                return;
            }
            if (!document.body) {
                document.addEventListener("DOMContentLoaded", () => this.inject(), { once: true });
                return;
            }

            const index = notifications.indexOf(this);
            const previous = index > 0 ? notifications[index - 1] : null;
            if (previous && previous.element && previous.element.isConnected) {
                this.y = previous.y + previous.element.offsetHeight + 10;
                this.element.style.top = this.y + "px";
            }

            document.body.appendChild(this.element);
            this.state = "render";

            requestAnimationFrame(() => {
                if (this.element && this.state === "render") {
                    this.element.style.opacity = "1";
                }
            });

            if (audioUnlocked) {
                const playResult = notificationSound.play();
                if (playResult && typeof playResult.catch === "function") {
                    playResult.catch(() => {});
                }
            }

            if (this.decay > 0) {
                this.closeTimer = setTimeout(() => this.destroy(), this.decay);
            }
        }

        destroy() {
            if (this.state === "closing" || this.state === "closed") {
                return;
            }
            this.state = "closing";

            if (this.closeTimer !== null) {
                clearTimeout(this.closeTimer);
                this.closeTimer = null;
            }

            if (!this.element) {
                this.finish();
                return;
            }

            this.element.style.opacity = "0";
            this.removeTimer = setTimeout(() => this.finish(), 260);
        }

        finish() {
            if (this.state === "closed") {
                return;
            }
            this.state = "closed";

            if (this.removeTimer !== null) {
                clearTimeout(this.removeTimer);
                this.removeTimer = null;
            }
            if (this.closeTimer !== null) {
                clearTimeout(this.closeTimer);
                this.closeTimer = null;
            }

            if (this.element) {
                this.element.remove();
                this.element = null;
            }

            const index = notifications.indexOf(this);
            if (index !== -1) {
                notifications.splice(index, 1);
            }
        }
    }

    const addNotification = (title, content, x, y, decay) => {
        const notification = new ClarIPNotification(title, content, x, y, decay);
        notification.createElement();
        notifications.push(notification);
        notification.inject();
        return notification;
    };

    window.addNotification = addNotification;
})();
