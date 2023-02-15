// start of file
/**
	Object > Path Point
	A collection of these units make up a Path,
	they have position and handles (or control
	points). There are a few Path Point types, and
	individual handles can be shown or hidden.

	(bottom of the file)
	Object > Coordinate
	A mini object that holds x/y position, as well
	as if that point is locked or not.
**/

function PathPoint(oa) {
	oa = oa || {};
	this.objtype = 'pathpoint';

	this.P = oa.P ? new Coord(oa.P) : new Coord({ x: 100, y: 100 });
	this.H1 = oa.H1 ? new Coord(oa.H1) : new Coord({ x: 0, y: 0 });
	this.H2 = oa.H2 ? new Coord(oa.H2) : new Coord({ x: 200, y: 200 });
	this.Q = oa.Q ? new Coord(oa.Q) : false; // Remembering Quadratic single handle for Import SVG
	this.type = oa.type || 'corner'; // corner, flat, symmetric
	// this.parentpath = oa.parentpath || false;

	if (isval(oa.useh1) && oa.useh1) this.useh1 = true;
	else this.useh1 = false;

	if (isval(oa.useh2) && oa.useh2) this.useh2 = true;
	else this.useh2 = false;

	if (this.type === 'symmetric') {
		this.makeSymmetric('H1');
	} else if (this.type === 'flat') {
		this.makeFlat('H1');
	}

	// debug('PATHPOINT was passed ' + json(oa));
}

//-------------------------------------------------------
// PATH POINT METHODS
//-------------------------------------------------------

PathPoint.prototype.alignY = function (pathPoint) {
	this.P.y = pathPoint.P.y;
	redraw({ calledby: 'pointDetails' });
};

PathPoint.prototype.alignX = function (pathPoint) {
	this.P.x = pathPoint.P.x;
	redraw({ calledby: 'pointDetails' });
};

PathPoint.prototype.alignHV = function () {
	this.H1.x = this.P.x;
	this.H2.x = this.P.x;
	redraw({ calledby: 'pointDetails' });
};

PathPoint.prototype.alignHH = function () {
	var h = [this.H1, this.H2];
	this.H1.y = this.P.y;
	this.H2.y = this.P.y;
	redraw({ calledby: 'pointDetails' });
};

PathPoint.prototype.alignH1X = function (pathPoint) {
	this.H1.x = pathPoint.H1.x;
	redraw({ calledby: 'pointDetails' });
};

PathPoint.prototype.alignH1XCross = function (pathPoint) {
	this.H1.x = pathPoint.H2.x;
	redraw({ calledby: 'pointDetails' });
};

PathPoint.prototype.alignH1Y = function (pathPoint) {
	this.H1.y = pathPoint.H1.y;
	redraw({ calledby: 'pointDetails' });
};

PathPoint.prototype.alignH1YCross = function (pathPoint) {
	this.H1.y = pathPoint.H2.y;
	redraw({ calledby: 'pointDetails' });
};

PathPoint.prototype.alignH2X = function (pathPoint) {
	this.H2.x = pathPoint.H2.x;
	redraw({ calledby: 'pointDetails' });
};

PathPoint.prototype.alignH2XCross = function (pathPoint) {
	this.H2.x = pathPoint.H1.x;
	redraw({ calledby: 'pointDetails' });
};

PathPoint.prototype.alignH2Y = function (pathPoint) {
	this.H2.y = pathPoint.H2.y;
	redraw({ calledby: 'pointDetails' });
};

PathPoint.prototype.alignH2YCross = function (pathPoint) {
	this.H2.y = pathPoint.H1.y;
	redraw({ calledby: 'pointDetails' });
};

PathPoint.prototype.alignHY = function (pathPoint) {
	this.alignH1Y(pathPoint);
	this.alignH2Y(pathPoint);
};

PathPoint.prototype.alignHYCross = function (pathPoint) {
	this.alignH1YCross(pathPoint);
	this.alignH2YCross(pathPoint);
};

PathPoint.prototype.alignHXCross = function (pathPoint) {
	this.alignH1XCross(pathPoint);
	this.alignH2XCross(pathPoint);
};

PathPoint.prototype.alignHX = function (pathPoint) {
	this.alignH1X(pathPoint);
	this.alignH2X(pathPoint);
};

PathPoint.prototype.alignH1 = function (pathPoint) {
	this.alignH1X(pathPoint);
	this.alignH1Y(pathPoint);
};

PathPoint.prototype.alignH2 = function (pathPoint) {
	this.alignH2X(pathPoint);
	this.alignH2Y(pathPoint);
};

