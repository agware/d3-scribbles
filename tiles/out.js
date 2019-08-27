class Circle {
    constructor(r, draw) {
        this.r = r;
        this.draw = draw;
    }
}
class Line {
    constructor(p1, p2, draw) {
        this.p1 = p1;
        this.p2 = p2;
        this.draw = draw;
        var rise = p2.y - p1.y;
        var run = p2.x - p1.x;
        run = run ? run : -0.000001;
        this.m = rise / run;
        this.c = p1.y - this.m * p1.x;
    }
    getPoint1() {
        return this.p1;
    }
    getPoint2() {
        return this.p2;
    }
    getLineIntersection(line) {
        var x = (line.c - this.c) / (this.m - line.m);
        return { x: x, y: this.getY(x) };
    }
    getRadiusIntersection(radius) {
        var xVals = this.findRadiusIntersection(radius);
        var x;
        if (this.checkXcontained(xVals[0])) {
            x = xVals[0];
        }
        else {
            x = xVals[1];
        }
        return { x: x, y: this.getY(x) };
    }
    extendLineToRadius(radius) {
        var xVals = this.findRadiusIntersection(radius);
        if (Math.abs(xVals[0] - xVals[1]) < 0.00001) {
            // a^2 + b^2 = c^2
            let y = Math.sqrt(Math.pow(radius, 2) - Math.pow(xVals[0], 2));
            if (this.p1.y < this.p2.y) {
                this.p1 = { x: xVals[0], y: -y };
                this.p2 = { x: xVals[0], y: y };
            }
            else {
                this.p1 = { x: xVals[0], y: y };
                this.p2 = { x: xVals[0], y: -y };
            }
        }
        else if (this.p1.x < this.p2.x) {
            this.p1 = { x: xVals[0], y: this.getY(xVals[0]) };
            this.p2 = { x: xVals[1], y: this.getY(xVals[1]) };
        }
        else {
            this.p1 = { x: xVals[1], y: this.getY(xVals[1]) };
            this.p2 = { x: xVals[0], y: this.getY(xVals[0]) };
        }
    }
    findRadiusIntersection(radius) {
        /*  y = mx + c                              line
            r^2 = (x - p)^2 + (y - q^2)             circle
            r^2 = x^2 + y^2                         simplified
            r^2 = x^2 + (mx + c)^2                  combined
            r^2 = x^2 + m^2x^2 + 2cmx + c^2         expanded
            (1 + m^2)x^2 + 2cmx + c^2 - r^2 = 0     rearranged
            Ax^2 + Bx + C = 0                       quadratic formula */
        // 1 + m^2
        var A = 1 + Math.pow(this.m, 2);
        // 2cm
        var B = 2 * this.c * this.m;
        // c^2 - r^2
        var C = Math.pow(this.c, 2) - Math.pow(radius, 2);
        var discriminant = Math.pow(B, 2) - 4 * A * C;
        var x1 = (-B - Math.sqrt(discriminant)) / (2 * A);
        var x2 = (-B + Math.sqrt(discriminant)) / (2 * A);
        return [x1, x2];
    }
    checkXcontained(x) {
        if (this.p1.x == this.p2.x) {
            return Math.min(this.p1.y, this.p2.y) <= this.getY(x) && Math.max(this.p1.y, this.p2.y) >= this.getY(x);
        }
        return Math.min(this.p1.x, this.p2.x) <= x && Math.max(this.p1.x, this.p2.x) >= x;
    }
    getY(x) {
        return this.m * x + this.c;
    }
}
class Instruction {
    constructor(num, extend, category) {
        this.num = num;
        this.extend = extend;
        this.category = category;
    }
    addLines(delay, circleData, lineData) {
        var draw = { delay: delay, category: this.category };
        var lines = this.generateLines(circleData, lineData, draw);
        lineData.push(lines);
    }
    ;
}
class SplitInstruction extends Instruction {
    constructor(num, extend, category) {
        super(num, extend, category);
    }
    generateLines(circleData, lineData, draw) {
        var lines = [];
        for (var i = 0; i < this.num; i++) {
            var radians = 2 * i * Math.PI / (this.num);
            var circleLabel = this.extend ? 'outer' : 'main';
            var line = new Line({ x: 0, y: 0 }, { x: Math.sin(radians) * circleData[circleLabel].r, y: Math.cos(radians) * circleData[circleLabel].r }, draw);
            lines.push(line);
        }
        return lines;
    }
}
class PointInstruction extends Instruction {
    constructor(num, extend, category, from, to) {
        super(num, extend, category);
        this.from = from;
        this.to = to;
    }
    generateLines(circleData, lineData, draw) {
        var lines = [];
        var points = this.generatePoints(circleData, lineData);
        for (var i = 0; i < this.num; i++) {
            var j = (i + 1) % this.num;
            var line = new Line(points[i], points[j], draw);
            if (this.extend) {
                line.extendLineToRadius(circleData['outer'].r);
            }
            lines.push(line);
        }
        return lines;
    }
    generatePoints(circleData, lineData) {
        var points = [];
        for (var i = 0; i < this.num; i++) {
            var fromLine = lineData[this.from.getStep()][this.from.getIndex(i)];
            var point;
            if (this.to != undefined) {
                var toLine = lineData[this.to.getStep()][this.to.getIndex(i)];
                point = fromLine.getLineIntersection(toLine);
            }
            else {
                point = fromLine.getRadiusIntersection(circleData['main'].r);
            }
            points.push(point);
        }
        return points;
    }
}
class LineInstruction extends Instruction {
    constructor(num, extend, category, main, edge1, edge2) {
        super(num, extend, category);
        this.main = main;
        this.edge1 = edge1;
        this.edge2 = edge2;
    }
    generateLines(circleData, lineData, draw) {
        let lines = [];
        for (var i = 0; i < this.num; i++) {
            var mainLine = lineData[this.main.getStep()][this.main.getIndex(i)];
            var edge1Line = lineData[this.edge1.getStep()][this.edge1.getIndex(i)];
            var edge2Line = lineData[this.edge2.getStep()][this.edge2.getIndex(i)];
            var point1 = mainLine.getLineIntersection(edge1Line);
            var point2 = mainLine.getLineIntersection(edge2Line);
            var line = new Line(point1, point2, draw);
            if (this.extend) {
                line.extendLineToRadius(circleData['outer'].r);
            }
            lines.push(line);
        }
        return lines;
    }
}
class Vector {
    constructor(step, incr, offset, max) {
        this.step = step;
        this.incr = incr;
        this.offset = offset;
        this.max = max;
    }
    getIndex(index) {
        return (this.incr * index + this.offset) % this.max;
    }
    getStep() {
        return this.step;
    }
}
const margin = { top: 50, right: 50, bottom: 50, left: 50 };
const height = 500 - margin.top - margin.bottom;
const width = 960 - margin.left - margin.right;
let svg = d3.select('body').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);
let g = svg.append('g')
    .attr('transform', 'translate(' + (width / 2 + margin.right) + ',' + (height / 2 + margin.top) + ')');
