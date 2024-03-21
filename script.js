const paneEntryList = document.getElementsByClassName("pane-entry");
const listEntryList = document.getElementsByClassName("list-entry");
const colorSelector = document.getElementById("color-selector");
const prevContainer = document.getElementById("prev-bg-colors");
const nextContainer = document.getElementById("next-bg-colors");
const nextArrow = document.getElementById("next-arrow");
const prevArrow = document.getElementById("prev-arrow");
const prevButton = document.getElementById("previous-button");
const nextButton = document.getElementById("next-button");

// CANNOT BE BELOW 3
const maxArrayLength = 5;
const toggleBackgrounds = [];
let previewBuffer = [];
let currIndex = 1;

const cooldown = 750;
let isOnCooldown = false;

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

function setCooldown() {
    isOnCooldown = true;

    setTimeout(() => {
        isOnCooldown = false;
    }, cooldown)
}

addEventListener("resize", setArrows);

prevButton.addEventListener("click", () => {
    if (!isOnCooldown) {
        if (currIndex > 1) {
            currIndex--;        
    
            displayValues();
            updateCurrentValues();
        }

        setCooldown();
    }
});

nextButton.addEventListener("click", () => {
    if (!isOnCooldown) {
        currIndex++;

        const toggleLength = toggleBackgrounds.length;
        
        if (toggleLength >= maxArrayLength && currIndex > toggleLength - 1) {
            toggleBackgrounds.splice(1, 1);
            currIndex = maxArrayLength - 1;
        }
    
        addToBackgrounds();
        displayValues();
        updateCurrentValues();

        setCooldown();
    }
});

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
        for (color of nextColors) {
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

    for (paneEntry of paneEntryList)
        createThemeEntry(paneEntry)

    for (listEntry of listEntryList)
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

function addToBackgrounds() {
    const toggleLength = toggleBackgrounds.length;

    if (currIndex > toggleLength - 1) {
        toggleBackgrounds.push(previewBuffer);
        previewBuffer = [];
    } 
}