const colorTheme = [...document.getElementsByClassName("pane-entry"), ...document.getElementsByClassName("list-entry")];
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
const fadeBackground = document.getElementById("fade-out-background");
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
const popupWindow = document.getElementById("prompt-popup-window");
const promptCancelButton = document.getElementById("cancel-button");
const promptConfirmButton = document.getElementById("confirm-button");

const PORT = 3500;

let confirmAC = new AbortController();

// CANNOT BE BELOW 3
const maxArrayLength = 5;
const toggleBackgrounds = [];
let previewBuffer = [];
let currentThemeBuffer = [];
let currIndex = 1;

let inPreviewMode = false;
let popupWindowOpen = false;

const cooldowns = {
    theme: false,
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

function pushNotification(status, statusMessage) {
    const notifElements = notification.children;

    notification.style.display = "flex";
    notification.style.backgroundColor = status.color;
    
    notifElements[0].innerHTML = status.icon;

    notifElements[1].innerText = statusMessage;

    notifElements[2].addEventListener("click", () => {
        notification.style.display = "none";
    });

    setTimeout(() => {
        notification.style.display = "none";
    }, 5000)
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

setInterval(populateSavedColors, 30 * 1000);

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
    fadeBackground.style.display = "block";
    fadeBackground.style.backdropFilter = "blur(0px)";
}

function closeMenu() {
    savedThemesContainer.style.display = "none";
    fadeBackground.style.display = "none";
}

function togglePopupWindow() {
    let display;
    let blur

    if(!popupWindowOpen) {
        popupWindowOpen = true;
        display = "flex";
        blur = "blur(2px)";
    } else {
        popupWindowOpen = false;
        display = "none";
        blur = "blur(0px)";
    }

    popupWindow.style.display = display;
    fadeBackground.style.display = display;
    fadeBackground.style.backdropFilter = blur;
}

function removeTheme() {
    const previewThemeName = previewThemeHeader.children[0].innerText;
    togglePopupWindow();

    

    const copiedCurrColors = [...document.getElementsByClassName("delete-color")];

    document.getElementById("delete-theme-name").innerText = previewThemeName;
    
    copiedCurrColors.forEach((element, i) => {
        element.style.backgroundColor = colorTheme[i].style.backgroundColor;
    });

    // Removed if either clicked on or cancel button is clicked
    // Listener ABORTED (removed)
    promptConfirmButton.addEventListener("click", async () => {
        await fetchFromAPI("DELETE", "api/colors", {
            body: {
                name: previewThemeName
            }
        });

        togglePopupWindow();
        setTimeout(togglePreviewMode(), 0);
        
        pushNotification(statuses.alert, "Theme deleted!");
        populateSavedColors();
    }, { once: true, signal: confirmAC.signal });
}

promptCancelButton.addEventListener("click", () => {
    confirmAC.abort();
    confirmAC = new AbortController();
    togglePopupWindow();
});

deleteButton.addEventListener("click", removeTheme);

previewButton.addEventListener("click", togglePreviewMode());

menuButton.addEventListener("click", openMenu);

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
                responseOk();
            else 
                responseNotOk();
        } catch(err) {
            console.error(`[ERROR]: ${err}`);
        }    
    } else
        responseNotOk();

    cooldowns.button = true;

    setTimeout(() => {
        cooldowns.button = false;
    }, 6000);

    function responseOk() {
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
        console.error(`[ERROR]: Colors failed to populate!\nReason: ${err}`);
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
        element.style.backgroundColor = currEntry[i];
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

populateSavedColors();

function addToBackgrounds() {
    const toggleLength = toggleBackgrounds.length;

    if (currIndex > toggleLength - 1) {
        toggleBackgrounds.push(previewBuffer);
        previewBuffer = [];
    } 
}