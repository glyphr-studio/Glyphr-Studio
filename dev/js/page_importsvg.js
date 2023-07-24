// start of file
/**
	Page > Import SVG
	HTML and associated functions for this page.
**/

function loadPage_importsvg() {
	// debug("LOADING PAGE >> loadpage_importsvg");
	var chname = getSelectedWorkItemName();
	var content =
		"<h1 class='pagetitle'>Import SVG</h1><div class='pagecontent textpage'>" +
		"<h2 id='importsvgselecttitle'>Target glyph: " +
		chname +
		'</h2>' +
		"<table style='margin-top:16px;'><tr><td style='width:50%;'>" +
		'<h3>scaling and moving</h3>' +
		'<table><tr><td>' +
		checkUI('_UI.importsvg.scale', _UI.importsvg.scale) +
		"</td><td style='padding:0px 0px 8px 5px;'>" +
		"<label for='scale'>Scale the imported SVG outlines</label>" +
		'</td></tr><tr><td>' +
		checkUI('_UI.importsvg.move', _UI.importsvg.move) +
		"</td><td style='padding:0px 0px 8px 5px;'>" +
		"<label for='move'>Move the imported SVG outlines</label>" +
		'</td></tr></table>' +
		"</td><td style='width:50%;'>" +
		'<h3>height metrics</h3>' +
		"<table style='margin-top:10px;'><tr>" +
		"<td style='width:20px; padding-top:10px;'>" +
		checkUI('_UI.importsvg.ascender', _UI.importsvg.ascender) +
		'<br>' +
		checkUI('_UI.importsvg.capheight', _UI.importsvg.capheight) +
		"</td><td class='svgscaleoption'>" +
		"<label for='ascender'>Ascender</label><br>" +
		"<label for='capheight'>Cap Height</label>" +
		"</td><td style='padding-left:30px;' rowspan='3'>" +
		"<table><tr><td colspan='2' style='padding-bottom:8px;'>" +
		'For rounded glyphs:' +
		'</td></tr><tr><td>' +
		checkUI('_UI.importsvg.overshoot_top', _UI.importsvg.overshoot_top) +
		"</td><td style='padding:0px 0px 8px 8px;'>" +
		"<label for='overshoot_top'>top overshoot</label>" +
		'</td></tr><tr><td>' +
		checkUI('_UI.importsvg.overshoot_bottom', _UI.importsvg.overshoot_bottom) +
		"</td><td style='padding:0px 0px 8px 8px;'>" +
		"<label for='overshoot_bottom'>bottom overshoot</label>" +
		'</td></tr></table>' +
		"</tr><tr><td style='padding-top:10px;'>" +
		"<input type='checkbox' disabled checked/>" +
		"</td><td class='svgscaleoption'>" +
		"<span style='color:" +
		_UI.colors.gray.l40 +
		";'>X Height</span>" +
		"</td></tr><tr><td style='padding-top:10px;'>" +
		checkUI('_UI.importsvg.descender', _UI.importsvg.descender) +
		"</td><td class='svgscaleoption'>" +
		"<label for='descender'>Descender</label><br>" +
		'</td></tr></table>' +
		'</td></tr></table>' +
		"<h2 style='margin-bottom:10px;'>SVG Code</h2>" +
		"<div id='droptarget' style='width:100%; height:auto; margin-bottom:0px; padding:8px;'>drop a .svg file here, or paste code below</div>" +
		"<textarea id='svgcode' onchange='importSVG_codeAreaChange();'>" +
		(_UI.importsvg.svgcode ? _UI.importsvg.svgcode : '') +
		'</textarea><br><br>' +
		"<button class='buttonsel' style='display:inline; padding-left:60px; padding-right:60px;' onclick='importSVG_importCode();'>Import SVG</button>" +
		"<button style='display:inline; margin-left:60px; padding-left:20px; padding-right:20px;' onclick='importSVG_goToSelectedGlyph();'>edit the selected glyph</button>" +
		"<button style='display:inline; margin-left:10px; padding-left:20px; padding-right:20px;' onclick='history_pull();'>undo</button>" +
		"<button style='display:inline; margin-left:10px; padding-left:20px; padding-right:20px;' onclick='importSVG_clearCode();'>clear code</button>" +
		makeErrorMessageBox() +
		'<br><br></div>';

	var wrapper = getEditDocument().getElementById('mainwrapper');
	wrapper.innerHTML = content;
	//importSVG_selectGlyph("0x0061");

	getEditDocument()
		.getElementById('droptarget')
		.addEventListener('dragover', importSVG_handleDragOver, false);
	getEditDocument()
		.getElementById('droptarget')
		.addEventListener('dragleave', importSVG_handleDragLeave, false);
	getEditDocument()
		.getElementById('droptarget')
		.addEventListener('drop', importSVG_handleDrop, false);
}

