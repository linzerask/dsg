
#target photoshop

function generateAllShields() {
    app.preferences.rulerUnits = Units.PIXELS;
    app.preferences.typeUnits = TypeUnits.PIXELS;

    var outDir = "C:/Users/43670/Desktop/Graphics/AnonymCreator - Digitalstudion/Webseiten/DSG Liga/Website/Logos/Ready/standard/default";
    var outFolder = new Folder(outDir);
    if (!outFolder.exists) { outFolder.create(); }

    var shields = [{"id": "shield_01_classic_heater", "name": "Classic Heater Shield", "desc": "Traditional European football crest with straight top, vertical sides, and sweeping curve to a sharp point", "points": [[160, 140, 160, 140, 160, 140, "CORNERPOINT"], [864, 140, 864, 140, 864, 140, "CORNERPOINT"], [864, 520, 864, 420, 864, 680, "SMOOTHPOINT"], [512, 900, 680, 840, 344, 840, "CORNERPOINT"], [160, 520, 160, 680, 160, 420, "SMOOTHPOINT"]]}, {"id": "shield_02_iberian_rounded", "name": "Iberian Rounded Crest", "desc": "Classic Spanish/Portuguese football shield with straight sides and a smooth semicircular base", "points": [[170, 140, 170, 140, 170, 140, "CORNERPOINT"], [854, 140, 854, 140, 854, 140, "CORNERPOINT"], [854, 550, 854, 450, 854, 730, "SMOOTHPOINT"], [512, 894, 700, 894, 324, 894, "SMOOTHPOINT"], [170, 550, 170, 730, 170, 450, "SMOOTHPOINT"]]}, {"id": "shield_03_swiss_notched", "name": "Swiss Notched Crest", "desc": "Shield with concave top dip, flared shoulder notches, and tapered body to a sharp point", "points": [[512, 170, 400, 145, 624, 145, "SMOOTHPOINT"], [840, 140, 760, 140, 840, 140, "CORNERPOINT"], [820, 220, 820, 220, 820, 220, "CORNERPOINT"], [860, 270, 860, 270, 860, 270, "CORNERPOINT"], [860, 520, 860, 420, 860, 680, "SMOOTHPOINT"], [512, 900, 680, 830, 344, 830, "CORNERPOINT"], [164, 520, 164, 680, 164, 420, "SMOOTHPOINT"], [164, 270, 164, 270, 164, 270, "CORNERPOINT"], [204, 220, 204, 220, 204, 220, "CORNERPOINT"], [184, 140, 184, 140, 264, 140, "CORNERPOINT"]]}, {"id": "shield_04_florentine_scalloped", "name": "Florentine Scalloped Shield", "desc": "Renaissance / Italian heraldic shield with scalloped double-arched top and side horn flourishes", "points": [[512, 210, 470, 190, 554, 190, "CORNERPOINT"], [680, 135, 590, 140, 750, 140, "SMOOTHPOINT"], [830, 185, 800, 160, 830, 185, "CORNERPOINT"], [810, 260, 810, 260, 810, 260, "CORNERPOINT"], [864, 340, 864, 300, 864, 480, "SMOOTHPOINT"], [850, 580, 864, 500, 810, 690, "SMOOTHPOINT"], [512, 905, 680, 840, 344, 840, "CORNERPOINT"], [174, 580, 214, 690, 160, 500, "SMOOTHPOINT"], [160, 340, 160, 480, 160, 300, "SMOOTHPOINT"], [214, 260, 214, 260, 214, 260, "CORNERPOINT"], [194, 185, 194, 185, 224, 160, "CORNERPOINT"], [344, 135, 274, 140, 434, 140, "SMOOTHPOINT"]]}, {"id": "shield_05_modern_hexagonal", "name": "Modern Hexagonal Badge", "desc": "Sharp geometric angular football crest with 6 faceted sides and modern sharp silhouette", "points": [[280, 140, 280, 140, 280, 140, "CORNERPOINT"], [744, 140, 744, 140, 744, 140, "CORNERPOINT"], [874, 360, 874, 360, 874, 360, "CORNERPOINT"], [874, 590, 874, 590, 874, 590, "CORNERPOINT"], [512, 895, 512, 895, 512, 895, "CORNERPOINT"], [150, 590, 150, 590, 150, 590, "CORNERPOINT"], [150, 360, 150, 360, 150, 360, "CORNERPOINT"]]}, {"id": "shield_06_crown_crenellated", "name": "Crown Stepped Crest", "desc": "Shield with 3-turret/crenellated castle crown header and sleek tapered lower body", "points": [[160, 240, 160, 240, 160, 240, "CORNERPOINT"], [260, 240, 260, 240, 260, 240, "CORNERPOINT"], [260, 140, 260, 140, 260, 140, "CORNERPOINT"], [380, 140, 380, 140, 380, 140, "CORNERPOINT"], [380, 210, 380, 210, 380, 210, "CORNERPOINT"], [440, 210, 440, 210, 440, 210, "CORNERPOINT"], [440, 140, 440, 140, 440, 140, "CORNERPOINT"], [584, 140, 584, 140, 584, 140, "CORNERPOINT"], [584, 210, 584, 210, 584, 210, "CORNERPOINT"], [644, 210, 644, 210, 644, 210, "CORNERPOINT"], [644, 140, 644, 140, 644, 140, "CORNERPOINT"], [764, 140, 764, 140, 764, 140, "CORNERPOINT"], [764, 240, 764, 240, 764, 240, "CORNERPOINT"], [864, 240, 864, 240, 864, 240, "CORNERPOINT"], [864, 540, 864, 440, 864, 690, "SMOOTHPOINT"], [512, 900, 680, 840, 344, 840, "CORNERPOINT"], [160, 540, 160, 690, 160, 440, "SMOOTHPOINT"]]}, {"id": "shield_07_gothic_ogive", "name": "Gothic Ogive Shield", "desc": "Continuous elegant arc from top corners meeting at a sharp ogive base", "points": [[170, 150, 170, 150, 170, 150, "CORNERPOINT"], [854, 150, 854, 150, 854, 150, "CORNERPOINT"], [854, 420, 854, 260, 810, 620, "SMOOTHPOINT"], [512, 905, 680, 840, 344, 840, "CORNERPOINT"], [170, 420, 214, 620, 170, 260, "SMOOTHPOINT"]]}, {"id": "shield_08_stadium_pill", "name": "Stadium Rounded Shield", "desc": "Modern arena badge with convex arched top, straight sides, and convex arched bottom", "points": [[512, 130, 330, 130, 694, 130, "SMOOTHPOINT"], [860, 210, 780, 150, 860, 210, "CORNERPOINT"], [860, 760, 860, 500, 860, 820, "CORNERPOINT"], [512, 895, 694, 895, 330, 895, "SMOOTHPOINT"], [164, 760, 164, 820, 164, 500, "CORNERPOINT"], [164, 210, 164, 210, 244, 150, "CORNERPOINT"]]}, {"id": "shield_09_diamond_lozenge", "name": "Diamond Lozenge Crest", "desc": "Dynamic 4-point football diamond crest with slightly bowed aerodynamic flanks", "points": [[512, 130, 512, 130, 512, 130, "CORNERPOINT"], [874, 512, 730, 300, 730, 724, "SMOOTHPOINT"], [512, 895, 512, 895, 512, 895, "CORNERPOINT"], [150, 512, 294, 724, 294, 300, "SMOOTHPOINT"]]}, {"id": "shield_10_pointed_scutum", "name": "Pointed Chevron Scutum", "desc": "Modern dynamic football shield with chevron pointed top roof and athletic tapered body", "points": [[512, 130, 512, 130, 512, 130, "CORNERPOINT"], [854, 210, 854, 210, 854, 210, "CORNERPOINT"], [854, 540, 854, 430, 854, 690, "SMOOTHPOINT"], [512, 905, 680, 840, 344, 840, "CORNERPOINT"], [170, 540, 170, 690, 170, 430, "SMOOTHPOINT"], [170, 210, 170, 210, 170, 210, "CORNERPOINT"]]}];

    function applyStrokeEffect(doc, strokeSize, r, g, b) {
        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putProperty(charIDToTypeID('Prpr'), charIDToTypeID('Lefx'));
        ref.putEnumerated(charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
        desc.putReference(charIDToTypeID('null'), ref);

        var effectDesc = new ActionDescriptor();
        var strokeDesc = new ActionDescriptor();
        strokeDesc.putBoolean(charIDToTypeID('enab'), true);
        strokeDesc.putEnumerated(charIDToTypeID('Styl'), charIDToTypeID('FStl'), charIDToTypeID('InsF'));
        strokeDesc.putEnumerated(charIDToTypeID('PntT'), charIDToTypeID('FrSt'), charIDToTypeID('SClr'));
        strokeDesc.putEnumerated(charIDToTypeID('Md  '), charIDToTypeID('BlnM'), charIDToTypeID('Nrml'));
        strokeDesc.putUnitDouble(charIDToTypeID('Opct'), charIDToTypeID('#Prc'), 100);
        strokeDesc.putUnitDouble(charIDToTypeID('Sz  '), charIDToTypeID('#Pxl'), strokeSize);

        var colorDesc = new ActionDescriptor();
        colorDesc.putDouble(charIDToTypeID('Rd  '), r);
        colorDesc.putDouble(charIDToTypeID('Grn '), g);
        colorDesc.putDouble(charIDToTypeID('Bl  '), b);
        strokeDesc.putObject(charIDToTypeID('Clr '), charIDToTypeID('RGBC'), colorDesc);

        effectDesc.putObject(charIDToTypeID('FrFX'), charIDToTypeID('FrFX'), strokeDesc);
        desc.putObject(charIDToTypeID('T   '), charIDToTypeID('Lefx'), effectDesc);
        executeAction(charIDToTypeID('setd'), desc, DialogModes.NO);
    }

    var results = [];
    var grayR = 71;
    var grayG = 85;
    var grayB = 105;

    for (var i = 0; i < shields.length; i++) {
        var s = shields[i];
        var doc = app.documents.add(1024, 1024, 72, s.id, NewDocumentMode.RGB, DocumentFill.TRANSPARENT);
        
        var lineArray = [];
        for (var p = 0; p < s.points.length; p++) {
            var pt = s.points[p];
            var pInfo = new PathPointInfo();
            pInfo.anchor = [pt[0], pt[1]];
            pInfo.leftDirection = [pt[2], pt[3]];
            pInfo.rightDirection = [pt[4], pt[5]];
            pInfo.kind = (pt[6] == "SMOOTHPOINT") ? PointKind.SMOOTHPOINT : PointKind.CORNERPOINT;
            lineArray.push(pInfo);
        }
        
        var subPath = new SubPathInfo();
        subPath.operation = ShapeOperation.SHAPEADD;
        subPath.closed = true;
        subPath.entireSubPath = lineArray;
        
        var pathItem = doc.pathItems.add(s.name, [subPath]);
        pathItem.makeSelection(0, true, SelectionType.REPLACE);
        
        var layer = doc.artLayers.add();
        layer.name = s.name;
        
        var fillColor = new SolidColor();
        fillColor.rgb.red = grayR;
        fillColor.rgb.green = grayG;
        fillColor.rgb.blue = grayB;
        doc.selection.fill(fillColor);
        doc.selection.deselect();
        
        applyStrokeEffect(doc, 8, 255, 255, 255);
        
        var pngOptions = new PNGSaveOptions();
        pngOptions.compression = 9;
        pngOptions.interlaced = false;
        var pngFile = new File(outDir + "/" + s.id + ".png");
        doc.saveAs(pngFile, pngOptions, true, Extension.LOWERCASE);
        
        var psdOptions = new PhotoshopSaveOptions();
        psdOptions.layers = true;
        psdOptions.embedColorProfile = true;
        var psdFile = new File(outDir + "/" + s.id + ".psd");
        doc.saveAs(psdFile, psdOptions, true, Extension.LOWERCASE);
        
        doc.close(SaveOptions.DONOTSAVECHANGES);
        results.push(s.id);
    }

    var masterDoc = app.documents.add(1024, 1024, 72, "default_shields_master", NewDocumentMode.RGB, DocumentFill.TRANSPARENT);

    for (var i = 0; i < shields.length; i++) {
        var s = shields[i];
        var lineArray = [];
        for (var p = 0; p < s.points.length; p++) {
            var pt = s.points[p];
            var pInfo = new PathPointInfo();
            pInfo.anchor = [pt[0], pt[1]];
            pInfo.leftDirection = [pt[2], pt[3]];
            pInfo.rightDirection = [pt[4], pt[5]];
            pInfo.kind = (pt[6] == "SMOOTHPOINT") ? PointKind.SMOOTHPOINT : PointKind.CORNERPOINT;
            lineArray.push(pInfo);
        }
        
        var subPath = new SubPathInfo();
        subPath.operation = ShapeOperation.SHAPEADD;
        subPath.closed = true;
        subPath.entireSubPath = lineArray;
        
        var pathItem = masterDoc.pathItems.add(s.name, [subPath]);
        pathItem.makeSelection(0, true, SelectionType.REPLACE);
        
        var layer = masterDoc.artLayers.add();
        layer.name = (i + 1) + ". " + s.name;
        
        var fillColor = new SolidColor();
        fillColor.rgb.red = grayR;
        fillColor.rgb.green = grayG;
        fillColor.rgb.blue = grayB;
        masterDoc.selection.fill(fillColor);
        masterDoc.selection.deselect();
        
        applyStrokeEffect(masterDoc, 8, 255, 255, 255);
        
        if (i > 0) {
            layer.visible = false;
        }
    }

    var masterPsdFile = new File(outDir + "/default_shields_master.psd");
    var psdOptions = new PhotoshopSaveOptions();
    psdOptions.layers = true;
    psdOptions.embedColorProfile = true;
    masterDoc.saveAs(masterPsdFile, psdOptions, true, Extension.LOWERCASE);
    masterDoc.close(SaveOptions.DONOTSAVECHANGES);

    return { generated: results, count: results.length, master: "default_shields_master.psd" };
}

generateAllShields();