PathPoint.prototype.getMutualOffset = function (pathPoint) {
	if (this.P.x === pathPoint.P.x) {
		return Math.abs(this.P.y - pathPoint.P.y);
	} else if (this.P.y === pathPoint.P.y) {
		return Math.abs(this.P.x - pathPoint.P.x);
	} else {
		var dX = Math.abs(this.P.x - pathPoint.P.x),
			dY = Math.abs(this.P.y - pathPoint.P.y);
		return Math.sqrt(Math.abs(dX ^ (2 + dY) ^ 2));
	}
};

PathPoint.prototype.alignMutualOffsetXY = function (p1, p2, p3) {
	this.alignMutualOffsetY(p1, p2, p3);
	this.alignMutualOffsetX(p1, p2, p3);

	redraw({ calledby: 'pointDetails' });
};

PathPoint.prototype.alignMutualOffsetX = function (p1, p2, p3) {
	var dRef = Math.abs(p1.P.x - p2.P.x),
		dCur = Math.abs(this.P.x - (p3.P.x || p2.P.x)),
		delta = dRef - dCur;

	if (this.P.x > p3.P.x || this.P.x == p3.P.x) this.P.x += delta;
	else if (this.P.x < p3.P.x) this.P.x -= delta;
	else if (this.P.x > p2.P.x || this.P.x == p2.P.x) this.P.x += delta;
	else if (this.P.x < p2.P.x) this.P.x -= delta;

	redraw({ calledby: 'pointDetails' });
};

PathPoint.prototype.alignMutualOffsetY = function (p1, p2, p3) {
	var dRef = Math.abs(p1.P.y - p2.P.y),
		dCur = Math.abs(this.P.y - (p3.P.y || p2.P.y)),
		delta = dRef - dCur;

	if (this.P.y > p3.P.y || this.P.y == p3.P.y) this.P.y += delta;
	else if (this.P.y < p3.P.y) this.P.y -= delta;
	else if (this.P.y > p2.P.y || this.P.y == p2.P.y) this.P.y += delta;
	else if (this.P.y < p2.P.y) this.P.y -= delta;

	redraw({ calledby: 'pointDetails' });
};

PathPoint.prototype.alignAngle = function (pathPoint) {};

PathPoint.prototype.setPathPointPosition = function (controlpoint, nx, ny) {
	var dx = 0;
	var dy = 0;
	if (nx !== false) nx = parseFloat(nx);
	if (ny !== false) ny = parseFloat(ny);
	var changed = false;

	switch (controlpoint) {
		case 'P':
			if (!this.P.xlock && !isNaN(nx)) {
				dx = this.P.x - nx;
				this.P.x = nx;
				this.H1.x -= dx;
				this.H2.x -= dx;
			}
			if (!this.P.ylock && !isNaN(ny)) {
				dy = this.P.y - ny;
				this.P.y = ny;
				this.H1.y -= dy;
				this.H2.y -= dy;
			}
			break;

		case 'H1':
			if (!this.H1.xlock && !isNaN(nx)) {
				this.H1.x = nx;
				changed = 'H1';
			}
			if (!this.H1.ylock && !isNaN(ny)) {
				this.H1.y = ny;
				changed = 'H1';
			}
			break;

		case 'H2':
			if (!this.H2.xlock && !isNaN(nx)) {
				this.H2.x = nx;
				changed = 'H2';
			}
			if (!this.H2.ylock && !isNaN(ny)) {
				this.H2.y = ny;
				changed = 'H2';
			}
			break;
	}

	if (changed) {
		if (this.type === 'symmetric') {
			this.makeSymmetric(changed);
		} else if (this.type === 'flat') {
			this.makeFlat(changed);
		}
	}

	//this.roundAll();
};

// returns nudge vector if close enough to grids or guides
function calculateSnapDelta(x, y, single) {
	var ps = _GP.projectsettings;
	if (!single) return [0, 0];
	if (!ps.snaptogrid && !ps.snaptoguides) return [0, 0];

	// debug(`\n calculateSnapDelta - START`);
	// debug(`\t passed ${x}, ${y}`);

	var zoom = getView('calculateSnapDelta').dz;
	var sd = ps.snapdistance;
	var dx = sd + 1; // It won't snap by default!
	var dy = sd + 1; // It won't snap by default!

	if (ps.snaptogrid) {
		var grid = round(ps.upm / ps.griddivisions, 3);
		dx = grid * Math.round(x / grid) - x;
		dy = grid * Math.round(y / grid) - y;
	}

	if (ps.snaptoguides) {
		var temp;
		var guide;
		for (var g in ps.guides) {
			if (ps.guides.hasOwnProperty(g)) {
				guide = ps.guides[g];
				if (guide.name === 'min' || guide.name === 'max') continue;
				if (guide.type === 'vertical') {
					temp = guide.location - x;
					if (temp * temp <= dx * dx) dx = temp;
				} else if (guide.type === 'horizontal') {
					temp = guide.location - y;
					if (temp * temp <= dy * dy) dy = temp;
				}
			}
		}
	}

	// Divide by zoom to get screen pixels instead of em units
	if (dx * dx > (sd * sd) / zoom) dx = 0;
	if (dy * dy > (sd * sd) / zoom) dy = 0;

	// debug(`\t returning ${dx} \t ${dy}`);

	// debug(` calculateSnapDelta - END\n\n`);

	return [dx, dy];
}

