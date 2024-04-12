const colorTheme = [...document.getElementsByClassName("pane-entry"), ...document.getElementsByClassName("list-entry")];
const copyThemeButtons = [...document.getElementsByClassName("copy-theme-background")];
const colorSelector = document.getElementById("color-selector");
const prevContainer = document.getElementById("prev-bg-colors");
const nextContainer = document.getElementById("next-bg-colors");
const nextArrow = document.getElementById("next-arrow");
const prevArrow = document.getElementById("prev-arrow");
const prevButton = document.getElementById("previous-button");
const nextButton = document.getElementById("next-button");
const saveThemeButton = document.getElementById("save-button");
const menuButton = document.getElementById("menu-button");
const closeMenuButton = document.getElementById("close-menu-button");
const savedThemesContainer = document.getElementById("saved-themes-container");
const menuFadeBackground = document.getElementById("menu-fade-background");
const popupFadeBackground = document.getElementById("popup-fade-background");
const savedThemesList = document.getElementById("saved-themes-list");
const showAllThemesButton = document.getElementById("show-all-themes-button");
const contextMenu = document.getElementById("theme-options");
const previewThemeHeader = document.getElementById("preview-theme-header");
const themeContainer = document.getElementById("container");
const previewOptions = document.getElementById("preview-options");
const editButtons = document.getElementById("edit-options");
const favoriteButton = document.getElementById("favorite-button");
const renameButton = document.getElementById("rename-button");
const deleteButton = document.getElementById("delete-button");
const previewButton = document.getElementById("preview-button");
const notification = document.getElementById("notification");
const deletePopupWindow = document.getElementById("delete-prompt-popup-window");
const popupWindows = [...document.getElementsByClassName("popup-window")];
const cancelButtons = [...document.getElementsByClassName("cancel-button")];
const confirmButtons = [...document.getElementsByClassName("confirm-button")];
const namePrompt = document.getElementById("name-prompt");
const renameThemeInput = document.getElementById("rename-theme-input");

const PORT = 3500;

const signals = {
    confirmAC: new AbortController(),
    themeAC: new AbortController()
}

// CANNOT BE BELOW 3
const maxArrayLength = 5;
const toggleBackgrounds = [];
let previewBuffer = [];
let currentThemeBuffer = [];
let currIndex = 1;

let inPreviewMode = false;
let popupWindowOpen = false;

const animations = {
    menu: 100,
    notification: 3000,
    theme: 175,
    popup: 175,
    copy: 200
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


function removeListeners(abortController) {
    
    signals[abortController].abort();
    signals[abortController] = new AbortController();
}

function pushNotification(status, statusMessage) {
    const notifElements = notification.children;
    
    notification.style.display = "flex";
    notification.style.backgroundColor = status.color;
    
    notifElements[0].innerHTML = status.icon;

    setTimeout(() => {
        notification.style.display = "none";
    }, animations.notification);

    notification.animate(
        [
            {
                top: "-20px",
                offset: 0
            },
            {
                top: "20px",
                offset: 0.1
            },
            {
                top: "20px",
                offset: 0.9
            },
            {
                top: "-60px",
                offset: 1
            }
        ],
        {
            duration: animations.notification,
            fill: "forwards",
            ease: "ease-in"
        }
    );
    
    notifElements[1].innerText = statusMessage;

    notifElements[2].addEventListener("click", () => {
        notification.style.display = "none";
    });
}

setArrows();

function setArrows() {
    if (matchMedia("(max-width: 1049px)").matches) {
        nextArrow.innerHTML = '<i class="fa-solid fa-angle-down"></i>';
        prevArrow.innerHTML = '<i class="fa-solid fa-angle-up"></i>';
    } else {
        nextArrow.innerHTML = '<i class="fa-solid fa-angle-right"></i>';
        prevArrow.innerHTML = '<i class="fa-solid fa-angle-left"></i>';
    }  
}

addEventListener("resize", setArrows);

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
            closeMenu();

            theme = "dark";
            previewBlock = "block"; previewFlex = "flex";
            mainBlock = "none"; mainFlex = "none";
        } else {
            populateSavedColors();
            openMenu();

            theme = "light";
            previewBlock = "none"; previewFlex = "none";
            mainBlock = "block"; mainFlex = "flex";
        }        
        
        document.body.style.backgroundImage = `url("/img/${theme}MainTheme.png")`;
        menuButton.style.display = mainBlock;
        previewThemeHeader.style.display = previewFlex;
        favoriteButton.style.display = previewFlex;
        previewOptions.style.display = previewFlex;
        prevButton.style.display = mainFlex;
        nextButton.style.display = mainFlex;
    }
    
    return () => {
        const colorBackgrounds = document.getElementsByClassName("background");
        const colorValues = document.getElementsByClassName("color-values");
        const copyColorButtons = document.getElementsByClassName("copy");
        const colorEntries = colorSelector.children;
        
        let bgColor, colorEntity;
        
        // savedTheme will be guaranteed to exist if preview mode is false
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

        toggleVisibility(inPreviewMode);

        previewThemeHeader.style.backgroundColor = bgColor;

        styleFavoriteButton();

        for(let i = 0; i < colorEntity.length; i++) {
            colorTheme[i].style.backgroundColor = colorEntity[i];

            colorEntries[i].style.backgroundColor = colors.normal;
            
            colorBackgrounds[i].style.backgroundColor = colorEntity[i];

            colorValues[i].innerText = colorEntity[i];

            copyColorButtons[i].innerHTML = `<i class="fa-regular fa-copy"></i>`;
            copyColorButtons[i].addEventListener("click", () => {
                colorEntries[i].style.backgroundColor = "darkgrey";
                copyColorButtons[i].style.backgroundColor = "grey";
                copyColorButtons[i].innerHTML = `<i class="fa-solid fa-check"></i>`;
                navigator.clipboard.writeText(colorValues[i].innerText);
            });
        }
    }
}

