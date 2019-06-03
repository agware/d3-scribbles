class Circle {
    static radius = 50;
    // generates the path string
    arc = d3.arc()
        .innerRadius(Circle.radius)
        .outerRadius(Circle.radius)
        .startAngle(0)
        .endAngle(0);
    // the g on which the path is drawn
    container;
    // Date.now() at which the drawing started
    timeDrawn;
    // boolean to indicate the circle is being removed
    isEnding = false;

    constructor(container) {
        this.container = container;

        container.append("path")
            .attr("d", this.arc())
            .attr("stroke-width", "5px")
            .attr("stroke", "black")
            .attr("fill", "none");

        this.timeDrawn = Date.now();
        this.draw();
    }

    // Returns true if finished drawing
    draw() {
        const speedAnimation = 500;
        let angle = (Date.now() - this.timeDrawn)/speedAnimation;

        if(!this.isEnding) {
            this.arc.endAngle(angle);
        } else {
            this.arc.startAngle(angle);
        }
        this.container.select("path")
            .attr("d", this.arc());

        return angle > Math.PI*2 + 0.2;
    }

    undrawCircle() {
        this.timeDrawn = Date.now();
        this.isEnding = true;
    }

    removeCircle() {
        this.container.remove();
    }

}