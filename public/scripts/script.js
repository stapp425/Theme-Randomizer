const colorTheme = [...document.getElementsByClassName("pane-entry"), ...document.getElementsByClassName("list-entry")];
const copyThemeButtons = [...document.getElementsByClassName("copy-theme-background")];
const prevContainer = document.getElementById("prev-bg-colors");
const nextContainer = document.getElementById("next-bg-colors");
const nextArrow = document.getElementById("next-arrow");
const prevArrow = document.getElementById("prev-arrow");
const prevButton = document.querySelector(".previous-button");
const nextButton = document.querySelector(".next-button");
const cooldownMeters = [...document.getElementsByClassName("cooldown-meter")]
const saveThemeButton = document.getElementById("save-button");
const menuButton = document.getElementById("menu-button");
const closeMenuButton = document.getElementById("close-menu-button");
const savedThemesContainer = document.querySelector(".saved-themes-container");
const menuFadeBackground = document.querySelector(".menu-fade-background");
const popupFadeBackground = document.querySelector(".popup-fade-background");
const optionsFadeBackground = document.querySelector(".options-fade-background");
const savedThemesList = document.getElementById("saved-themes-list");
const contextMenu = document.getElementById("theme-options");
const previewThemeHeader = document.getElementById("preview-theme-header");
const favoriteButton = document.getElementById("favorite-button");
const renameButton = document.getElementById("rename-button");
const deleteButton = document.getElementById("delete-button");
const previewButton = document.getElementById("preview-button");
const notification = document.querySelector(".notification");
const popupWindows = [...document.getElementsByClassName("popup-window")];
const cancelButtons = [...document.getElementsByClassName("cancel-button")];
const confirmButtons = [...document.getElementsByClassName("confirm-button")];
const namePrompt = document.getElementById("name-prompt");
const renameThemeInput = document.getElementById("rename-theme-input");
const customizationMenu = document.getElementById("customization-menu");
const statusArrow = document.getElementById("status-arrow");
const customizationOptions = document.querySelector(".customization-options");
const customButtons = [...document.getElementsByClassName("custom-option")];
const hoverDescription = document.querySelector(".hover-description");
const navBar = document.querySelector(".nav-bar");
const navBarToggleButton = document.querySelector(".nav-bar-toggle-button");
const navBarOptions = [...navBar.children];

const PORT = 3500;

const signals = {
    confirmAC: new AbortController(),
    themeAC: new AbortController(),
}

// CANNOT BE BELOW 3
const maxArrayLength = 5;
const toggleBackgrounds = [];
let previewBuffer = [];
let currentThemeBuffer = [];
let currIndex = 1;
let inPreviewMode = false;

const animations = {
    menu: 100,
    notification: 3000,
    theme: 175,
    popup: 100,
    copy: 125,
    cycle: 750
}

const cooldowns = {
    theme: false,
    refresh: false,
    button: false,
}

const colors = {
    favorite: "#ffffc8",
    normal: "white",
    container: "rgba(255, 255, 255, 0.9)",
}

const statuses = {
    success: {
        color: "#7dff7d",
        icon: `<i class="fa-solid fa-check"></i>`
    },
    alert: {
        color: "#ffc84b",
        icon: `<i class="fa-solid fa-triangle-exclamation"></i>`
    },
    failure: {
        color: "#ff6464",
        icon: `<i class="fa-solid fa-xmark"></i>`
    }
}

const hoverDescriptionTexts = ["Save theme", "Cancel", "Show all themes"];

let pageOrientation;
let animationOrientation;

function removeListeners(abortController) {
    signals[abortController].abort();
    signals[abortController] = new AbortController();
}

notification.children[2].addEventListener("click", () => {
    notification.style.top = "-40px";
});

function pushNotification(status, statusMessage) {
    const notifElements = notification.children;

    notification.style.backgroundColor = status.color;
    notifElements[0].innerHTML = status.icon;
    notifElements[1].innerText = statusMessage;

    notification.classList.toggle("notify");
    setTimeout(() => {
        notification.classList.toggle("notify");
    }, animations.notification);
}

setOrientation();

function setOrientation() {
    if (matchMedia("(max-width: 1049px)").matches) {
        pageOrientation = "portrait";
        animationOrientation = "X";
        statusArrow.innerHTML = `<i class="fa-solid fa-angle-left"></i>`;
        nextArrow.innerHTML = '<i class="fa-solid fa-angle-down"></i>';
        prevArrow.innerHTML = '<i class="fa-solid fa-angle-up"></i>';
    } else {
        pageOrientation = "landscape";
        animationOrientation = "Y";
        statusArrow.innerHTML = `
        <i class="fa-solid fa-angle-up"></i><h1>OPTIONS</h1>`;
        nextArrow.innerHTML = '<i class="fa-solid fa-angle-right"></i>';
        prevArrow.innerHTML = '<i class="fa-solid fa-angle-left"></i>';
    }
}

