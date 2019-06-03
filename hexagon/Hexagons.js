// Holds a group of hexagons all shrinking to the same centre
class Hexagons {
    defaultSideLength;
    hexagons = [];
    offsets = [];
    constructor(container, sideLength, numHexagons) {
        this.defaultSideLength = sideLength;

        const offset = sideLength/numHexagons;
        for(let i = 0; i < numHexagons; i++) {
            this.offsets.push(i*offset);
            this.hexagons.push(new Hexagon(container, sideLength - this.offsets[i]));
        }
    }

    shiftHexagons(elapsed) {
        for(let i = 0; i < this.hexagons.length; i++) {
            let shift = (elapsed + this.offsets[i]) % this.defaultSideLength;
            let currSideLength = this.defaultSideLength - shift;
            let opacity = 1 - currSideLength/this.defaultSideLength;
            this.hexagons[i].updatePoints(currSideLength, opacity);
        }
    }
}

// A single shrinking hexagon
class Hexagon {
    // Assumes center is at (0,0)
    points = [];
    // Define how the line between the points should look
    lineFunction = d3.line()
        .x(function(d) { return d.x; })
        .y(function(d) {return d.y; });
    path;

    constructor(container, sideLength) {
        this.addPoints(sideLength);
        this.path = container.append("path")
            .attr("d", this.lineFunction(this.points))
            .attr("stroke-width", "5px")
            .attr("fill", "none");
    }

    updatePoints(sideLength, scale) {
        this.points = [];
        this.addPoints(sideLength, scale);
        let color;
        let limit = 0.3;
        if(scale < limit) {
            let step = 1/limit;
            let val = 255*(1-scale*step);
            color = d3.rgb(val, val, val);
        } else {
            color = d3.rgb(255*(scale-limit), 0, 255*(scale-limit));
        }
        this.path.attr("d", this.lineFunction(this.points))
            .attr("stroke", color);
    }

    addPoints(sideLength) {
        const angle = Math.PI/3;
        const yShift = sideLength*Math.sin(angle);

        // Calculate the 6 points
        this.points.push({x: sideLength/2, y: -yShift});
        this.points.push({x: sideLength, y: 0});
        this.points.push({x: sideLength/2, y: yShift});
        this.points.push({x: -sideLength/2, y: yShift});
        this.points.push({x: -sideLength, y: 0});
        this.points.push({x: -sideLength/2, y: -yShift});

        // to close the path nicely
        this.points.push(this.points[0]);
        this.points.push(this.points[1]);
    }
}