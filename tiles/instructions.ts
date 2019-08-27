abstract class Instruction {
    constructor(protected num: number, protected extend: boolean, protected category: string){}

    addLines(delay: number, circleData: any, lineData: Line[][]): void {
        var draw: Drawable = {delay: delay, category: this.category};
        var lines: Line[] = this.generateLines(circleData, lineData, draw);
        lineData.push(lines);
    };
    protected abstract generateLines(circleData: any, lineData: Line[][], draw: Drawable): Line[];
}

class SplitInstruction extends Instruction {
    constructor(num: number, extend: boolean, category: string) {
        super(num, extend, category);
    }

    protected generateLines(circleData: any, lineData: Line[][], draw: Drawable): Line[] {
        var lines: Line[] = [];
        for(var i = 0; i < this.num; i++) {
            var radians = 2*i*Math.PI/(this.num);
            var circleLabel = this.extend ? 'outer' : 'main';
            var line: Line = new Line({x: 0, y: 0}, {x: Math.sin(radians)*circleData[circleLabel].r, y: Math.cos(radians)*circleData[circleLabel].r}, draw);
            lines.push(line);
        }
        return lines;
    }
}

class PointInstruction extends Instruction {
    constructor(num: number, extend: boolean, category: string, private from: Vector, private to?: Vector) {
        super(num, extend, category);
    }

    protected generateLines(circleData: any, lineData: Line[][], draw: Drawable): Line[] {
        var lines: Line[] = [];
        var points = this.generatePoints(circleData, lineData);
        for(var i = 0; i < this.num; i++) {
            var j = (i+1) % this.num;
            var line = new Line(points[i], points[j], draw);
            if(this.extend) { line.extendLineToRadius(circleData['outer'].r)}
            lines.push(line);
        }
        return lines;
    }

    private generatePoints(circleData: any, lineData: Line[][]): Point[] {
        var points: Point[] = [];
        for(var i = 0; i < this.num; i++) {
            var fromLine: Line = lineData[this.from.getStep()][this.from.getIndex(i)];

            var point: Point;
            if(this.to != undefined) {
                var toLine: Line = lineData[this.to.getStep()][this.to.getIndex(i)];
                point = fromLine.getLineIntersection(toLine);
            } else {
                point = fromLine.getRadiusIntersection(circleData['main'].r);
            }
            points.push(point);
        }

        return points;
    }
}

class LineInstruction extends Instruction {
    constructor(num: number, extend: boolean, category: string, private main: Vector, private edge1: Vector, private edge2: Vector) {
        super(num, extend, category);
    }

    protected generateLines(circleData: any, lineData: Line[][], draw: Drawable): Line[] {
        let lines: Line[] = [];
        for(var i = 0; i < this.num; i++) {
            var mainLine: Line = lineData[this.main.getStep()][this.main.getIndex(i)];
            var edge1Line: Line = lineData[this.edge1.getStep()][this.edge1.getIndex(i)];
            var edge2Line: Line = lineData[this.edge2.getStep()][this.edge2.getIndex(i)];

            var point1: Point = mainLine.getLineIntersection(edge1Line);
            var point2: Point = mainLine.getLineIntersection(edge2Line);

            var line: Line = new Line(point1, point2, draw);
            if(this.extend) { line.extendLineToRadius(circleData['outer'].r)}
            lines.push(line);
        }
        return lines;
    }
}

class Vector {
    constructor(private step: number, private incr: number, private offset: number, private max: number) {}

    getIndex(index: number): number {
        return (this.incr*index + this.offset) % this.max;
    }

    getStep(): number {
        return this.step;
    }
}