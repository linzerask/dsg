#target photoshop
app.bringToFront();

var basePath = "C:/Users/43670/Desktop/Graphics/AnonymCreator - Digitalstudion/Webseiten/DSG Liga/Website/Logos/";
var wallpaperPath = basePath + "Matchday_Wallpapers/";
var assetsPath = wallpaperPath + "assets/";
var gornjakLogoFile = new File(basePath + "Ready/standard/fcgornjak.png");
var heiligenbergLogoFile = new File(basePath + "Ready/standard/unionheiligenberg.png");
var dsgLogoFile = new File(basePath + "Ready/standard/DSGLiga.png");

function placeImage(doc, file, targetWidth, x, y) {
    if (!file.exists) return null;
    var placedDoc = app.open(file);
    placedDoc.selection.selectAll();
    placedDoc.selection.copy();
    placedDoc.close(SaveOptions.DONOTSAVECHANGES);
    
    app.activeDocument = doc;
    var layer = doc.paste();
    var bounds = layer.bounds;
    var curW = bounds[2].value - bounds[0].value;
    var scale = (targetWidth / curW) * 100;
    layer.resize(scale, scale, AnchorPosition.TOPLEFT);
    
    var newBounds = layer.bounds;
    var deltaX = x - newBounds[0].value;
    var deltaY = y - newBounds[1].value;
    layer.translate(deltaX, deltaY);
    return layer;
}

function createTextLayer(doc, group, text, x, y, size, hexColor, fontName, justification) {
    var textLayer = doc.artLayers.add();
    textLayer.kind = LayerKind.TEXT;
    var ti = textLayer.textItem;
    ti.contents = text;
    ti.size = size;
    var c = new SolidColor();
    c.rgb.hexValue = hexColor;
    ti.color = c;
    if (fontName) {
        try { ti.font = fontName; } catch(e) {}
    }
    if (justification) {
        ti.justification = justification;
    }
    ti.position = [x, y];
    if (group) textLayer.move(group, ElementPlacement.INSIDE);
    return textLayer;
}

// Concept definitions
var concepts = [
    {
        name: "Concept_1_Cyber_Neon",
        bgFile: "bg_concept1.png",
        title: "MATCHDAY",
        sub: "OFFIZIELLER SPIELTAG • 2026/2027",
        date: "SA 03.10.2026",
        time: "16:00 UHR",
        tagHome: "HEIM",
        tagAway: "GAST"
    },
    {
        name: "Concept_2_Swiss_Minimalist",
        bgFile: "bg_concept2.png",
        title: "NEXT FIXTURE",
        sub: "DSG LIGA MEISTERSCHAFT",
        date: "03 / 10 / 2026",
        time: "16:00 UHR",
        tagHome: "HOME",
        tagAway: "AWAY"
    },
    {
        name: "Concept_3_Dynamic_Split",
        bgFile: "bg_concept3.png",
        title: "MATCHDAY",
        sub: "DSG LIGA SPIELTAG",
        date: "SAMSTAG, 03.10.2026",
        time: "16:00 UHR",
        tagHome: "FC GORNJAK",
        tagAway: "HEILIGENBERG"
    },
    {
        name: "Concept_4_Atmospheric_Stadium",
        bgFile: "bg_concept4.png",
        title: "MATCHDAY",
        sub: "SPORTPLATZ • LIGASPIEL",
        date: "SAMSTAG • 03.10.2026",
        time: "16:00 UHR",
        tagHome: "FC GORNJAK",
        tagAway: "UNION HEILIGENBERG"
    },
    {
        name: "Concept_5_Urban_Street",
        bgFile: "bg_concept5.png",
        title: "MATCHDAY",
        sub: "OFFICIAL PASS",
        date: "03.10.2026",
        time: "16:00 UHR",
        tagHome: "HOME SQUAD",
        tagAway: "AWAY SQUAD"
    }
];

// Build each concept PSD
for (var i = 0; i < concepts.length; i++) {
    var c = concepts[i];
    var doc = app.documents.add(1080, 1080, 72, c.name, NewDocumentMode.RGB, DocumentFill.TRANSPARENT);
    
    // Group: Background
    var grpBg = doc.layerSets.add();
    grpBg.name = "Background & Lighting";
    var bgImgFile = new File(assetsPath + c.bgFile);
    if (bgImgFile.exists) {
        var bgLayer = placeImage(doc, bgImgFile, 1080, 0, 0);
        if (bgLayer) bgLayer.move(grpBg, ElementPlacement.INSIDE);
    }
    
    // Group: Shields & Clash
    var grpShields = doc.layerSets.add();
    grpShields.name = "Clash & Team Shields";
    
    var gornjakLyr = placeImage(doc, gornjakLogoFile, 270, 135, 290);
    if (gornjakLyr) {
        gornjakLyr.name = "FC Gornjak Crest";
        gornjakLyr.move(grpShields, ElementPlacement.INSIDE);
    }
    
    var heiligenbergLyr = placeImage(doc, heiligenbergLogoFile, 270, 675, 290);
    if (heiligenbergLyr) {
        heiligenbergLyr.name = "Union Heiligenberg Crest";
        heiligenbergLyr.move(grpShields, ElementPlacement.INSIDE);
    }
    
    // Group: Typography & Info
    var grpText = doc.layerSets.add();
    grpText.name = "Typography & Match Details";
    
    var dsgLyr = placeImage(doc, dsgLogoFile, 220, (1080 - 220)/2, 45);
    if (dsgLyr) {
        dsgLyr.name = "DSG Liga Official Logo";
        dsgLyr.move(grpText, ElementPlacement.INSIDE);
    }
    
    createTextLayer(doc, grpText, c.title, 540, 200, 48, "FFFFFF", "Impact", Justification.CENTER);
    createTextLayer(doc, grpText, "FC GORNJAK", 270, 620, 22, "FFFFFF", "Arial-BoldMT", Justification.CENTER);
    createTextLayer(doc, grpText, "UNION HEILIGENBERG", 810, 620, 22, "FFFFFF", "Arial-BoldMT", Justification.CENTER);
    createTextLayer(doc, grpText, "VS", 540, 430, 32, "FFD700", "Impact", Justification.CENTER);
    
    createTextLayer(doc, grpText, c.date + " • " + c.time, 540, 880, 26, "FFFFFF", "Arial-BoldMT", Justification.CENTER);
    createTextLayer(doc, grpText, "DSG LIGA MEISTERSCHAFT", 540, 930, 16, "00DCFF", "ArialMT", Justification.CENTER);
    
    // Save as PSD
    var psdOptions = new PhotoshopSaveOptions();
    psdOptions.layers = true;
    psdOptions.embedColorProfile = true;
    var psdFile = new File(wallpaperPath + c.name + ".psd");
    doc.saveAs(psdFile, psdOptions, true, Extension.LOWERCASE);
}

"All 5 PSDs successfully built and saved in Photoshop!";
