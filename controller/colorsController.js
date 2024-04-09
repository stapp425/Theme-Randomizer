const Color = require("../model/Color");

async function getAllThemes(req, res) {
    try {
        // Favorites go first
        const allThemes = await Color.find().sort({
            favorite: -1,
            name: 1
        });

        if(!allThemes) res.status(404).json({ "FAILURE" : "There are no themes present!" });

        res.json(allThemes)
    } catch(err) {
        res.status(500).json(`[ERROR]: ${err}`);
    }
}

async function getFavThemes(req, res) {
    try {
        const favThemes = await Color.find({ favorite: true });

        if(!favThemes.length) return res.status(404).json({ "FAILURE": `There are no favorited themes!` });

        res.json(favThemes);
    } catch(err) {
        res.status(500).json(`[ERROR]: ${err}`);
    }
}

async function getNormalThemes(req, res) {
    try {
        // Gets ALL documents
        const all = await Color.find({ favorite: false });
        res.json(all);
    } catch(err) {
        res.status(500).json(`[ERROR]: ${err}`);
    }
}

// For displaying in the side menu
async function getLimitedThemes(req, res) {
    try {
        const limitedThemes = await Color.find().sort({
            favorite: -1,
            name: 1
        }).limit(process.env.MAX_THEMES_DISPLAYED);
        
        if(!limitedThemes) return res.status(409).json({ "FAILURE": "There are no themes!" })
        
        res.json(limitedThemes);
    } catch(err) {
        res.status(500).json(`[ERROR]: ${err}`);
    }
}

async function addNewTheme(req, res) {
    const themeName = req.body.name;
    const isFavorite = req.body.favorite;
    
    const duplicate = await Color.findOne({ name: themeName })
    
    if(duplicate) return res.status(409).json({ "FAILURE": "This color theme already exists!" })

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

    if(!themeName) return res.status(400).json({ "BAD REQUEST": "Please enter a theme name." });
    if(toggleFav == null && !newName) return res.status(400).json({ "BAD REQUEST": "Please enter a new theme name and/or a favorite." }); 
    if(newName === themeName) return res.status(409).json({ "FAILURE": `The theme names match!` });
    
    const nameFound = await Color.findOne({ name: themeName });
    const themeWithNewName = await Color.findOne({ name: newName });

    if(!nameFound) return res.status(404).json({ "FAILURE": `${themeName} was not found!` });    
    if(themeWithNewName) return res.status(409).json({ "FAILURE": `${newName} already exists!`});    
    
    try {
        if(toggleFav !== nameFound.favorite)
            await Color.updateOne({ name: themeName }, { favorite: toggleFav });

        await Color.updateOne({ name: themeName }, { name: newName });

        res.json({ "SUCCESS": `Color theme ${themeName} successfully updated!` });
    } catch(err) {
        res.status(500).json(`[ERROR]: ${err}`);
    }
}

async function removeTheme(req, res) {
    const themeName = req.body.name;
    const nameFound = await Color.findOne({ name: themeName });

    if(!nameFound) return res.status(404).json({ "FAILURE": `${themeName} was not found!` })

    try {
        await Color.deleteOne({ name: themeName });
        res.json({ "SUCCESS": `${themeName} was successfully removed!` })
    } catch(err) {
        res.status(500).json(`[ERROR]: ${err}`);
    }
}

module.exports = {
    getAllThemes,
    getFavThemes,
    getNormalThemes,
    getLimitedThemes,
    addNewTheme,
    updateTheme,
    removeTheme
}