function importSVG_goToSelectedGlyph() {
	var sg = _UI.selectedsvgimporttarget;

	if (sg.indexOf('0x', 2) > 0) {
		// Ligature
		selectLigature(sg, false);
		navigate({ page: 'ligatures', panel: 'npAttributes' });
	} else if (sg.indexOf('0x') === 0) {
		// Glyph
		selectGlyph(sg, false);
		navigate({ page: 'glyph edit', panel: 'npAttributes' });
	} else {
		// Component
		selectComponent(sg, false);
		navigate({ page: 'components', panel: 'npAttributes' });
	}
}

function importSVG_codeAreaChange() {
	document.getElementById('droptarget').innerHTML =
		'Drop a .svg file here, or paste code below';
	_UI.importsvg.svgcode = document.getElementById('svgcode').value;
	//debug("IMPORTSVG_CODEAREACHANGE - code: " + _UI.importsvg.svgcode);
}

function importSVG_handleDragOver(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'move';

	importSVG_clearCode();
	document.getElementById('droptarget').innerHTML = 'Drop it!';
}

function importSVG_handleDragLeave(evt) {
	evt.stopPropagation();
	evt.preventDefault();

	importSVG_clearCode();
}

function importSVG_handleDrop(evt) {
	evt.stopPropagation();
	evt.preventDefault();

	var f = evt.dataTransfer.files[0]; // FileList object only first file
	var reader = new FileReader();
	var dt = document.getElementById('droptarget');

	dt.innerHTML = 'Loading File...';

	// Closure to capture the file information.
	reader.onload = (function (theFile) {
		return function (e) {
			//console.log(reader.result);
			document.getElementById('svgcode').value = reader.result;
			_UI.importsvg.svgcode = reader.result;
			dt.innerHTML = 'Loaded ' + theFile.name;
			closeErrorMessageBox();
		};
	})(f);

	reader.readAsText(f);
}

function importSVG_clearCode() {
	document.getElementById('droptarget').innerHTML =
		'Drop a .svg file here, or paste code below';
	document.getElementById('svgcode').value = '';
	document.getElementById('svgcode').focus();
	_UI.importsvg.svgcode = false;
	closeErrorMessageBox();
}

function importSVG_selectGlyph(cid) {
	//debug("IMPORTSVG_SELECTGLYPH - selecting " + cid);
	selectSVGImportTarget(cid, true);
	document.getElementById('importsvgselecttitle').innerHTML =
		'Target glyph: ' + getSelectedWorkItemName();
	update_NavPanels();
}

function importSVG_importCode() {
	// debug('\n importSVG_importCode - START');
	var svgin = document.getElementById('svgcode').value;
	//debug("IMPORTSVG_IMPORTCODE - svgin is " + JSON.stringify(svgin));
	closeErrorMessageBox();

	var tempchar = ioSVG_convertTagsToGlyph(svgin);
	// debug('\t Convert Tags To Glyph returned');
	// debug(tempchar);
	if (!tempchar) return;

	// Flip and Scale
	var mid = _GP.projectsettings.ascent / 2;
	// debug('\t Flipping tempchar about ' + mid);
	tempchar.flipNS(mid);
	tempchar.reverseWinding();
	// debug('\t >><< AFTER FLIPNS');
	// debug(tempchar);

	//debug("IMPORTSVG_IMPORTCODE - scale / move " + so.scale + " / " + so.move);
	var so = _UI.importsvg;
	var gp = _GP.projectsettings;

	if (so.scale || so.move) {
		var chartop = gp.xheight * 1;
		if (so.capheight) chartop = gp.capheight * 1;
		if (so.ascender) chartop = gp.ascent * 1;

		var totalheight = chartop;
		var ovs = gp.overshoot * 1;

		if (so.descender) totalheight += (gp.upm - gp.ascent) * 1;
		if (so.overshoot_bottom) totalheight += ovs;
		if (so.overshoot_top) {
			totalheight += ovs;
			chartop += ovs;
		}

		// debug('\t\n Scale to totalheight = ' + totalheight);
		if (so.scale) tempchar.setGlyphSize(false, totalheight, true);
		// debug('\t >><< AFTER SCALE');
		// debug(tempchar);

		// debug('\t\n move to chartop = ' + chartop);
		if (so.move) tempchar.setGlyphPosition(0, chartop);
		// debug('\t >><< AFTER MOVE');
		// debug(tempchar);
	}

	// Add new Glyph Shapes
	tempchar.copyShapesTo(getSelectedWorkItemID());
	markSelectedWorkItemAsChanged();
	history_put('Imported Paths from SVG to glyph ' + getSelectedWorkItemName());

	update_NavPanels();

	// debug(' importSVG_importCode - END\n');
}
