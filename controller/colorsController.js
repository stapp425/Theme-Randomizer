const Color = require("../model/Color");

async function getFavThemes(req, res) {
    try {
        const favThemes = await Color.find({ favorite: true });

        if(!favThemes.length) return res.status(404).json({ "message": `There are no favorited themes!` });

        res.json(favThemes);
    } catch(err) {
        res.status(500).json(`[ERROR]: ${err}`);
    }
}

async function getNormalThemes(req, res) {
    try {
        // Gets ALL documents
        const all = await Color.find({});
        res.json(all);
    } catch(err) {
        res.status(500).json(`[ERROR]: ${err}`);
    }
}

async function addNewTheme(req, res) {
    const themeName = req.body.name;
    const isFavorite = req.body.favorite;
    
    const duplicate = await Color.findOne({ name: themeName })
    
    if(duplicate) return res.status(409).json({ "message": "This color theme already exists!" })

    try {
        await Color.create({
            name: themeName,
            colors: req.body.colors,
            favorite: isFavorite
        });

        res.json({ "SUCCESS": `Color theme ${themeName} successfully created!` });
    } catch(err) {
        res.status(500).json(`[ERROR]: ${err}`);
    }
}

async function updateTheme(req, res) {
    const themeName = req.body.name;
    const newName = req.body.newName;
    const toggleFav = req.body.favorite;

    const nameFound = await Color.findOne({ name: themeName });

    if(!nameFound) return res.status(404).json({ "message": `${themeName} was not found!` })

    try {
        if(newName)
            await Color.updateOne({ name: themeName }, { name: newName });

        if(toggleFav != null && toggleFav !== nameFound.favorite)
            await Color.updateOne({ name: newName ? newName : themeName }, { favorite: toggleFav });            

        res.json({ "SUCCESS": `Color theme ${themeName} successfully updated!` });
    } catch(err) {
        res.status(500).json(`[ERROR]: ${err}`);
    }
}

async function removeTheme(req, res) {
    const themeName = req.body.name;
    const nameFound = await Color.findOne({ name: themeName });

    if(!nameFound) return res.status(404).json({ "message": `${themeName} was not found!` })

    try {
        await Color.deleteOne({ name: themeName });
        res.json({ "SUCCESS": `${themeName} was successfully removed!` })
    } catch(err) {
        res.status(500).json(`[ERROR]: ${err}`);
    }
}

module.exports = {
    getFavThemes,
    getNormalThemes,
    addNewTheme,
    updateTheme,
    removeTheme
}