PathPoint.prototype.updatePathPointPosition = function (
	controlpoint,
	dx,
	dy,
	force,
	ev,
	single
) {
	// debug(`\n PathPoint.updatePathPointPosition - ${controlpoint} - START`);
	// debug(`\t before: ${dx}, ${dy}`);

	if (ev && ev.ctrlKey) return;

	if (dx !== false) dx = parseFloat(dx);
	if (dy !== false) dy = parseFloat(dy);
	var lockx = _UI.selectedToolName === 'pathedit' ? this.P.xlock : false;
	var locky = _UI.selectedToolName === 'pathedit' ? this.P.ylock : false;

	if (isval(force)) {
		if (force) {
			lockx = false;
			locky = false;
		}
	}

	var gsnap = [0, 0];
	switch (controlpoint) {
		case 'P':
			gsnap = calculateSnapDelta(this.P.x + dx, this.P.y + dy, single);
			dx += gsnap[0];
			dy += gsnap[1];
			// debug(`\t afters: ${dx}, ${dy}`);

			if (!lockx) {
				this.P.x += dx;
				this.H1.x += dx;
				this.H2.x += dx;
			}
			if (!locky) {
				this.P.y += dy;
				this.H1.y += dy;
				this.H2.y += dy;
			}
			break;

		case 'H1':
			gsnap = calculateSnapDelta(this.H1.x, this.H1.y, single);
			dx += gsnap[0];
			dy += gsnap[1];
			this.H1.x += dx;
			this.H1.y += dy;

			// debug('\t Hold H1, updated to: ' + this.H1.x + ' ' + this.H1.y);
			if (this.type === 'symmetric') {
				this.makeSymmetric('H1');
			} else if (this.type === 'flat') {
				this.makeFlat('H1');
			}
			break;

		case 'H2':
			gsnap = calculateSnapDelta(this.H2.x, this.H2.y, single);
			dx += gsnap[0];
			dy += gsnap[1];
			this.H2.x += dx;
			this.H2.y += dy;

			if (this.type === 'symmetric') {
				this.makeSymmetric('H2');
			} else if (this.type === 'flat') {
				this.makeFlat('H2');
			}
			break;
	}

	//this.roundAll();
	dx = round(dx, 6);
	dy = round(dy, 6);
	// debug(`\t returning ${(dx !== 0 || dy !== 0)}`);

	// debug(` PathPoint.updatePathPointPosition - END\n\n`);

	// return true if the point moved
	return dx !== 0 || dy !== 0;
};

PathPoint.prototype.isOverControlPoint = function (x, y, nohandles) {
	var hp =
		_GP.projectsettings.pointsize / getView('Path.isOverControlPoint').dz;

	if (
		this.P.x + hp > x &&
		this.P.x - hp < x &&
		this.P.y + hp > y &&
		this.P.y - hp < y
	) {
		// debug('PathPoint.isOverControlPoint - Returning P1');

		return { point: this, type: 'P' };
	}

	if (this.useh1 && !nohandles) {
		if (
			this.H1.x + hp > x &&
			this.H1.x - hp < x &&
			this.H1.y + hp > y &&
			this.H1.y - hp < y
		) {
			// debug('PathPoint.isOverControlPoint - Returning H1');
			return { point: this, type: 'H1' };
		}
	}

	if (this.useh2 && !nohandles) {
		if (
			this.H2.x + hp > x &&
			this.H2.x - hp < x &&
			this.H2.y + hp > y &&
			this.H2.y - hp < y
		) {
			// debug('PathPoint.isOverControlPoint - Returning H2');
			return { point: this, type: 'H2' };
		}
	}

	return false;
};

PathPoint.prototype.toggleUseHandle = function (h) {
	// debug(`\n PathPoint.toggleUseHandle - START`);

	// debug('\t before:\n'+json(this));

	if (h) {
		this.useh1 = !this.useh1;
		history_put('Use Handle 1 : ' + this.useh1);
	} else {
		this.useh2 = !this.useh2;
		history_put('Use Handle 2 : ' + this.useh2);
	}
	_UI.ms.shapes.calcMaxes();
	redraw({ calledby: 'pointDetails' });

	// debug('\t after:\n'+json(this));
	// debug(` PathPoint.toggleUseHandle - END\n\n`);
};