function openMenu() {
    savedThemesContainer.style.display = "flex";
    menuFadeBackground.style.display = "block";

    menuFadeBackground.animate([
        { opacity: "0" }, { opacity: "1" }
    ],
    {
        duration: animations.menu,
        fill: "forwards",
        easing: "ease-in"
    });
    
    savedThemesContainer.animate([
        { left: "-300px" },
        { left: "0" }
    ],
    {
        duration: animations.menu,
        fill: "forwards",
        easing: "ease-in"
    });
}

function closeMenu() {
    setTimeout(() => {
        menuFadeBackground.style.display = "none";
        savedThemesContainer.style.display = "none";
    }, animations.menu);
    
    menuFadeBackground.animate(
        [
            { opacity: "1" }, 
            { opacity: "0" }
        ],
        {
            duration: animations.menu,
            fill: "forwards",
            easing: "ease-in"
        }
    );

    savedThemesContainer.animate(
        [
            { left: "0" },
            { left: "-300px" }
        ],
        {
            duration: animations.menu,
            fill: "forwards",
            easing: "ease-in"
        }
    );

    // TODO: Make display none after animation ends

    menuFadeBackground.style.display = "none";
}

function toggleFadeBackground() {
    let display;
    
    if(!popupWindowOpen) {
        display = "none";
    } else {
        display = "block";
    }

    menuFadeBackground.style.display = display;
}

function togglePopupWindow(index) {
    let display;

    if(!popupWindowOpen) {
        popupFadeBackground.style.display = "block";
        
        popupFadeBackground.animate(
            [
                { 
                    opacity: "0",
                    backdropFilter: "blur(0)"
                }, { 
                    opacity: "1",
                    backdropFilter: "blur(2px)"
                }
            ],
            {
                duration: animations.menu,
                fill: "forwards",
                easing: "ease-in"
            }
        );

        popupWindowOpen = true;
        display = "flex";
    } else {
        setTimeout(() => {
            popupFadeBackground.style.display = "none";
        }, animations.popup);

        popupFadeBackground.animate(
            [
                { 
                    opacity: "1",
                    backdropFilter: "blur(2px)"
                }, { 
                    opacity: "0",
                    backdropFilter: "blur(0)"
                }
            ],
            {
                duration: animations.menu,
                fill: "forwards",
                easing: "ease-in"
            }
        );

        popupWindowOpen = false;
        display = "none";
    }

    popupWindows[index].style.display = display;
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
        ${favButtonStar}
        ${favButtonText}
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

    openMenu();
});