const r = { outer: height / 2, padding: height / 10 };
const circleData = {
    main: new Circle(r.outer - r.padding, { delay: 0, category: 'construction' }),
    outer: new Circle(r.outer, { delay: 0, category: 'hidden' })
};
let lineData = [];
const data = [
    new SplitInstruction(12, true, 'construction'),
    new PointInstruction(6, false, 'construction', new Vector(0, 2, 0, 12)),
    new PointInstruction(3, false, 'construction', new Vector(0, 4, 0, 12)),
    new PointInstruction(3, false, 'construction', new Vector(0, 4, 2, 12)),
    new PointInstruction(3, true, 'construction', new Vector(2, 1, 0, 3), new Vector(3, 1, 0, 3)),
    new PointInstruction(3, true, 'construction', new Vector(2, 1, 0, 3), new Vector(3, 1, 2, 3)),
    new LineInstruction(3, false, 'final', new Vector(4, 1, 0, 3), new Vector(1, 2, 1, 6), new Vector(1, 2, 3, 6)),
    new LineInstruction(3, false, 'final', new Vector(5, 1, 0, 3), new Vector(1, 2, 0, 6), new Vector(1, 2, 2, 6))
];
for (let i = 0; i < data.length; i++) {
    data[i].addLines(i + 1, circleData, lineData);
}
// let temp = lineData[4][0];
// lineData.push([new Line(temp.getPoint1(), temp.getPoint2(), {delay: temp.draw.delay, category: 'final'})]);
// temp = lineData[1][1];
// lineData.push([new Line(temp.getPoint1(), temp.getPoint2(), {delay: temp.draw.delay, category: 'final'})]);
// temp = lineData[1][3];
// lineData.push([new Line(temp.getPoint1(), temp.getPoint2(), {delay: temp.draw.delay, category: 'final'})]);
const duration = 1000;
g.selectAll('circle')
    .data(d3.entries(circleData)).enter()
    .append('circle')
    .attr('class', d => d.value.draw.category)
    .transition().duration(duration).delay(d => d.value.draw.delay * duration)
    .attr('r', d => d.value.r);
let lines = [].concat.apply([], lineData);
g.selectAll('line')
    .data(lines).enter()
    .append('line')
    .attr('class', d => d.draw.category)
    .attr('x1', d => d.getPoint1().x)
    .attr('y1', d => d.getPoint1().y)
    .attr('x2', d => d.getPoint1().x)
    .attr('y2', d => d.getPoint1().y)
    .transition().duration(duration).delay(d => d.draw.delay * duration)
    .attr('x2', d => d.getPoint2().x)
    .attr('y2', d => d.getPoint2().y);