PathPoint.prototype.setPointType = function (type) {
	if (type === 'symmetric') this.makeSymmetric();
	else if (type === 'flat') this.makeFlat();
	else this.type = 'corner';
};

PathPoint.prototype.makeSymmetric = function (hold) {
	// debug(`\n PathPoint.makeSymmetric - START`);

	// debug('\t hold ' + hold + ' starts as ' + json(this));

	if (!hold) {
		hold = this.useh1 ? 'H1' : 'H2';
		if (!(this.useh1 || this.useh2)) {
			if (
				coordsAreEqual(this.P, this.H1) &&
				coordsAreEqual(this.P && this.H2)
			) {
				// Handles and points are all in the same place
				this.H2.x -= 200;
				this.H1.x += 200;
				this.type = 'symmetric';
				this.useh1 = true;
				this.useh2 = true;
				return;
			}
		}
	}

	switch (hold) {
		case 'H1':
			this.H2.x = this.P.x - this.H1.x + this.P.x;
			this.H2.y = this.P.y - this.H1.y + this.P.y;
			break;
		case 'H2':
			this.H1.x = this.P.x - this.H2.x + this.P.x;
			this.H1.y = this.P.y - this.H2.y + this.P.y;
			break;
	}

	this.type = 'symmetric';
	this.useh1 = true;
	this.useh2 = true;

	//this.roundAll();
	// debug('\t returns ' + json(this));
	// debug(` PathPoint.makeSymmetric - END\n\n`);
};

PathPoint.prototype.makeFlat = function (hold) {
	// debug('\n PathPoint.makeFlat - START');
	// debug('\t hold passed ' + hold);

	if (this.isFlat()) {
		this.type = 'flat';
		return;
	}

	if (!hold) {
		hold = this.useh1 ? 'H1' : 'H2';
		if (!(this.useh1 || this.useh2)) {
			if (
				coordsAreEqual(this.P, this.H1) &&
				coordsAreEqual(this.P && this.H2)
			) {
				// Handles and points are all in the same place
				this.H2.x -= 300;
				this.H1.x += 100;
				this.type = 'flat';
				this.useh1 = true;
				this.useh2 = true;
				return;
			}
		}
	}

	if (hold === 'H1' && !this.useh1 && this.useh2) this.makeSymmetric('H2');
	if (hold === 'H2' && !this.useh2 && this.useh1) this.makeSymmetric('H1');

	var angle1 = this.getH1Angle();
	var angle2 = this.getH2Angle();
	var hyp1 = this.getH1Length();
	var hyp2 = this.getH2Length();

	// debug(`\t H1a ${angle1} \t H2a ${angle2}`);
	// debug(`\t H1l ${hyp1} \t H2l ${hyp2}`);

	//new values
	var newHx, newHy, newadj, newopp;

	if (hold === 'H1') {
		//get new x and y for H2
		newadj = Math.cos(angle1) * hyp2;
		newopp = Math.tan(angle1) * newadj;

		//Set values
		newHx = this.P.x + newadj * -1;
		newHy = this.P.y + newopp * -1;

		if (!isNaN(newHx) && !isNaN(newHy)) {
			this.H2.x = newHx;
			this.H2.y = newHy;
		}
	} else if (hold === 'H2') {
		//get new x and y for H2
		newadj = Math.cos(angle2) * hyp1;
		newopp = Math.tan(angle2) * newadj;

		//Set values
		newHx = this.P.x + newadj * -1;
		newHy = this.P.y + newopp * -1;

		if (!isNaN(newHx) && !isNaN(newHy)) {
			this.H1.x = newHx;
			this.H1.y = newHy;
		}
	}

	this.type = 'flat';

	// debug(' PathPoint.makeFlat - END\n');
};

PathPoint.prototype.isFlat = function () {
	if (this.P.x === this.H1.x && this.P.x === this.H2.x) return true;
	if (this.P.y === this.H1.y && this.P.y === this.H2.y) return true;

	var a1 = this.getH1Angle();
	var a2 = this.getH2Angle();
	// debug('\t comparing ' + a1 + ' / ' + a2);

	return round(Math.abs(a1) + Math.abs(a2), 2) === 3.14;
};

PathPoint.prototype.resolvePointType = function () {
	// debug('\n PathPoint.resolvePointType - START');

	if (this.isFlat()) {
		if (this.getH1Length() === this.getH2Length()) {
			// debug('\t resolvePointType - setting to Symmetric');
			this.type = 'symmetric';
		} else {
			// debug('\t resolvePointType - setting to Flat');
			this.type = 'flat';
		}
	} else {
		// debug('\t resolvePointType - setting to Corner');
		this.type = 'corner';
	}
	// debug(' pathPoint.resolvePointType - END\n');
};

