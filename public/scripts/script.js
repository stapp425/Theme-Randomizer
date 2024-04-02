const paneEntryList = document.getElementsByClassName("pane-entry");
const listEntryList = document.getElementsByClassName("list-entry");
const colorSelector = document.getElementById("color-selector");
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
const themeContainer = document.getElementById("container");

const PORT = 3500;

// CANNOT BE BELOW 3
const maxArrayLength = 5;
const toggleBackgrounds = [];
let previewBuffer = [];
let currIndex = 1;

const cooldowns = {
    theme: false,
    button: false,
    refresh: false
}

let changesMade = true;
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
    changesMade = false;
}, 20 * 1000);

function togglePreviewMode(savedTheme) {
    return () => {
        const colorSelector = document.getElementById("color-selector");

        if(!inPreviewMode) {
            inPreviewMode = true;
    
            closeMenu();

            const savedThemeComponents = savedTheme?.children;
            
            document.body.style.backgroundImage = `url("/img/darkMainTheme.png")`;
            menuButton.style.display = "none";
            previewThemeHeader.style.display = "flex";
            previewThemeHeader.children[0].innerText = savedThemeComponents ? savedThemeComponents[0].innerText : "Theme Name";
            previewButton.style.display = "block";
            prevButton.style.display = "none";
            nextButton.style.display = "none";

            if(savedTheme) {
                const savedThemeColors = savedThemeComponents[2].children;

                for(let i = 0; i < paneEntryList.length; i++)
                paneEntryList[i].style.backgroundColor = savedThemeColors[i].style.backgroundColor;

                for(let i = 0; i < listEntryList.length; i++)
                listEntryList[i].style.backgroundColor = savedThemeColors[i + 1].style.backgroundColor;
            
                for(const colorEntry of colorSelector.children) {
                    const colorOptions = colorEntry.children;
                    
                    
                    for(let i = 0; i < colorOptions.length; i++) {
                        colorOptions[0].style.backgroundColor = savedThemeComponents[i].style.backgroundColor;

                        // TODO
                    }
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

            for(let i = 0; i < paneEntryList.length; i++)
                paneEntryList[i].style.backgroundColor = toggleBackgrounds[currIndex][i];

            for(let i = 0; i < listEntryList.length; i++)
                listEntryList[i].style.backgroundColor = toggleBackgrounds[currIndex][i + 1];
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

        changesMade = true;
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
    if(!cooldowns.refresh && changesMade) {
        
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
        <div class="background"></div>        

        <div class="color-values">
            <p class="Hex-Value">Random Hex Value</p>
        </div>

        <button class="copy"><i class="fa-regular fa-copy"></i></button>
    `;

    const newEntryChildren = newEntry.children;
    const copiedBackground = newEntryChildren[0];
    const copiedHexVal = newEntryChildren[1].children[0];
    const copyButton = newEntryChildren[2];
    
    copiedBackground.style.backgroundColor = color;
    copiedHexVal.innerText = color;
    copyButton.innerHTML = `<i class="fa-regular fa-copy"></i>`;

    copyButton.addEventListener("click", () => {
        newEntry.style.backgroundColor = "grey";
        copyButton.innerHTML = `<i class="fa-solid fa-check"></i>`;
        navigator.clipboard.writeText(copiedHexVal.innerText);
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