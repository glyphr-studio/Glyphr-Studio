// start of file
/**
	History
	An object that stores a Glyphr Studio Project
	state, to enable undo.  History is saved per
	page... essentially, each page gets it's own
	undo queue.
**/

/** cspell disable */
function History(pn) {
	this.queue = [];
	this.parentname = pn;
	this.currstate = clone(_GP[this.parentname], 'History');
	this.initialstate = clone(_GP[this.parentname], 'History');
	this.initialdate = new Date().getTime();
}

History.prototype.put = function (des) {
	// debug('\n History.put - START');

	this.queue = this.queue || [];
	this.queue.push({
		name: getSelectedWorkItemName(),
		id: getSelectedWorkItemID(),
		description: des,
		date: new Date().getTime(),
		state: clone(this.currstate, 'History.put'),
	});

	this.currstate = clone(_GP[this.parentname], 'History.put');

	setProjectAsUnsaved();
	markSelectedWorkItemAsChanged();

	// debug(' History.put - END\n');
};

History.prototype.pull = function () {
	// debug('\n History.pull - START');
	// debug('\t queue.length ' + this.queue.length);

	if (this.queue.length === 0) return;

	var currentID = getSelectedWorkItemID();
	var nextID = this.queue[this.queue.length - 1].id;

	if (currentID === nextID) {
		var top = this.queue.length ? this.queue.pop().state : this.initialstate;

		if (this.parentname === 'kerning')
			hydrateGlyphrObjectList(HKern, clone(top, 'History.pull'), _GP[kerning]);
		else
			hydrateGlyphrObjectList(
				Glyph,
				clone(top, 'History.pull'),
				_GP[this.parentname]
			);

		this.currstate = clone(top, 'History.pull');

		var selwi = getSelectedWorkItem();
		if (selwi && selwi.changed) selwi.changed(true, true);
	} else {
		// If the next undo item is a different glyph,
		// navigate to that glyph before undo-ing
		showToast(
			'Navigated without undo-ing.<br>Undo again to roll back changes for this glyph.',
			2000
		);
		selectGlyph(nextID);
	}

	if (_UI.current_page === 'import svg') {
		update_NavPanels();
	} else if (_UI.current_page === 'components') {
		if (!_GP.components[_UI.selectedcomponent]) {
			_UI.selectedcomponent = getFirstID(_GP.components);
		}
	} else if (_UI.current_page === 'ligatures') {
		if (!_GP.ligatures[_UI.selectedligature]) {
			_UI.selectedligature = getFirstID(_GP.ligatures);
		}
	}

	_UI.ms.shapes.clear();
	_UI.ms.points.clear();
	// update_NavPanels();
	redraw({ calledby: 'history_pull', redrawpanels: true });

	// debug('\t after redraw');

	var empty = true;
	for (var q in _UI.history) {
		if (_UI.history.hasOwnProperty(q) && _UI.history[q].queue.length) {
			empty = false;
			break;
		}
	}
	if (empty) setProjectAsSaved();

	// debug(' History.pull - END\n');
};

// Global Accessor Functions
function history_put(dsc) {
	if (onCanvasEditPage()) {
		var queue =
			_UI.current_page === 'import svg' ? 'glyph edit' : _UI.current_page;
		window.setTimeout(function () {
			_UI.history[queue].put(dsc);
		}, 10);
	}
}

function history_pull() {
	if (onCanvasEditPage()) {
		closeDialog();
		closeNotation();
		window.setTimeout(function () {
			_UI.history[_UI.current_page].pull();
		}, 10);
	}
}

function history_length() {
	if (onCanvasEditPage()) {
		return _UI.history[_UI.current_page].queue.length || 0;
	}

	return 0;
}