PathPoint.prototype.makePointedTo = function (
	px,
	py,
	length,
	handle,
	dontresolvetype
) {
	//figure out angle
	var adj1 = this.P.x - px;
	var opp1 = this.P.y - py;

	var ymod = opp1 >= 0 ? -1 : 1;
	var xmod = -1;

	var hyp1 = Math.sqrt(adj1 * adj1 + opp1 * opp1);
	var angle1 = Math.acos(adj1 / hyp1);

	length = length || hyp1 / 3;
	handle = handle === 'H2' ? 'H2' : 'H1';

	// debug('MAKEPOINTEDTO - x/y/l ' + px + ' ' + py + ' ' + length + ' - Before H1x/y ' + this.H1.x + ' ' + this.H1.y);
	this[handle].x = this.P.x + Math.cos(angle1) * length * xmod;
	this[handle].y = this.P.y + Math.sin(angle1) * length * ymod;
	// debug('MAKEPOINTEDTO - after H1x/y ' + this.H1.x + ' ' + this.H1.y);

	if (!dontresolvetype) {
		if (this.type === 'corner') this.makeFlat(handle);
		else this.makeSymmetric(handle);
		// debug('MAKEPOINTEDTO - after makesymmetric H1x/y ' + this.H1.x + ' ' + this.H1.y);
	}
};

PathPoint.prototype.round = function (precision) {
	precision = isval(precision) ? precision : 3;
	this.roundAll(precision);
};

PathPoint.prototype.rotate = function (deltaRad, about, snap) {
	// debug('\n PathPoint.rotate - START');
	rotate(this.P, deltaRad, about, snap);
	rotate(this.H1, deltaRad, about, snap);
	rotate(this.H2, deltaRad, about, snap);
	// debug('\t this.P ' + json(this.P, true));
	// debug(' PathPoint.rotate - END\n');
};

PathPoint.prototype.resetHandles = function () {
	this.type = 'corner';
	this.useh1 = true;
	this.useh2 = true;
	this.H2.x = this.P.x - 100;
	this.H2.y = this.P.y;
	this.H1.x = this.P.x + 100;
	this.H1.y = this.P.y;
};

PathPoint.prototype.getPointNum = function () {
	var parr = this.parentpath;
	if (!parr) return false;

	parr = parr.pathpoints;
	if (!parr) return false;

	for (var p = 0; p < parr.length; p++) {
		if (parr[p] === this) return p;
	}

	return false;
};

PathPoint.prototype.roundAll = function (precision) {
	precision = isval(precision) ? precision : 9;

	this.P.x = round(this.P.x, precision);
	this.P.y = round(this.P.y, precision);
	this.H1.x = round(this.H1.x, precision);
	this.H1.y = round(this.H1.y, precision);
	this.H2.x = round(this.H2.x, precision);
	this.H2.y = round(this.H2.y, precision);
};

//-------------------------------------------------------
// GETTERS
//-------------------------------------------------------

PathPoint.prototype.getPx = function () {
	var re = this.P.x;
	if (isNaN(re)) {
		re = 0;
		// debug('PathPoint NaN found P.x - falling back to 0');
	}
	return re;
};

PathPoint.prototype.getPy = function () {
	var re = this.P.y;
	if (isNaN(re)) {
		re = 0;
		// debug('PathPoint NaN found P.y - falling back to 0');
	}
	return re;
};

PathPoint.prototype.getH1x = function () {
	this.H1 = this.H1 || new Coord(this.P);
	var re = this.useh1 ? this.H1.x : this.P.x;
	if (isNaN(re)) {
		re = this.P.x || this.H1.x || 0;
		// debug('PathPoint NaN found H1.x - falling back to ' + re);
	}
	return re;
};

PathPoint.prototype.getH1y = function () {
	this.H1 = this.H1 || new Coord(this.P);
	var re = this.useh1 ? this.H1.y : this.P.y;
	if (isNaN(re)) {
		re = this.P.y || this.H1.y || 0;
		// debug('PathPoint NaN found H1.y - falling back to ' + re);
	}
	return re;
};

PathPoint.prototype.getH2x = function () {
	this.H2 = this.H2 || new Coord(this.P);
	var re = this.useh2 ? this.H2.x : this.P.x;
	if (isNaN(re)) {
		re = this.P.x || this.H2.x || 0;
		// debug('PathPoint NaN found H2.x - falling back to ' + re);
	}
	return re;
};

PathPoint.prototype.getH2y = function () {
	this.H2 = this.H2 || new Coord(this.P);
	var re = this.useh2 ? this.H2.y : this.P.y;
	if (isNaN(re)) {
		re = this.P.y || this.H2.y || 0;
		// debug('PathPoint NaN found H2.y - falling back to ' + re);
	}
	return re;
};

