import json

with open("final_shields.json", "r", encoding="utf-8") as f:
    shields = json.load(f)

# RGB for #1e293b is (30, 41, 59)
grayR, grayG, grayB = 30, 41, 59

jsx = f"""#target photoshop

function generateSlateShields() {{
    app.preferences.rulerUnits = Units.PIXELS;
    app.preferences.typeUnits = TypeUnits.PIXELS;

    var outDir = "C:/Users/43670/Desktop/Graphics/AnonymCreator - Digitalstudion/Webseiten/DSG Liga/Website/Logos/Ready/standard/default";
    var outFolder = new Folder(outDir);
    if (!outFolder.exists) {{ outFolder.create(); }}

    var shields = {json.dumps(shields)};

    function applyStrokeEffect(doc, strokeSize, r, g, b) {{
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
    }}

    var grayR = {grayR};
    var grayG = {grayG};
    var grayB = {grayB};

    var generatedFiles = [];

    // 1. Generate individual PSD and PNG files
    for (var i = 0; i < shields.length; i++) {{
        var s = shields[i];
        var doc = app.documents.add(1024, 1024, 72, s.id, NewDocumentMode.RGB, DocumentFill.TRANSPARENT);
        
        var lineArray = [];
        for (var p = 0; p < s.polygon.length; p++) {{
            var pt = s.polygon[p];
            var pInfo = new PathPointInfo();
            pInfo.anchor = [pt[0], pt[1]];
            pInfo.leftDirection = [pt[0], pt[1]];
            pInfo.rightDirection = [pt[0], pt[1]];
            pInfo.kind = PointKind.CORNERPOINT;
            lineArray.push(pInfo);
        }}
        
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
        generatedFiles.push(s.id);
    }}

    // 2. Generate Master All-In-One Multi-Layer PSD
    var masterDoc = app.documents.add(1024, 1024, 72, "all_default_shields_master", NewDocumentMode.RGB, DocumentFill.TRANSPARENT);

    for (var i = 0; i < shields.length; i++) {{
        var s = shields[i];
        var lineArray = [];
        for (var p = 0; p < s.polygon.length; p++) {{
            var pt = s.polygon[p];
            var pInfo = new PathPointInfo();
            pInfo.anchor = [pt[0], pt[1]];
            pInfo.leftDirection = [pt[0], pt[1]];
            pInfo.rightDirection = [pt[0], pt[1]];
            pInfo.kind = PointKind.CORNERPOINT;
            lineArray.push(pInfo);
        }}
        
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
        
        if (i > 0) {{
            layer.visible = false;
        }}
    }}

    var masterPsdFile = new File(outDir + "/all_default_shields_master.psd");
    var psdOptions = new PhotoshopSaveOptions();
    psdOptions.layers = true;
    psdOptions.embedColorProfile = true;
    masterDoc.saveAs(masterPsdFile, psdOptions, true, Extension.LOWERCASE);
    masterDoc.close(SaveOptions.DONOTSAVECHANGES);

    return {{ 
        success: true, 
        color: "#1e293b",
        count: generatedFiles.length, 
        generated: generatedFiles, 
        master: "all_default_shields_master.psd",
        directory: outDir
    }};
}}

generateSlateShields();
"""

with open("generate_slate_shields.jsx", "w", encoding="utf-8") as f:
    f.write(jsx)

print("Created generate_slate_shields.jsx successfully!")
