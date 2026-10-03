import json
import os

with open("shields_data.json", "r", encoding="utf-8") as f:
    shields = json.load(f)

jsx_code = """
#target photoshop

function run() {
    app.preferences.rulerUnits = Units.PIXELS;
    app.preferences.typeUnits = TypeUnits.PIXELS;

    var outDir = "C:/Users/43670/Desktop/Graphics/AnonymCreator - Digitalstudion/Webseiten/DSG Liga/Website/Logos/Ready/standard/default";
    var outFolder = new Folder(outDir);
    if (!outFolder.exists) { outFolder.create(); }

    var shields = """ + json.dumps(shields) + """;

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
"""

with open("generate_shields_v2.jsx", "w", encoding="utf-8") as f:
    f.write(jsx_code)

print("Wrote generate_shields_v2.jsx")