PathPoint.prototype.setH1AngleX = function (angle) {
	this.H1.x = calculateAngleX(angle, this.H1.y);
};

PathPoint.prototype.setH1AngleY = function (angle) {
	this.H1.y = calculateAngleY(angle, this.H1.x);
};

PathPoint.prototype.setH2AngleX = function (angle) {
	this.H2.x = calculateAngleX(angle, this.H2.y);
};

PathPoint.prototype.setH2AngleY = function (angle) {
	this.H2.y = calculateAngleY(angle, this.H2.x);
};

PathPoint.prototype.getH1Angle = function () {
	return calculateAngle(this.H1, this.P);
};

PathPoint.prototype.getH2Angle = function () {
	return calculateAngle(this.H2, this.P);
};

PathPoint.prototype.getH1NiceAngle = function () {
	return radiansToNiceAngle(this.getH1Angle());
};

PathPoint.prototype.getH2NiceAngle = function () {
	return radiansToNiceAngle(this.getH2Angle());
};

PathPoint.prototype.getH1Length = function () {
	return calculateLength(this.H1, this.P);
};

PathPoint.prototype.getH2Length = function () {
	return calculateLength(this.H2, this.P);
};

//-------------------------------------------------------
// HELPERS
//-------------------------------------------------------
function makePathPointFromSegments(seg1, seg2) {
	var newpp = new PathPoint({
		H1: new Coord({ x: seg1.p3x, y: seg1.p3y }),
		P: new Coord({ x: seg2.p1x, y: seg2.p1y }),
		H2: new Coord({ x: seg2.p2x, y: seg2.p2y }),
		useh1: true,
		useh2: true,
	});

	if (seg1.line || coordsAreEqual(newpp.H1, newpp.P)) newpp.useh1 = false;
	if (seg2.line || coordsAreEqual(newpp.H2, newpp.P)) newpp.useh2 = false;

	// newpp.resolvePointType();

	return newpp;
}

//-------------------------------------------------------
// DRAW
//-------------------------------------------------------

PathPoint.prototype.drawPoint = function (accent) {
	// debug('\n PathPoint.drawPoint - START');
	// debug('\t sel = ' + _UI.ms.points.isSelected(this));

	accent = accent || _UI.colors.blue;
	var ps = _GP.projectsettings.pointsize;
	var hp = ps / 2;
	// _UI.glypheditctx.fillStyle = sel? 'white' : accent.l65;
	_UI.glypheditctx.fillStyle = _UI.ms.points.isSelected(this)
		? 'white'
		: accent.l65;
	_UI.glypheditctx.strokeStyle = accent.l65;
	_UI.glypheditctx.font = '10px Consolas';

	_UI.glypheditctx.fillRect(sx_cx(this.P.x) - hp, sy_cy(this.P.y) - hp, ps, ps);
	_UI.glypheditctx.strokeRect(
		sx_cx(this.P.x) - hp,
		sy_cy(this.P.y) - hp,
		ps,
		ps
	);

	_UI.glypheditctx.fillStyle = accent.l65;
	_UI.glypheditctx.fillText(
		this.getPointNum(),
		sx_cx(this.P.x + 12),
		sy_cy(this.P.y)
	);
	// debug(' PathPoint.drawPoint - END\n');
};

PathPoint.prototype.drawDirectionalityPoint = function (accent, next) {
	accent = accent || _UI.colors.blue;
	// _UI.glypheditctx.fillStyle = sel? 'white' : accent.l65;
	_UI.glypheditctx.fillStyle = _UI.ms.points.isSelected(this)
		? 'white'
		: accent.l65;
	_UI.glypheditctx.strokeStyle = accent.l65;
	_UI.glypheditctx.lineWidth = 1;
	var begin = { x: this.P.x, y: this.P.y };
	var end = { x: this.H2.x, y: this.H2.y };

	if (!this.useh2) {
		end = { x: next.P.x, y: next.P.y };
	}

	var ps = _GP.projectsettings.pointsize * 0.5;
	var arrow = [
		[ps * 3, 0],
		[ps, ps],
		[-ps, ps],
		[-ps, -ps],
		[ps, -ps],
	];
	var rotatedarrow = [];
	var ang = Math.atan2(end.y - begin.y, end.x - begin.x) * -1;

	// FAILURE CASE FALLBACK
	if (!ang && ang !== 0) {
		ang = this.P.x > this.H2.x ? Math.PI : 0;
	}

	for (var a in arrow) {
		if (arrow.hasOwnProperty(a)) {
			rotatedarrow.push([
				arrow[a][0] * Math.cos(ang) - arrow[a][1] * Math.sin(ang),
				arrow[a][0] * Math.sin(ang) + arrow[a][1] * Math.cos(ang),
			]);
		}
	}

	// debug('DRAWPOINT arrow = ' + json(arrow) + ' - rotatedarrow = ' + json(rotatedarrow));

	_UI.glypheditctx.beginPath();
	_UI.glypheditctx.moveTo(
		rotatedarrow[0][0] + sx_cx(this.P.x),
		rotatedarrow[0][1] + sy_cy(this.P.y)
	);

	for (var p in rotatedarrow) {
		if (p > 0) {
			_UI.glypheditctx.lineTo(
				rotatedarrow[p][0] + sx_cx(this.P.x),
				rotatedarrow[p][1] + sy_cy(this.P.y)
			);
		}
	}

	_UI.glypheditctx.lineTo(
		rotatedarrow[0][0] + sx_cx(this.P.x),
		rotatedarrow[0][1] + sy_cy(this.P.y)
	);
	_UI.glypheditctx.fill();
	_UI.glypheditctx.stroke();

	// Exact Middle Point
	_UI.glypheditctx.fillStyle = accent.l65;
	_UI.glypheditctx.fillRect(
		sx_cx(this.P.x).makeCrisp(),
		sy_cy(this.P.y).makeCrisp(),
		1,
		1
	);
};