closeMenuButton.addEventListener("click", closeMenu);

prevButton.addEventListener("click", () => {
    if (!cooldowns.theme) {
        if (currIndex > 1) {
            currIndex--;        
    
            displayValues();
            updateCurrentValues();
        }

        cooldowns.theme = true;

        setTimeout(() => {
            cooldowns.theme = false;
        }, 750);
    }
});

nextButton.addEventListener("click", () => {
    if (!cooldowns.theme) {
        const copyBackground = `
            <i class="fa-regular fa-copy"></i>
            <h1>COPY</h1>`;

        copyThemeButtons.forEach(element => {
            if(element.innerHTML !== copyBackground)
                element.innerHTML = `
                    <i class="fa-regular fa-copy"></i>
                    <h1>COPY</h1>`;
        });
        
        removeListeners("themeAC");
        
        currIndex++;

        const toggleLength = toggleBackgrounds.length;
        
        if (toggleLength >= maxArrayLength && currIndex > toggleLength - 1) {
            toggleBackgrounds.splice(1, 1);
            currIndex = maxArrayLength - 1;
        }
    
        addToBackgrounds();
        displayValues();
        updateCurrentValues();

        cooldowns.theme = true;

        setTimeout(() => {
            cooldowns.theme = false;
        }, 750);
    }
});

saveThemeButton.addEventListener("click", async () => {
    const themeInput = document.getElementById("name-prompt");
    const inputValue = themeInput.value;
    
    function revertToDefault() {        
        setTimeout(() => {
            saveThemeButton.style.backgroundColor = "lightgrey";
            saveThemeButton.innerText = "Save!";
            saveThemeButton.style.color = "black";
        }, 5000);
    }

    if (inputValue && !cooldowns.button) {
        try {
            const data = await fetchFromAPI("POST", "api/colors", {
                body: {
                    name: inputValue,
                    colors: toggleBackgrounds[currIndex],
                    favorite: false
                }
            });
            
            if (Object.hasOwn(data, "SUCCESS"))
                await responseOk();
            else 
                responseNotOk();
        } catch(err) {
            console.error(`[ERROR]: ${err}`);
            pushNotification(statuses.failure, "Theme failed to save!");
        }    
    } else
        responseNotOk();

    cooldowns.button = true;

    setTimeout(() => {
        cooldowns.button = false;
    }, 6000);

    async function responseOk() {
        revertToDefault();

        saveThemeButton.style.backgroundColor = "green";
        saveThemeButton.style.color = "white";
        saveThemeButton.innerHTML = `<i class="fa-solid fa-check"></i>`;

        pushNotification(statuses.success, "Theme created!");
        populateSavedColors();
    }

    function responseNotOk() {
        saveThemeButton.style.backgroundColor = "red";
        saveThemeButton.style.color = "white";
        saveThemeButton.innerHTML = `<i class="fa-solid fa-xmark"></i>`;

        pushNotification(statuses.failure, !inputValue ? "Enter a theme name." : "Theme already exists!");

        revertToDefault();
    }
});

showAllThemesButton.addEventListener("click", () => {
    open(`http://localhost:${PORT}/all`, "_blank");
});

