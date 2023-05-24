// ==UserScript==
// @name            YouTube Brightness Control
// @description     Control the video brightness level from the settings menu
// @version         1.0
// @icon            https://cdn-icons-png.flaticon.com/512/1384/1384060.png
// @namespace       https://github.com/CHJ85/YouTube-Brightness-Control
// @author          CHJ85
// @match           https://www.youtube.com/watch?*
// @match           https://www.youtube.com/embed/*
// ==/UserScript==

(function () {
  'use strict';

  // Configuration
  const LANGUAGE_DEFAULT = "en-US";

  const LANGUAGE_RESOURCES = {
    [LANGUAGE_DEFAULT]: {
      "brightness": "Brightness"
    },
    "de-DE": {
      "brightness": "Helligkeit"
    }
  };

  // State variables
  let resources, brightness, moviePlayer, video, settingsMenu, speedOption, brightnessOption, text;

  // Initialization
  const init = () => {
    const lang = document.documentElement.lang;
    resources = LANGUAGE_RESOURCES[lang] || LANGUAGE_RESOURCES[LANGUAGE_DEFAULT];
    moviePlayer = document.querySelector("#movie_player");
    if (!moviePlayer) return;
    moviePlayer.style.backgroundColor = "black";
    video = document.querySelector("video");
    settingsMenu = document.querySelector("div.ytp-settings-menu");
    brightness = parseInt(localStorage.getItem("lwchris.youtube_brightness_option.brightness") || "100", 10);
    setBrightness(brightness);
    addObserver();
  };

  // Mutation Observer for menu population
  const addObserver = () => {
    const observer = new MutationObserver(menuPopulated);
    const config = { attributes: false, childList: true, subtree: true };
    observer.observe(settingsMenu, config);
  };

  // Inject the brightness option into the settings menu
  const injectMenuOption = () => {
    if (brightnessOption || !speedOption) {
      return;
    }

    // Use playback speed element as template element
    brightnessOption = speedOption.cloneNode(true);

    // Adjust contents
    const label = brightnessOption.querySelector(".ytp-menuitem-label");
    label.textContent = resources["brightness"];

    // Attribution optional, but credit where credit is due:
    // https://iconmonstr.com/brightness-5-svg/
    const path = brightnessOption.querySelector("path");
    path.setAttribute(
      "d",
      "M12 9c1.654 0 3 1.346 3 3s-1.346 3-3 3-3-1.346-3-3 1.346-3 3-3zm0-2c-2.762 0-5 2.238-5 5s2.238 5 5 5 5-2.238 5-5-2.238-5-5-5zm0-2c.34 0 .672.033 1 .08v-2.08h-2v2.08c.328-.047.66-.08 1-.08zm-4.184 1.401l-1.472-1.473-1.414 1.415 1.473 1.473c.401-.537.876-1.013 1.413-1.415zm9.782 1.414l1.473-1.473-1.414-1.414-1.473 1.473c.537.402 1.012.878 1.414 1.414zm-5.598 11.185c-.34 0-.672-.033-1-.08v2.08h2v-2.08c-.328.047-.66.08-1 .08zm4.185-1.402l1.473 1.473 1.415-1.415-1.473-1.472c-.403.536-.879 1.012-1.415 1.414zm-11.185-5.598c0-.34.033-.672.08-1h-2.08v2h2.08c-.047-.328-.08-.66-.08-1zm13.92-1c.047.328.08.66.08 1s-.033.672-.08 1h2.08v-2h-2.08zm-12.519 5.184l-1.473 1.473 1.414 1.414 1.473-1.473c-.536-.402-1.012-.877-1.414-1.414z"
    );

    text = brightnessOption.querySelector(".ytp-menuitem-content");
    text.textContent = brightness + "%";

    // Adjust behavior
    brightnessOption.setAttribute("aria-haspopup", "false");
    brightnessOption.addEventListener("click", optionClicked);

    speedOption.parentNode.insertBefore(brightnessOption, speedOption);

    // Adjust height to prevent a scrollbar in the popup
    const isBigPlayer = moviePlayer.classList.contains("ytp-big-mode");
    const panel = settingsMenu.querySelector(".ytp-panel");
    const panelMenu = settingsMenu.querySelector(".ytp-panel-menu");

    const newHeight = `calc(${panel.style.height} + ${isBigPlayer ? 49 : 40}px)`;
    settingsMenu.style.height = newHeight;
    panel.style.height = newHeight;
    panelMenu.style.height = newHeight;
  };

  // Handler for the brightness option click event
  const optionClicked = () => {
    brightness += 20;
    if (brightness > 100) {
      brightness = 20;
    }
    setBrightness(brightness);
  };

  // Set the video brightness
  const setBrightness = (b) => {
    video.style.opacity = b / 100;
    if (text) {
      text.textContent = b + "%";
    }
    try {
      if (b === 100) {
        localStorage.removeItem("lwchris.youtube_brightness_option.brightness");
      } else {
        // Try to persist the value for reloads
        localStorage.setItem("lwchris.youtube_brightness_option.brightness", b);
      }
    } catch {
      // Might happen when local storage is disabled for youtube.com
      console.log("Persisting brightness failed");
    }
  };

  // Callback for menu population mutation observer
  const menuPopulated = () => {
    const menuItems = settingsMenu.querySelectorAll(".ytp-menuitem");
    speedOption = null;
    for (const item of menuItems) {
      const icon = item.querySelector("path");
      if (icon && icon.getAttribute("d").startsWith("M10,8v8l6-4L10,8L10,8z")) {
        speedOption = item;
        break;
      }
    }

    if (speedOption) {
      injectMenuOption();
      observer.disconnect();
    }
  };

  // Initialize the script
  init();
})();
