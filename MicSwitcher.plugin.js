/**
 * @name MicSwitcher
 * @author Nox
 * @description Switch between two microphone inputs with a button in the voice call UI.
 * @version 0.0.3
 */

class MicSwitcher {
    constructor() {
        this.deviceIds = [];
        this.selectedDevices = BdApi.Data.load("MicSwitcher", "selectedDevices") || { mic1: null, mic2: null };
        this.currentDevice = "mic1";
    }

    async start() {
        console.log("[MicSwitcher] Plugin started.");
        await this.getMicrophones();
        this.createButton();
    }

    stop() {
        console.log("[MicSwitcher] Plugin stopped.");
        this.removeButton();
    }

    async getMicrophones() {
        const devices = await navigator.mediaDevices.enumerateDevices();
        this.deviceIds = devices.filter(device => device.kind === "audioinput");

        if (!this.selectedDevices.mic1 && this.deviceIds.length > 0) {
            this.selectedDevices.mic1 = this.deviceIds[0].deviceId;
        }
        if (!this.selectedDevices.mic2 && this.deviceIds.length > 1) {
            this.selectedDevices.mic2 = this.deviceIds[1].deviceId;
        }
    }

    switchMicrophone() {
        if (!this.selectedDevices.mic1 || !this.selectedDevices.mic2) {
            BdApi.showToast("[MicSwitcher] Please set microphones in settings.", { type: "warning" });
            return;
        }

        this.currentDevice = this.currentDevice === "mic1" ? "mic2" : "mic1";
        const newMic = this.selectedDevices[this.currentDevice];

        console.log(`[MicSwitcher] Switching to microphone: ${newMic}`);

        // Note: Discord does not provide an API to change input devices dynamically.
        // This will only log the change for now, external handling is required.
    }

    createButton() {
        const observer = new MutationObserver(() => {
            const crispButton = document.querySelector("#app-mount > div.appAsidePanelWrapper_a3002d > div.notAppAsidePanel_a3002d > div.app_a3002d > div > div.layers__960e4.layers__160d8 > div > div > div > div > div.sidebar_c48ade > section > div.wrapper_e131a9 > div > div.flex__7c0ba.horizontal__7c0ba.justifyStart_abf706.alignCenter_abf706.noWrap_abf706.connection_e131a9 > div.flex__7c0ba.horizontal__7c0ba.justifyStart_abf706.alignStretch_abf706.noWrap_abf706.voiceButtonsContainer_e131a9 > button:nth-child(1)");

            const disconnectButton = document.querySelector("#app-mount > div.appAsidePanelWrapper_a3002d > div.notAppAsidePanel_a3002d > div.app_a3002d > div > div.layers__960e4.layers__160d8 > div > div > div > div > div.sidebar_c48ade > section > div.wrapper_e131a9 > div > div.flex__7c0ba.horizontal__7c0ba.justifyStart_abf706.alignCenter_abf706.noWrap_abf706.connection_e131a9 > div.flex__7c0ba.horizontal__7c0ba.justifyStart_abf706.alignStretch_abf706.noWrap_abf706.voiceButtonsContainer_e131a9 > button:nth-child(2)");

            if (crispButton && disconnectButton && !document.getElementById("mic-switch-button")) {
                const button = document.createElement("button");
                button.id = "mic-switch-button";
                button.title = "Switch Microphone";
                button.style.background = "transparent";
                button.style.border = "none";
                button.style.color = "white";
                button.style.fontSize = "18px";
                button.style.cursor = "pointer";
                button.style.margin = "0 5px";

                // Replace with your actual SVG URL
                const icon = document.createElement("img");
                icon.src = "https://example.com/mic-icon.svg"; // Replace this URL with your SVG file location
                icon.style.width = "24px";
                icon.style.height = "24px";

                button.appendChild(icon);

                button.onclick = () => this.switchMicrophone();

                crispButton.parentNode.insertBefore(button, disconnectButton);

                console.log("[MicSwitcher] Button added between Crisp and Disconnect.");
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        this.voiceObserver = observer;
    }

    removeButton() {
        if (this.voiceObserver) {
            this.voiceObserver.disconnect();
            this.voiceObserver = null;
        }
        const button = document.getElementById("mic-switch-button");
        if (button) button.remove();
    }

    getSettingsPanel() {
        const settingsPanel = document.createElement("div");
        settingsPanel.style.padding = "10px";

        const title = document.createElement("h3");
        title.textContent = "MicSwitcher Settings";
        settingsPanel.appendChild(title);

        const mic1Label = document.createElement("label");
        mic1Label.textContent = "Primary Microphone: ";
        settingsPanel.appendChild(mic1Label);

        const mic1Select = document.createElement("select");
        this.deviceIds.forEach(device => {
            const option = document.createElement("option");
            option.value = device.deviceId;
            option.textContent = device.label || "Unknown Device";
            if (device.deviceId === this.selectedDevices.mic1) option.selected = true;
            mic1Select.appendChild(option);
        });
        mic1Select.onchange = () => {
            this.selectedDevices.mic1 = mic1Select.value;
            BdApi.Data.save("MicSwitcher", "selectedDevices", this.selectedDevices);
        };
        settingsPanel.appendChild(mic1Select);

        settingsPanel.appendChild(document.createElement("br"));

        const mic2Label = document.createElement("label");
        mic2Label.textContent = "Secondary Microphone: ";
        settingsPanel.appendChild(mic2Label);

        const mic2Select = document.createElement("select");
        this.deviceIds.forEach(device => {
            const option = document.createElement("option");
            option.value = device.deviceId;
            option.textContent = device.label || "Unknown Device";
            if (device.deviceId === this.selectedDevices.mic2) option.selected = true;
            mic2Select.appendChild(option);
        });
        mic2Select.onchange = () => {
            this.selectedDevices.mic2 = mic2Select.value;
            BdApi.Data.save("MicSwitcher", "selectedDevices", this.selectedDevices);
        };
        settingsPanel.appendChild(mic2Select);

        return settingsPanel;
    }
}

module.exports = MicSwitcher;