PathPoint.prototype.drawHandles = function (drawH1, drawH2, accent) {
	var setStyleDefaults = function () {
		accent = accent || _UI.colors.blue;
		_UI.glypheditctx.fillStyle = accent.l65;
		_UI.glypheditctx.strokeStyle = accent.l65;
		_UI.glypheditctx.lineWidth = 1;
		_UI.glypheditctx.font = '10px Consolas';
	};
	setStyleDefaults();

	var hp = _GP.projectsettings.pointsize / 2;

	if (drawH1 && this.useh1) {
		_UI.glypheditctx.beginPath();
		_UI.glypheditctx.arc(
			sx_cx(this.H1.x),
			sy_cy(this.H1.y),
			hp,
			0,
			Math.PI * 2,
			true
		);
		_UI.glypheditctx.closePath();
		_UI.glypheditctx.fill();

		_UI.glypheditctx.beginPath();
		_UI.glypheditctx.moveTo(sx_cx(this.P.x), sy_cy(this.P.y));
		_UI.glypheditctx.lineTo(sx_cx(this.H1.x), sy_cy(this.H1.y));
		_UI.glypheditctx.closePath();
		_UI.glypheditctx.stroke();
		_UI.glypheditctx.fillText('1', sx_cx(this.H1.x + 12), sy_cy(this.H1.y));
	}

	if (drawH2 && this.useh2) {
		_UI.glypheditctx.beginPath();
		_UI.glypheditctx.arc(
			sx_cx(this.H2.x),
			sy_cy(this.H2.y),
			hp,
			0,
			Math.PI * 2,
			true
		);
		_UI.glypheditctx.closePath();
		_UI.glypheditctx.fill();

		_UI.glypheditctx.beginPath();
		_UI.glypheditctx.moveTo(sx_cx(this.P.x), sy_cy(this.P.y));
		_UI.glypheditctx.lineTo(sx_cx(this.H2.x), sy_cy(this.H2.y));
		_UI.glypheditctx.closePath();
		_UI.glypheditctx.stroke();
		_UI.glypheditctx.fillText('2', sx_cx(this.H2.x + 12), sy_cy(this.H2.y));
	}
};

PathPoint.prototype.drawQuadraticHandle = function (prevP) {
	// Draw Quadratic handle point from imported SVG
	_UI.glypheditctx.fillStyle = _UI.colors.error.medium;
	_UI.glypheditctx.strokeStyle = _UI.colors.error.medium;
	_UI.glypheditctx.lineWidth = 1;
	var hp = _GP.projectsettings.pointsize / 2;

	if (this.Q) {
		_UI.glypheditctx.beginPath();
		_UI.glypheditctx.arc(
			sx_cx(this.Q.x),
			sy_cy(this.Q.y),
			hp,
			0,
			Math.PI * 2,
			true
		);
		_UI.glypheditctx.closePath();
		_UI.glypheditctx.fill();

		_UI.glypheditctx.beginPath();
		_UI.glypheditctx.moveTo(sx_cx(this.P.x), sy_cy(this.P.y));
		_UI.glypheditctx.lineTo(sx_cx(this.Q.x), sy_cy(this.Q.y));
		_UI.glypheditctx.closePath();
		_UI.glypheditctx.stroke();

		if (prevP) {
			_UI.glypheditctx.beginPath();
			_UI.glypheditctx.moveTo(sx_cx(prevP.x), sy_cy(prevP.y));
			_UI.glypheditctx.lineTo(sx_cx(this.Q.x), sy_cy(this.Q.y));
			_UI.glypheditctx.closePath();
			_UI.glypheditctx.stroke();
		}
	}
};