addEventListener("resize", setOrientation);

navBarToggleButton.addEventListener("click", () => {
    navBar.classList.toggle("nav-bar-opened");
});

function convertColorValues(colorValue) {
    let result;
    
    if(colorValue.charAt(0) === "#") {
        const hexValue = colorValue.substring(1);
        const r = parseInt(hexValue.substring(0, 2), 16);
        const g = parseInt(hexValue.substring(2, 4), 16);
        const b = parseInt(hexValue.substring(4, 6), 16);

        result = `rgb(${r}, ${g}, ${b})`;
    } else {
        let colorValues = colorValue.match(/[0-9]{1,3}/g);

        colorValues = colorValues.map(element => {
            const hex = parseInt(element).toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        });

        result = `#${colorValues[0]}${colorValues[1]}${colorValues[2]}`;
    }

    return result;
}

function togglePreviewMode(savedTheme) {

    function toggleVisibility(bool) {
        let theme;
        let previewBlock, previewFlex;
        let mainBlock, mainFlex;

        if(bool) {
            theme = "dark";
            previewBlock = "block"; previewFlex = "flex";
            mainBlock = "none"; mainFlex = "none";
        } else {
            populateSavedColors();

            theme = "light";
            previewBlock = "none"; previewFlex = "none";
            mainBlock = "block"; mainFlex = "flex";
        }
        
        toggleMenu();
        
        previewButton.style.display = previewFlex;
        favoriteButton.style.display = previewFlex;
        renameButton.style.display = previewFlex;
        deleteButton.style.display = previewFlex;
        document.body.style.backgroundImage = `url("/img/${theme}MainTheme.png")`;
        customizationMenu.style.display = mainFlex;
        menuButton.style.display = mainBlock;
        previewThemeHeader.style.display = previewFlex;
        prevButton.style.display = mainFlex;
        nextButton.style.display = mainFlex;
    }
    
    return () => {        
        let bgColor, colorEntity;
        
        if(!inPreviewMode) {
            inPreviewMode = true;
            
            previewThemeHeader.children[0].innerText = savedTheme.children[0].innerText;
            
            bgColor = savedTheme.style.backgroundColor === convertColorValues(colors.favorite)
                ? colors.favorite : colors.container;

            colorEntity = [...savedTheme.children[2].children].map(element => {
                return convertColorValues(element.style.backgroundColor);
            });
                
        } else {
            inPreviewMode = false;

            bgColor = colors.container;
            colorEntity = toggleBackgrounds[currIndex];
        }

        resetCopyHoverBackgrounds();
        toggleVisibility(inPreviewMode);

        previewThemeHeader.style.backgroundColor = bgColor;

        styleFavoriteButton();

        colorEntity.forEach((element, i) => {
            colorTheme[i].style.backgroundColor = element;
        });
    }
}

function toggleMenu() {
    menuFadeBackground.classList.toggle("menu-active");
    savedThemesContainer.classList.toggle("menu-active");
}

function togglePopupWindow(index) {
    popupWindows[index].classList.toggle("popup-active");
    popupFadeBackground.classList.toggle("popup-active");
}

function styleFavoriteButton() {
    const previewThemeHeaderBackground = previewThemeHeader.style.backgroundColor;
    const isFavorite = convertColorValues(previewThemeHeaderBackground) === colors.favorite;
    
    let favButtonStar, favButtonText
    
    if(isFavorite) {
        favButtonStar = `<i class="fa-solid fa-star"></i>`;
        favButtonText = "Unfavorite";
    } else {
        favButtonStar = `<i class="fa-regular fa-star"></i>`;
        favButtonText = "Favorite";
    }

    favoriteButton.innerHTML = `
        ${favButtonText}
        ${favButtonStar}
    `;
}

