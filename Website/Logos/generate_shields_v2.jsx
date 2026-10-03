
#target photoshop

function run() {
    app.preferences.rulerUnits = Units.PIXELS;
    app.preferences.typeUnits = TypeUnits.PIXELS;

    var outDir = "C:/Users/43670/Desktop/Graphics/AnonymCreator - Digitalstudion/Webseiten/DSG Liga/Website/Logos/Ready/standard/default";
    var outFolder = new Folder(outDir);
    if (!outFolder.exists) { outFolder.create(); }

    var shields = [{"id": "shield_01_classic_heater", "name": "Classic Heater Shield", "desc": "Traditional European football crest with straight top, vertical sides, and sweeping curve to a sharp point", "svg_d": "M 160,140 L 864,140 L 864,500 C 864,680 720,810 512,884 C 304,810 160,680 160,500 Z", "points": [[160, 140, 160, 140, 160, 140, "CORNERPOINT"], [864, 140, 864, 140, 864, 140, "CORNERPOINT"], [864, 500, 864, 500, 864, 660, "CORNERPOINT"], [512, 884, 680, 810, 344, 810, "CORNERPOINT"], [160, 500, 160, 660, 160, 500, "CORNERPOINT"]]}, {"id": "shield_02_iberian_rounded", "name": "Iberian Rounded Crest", "desc": "Classic Spanish/Portuguese football shield with straight sides and a smooth semicircular base", "svg_d": "M 170,140 L 854,140 L 854,540 C 854,730 700,884 512,884 C 324,884 170,730 170,540 Z", "points": [[170, 140, 170, 140, 170, 140, "CORNERPOINT"], [854, 140, 854, 140, 854, 140, "CORNERPOINT"], [854, 540, 854, 540, 854, 730, "CORNERPOINT"], [512, 884, 700, 884, 324, 884, "SMOOTHPOINT"], [170, 540, 170, 730, 170, 540, "CORNERPOINT"]]}, {"id": "shield_03_swiss_notched", "name": "Swiss Notched Crest", "desc": "Shield with concave top dip, flared shoulder notches, and tapered body to a sharp point", "svg_d": "M 512,170 C 620,170 730,140 840,140 L 820,230 L 864,280 L 864,520 C 864,680 720,810 512,884 C 304,810 160,680 160,520 L 160,280 L 204,230 L 184,140 C 294,140 404,170 512,170 Z", "points": [[512, 170, 420, 170, 604, 170, "SMOOTHPOINT"], [840, 140, 730, 140, 840, 140, "CORNERPOINT"], [820, 230, 820, 230, 820, 230, "CORNERPOINT"], [864, 280, 864, 280, 864, 280, "CORNERPOINT"], [864, 520, 864, 520, 864, 680, "CORNERPOINT"], [512, 884, 720, 810, 304, 810, "CORNERPOINT"], [160, 520, 160, 680, 160, 520, "CORNERPOINT"], [160, 280, 160, 280, 160, 280, "CORNERPOINT"], [204, 230, 204, 230, 204, 230, "CORNERPOINT"], [184, 140, 184, 140, 294, 140, "CORNERPOINT"]]}, {"id": "shield_04_florentine_scalloped", "name": "Florentine Scalloped Shield", "desc": "Renaissance / Italian heraldic shield with scalloped double-arched top and side horn flourishes", "svg_d": "M 512,200 C 580,140 700,130 830,170 L 810,250 C 850,300 870,400 870,490 C 870,680 720,810 512,890 C 304,810 154,680 154,490 C 154,400 174,300 214,250 L 194,170 C 324,130 444,140 512,200 Z", "points": [[512, 200, 450, 150, 574, 150, "CORNERPOINT"], [830, 170, 720, 130, 830, 170, "CORNERPOINT"], [810, 250, 810, 250, 840, 280, "CORNERPOINT"], [870, 490, 870, 370, 870, 680, "CORNERPOINT"], [512, 890, 720, 810, 304, 810, "CORNERPOINT"], [154, 490, 154, 680, 154, 370, "CORNERPOINT"], [214, 250, 184, 280, 214, 250, "CORNERPOINT"], [194, 170, 194, 170, 304, 130, "CORNERPOINT"]]}, {"id": "shield_05_modern_hexagonal", "name": "Modern Hexagonal Badge", "desc": "Sharp geometric angular football crest with 6 faceted sides and modern sharp silhouette", "svg_d": "M 280,140 L 744,140 L 874,370 L 874,600 L 512,884 L 150,600 L 150,370 Z", "points": [[280, 140, 280, 140, 280, 140, "CORNERPOINT"], [744, 140, 744, 140, 744, 140, "CORNERPOINT"], [874, 370, 874, 370, 874, 370, "CORNERPOINT"], [874, 600, 874, 600, 874, 600, "CORNERPOINT"], [512, 884, 512, 884, 512, 884, "CORNERPOINT"], [150, 600, 150, 600, 150, 600, "CORNERPOINT"], [150, 370, 150, 370, 150, 370, "CORNERPOINT"]]}, {"id": "shield_06_crown_crenellated", "name": "Crown Stepped Crest", "desc": "Shield with 3-turret/crenellated castle crown header and sleek tapered lower body", "svg_d": "M 160,240 L 260,240 L 260,140 L 380,140 L 380,210 L 440,210 L 440,140 L 584,140 L 584,210 L 644,210 L 644,140 L 764,140 L 764,240 L 864,240 L 864,520 C 864,680 720,810 512,884 C 304,810 160,680 160,520 Z", "points": [[160, 240, 160, 240, 160, 240, "CORNERPOINT"], [260, 240, 260, 240, 260, 240, "CORNERPOINT"], [260, 140, 260, 140, 260, 140, "CORNERPOINT"], [380, 140, 380, 140, 380, 140, "CORNERPOINT"], [380, 210, 380, 210, 380, 210, "CORNERPOINT"], [440, 210, 440, 210, 440, 210, "CORNERPOINT"], [440, 140, 440, 140, 440, 140, "CORNERPOINT"], [584, 140, 584, 140, 584, 140, "CORNERPOINT"], [584, 210, 584, 210, 584, 210, "CORNERPOINT"], [644, 210, 644, 210, 644, 210, 644, "CORNERPOINT"], [644, 140, 644, 140, 644, 140, "CORNERPOINT"], [764, 140, 764, 140, 764, 140, "CORNERPOINT"], [764, 240, 764, 240, 764, 240, "CORNERPOINT"], [864, 240, 864, 240, 864, 240, "CORNERPOINT"], [864, 520, 864, 520, 864, 680, "CORNERPOINT"], [512, 884, 720, 810, 304, 810, "CORNERPOINT"], [160, 520, 160, 680, 160, 520, "CORNERPOINT"]]}, {"id": "shield_07_gothic_ogive", "name": "Gothic Ogive Shield", "desc": "Continuous elegant arc from top corners meeting at a sharp ogive base", "svg_d": "M 170,140 L 854,140 C 854,420 760,730 512,890 C 264,730 170,420 170,140 Z", "points": [[170, 140, 170, 140, 170, 140, "CORNERPOINT"], [854, 140, 854, 140, 854, 380, "CORNERPOINT"], [512, 890, 760, 730, 264, 730, "CORNERPOINT"], [170, 140, 170, 380, 170, 140, "CORNERPOINT"]]}, {"id": "shield_08_stadium_pill", "name": "Stadium Rounded Shield", "desc": "Modern arena badge with convex arched top, straight sides, and convex arched bottom", "svg_d": "M 170,240 C 270,140 754,140 854,240 L 854,720 C 754,884 270,884 170,720 Z", "points": [[170, 240, 170, 240, 280, 140, "CORNERPOINT"], [854, 240, 744, 140, 854, 240, "CORNERPOINT"], [854, 720, 854, 720, 744, 880, "CORNERPOINT"], [170, 720, 280, 880, 170, 720, "CORNERPOINT"]]}, {"id": "shield_09_diamond_lozenge", "name": "Diamond Lozenge Crest", "desc": "Dynamic 4-point football diamond crest with slightly bowed aerodynamic flanks", "svg_d": "M 512,130 C 700,290 880,410 880,512 C 880,614 700,734 512,894 C 324,734 144,614 144,512 C 144,410 324,290 512,130 Z", "points": [[512, 130, 370, 250, 654, 250, "CORNERPOINT"], [880, 512, 880, 420, 880, 604, "CORNERPOINT"], [512, 894, 654, 774, 370, 774, "CORNERPOINT"], [144, 512, 144, 604, 144, 420, "CORNERPOINT"]]}, {"id": "shield_10_pointed_scutum", "name": "Pointed Chevron Scutum", "desc": "Modern dynamic football shield with chevron pointed top roof and athletic tapered body", "svg_d": "M 512,130 L 860,220 L 860,520 C 860,680 720,810 512,884 C 304,810 164,680 164,520 L 164,220 Z", "points": [[512, 130, 512, 130, 512, 130, "CORNERPOINT"], [860, 220, 860, 220, 860, 220, "CORNERPOINT"], [860, 520, 860, 520, 860, 680, "CORNERPOINT"], [512, 884, 720, 810, 304, 810, "CORNERPOINT"], [164, 520, 164, 680, 164, 520, "CORNERPOINT"], [164, 220, 164, 220, 164, 220, "CORNERPOINT"]]}];

    function applyStrokeEffect(doc, strokeSize, r, g, b) {
        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putProperty(charIDToTypeID('Prpr'), charIDToTypeID('Lefx'));
        ref.putEnumerated(charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
        desc.putReference(charIDToTypeID('null'), ref);

        var effectDesc = new ActionDescriptor();
        var strokeDesc = new ActionDescriptor();
        strokeDesc.putBoolean(charIDToTypeID('enab'), true);
        strokeDesc.putEnumerated(charIDToTypeID('Styl'), charIDToTypeID('FStl'), charIDToTypeID('InsF')); // Inside stroke
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
    var grayR = 75; // #4b5563 Slate/Gray - perfectly balanced for dark and light web modes
    var grayG = 85;
    var grayB = 99;

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
        
        // 8px white stroke
        applyStrokeEffect(doc, 8, 255, 255, 255);
        
        // Save PNG
        var pngOptions = new PNGSaveOptions();
        pngOptions.compression = 9;
        pngOptions.interlaced = false;
        var pngFile = new File(outDir + "/" + s.id + ".png");
        doc.saveAs(pngFile, pngOptions, true, Extension.LOWERCASE);
        
        // Save PSD
        var psdOptions = new PhotoshopSaveOptions();
        psdOptions.layers = true;
        psdOptions.embedColorProfile = true;
        var psdFile = new File(outDir + "/" + s.id + ".psd");
        doc.saveAs(psdFile, psdOptions, true, Extension.LOWERCASE);
        
        doc.close(SaveOptions.DONOTSAVECHANGES);
        results.push(s.id);
    }

    // Master PSD with all 10 organized layers
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

run();