PathPoint.prototype.drawNonIntegerPoint = function (accent) {
	// debug('\n PathPoint.drawNonIntegerPoint - START');
	// debug('\t sel = ' + _UI.ms.points.isSelected(this));
	accent = accent || _UI.colors.error.medium;
	var ps = _GP.projectsettings.pointsize;
	var hp = ps / 2;
	_UI.glypheditctx.strokeStyle = accent;
	_UI.glypheditctx.font = '10px Consolas';
	_UI.glypheditctx.fillStyle = _UI.ms.points.isSelected(this)
		? 'white'
		: accent;

	if (
		this.useh1 &&
		!(
			Math.round(this.H1.x) === this.H1.x && Math.round(this.H1.y) === this.H1.y
		)
	) {
		_UI.glypheditctx.beginPath();
		_UI.glypheditctx.moveTo(sx_cx(this.P.x), sy_cy(this.P.y));
		_UI.glypheditctx.lineTo(sx_cx(this.H1.x), sy_cy(this.H1.y));
		_UI.glypheditctx.closePath();
		_UI.glypheditctx.stroke();

		_UI.glypheditctx.beginPath();
		_UI.glypheditctx.arc(
			sx_cx(this.H1.x),
			sy_cy(this.H1.y),
			hp,
			0,
			Math.PI * 2,
			true
		);
		_UI.glypheditctx.closePath();
		_UI.glypheditctx.fill();
		_UI.glypheditctx.stroke();
	}

	if (
		this.useh1 &&
		!(
			Math.round(this.H2.x) === this.H2.x && Math.round(this.H2.y) === this.H2.y
		)
	) {
		_UI.glypheditctx.beginPath();
		_UI.glypheditctx.moveTo(sx_cx(this.P.x), sy_cy(this.P.y));
		_UI.glypheditctx.lineTo(sx_cx(this.H2.x), sy_cy(this.H2.y));
		_UI.glypheditctx.closePath();
		_UI.glypheditctx.stroke();

		_UI.glypheditctx.beginPath();
		_UI.glypheditctx.arc(
			sx_cx(this.H2.x),
			sy_cy(this.H2.y),
			hp,
			0,
			Math.PI * 2,
			true
		);
		_UI.glypheditctx.closePath();
		_UI.glypheditctx.fill();
		_UI.glypheditctx.stroke();
	}

	if (
		!(Math.round(this.P.x) === this.P.x && Math.round(this.P.y) === this.P.y)
	) {
		_UI.glypheditctx.fillRect(
			sx_cx(this.P.x) - hp,
			sy_cy(this.P.y) - hp,
			ps,
			ps
		);
		_UI.glypheditctx.strokeRect(
			sx_cx(this.P.x) - hp,
			sy_cy(this.P.y) - hp,
			ps,
			ps
		);

		_UI.glypheditctx.fillStyle = accent;
		_UI.glypheditctx.fillText('✖', sx_cx(this.P.x + 12), sy_cy(this.P.y + 12));
	}

	// debug(' PathPoint.drawNonIntegerPoint - END\n');
};

//-------------------------------------------------------
// COORDINATE OBJECT
//-------------------------------------------------------

function Coord(oa) {
	this.objtype = 'coord';
	oa = oa || {};

	this.x = parseFloat(oa.x) || 0;
	this.y = parseFloat(oa.y) || 0;
	this.xlock = oa.xlock || false;
	this.ylock = oa.ylock || false;

	if (oa && oa.x !== undefined && isNaN(oa.x))
		console.warn('NEW COORD >> initialized oa.x = ' + oa.x);
	if (oa && oa.y !== undefined && isNaN(oa.y))
		console.warn('NEW COORD >> initialized oa.y = ' + oa.y);
}

function coordsAreEqual(c1, c2, threshold) {
	// debug('\n coordsAreEqual - START');
	threshold = threshold || 1;
	// debug('\t c1 ' + json(c1, true));
	// debug('\t c2 ' + json(c2, true));
	// debug('\t threshold ' + threshold);

	if (c1.x === c2.x && c1.y === c2.y) {
		// debug('\t exact match');
		return true;
	}

	var dx = Math.abs(c1.x - c2.x);
	var dy = Math.abs(c1.y - c2.y);

	// debug('\t dx ' + dx + '\tdy ' + dy);

	if (dx <= threshold && dy <= threshold) {
		// debug('\t below threshold match');
		return true;
	}

	// debug('\t not a match');
	// debug(' coordsAreEqual - END\n');

	return false;
}