async function favoriteTheme() {
    const previewThemeHeaderBackground = previewThemeHeader.style.backgroundColor;
    const isFavorite = convertColorValues(previewThemeHeaderBackground) === colors.favorite;

    try {
        const data = await fetchFromAPI("PUT", "api/colors", {
            body: {
                name: previewThemeHeader.children[0].innerText,
                favorite: isFavorite ? false : true
            }
        });

        if(Object.hasOwn(data, "SUCCESS")) {
            const favStatus = isFavorite ? "unfavorite" : "favorite";

            previewThemeHeader.style.backgroundColor = isFavorite ? colors.container : colors.favorite;
            styleFavoriteButton();

            removeListeners("confirmAC");
            
            pushNotification(statuses.success, `Theme ${favStatus}d!`);
        } else
            pushNotification(statuses.failure, "A bad request occurred.");
    } catch(err) {
        console.error(err);
        pushNotification(statuses.failure, "Favorite failed unexpectedly.");
    }
}

function renameTheme() {
    const previewThemeName = previewThemeHeader.children[0].innerText;
    const renameThemeInput = document.getElementById("rename-theme-input");

    togglePopupWindow(0);
    
    confirmButtons[0].addEventListener("click", async () => {
        const enteredNewThemeName = renameThemeInput.value;

        if(enteredNewThemeName && enteredNewThemeName !== previewThemeName) {
            try {
                const data = await fetchFromAPI("PUT", "api/colors", {
                    body: {
                        name: previewThemeName,
                        newName: enteredNewThemeName
                    }
                });
    
                if(Object.hasOwn(data, "SUCCESS")) {
                    removeListeners("confirmAC");
        
                    pushNotification(statuses.success, "Theme Renamed!");
                    togglePopupWindow(0);
                    previewThemeHeader.children[0].innerText = enteredNewThemeName;
                } else
                    pushNotification(statuses.failure, "Theme name exists!");
            } catch(err) {
                console.error(err);
                pushNotification(statuses.failure, "Rename failed unexpectedly.");
            }
        } else {
            if(!enteredNewThemeName)
                pushNotification(statuses.failure, "Enter a new theme name.");
            else if(enteredNewThemeName === previewThemeName)
                pushNotification(statuses.failure, "Theme names match!");
        }
    }, { signal: signals.confirmAC.signal });
}

function removeTheme() {
    const previewThemeName = previewThemeHeader.children[0].innerText;
    
    togglePopupWindow(1);

    const copiedCurrColors = [...document.getElementsByClassName("delete-color")];

    document.getElementById("delete-theme-name").innerText = previewThemeName;
    
    copiedCurrColors.forEach((element, i) => {
        element.style.backgroundColor = colorTheme[i].style.backgroundColor;
    });

    confirmButtons[1].addEventListener("click", async () => {
        try {
            await fetchFromAPI("DELETE", "api/colors", {
                body: {
                    name: previewThemeName
                }
            });

            removeListeners("confirmAC");
    
            togglePopupWindow(1);
            setTimeout(togglePreviewMode(), 0);
            
            pushNotification(statuses.alert, "Theme deleted!");
        } catch(err) {
            console.err(`[ERROR]: ${err}`);
            pushNotification(statuses.failure, "Delete failed unexpectedly.");
        }
    }, { signal: signals.confirmAC.signal });
}

function saveTheme() {
    togglePopupWindow(2);

    confirmButtons[2].addEventListener("click", async () => {
        const themeInput = document.getElementById("name-prompt");
        const inputValue = themeInput.value;
        
        if(inputValue) {
            removeListeners("confirmAC");
            try {
                const data = await fetchFromAPI("POST", "api/colors", {
                    body: {
                        name: inputValue,
                        colors: toggleBackgrounds[currIndex],
                        favorite: false
                    }
                });
                
                if (Object.hasOwn(data, "SUCCESS")) {
                    resetCopyHoverBackgrounds();
                    togglePopupWindow(2);
                    pushNotification(statuses.success, "Theme created!");
                    await populateSavedColors();
                } else {
                    pushNotification(statuses.failure, !inputValue ? "Enter a theme name." : "Theme already exists!");
                }
            } catch(err) {
                console.error(`[ERROR]: ${err}`);
                pushNotification(statuses.failure, "Theme failed to save!");
            }
        } else
            pushNotification(statuses.failure, "Enter a theme name.");
    }, { signal: signals.confirmAC.signal });
}

statusArrow.addEventListener("click", () => {
    optionsFadeBackground.classList.toggle("options-active");
    customizationOptions.classList.toggle("custom-options-active");
})

customButtons.forEach((element, i) => {
    element.addEventListener("mouseenter", () => {
        hoverDescription.classList.add("hover-active");
        hoverDescription.innerText = hoverDescriptionTexts[i];
    });
    
    element.addEventListener("mousemove", event => {
        hoverDescription.style.top = `${event.clientY + 15}px`;
        hoverDescription.style.left = `${event.clientX + 15}px`;
    });

    element.addEventListener("mouseleave", event => {
        hoverDescription.classList.remove("hover-active");
    });
});

