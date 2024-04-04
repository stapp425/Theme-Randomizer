const paneEntryList = document.getElementsByClassName("pane-entry");
const listEntryList = document.getElementsByClassName("list-entry");
let colorSelector = document.getElementById("color-selector");
const prevContainer = document.getElementById("prev-bg-colors");
const nextContainer = document.getElementById("next-bg-colors");
const nextArrow = document.getElementById("next-arrow");
const prevArrow = document.getElementById("prev-arrow");
const prevButton = document.getElementById("previous-button");
const nextButton = document.getElementById("next-button");
const saveThemeButton = document.getElementById("save-button");
const editButton = document.getElementById("edit-button");
const menuButton = document.getElementById("menu-button");
const closeMenuButton = document.getElementById("close-menu-button");
const savedThemesContainer = document.getElementById("saved-themes-container");
const fadeBackground = document.getElementById("fade-out-background");
const savedThemesList = document.getElementById("saved-themes-list");
const showAllThemesButton = document.getElementById("show-all-themes-button");
const contextMenu = document.getElementById("theme-options");
const previewThemeHeader = document.getElementById("preview-theme-header");
const previewButton = document.getElementById("preview-button");
let themeContainer = document.getElementById("container");

const PORT = 3500;

// CANNOT BE BELOW 3
const maxArrayLength = 5;
const toggleBackgrounds = [];
let previewBuffer = [];
let currentThemeBuffer = [];
let currIndex = 1;

const cooldowns = {
    theme: false,
    button: false,
    refresh: false
}


let inPreviewMode = false;

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

// Periodically refreshes the list IF there are changes
setInterval(() => {
    populateSavedColors();

}, 30 * 1000);

function convertColorValues(colorValue) {
    let result;

    if(colorValue.charAt(0) === "#") {
        const hexValue = colorValue.substring(1);
        const r = parseInt(hexValue.substring(0, 2), 16);
        const g = parseInt(hexValue.substring(2, 4), 16);
        const b = parseInt(hexValue.substring(4, 6), 16);

        result = `rgb(${r}, ${g}, ${b})`;
    } else {
        const rgbValues = colorValue.match(/[0-9]{1,3}/g);

        const hexValues = rgbValues.map(element => {
            const hex = parseInt(element).toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        });

        result = `#${hexValues[0]}${hexValues[1]}${hexValues[2]}`;
    }

    return result;
}

function togglePreviewMode(savedTheme) {
    return () => {
        colorSelector = document.getElementById("color-selector");
        const colorEntries = document.getElementsByClassName("color-entry");
        const colorBackgrounds = document.getElementsByClassName("background");
        const colorValues = document.getElementsByClassName("color-values");
        const copyColorButtons = document.getElementsByClassName("copy");
        const isFavorite = savedTheme?.style.backgroundColor === convertColorValues("#ffffc8");
        themeContainer = document.getElementById("container");

        if(!inPreviewMode) {
            inPreviewMode = true;
    
            closeMenu();

            const savedThemeComponents = savedTheme?.children;
            const savedThemeColors = savedThemeComponents[2].children;
            
            document.body.style.backgroundImage = `url("/img/darkMainTheme.png")`;
            menuButton.style.display = "none";
            previewThemeHeader.style.display = "flex";
            previewThemeHeader.children[0].innerText = savedThemeComponents ? savedThemeComponents[0].innerText : "Theme Name";
            previewButton.style.display = "block";
            prevButton.style.display = "none";
            nextButton.style.display = "none";

            if(savedTheme) {
                if(isFavorite) {
                    themeContainer.style.backgroundColor = "#ffffc8";
                    previewThemeHeader.style.backgroundColor = "#ffffc8";

                    for(const colorEntry of colorEntries)
                        colorEntry.style.background = "#ffffc8";
                }

                for(let i = 0; i < paneEntryList.length; i++)
                    paneEntryList[i].style.backgroundColor = savedThemeColors[i].style.backgroundColor;

                for(let i = 0; i < listEntryList.length; i++)
                    listEntryList[i].style.backgroundColor = savedThemeColors[i + 1].style.backgroundColor;
                
                for(let i = 0; i < savedThemeColors.length; i++) {
                    colorBackgrounds[i].style.backgroundColor = savedThemeColors[i].style.backgroundColor;

                    colorValues[i].innerText = convertColorValues(savedThemeColors[i].style.backgroundColor);

                    copyColorButtons[i].replaceWith(copyColorButtons[i].cloneNode(true));

                    copyColorButtons[i].addEventListener("click", () => {
                        colorSelector.children[i].style.backgroundColor = "darkgrey";
                        copyColorButtons[i].style.backgroundColor = "grey";
                        copyColorButtons[i].innerHTML = `<i class="fa-solid fa-check"></i>`;
                        navigator.clipboard.writeText(colorValues[i].innerText);
                    });
                }                
            }
            
        } else {
            inPreviewMode = false;
    
            openMenu();
            
            document.body.style.backgroundImage = `url("/img/lightMainTheme.png")`;
            menuButton.style.display = "block";
            previewThemeHeader.style.display = "none";
            previewButton.style.display = "none";
            prevButton.style.display = "flex";
            nextButton.style.display = "flex";

            themeContainer.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
            previewThemeHeader.style.backgroundColor = "white";
            
            for(const colorEntry of colorEntries)
                colorEntry.style.background = "white";

            for(let i = 0; i < paneEntryList.length; i++)
                paneEntryList[i].style.backgroundColor = toggleBackgrounds[currIndex][i];

            for(let i = 0; i < listEntryList.length; i++)
                listEntryList[i].style.backgroundColor = toggleBackgrounds[currIndex][i + 1];

            for(let i = 0; i < colorSelector.children.length; i++) {
                // Set the background color of the color to corresponding saved theme value
                colorBackgrounds[i].style.backgroundColor = toggleBackgrounds[currIndex][i];
                
                colorValues[i].innerText = toggleBackgrounds[currIndex][i];

                // Update the copy text button to match the saved theme hex value
                // Delete ALL event listeners
                copyColorButtons[i].innerHTML = `<i class="fa-regular fa-copy"></i>`;
                copyColorButtons[i].style.backgroundColor = "grey";
                
                copyColorButtons[i].replaceWith(copyColorButtons[i].cloneNode(true));
                copyColorButtons[i].addEventListener("click", () => {
                    colorSelector.children[i].style.backgroundColor = "darkgrey";
                    copyColorButtons[i].style.backgroundColor = "grey";
                    copyColorButtons[i].innerHTML = `<i class="fa-solid fa-check"></i>`;
                    navigator.clipboard.writeText(colorValues[i].innerText);
                });
            }
        }
    }
}

