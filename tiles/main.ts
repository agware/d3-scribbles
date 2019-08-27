const margin = {top: 50, right: 50, bottom: 50, left: 50}
const height = 500 - margin.top - margin.bottom;
const width = 960 - margin.left - margin.right;

let svg = d3.select('body').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

let g = svg.append('g')
    .attr('transform', 'translate(' + (width/2 + margin.right) + ',' + (height/2 + margin.top) + ')');

const r = {outer: height/2, padding: height/10};
const circleData = {
    main: new Circle(r.outer - r.padding, {delay: 0, category: 'construction'}),
    outer: new Circle(r.outer, {delay: 0, category: 'hidden'})
};
let lineData: Line[][] = [];

const data = [
    new SplitInstruction(12, true, 'construction'),
    new PointInstruction(6, false, 'construction', new Vector(0, 2, 0, 12)),
    new PointInstruction(3, false, 'construction', new Vector(0, 4, 0, 12)),
    new PointInstruction(3, false, 'construction', new Vector(0, 4, 2, 12)),
    new PointInstruction(3, true, 'construction', new Vector(2, 1, 0, 3), new Vector(3, 1, 0, 3)),
    new PointInstruction(3, true, 'construction', new Vector(2, 1, 0, 3), new Vector(3, 1, 2, 3)),
    new LineInstruction(3, false, 'final', new Vector(4, 1, 0, 3), new Vector(1, 2, 1, 6), new Vector(1, 2, 3, 6)),
    new LineInstruction(3, false, 'final', new Vector(5, 1, 0, 3), new Vector(1, 2, 0, 6), new Vector(1, 2, 2, 6))
]

for(let i = 0; i < data.length; i++) {
    data[i].addLines(i+1, circleData, lineData);
}

const duration = 1000;
g.selectAll('circle')
    .data(d3.entries(circleData)).enter()
    .append('circle')
    .attr('class', d => d.value.draw.category)
    .transition().duration(duration).delay(d => d.value.draw.delay*duration)
        .attr('r', d => d.value.r);


let lines: Line[] = [].concat.apply([],lineData);
g.selectAll('line')
    .data(lines).enter()
    .append('line')
    .attr('class', d => d.draw.category)
    .attr('x1', d => d.getPoint1().x)
    .attr('y1', d => d.getPoint1().y)
    .attr('x2', d => d.getPoint1().x)
    .attr('y2', d => d.getPoint1().y)
    .transition().duration(duration).delay(d => d.draw.delay*duration)
        .attr('x2', d => d.getPoint2().x)
        .attr('y2', d => d.getPoint2().y);





