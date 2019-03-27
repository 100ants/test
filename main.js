/*=================== Sys funcs =======================*/

function checkLineIntersection(l1, l2) {
	let 
  	line1StartX = l1.s.x,
    line1StartY = l1.s.y,
    line1EndX = l1.e.x,
    line1EndY = l1.e.y,
    line2StartX = l2.s.x,
    line2StartY = l2.s.y,
    line2EndX = l2.e.x,
    line2EndY = l2.e.y;
    
    // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
    
    var denominator, a, b, numerator1, numerator2, result = {
        x: null,
        y: null,
        onLine1: false,
        onLine2: false,
        inters: false
    };
    denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
    
    if (denominator == 0) {
        return result;
    }
    
    a = line1StartY - line2StartY;
    b = line1StartX - line2StartX;
    numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
    numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
    a = numerator1 / denominator;
    b = numerator2 / denominator;

    // if we cast these lines infinitely in both directions, they intersect here:
    result.x = line1StartX + (a * (line1EndX - line1StartX));
    result.y = line1StartY + (a * (line1EndY - line1StartY));
/*
        // it is worth noting that this should be the same as:
        x = line2StartX + (b * (line2EndX - line2StartX));
        y = line2StartX + (b * (line2EndY - line2StartY));
        */
    // if line1 is a segment and line2 is infinite, they intersect if:
    if (a > 0 && a < 1) {
        result.onLine1 = true;
    }
    // if line2 is a segment and line1 is infinite, they intersect if:
    if (b > 0 && b < 1) {
        result.onLine2 = true;
    }
    result.inters = result.onLine1 && result.onLine2
    // if line1 and line2 are segments, they intersect if both of the above are true
    return result;
}

function checkPointInPoly(point, vsp){
	var x = point.x, y = point.y;
  var vs = vsp.points;  
  
    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i].x, yi = vs[i].y;
        var xj = vs[j].x, yj = vs[j].y;
        
        var intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
}

function rotate(angle, pivot, point){
	let p = point;
  
	let c = Math.cos(angle * Math.PI / 180);
  let s = Math.sin(angle * Math.PI / 180);
  
  p.x -= pivot.x;
  p.y -= pivot.y;
  
  let xnew = p.x * c - p.y * s;
  let ynew = p.x * s + p.y * c;
  
  p.x = xnew + pivot.x;
  p.y = ynew + pivot.y;

	return p
}

function dist(a, b){
	var c = a.x - b.x;
  var d = a.y - b.y;
  return Math.sqrt( c*c + d*d );
}

function findNearestExitVector(projectedPoint, circleCenter, radius) {
    var l1 = circleCenter.x - projectedPoint.x;
    var l2 = circleCenter.y - projectedPoint.y;
    var pointToCircleDist = Math.sqrt((l1 * l1) + (l2 * l2));
    var minDistance = 0;
    if (pointToCircleDist < radius) {
        minDistance = radius - pointToCircleDist;
    }

    var pointToCenterVector = new Vector2(l1 / pointToCircleDist, l2 / pointToCircleDist);
    return new Vector2(pointToCenterVector.x * minDistance, pointToCenterVector.y * minDistance);
}

function projectPointOnLine(linePoint1, linePoint2, point) {
    var ap = new Vector2(point.x - linePoint1.x, point.y - linePoint1.y);
    var ab = new Vector2(linePoint2.x - linePoint1.x, linePoint2.y - linePoint1.y);

    function dot(v1, v2) {
        return (v1.x * v2.x) + (v1.y * v2.y);
    }


    var coef = dot(ap, ab) / dot(ab, ab);
    return new Vector2(linePoint1.x + (coef * ab.x), linePoint1.y + (coef * ab.y));
}

function isProjectedPointOnLine(linePoint1, linePoint2, point) {
    //x1 < x < x2
    //y1 < y < y2
    return	(linePoint1.x < point.x && point.x < linePoint2.x) ||
      			(linePoint1.x > point.x && point.x > linePoint2.x) ||
      			(linePoint1.y < point.y && point.y < linePoint2.y) ||
      			(linePoint1.y > point.y && point.y > linePoint2.y)
}


/* Main polygin class */

class Poly{
	constructor(p){
    this.r = 0;
  	if(!p) return;
  	this.setpoints(p);
  }

  collides(p2){
  	if(p2 instanceof Rect || p2 instanceof Poly){
    	for(let i of this.points){
        if(checkPointInPoly(i, p2)) return true;
      }

      for(let i of p2.points){
        if(checkPointInPoly(i, this)) return true;
      }	
    } else if (p2 instanceof Circ){
    	return p2.collides(this)
    } else if (p2 instanceof Vector2){
    	return checkPointInPoly(p2, this)
    }
  }
  