customButtons[0].addEventListener("click", saveTheme);

customButtons[1].addEventListener("click", () => {
    optionsFadeBackground.classList.toggle("options-active");
    customizationOptions.classList.toggle("custom-options-active");
});

customButtons[2].addEventListener("click", () => {
    open(`http://localhost:${PORT}/all`, "_blank");
});

cancelButtons.forEach((button, i) => {
    button.addEventListener("click", () => {
        removeListeners("confirmAC");
        togglePopupWindow(i);
    })
})

favoriteButton.addEventListener("click", favoriteTheme);

renameButton.addEventListener("click", renameTheme);

deleteButton.addEventListener("click", removeTheme);

previewButton.addEventListener("click", togglePreviewMode());

menuButton.addEventListener("click", () => {
    if(!cooldowns.refresh) {  
        populateSavedColors();

        cooldowns.refresh = true;
        setTimeout(() => {
            cooldowns.refresh = false;
        }, 30 * 1000);
    }

    toggleMenu();
});

closeMenuButton.addEventListener("click", toggleMenu);

prevButton.addEventListener("click", () => {
    if (!cooldowns.theme) {
        if (currIndex > 1) {
            currIndex--;    
            
            const prevCooldown = cooldownMeters[0];
            
            prevCooldown.classList.toggle("theme-cooldown-active");
            setTimeout(() => {
                prevCooldown.classList.toggle("theme-cooldown-active");
            }, animations.cycle);
    
            resetCopyHoverBackgrounds();
            displayValues();
        }

        cooldowns.theme = true;

        setTimeout(() => {
            cooldowns.theme = false;
        }, animations.cycle + 75);
    }
});

nextButton.addEventListener("click", () => {
    if (!cooldowns.theme) {
        const nextCooldown = cooldownMeters[1];

        nextCooldown.classList.toggle("theme-cooldown-active");
        setTimeout(() => {
            nextCooldown.classList.toggle("theme-cooldown-active");
        }, animations.cycle);
        
        resetCopyHoverBackgrounds();
        
        currIndex++;

        const toggleLength = toggleBackgrounds.length;
        
        if (toggleLength >= maxArrayLength && currIndex > toggleLength - 1) {
            toggleBackgrounds.splice(1, 1);
            currIndex = maxArrayLength - 1;
        }
    
        addToBackgrounds();
        displayValues();

        cooldowns.theme = true;

        setTimeout(() => {
            cooldowns.theme = false;
        }, animations.cycle + 75);
    }
});

async function populateSavedColors() {
    savedThemesList.innerHTML = "";
    
    try {
        const data = await fetchFromAPI("GET", "api/colors/limited");

        if (Array.isArray(data) && data.length > 0) {
            data.forEach(element => {
                const savedTheme = document.createElement("button");
                savedTheme.className = "saved-theme";
                
                savedTheme.style.backgroundColor = element.favorite ? colors.favorite : "white";

                const themeName = document.createElement("div");
                themeName.className = "theme-name";
                themeName.innerText = element.name;

                savedTheme.appendChild(themeName);

                const lineBreak = document.createElement("hr");
                lineBreak.className = "theme-break";
                savedTheme.appendChild(lineBreak);

                const savedColorContainer = document.createElement("div");
                savedColorContainer.className = "saved-color-container";

                element.colors.forEach(attribute => {
                    const savedColor = document.createElement("div");
                    savedColor.className = "saved-color";
                    savedColor.style.backgroundColor = attribute;

                    savedColorContainer.appendChild(savedColor);
                    savedTheme.appendChild(savedColorContainer);
                });

                const hoverBackground = document.createElement("div");
                hoverBackground.className = "saved-theme-hover-background";
                savedTheme.appendChild(hoverBackground);

                savedTheme.addEventListener("mouseenter", () => {
                    hoverBackground.classList.add("hover-active");
                });

                savedTheme.addEventListener("mouseleave", () => {
                    hoverBackground.classList.remove("hover-active");
                })

                savedTheme.addEventListener("click", togglePreviewMode(savedTheme));

                savedThemesList.appendChild(savedTheme);
            });
        } else {
            savedThemesList.innerHTML = `
                <div id="no-themes-found">
                    <p style="font-size: 96px; color: rgba(0, 0, 0, 0.5)"><i class="fa-regular fa-face-frown"></i></p>
                    <h1 style="text-align: center; font-size: 26px">No themes found!</h1>
                    <p><i style="color: rgb(0, 0, 0, 0.75)">Try creating a new one!</i></p>
                </div>`;
        }
    } catch(err) {
        console.error(err);
        pushNotification(statuses.failure, "Colors failed to populate!");
        savedThemesList.innerHTML = `
            <div id="server-error">
                <p style="font-size: 96px; color: rgba(0, 0, 0, 0.5)"><i class="fa-regular fa-face-dizzy"></i></p>
                <h1 style="text-align: center; font-size: 26px">Server Offline!</h1>
                <p><i style="color: rgb(0, 0, 0, 0.75)">Try again later.</i></p>
            </div>`;
    }
}