function openMenu() {
    savedThemesContainer.style.display = "flex";
    fadeBackground.style.display = "block";
}

function closeMenu() {
    savedThemesContainer.style.display = "none";
    fadeBackground.style.display = "none";
}

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
    
    function responseOk() {
        saveThemeButton.style.backgroundColor = "green";
        saveThemeButton.style.color = "white";
        saveThemeButton.innerHTML = `<i class="fa-solid fa-check"></i>`;

        revertToDefault();


        populateSavedColors();
    }

    function responseNotOk() {
        saveThemeButton.style.backgroundColor = "red";
        saveThemeButton.style.color = "white";
        saveThemeButton.innerHTML = `<i class="fa-solid fa-xmark"></i>`;

        revertToDefault();
    }

    if (inputValue && !cooldowns.button) {
        try {
            const response = await fetch(`http://localhost:${PORT}/api/colors`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: inputValue,
                    colors: toggleBackgrounds[currIndex],
                    favorite: false
                })
            });
            
            if (response.ok)
                responseOk();
            else 
                responseNotOk();
            
            const data = await response.json();
            console.log(data);
        } catch(err) {
            console.error("[ERROR]: Somethin went wrong adding the theme color.");
        }    
    } else
        responseNotOk();

        cooldowns.button = true;

        setTimeout(() => {
            cooldowns.button = false;
        }, 6000);
});

showAllThemesButton.addEventListener("click", () => {
    open(`http://localhost:${PORT}/all`, "_blank");
});

async function populateSavedColors() {
    console.log("color update called")
    if(!cooldowns.refresh) {
        
        // Empty list
        savedThemesList.innerHTML = "";
        
        try {
            const response = await fetch(`http://localhost:${PORT}/api/colors/limited`, {
                headers: {
                    "Content-Type": "application/json"
                }
            });

            const data = await response.json();
            
            if (Array.isArray(data) && data.length > 0) {
                for(let i = 0; i < data.length; i++) {
                    const savedTheme = document.createElement("button");
                    savedTheme.className = "saved-theme";
                    
                    savedTheme.style.backgroundColor = data[i].favorite ? "#ffffc8" : "white";

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

        cooldowns.refresh = true;

        setTimeout(() => {
            cooldowns.refresh = false;
        }, 2000);
    }   
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

    paneEntryList[0].style.backgroundColor = currEntry[0];
    listEntryList[0].style.backgroundColor = currEntry[1];
    listEntryList[1].style.backgroundColor = currEntry[2];
    listEntryList[2].style.backgroundColor = currEntry[3];
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

    for (const paneEntry of paneEntryList)
        createThemeEntry(paneEntry)

    for (const listEntry of listEntryList)
        createThemeEntry(listEntry)
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