async function populateSavedColors() {
    // Empty list
    savedThemesList.innerHTML = "";
    
    try {
        const data = await fetchFromAPI("GET", "api/colors/limited");
        
        if (Array.isArray(data) && data.length > 0) {
            for(let i = 0; i < data.length; i++) {
                const savedTheme = document.createElement("button");
                savedTheme.className = "saved-theme";
                
                savedTheme.style.backgroundColor = data[i].favorite ? colors.favorite : "white";

                const themeName = document.createElement("div");
                themeName.className = "theme-name";
                themeName.innerText = data[i].name;

                savedTheme.appendChild(themeName);

                const lineBreak = document.createElement("hr");
                lineBreak.className = "theme-break";
                savedTheme.appendChild(lineBreak);

                const savedColorContainer = document.createElement("div");
                savedColorContainer.className = "saved-color-container";

                for(let j = 0; j < data[i].colors.length; j++) {
                    const savedColor = document.createElement("div");
                    savedColor.className = "saved-color";
                    savedColor.style.backgroundColor = data[i].colors[j];

                    savedColorContainer.appendChild(savedColor);
                    savedTheme.appendChild(savedColorContainer);
                }

                // TODO: Position each hover background correctly
                const hoverBackground = document.createElement("div");
                hoverBackground.className = "saved-theme-hover-background";
                savedTheme.appendChild(hoverBackground);

                savedTheme.addEventListener("mouseenter", () => {
                    hoverBackground.animate(
                        [
                            { opacity: "0" },
                            { opacity: "1" }
                        ],
                        {
                            duration: animations.theme,
                            fill: "forwards",
                            easing: "ease-in"
                        }
                    );
                });

                savedTheme.addEventListener("mouseleave", () => {
                    hoverBackground.animate(
                        [
                            { opacity: "1" },
                            { opacity: "0" }
                        ],
                        {
                            duration: animations.theme,
                            fill: "forwards",
                            easing: "ease-in"
                        }
                    );
                })

                savedTheme.addEventListener("click", togglePreviewMode(savedTheme));

                savedThemesList.appendChild(savedTheme);
            }
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

function displayValues() {
    const prevContainerChildren = prevContainer.children;
    const nextContainerChildren = nextContainer.children;
    const currEntry = toggleBackgrounds[currIndex];

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

    colorTheme.forEach((element, i) => {
        const copyButton = copyThemeButtons[i];
        element.style.backgroundColor = currEntry[i];

        element.addEventListener("click", () => {
            navigator.clipboard.writeText(convertColorValues(element.style.backgroundColor));
            
            copyButton.innerHTML = `<i class="fa-solid fa-check"></i>`;
        }, { signal: signals.themeAC.signal });

        element.addEventListener("mouseenter", () => {
            copyButton.style.display = "flex";
            copyButton.animate(
                [
                    { opacity: "0" },
                    { opacity: "1" }
                ],
                {
                    duration: animations.copy,
                    fill: "forwards",
                    ease: "ease-in"
                }
            );
        }, { signal: signals.themeAC.signal });

        element.addEventListener("mouseleave", () => {
            setTimeout(() => {
                copyButton.style.display = "none";
            }, animations.copy);

            copyButton.animate(
                [
                    { opacity: "1" },
                    { opacity: "0" }
                ],
                {
                    duration: animations.copy,
                    fill: "forwards",
                    ease: "ease-in"
                }
            );
        }, { signal: signals.themeAC.signal });
    });
}

function updateCurrentValues() {
    const colorSelectorChildren = colorSelector.children;

    for (let i = 0; i < colorSelectorChildren.length; i++) {
        const copyEntry = colorSelectorChildren[i].children;

        colorSelectorChildren[i].style.backgroundColor = "white";
        
        const hexText = toggleBackgrounds[currIndex][i];
        copyEntry[0].style.backgroundColor = hexText;
        copyEntry[1].innerText = hexText;

        const copyButton = copyEntry[2];

        copyButton.innerHTML = `<i class="fa-regular fa-copy"></i>`;

        copyButton.addEventListener("click", () => {
            copyButton.children[0].style.backgroundColor = "grey";
            copyButton.innerHTML = `<i class="fa-solid fa-check"></i>`;
            navigator.clipboard.writeText(hexText);
        });
    }
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

        const entry = createEntry(rand);
        colorSelector.appendChild(entry);
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

function createEntry(color = "#000000") {
    const newEntry = document.createElement("div");
    newEntry.className = "color-entry";

    newEntry.innerHTML = `
        <div class="background" style="background-color: ${color}"></div>        
        
        <div class="color-values">
            ${color}
        </div>

        <button class="copy"><i class="fa-regular fa-copy"></i></button>
    `;

    const newEntryChildren = newEntry.children;
    const copyButton = newEntryChildren[2];

    copyButton.addEventListener("click", () => {
        newEntry.style.backgroundColor = "grey";
        copyButton.innerHTML = `<i class="fa-solid fa-check"></i>`;
        navigator.clipboard.writeText(color);
    });

    return newEntry;
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