async function fetchFromAPI(httpMethod, uri, req) {
    const reqBody = {
        method: httpMethod,
        headers: { "Content-Type": "application/json" },
    }

    if (req?.body) reqBody.body = JSON.stringify(req.body);
    
    const response = await fetch(`http://localhost:${PORT}/${uri}`, reqBody);

    return await response.json();
}

function resetCopyHoverBackgrounds() {
    removeListeners("themeAC");
    
    const copyBackground = `
            <i class="fa-regular fa-copy"></i>
            <h1>COPY</h1>`;
    
    colorTheme.forEach((element, i) => {
        const copyButton = copyThemeButtons[i];
        const currEntry = toggleBackgrounds[currIndex];

        if(copyButton.classList.contains("hover-active"))
            copyButton.classList.remove("hover-active");

        if(copyButton.innerHTML !== copyBackground)
        copyButton.innerHTML = `
            <i class="fa-regular fa-copy"></i>
            <h1>COPY</h1>`;

        element.style.backgroundColor = currEntry[i];

        element.addEventListener("mouseenter", () => {
            copyButton.classList.add("hover-active");
        }, { signal: signals.themeAC.signal });

        element.addEventListener("mouseleave", () => {
            copyButton.classList.remove("hover-active");
        }, { signal: signals.themeAC.signal });

        element.addEventListener("click", () => {
            navigator.clipboard.writeText(convertColorValues(element.style.backgroundColor));
            copyButton.innerHTML = `<i class="fa-solid fa-check"></i>`;
        }, { signal: signals.themeAC.signal });
    });
}

function displayValues() {
    const prevContainerChildren = prevContainer.children;
    const nextContainerChildren = nextContainer.children;

    for (let i = 0; i < prevContainerChildren.length; i++)
        prevContainerChildren[i].style.backgroundColor = toggleBackgrounds[currIndex - 1][i];

    if (currIndex < toggleBackgrounds.length - 1)
        for (let i = 0; i < 4; i++)
            nextContainerChildren[i].style.backgroundColor = toggleBackgrounds[currIndex + 1][i];
    else {
        previewNextTheme();
        for (let i = 0; i < 4; i++)
            nextContainerChildren[i].style.backgroundColor = previewBuffer[i];
    }

    resetCopyHoverBackgrounds();
}

function previewNextTheme() {
    const nextColors = document.getElementsByClassName("next-color");
    
    if (previewBuffer.length == 0) {
        for (const color of nextColors) {
            const rand = generateRandomHex();
            color.style.backgroundColor = rand;
            previewBuffer.push(rand);
        }
    }
}

function initializeDefaultValues() {
    for (let i = 0; i < 4; i++) {
        const defaultValue = "#000000";
        prevChild = document.createElement("div");
        prevChild.className = "prev-color";
        prevContainer.appendChild(prevChild);
        previewBuffer.push(defaultValue);
    }
}

function initializeColorTheme() {
    function createThemeEntry(element) {
        const rand = generateRandomHex();
        element.style.backgroundColor = rand;

        previewBuffer.push(rand);

        const nextChild = document.createElement("div");
        nextChild.className = "next-color";
        nextContainer.appendChild(nextChild);
    }

    colorTheme.forEach(element => {
        createThemeEntry(element);
    });
}

initializeDefaultValues();
addToBackgrounds();

function generateRandomHex() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);

    const hexR = r.toString(16).padStart(2, "0");
    const hexG = g.toString(16).padStart(2, "0");
    const hexB = b.toString(16).padStart(2, "0");

    const color = `#${hexR}${hexG}${hexB}`;

    return color;
}

initializeColorTheme();
addToBackgrounds();
displayValues();

function addToBackgrounds() {
    const toggleLength = toggleBackgrounds.length;

    if (currIndex > toggleLength - 1) {
        toggleBackgrounds.push(previewBuffer);
        previewBuffer = [];
    } 
}
