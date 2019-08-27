interface Drawable {
    readonly delay: number;
    category: string;
}

class Circle {
    constructor(readonly r: number, readonly draw: Drawable) {}
}

interface Point {
    x: number;
    y: number;
}

class Line {
    readonly m: number;
    readonly c: number;
    constructor(private p1: Point, private p2: Point, readonly draw: Drawable) {
        var rise = p2.y - p1.y;
        var run = p2.x - p1.x;
        run = run ? run : -0.000001;
        
        this.m = rise/run;
        this.c = p1.y - this.m*p1.x;
    }

    getPoint1(): Point {
        return this.p1;
    }

    getPoint2(): Point {
        return this.p2;
    }

    getLineIntersection(line: Line): Point {
        var x = (line.c - this.c)/(this.m - line.m);
        return {x: x, y: this.getY(x)};
    }

    getRadiusIntersection(radius: number): Point {
        var xVals = this.findRadiusIntersection(radius);
    
        var x: number;
        if(this.checkXcontained(xVals[0])) {
            x = xVals[0];
        } else {
            x = xVals[1];
        }
        return {x: x, y: this.getY(x)};
    }

    extendLineToRadius(radius: number): void {
        var xVals = this.findRadiusIntersection(radius);
        
        if(Math.abs(xVals[0] - xVals[1]) < 0.00001) {
            // a^2 + b^2 = c^2
            let y = Math.sqrt(radius**2 - xVals[0]**2);
            if(this.p1.y < this.p2.y) {
                this.p1 = {x: xVals[0], y: -y};
                this.p2 = {x: xVals[0], y: y};
            } else {
                this.p1 = {x: xVals[0], y: y};
                this.p2 = {x: xVals[0], y: -y};
            }
        } else if(this.p1.x < this.p2.x) {
            this.p1 = {x: xVals[0], y: this.getY(xVals[0])};
            this.p2 = {x: xVals[1], y: this.getY(xVals[1])};
        } else {
            this.p1 = {x: xVals[1], y: this.getY(xVals[1])};
            this.p2 = {x: xVals[0], y: this.getY(xVals[0])};
        }
    }

    private findRadiusIntersection(radius: number): number[] {
        /*  y = mx + c                              line
            r^2 = (x - p)^2 + (y - q^2)             circle
            r^2 = x^2 + y^2                         simplified
            r^2 = x^2 + (mx + c)^2                  combined
            r^2 = x^2 + m^2x^2 + 2cmx + c^2         expanded
            (1 + m^2)x^2 + 2cmx + c^2 - r^2 = 0     rearranged
            Ax^2 + Bx + C = 0                       quadratic formula */
        
        // 1 + m^2
        var A = 1 + this.m**2;
        // 2cm
        var B = 2*this.c*this.m;
        // c^2 - r^2
        var C = this.c**2 - radius**2;

        var discriminant: number = B**2 - 4*A*C;
        var x1: number = (-B - Math.sqrt(discriminant))/(2*A);
        var x2: number = (-B + Math.sqrt(discriminant))/(2*A);
        return [x1, x2];
    }

    private checkXcontained(x: number): boolean {
        if(this.p1.x == this.p2.x) {
            return Math.min(this.p1.y, this.p2.y) <= this.getY(x) && Math.max(this.p1.y, this.p2.y) >= this.getY(x); 
        }
        return Math.min(this.p1.x, this.p2.x) <= x && Math.max(this.p1.x, this.p2.x) >= x;
    }

    private getY(x: number): number {
        return this.m*x + this.c;
    }
}