  rotate(ang, piv){
  	if(this.r !== undefined && this.piv){
    	let t = this;
      this.points.map(function(p){
        return rotate(-t.r, t.piv, p)
      })
    }
  	this.points.map(function(p){
    	return rotate(ang, piv, p)
    })
    this.r = ang;
    this.piv = piv
  }
  
  setpoints(p){
    if(!Array.isArray(p)){
    	console.error('Points must be array type!');
      return;
    }
    let lines = []
    p.forEach(function(e, i){
    	if(typeof e.x != 'number' || typeof e.y != 'number'){
      	console.error('Point must have x and y in number type!');
        return;
      }
      if(i + 1 <= p.length - 1) lines.push({s: e, e: p[i + 1]});
      else lines.push({s: e, e: p[0]})
      
    })
    
    if(JSON.stringify(this.lines) != JSON.stringify(lines)) this.lines = lines;
    
    this.points = p;
  }
  
}

/* Vector2 - 2D point */

class Vector2{
	constructor(x, y){
  	this.x = x;
    this.y = y;
  }
  
  toArray(){
  	return [this.x, this.y]
  }
}

/* Rect */

class Rect extends Poly{
	constructor(x, y, w, h){
  	super()
    this.rh = h;
    this.rw = w;
    this.rx = x;
    this.ry = y;
    
    super.setpoints([
    	new Vector2(x, y),
      new Vector2(x, y + h),
      new Vector2(x + w, y + h),
      new Vector2(x + w, y)
    ])
  }
  
  get x(){return this.rx}
  get y(){return this.ry}
  get w(){return this.rw}
  get h(){return this.rh}
  
  set h(h){
  	this.rh = h;
    this.bottom = this.ry + h
    this.setpoints([
    	new Vector2(this.x, this.y),
      new Vector2(this.x, this.y + h),
      new Vector2(this.x + this.w, this.y + h),
      new Vector2(this.x + this.w, this.y)
    ])
    let t = this
    this.points.map(function(p){
    	return rotate(t.r, t.piv, p)
    })
  }
  
  set w(w){
  	this.rw = w;
    this.left = this.rx + w
    this.setpoints([
    	new Vector2(this.x, this.y),
      new Vector2(this.x, this.y + this.h),
      new Vector2(this.x + w, this.y + this.h),
      new Vector2(this.x + w, this.y)
    ])
    let t = this
    this.points.map(function(p){
    	return rotate(t.r, t.piv, p)
    })
  }
  
  set x(x){
  	this.rx = x;
    this.right = x + this.rw
    this.setpoints([
    	new Vector2(x, this.y),
      new Vector2(x, this.y + this.h),
      new Vector2(x + this.w, this.y + this.h),
      new Vector2(x + this.w, this.y)
    ])
    let t = this
    this.points.map(function(p){
    	return rotate(t.r, t.piv, p)
    })
  }
  
  set y(y){
  	this.ry = y;
    this.bottom = y + this.rh
    this.setpoints([
    	new Vector2(this.x, y),
      new Vector2(this.x, y + this.h),
      new Vector2(this.x + this.w, y + this.h),
      new Vector2(this.x + this.w, y)
    ])
    let t = this
    this.points.map(function(p){
    	return rotate(t.r, t.piv, p)
    })
  }
}

/* Circle */

class Circ{
	constructor(pos, r){
  	this.x = pos.x;
    this.y = pos.y;
    this.r = r;
  }
  
  collides(o){
  	if(o instanceof Circ || o instanceof Vector2){ // Circle-circle collision    
    	var a;
      var x;
      var y;

      a = this.r + o.r | 0;
      x = this.x - o.x;
      y = this.y - o.y;

      if (a > Math.sqrt((x * x) + (y * y))) {
        return true;
      } else {
        return false;
      }
    }
    else if(o instanceof Rect || o instanceof Poly){
    	for(let i of o.lines){
      	let pnt = projectPointOnLine(i.s,
                                     i.e,
                                     new Vector2(this.x, this.y))
    
    		// is point on line (lineStart, lineEnd, point)
    		let ipnt = isProjectedPointOnLine(i.s, i.e, pnt);
        let nv = findNearestExitVector(pnt, this, this.r);
        
        if(ipnt && nv.x != 0 && nv.y != 0) return true;
      }// If circle is intsecting line
      for(let i of o.points){
        let a = this.r;
        let x = this.x - o.x;
        let y = this.y - o.y;

        if (a > Math.sqrt((x * x) + (y * y))) return true;
      }// Is point is in circle
      return checkPointInPoly(this, o) // If circle center is in poly
    }
  }
  
  rotate(ang, piv){
  	if(this.r && this.piv){
    	let nps = rotate(-this.r, this.piv, this)
      this.x = nps.x
      this.y = nps.y
    }
  	let nps = rotate(ang, piv, this)
    this.x = nps.x
    this.y = nps.y
    this.r = ang;
    this.piv = piv
  }
}