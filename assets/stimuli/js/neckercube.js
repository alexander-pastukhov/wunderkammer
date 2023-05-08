window.onload = function () {
    var NC_canvas = document.getElementById('NC-Canvas');
    
    // square canvas
    NC_canvas.height = NC_canvas.width;

    paper.setup(NC_canvas);
    var smallest_dim = Math.min(paper.view.size.width, paper.view.size.height);
    nc_side= (smallest_dim * 0.6)/2;

    // sliders
    nc_x = document.getElementById("NC_x");
    nc_y = document.getElementById("NC_y");
    nc_light = document.getElementById("NC_light");

    // creating cube side by side
    //      ------------- along x ------------  ----------- along y ----------
    sides = []
    sides[0] = { 'x': [-1, 1, 1, -1], 'y': [-1, -1, 1, 1], 'z': [-1, -1, -1, -1] }
    sides[1] = { 'x': [-1, 1, 1, -1], 'y': [-1, -1, 1, 1], 'z': [ 1,  1,  1,  1] }
    sides[2] = { 'x': [-1, 1, 1, -1], 'y': [-1, -1, -1, -1], 'z': [-1, -1, 1, 1] }
    sides[3] = { 'x': [-1, 1, 1, -1], 'y': [ 1,  1,  1,  1], 'z': [-1, -1, 1, 1] }
    sides[4] = { 'x': [-1, -1, -1, -1], 'y': [-1, 1, 1, -1], 'z': [-1, -1, 1, 1] }
    sides[5] = { 'x': [ 1,  1,  1,  1], 'y': [-1, 1, 1, -1], 'z': [-1, -1, 1, 1] }

    var x = [];
    var y = [];
    var z = [];
    for (var iSide = 0; iSide < sides.length; iSide++)
    {
        for(var iPoint= 0; iPoint<sides[iSide].x.length; iPoint++)
        {
            x.push(sides[iSide].x[iPoint]);
            y.push(sides[iSide].y[iPoint]);
            z.push(sides[iSide].z[iPoint]);
        }
    }

    nc = { 'xyz': numeric.transpose([x, y, z]), 'sides': [], 'edges': [], 'mean_z': [] };
    for (var iLine = 0; iLine < sides.length; iLine++) {
        // defining the side path
        var new_side = new paper.Path();
        var current_z = 0;
        for (var iPoint = 0; iPoint < 4; iPoint++)
        {
            new_side.add(new paper.Point(nc.xyz[iLine * 4 + iPoint][0] * nc_side + paper.view.center.x, nc.xyz[iLine * 4 + iPoint][1] * nc_side + paper.view.center.y));
            current_z += nc.xyz[iLine * 4 + iPoint][2];
        }
        new_side.closed= true;
        nc.sides.push(new_side);
        nc.edges.push(new_side.clone());
        nc.sides[nc.sides.length - 1].fillColor= 'black';
        nc.sides[nc.sides.length - 1].opacity= 0;
        nc.sides[nc.sides.length - 1].strokeWidth= 0;
        nc.edges[nc.edges.length - 1].strokeWidth = 10;
        nc.edges[nc.edges.length - 1].strokeColor = 'white';
        nc.edges[nc.edges.length - 1].strokeCap = 'round';
        nc.edges[nc.edges.length - 1].strokeJoin = 'round';

        nc.mean_z.push(current_z / 4.0);
    }
    adjust_orientation();
    adjust_light();

    paper.view.onFrame = function (event) {
    };
};

// sortes and returns index
function sortWithIndeces(toSort) {
    for (var i = 0; i < toSort.length; i++) {
        toSort[i] = [toSort[i], i];
    }
    toSort.sort(function (left, right) {
        return left[0] < right[0] ? -1 : 1;
    });
    toSort.sortIndices = [];
    for (var j = 0; j < toSort.length; j++) {
        toSort.sortIndices.push(toSort[j][1]);
        toSort[j] = toSort[j][0];
    }
    return toSort;
}

function adjust_orientation() {
    var opacity_sign = 1;
    if (Number(nc_light.value < 0))
    {
        opacity_sign = -1;
    }

    angleX = Number(nc_x.value) * Math.PI / 180.0;
    angleY = Number(nc_y.value) * Math.PI / 180.0;
    angleZ = 0.0;


    // compute the rotation matrix
    var sX = [[1, 0, 0], [0, Math.cos(angleX), -Math.sin(angleX)], [0, Math.sin(angleX), Math.cos(angleX)]];
    var sY = [[Math.cos(angleY), 0, Math.sin(angleY)], [0, 1, 0], [-Math.sin(angleY), 0, Math.cos(angleY)]];
    var sZ = [[Math.cos(angleZ), -Math.sin(angleZ), 0], [Math.sin(angleZ), Math.cos(angleZ), 0], [0, 0, 1]];

    // rotate lines
    current_coords = numeric.dotMMsmall(numeric.dotMMsmall(numeric.dotMMsmall(nc.xyz, sX), sY), sZ);

    // put coords in
    for (var iLine = 0; iLine < sides.length; iLine++) {
        var current_z = 0;
        for (var iSegment = 0; iSegment < 4; iSegment++) {
            nc.sides[iLine].segments[iSegment].point.x = current_coords[iLine * 4 + iSegment][0] * nc_side + paper.view.center.x;
            nc.sides[iLine].segments[iSegment].point.y = current_coords[iLine * 4 + iSegment][1] * nc_side + paper.view.center.y;
            nc.edges[iLine].segments[iSegment].point.x = current_coords[iLine * 4 + iSegment][0] * nc_side + paper.view.center.x;
            nc.edges[iLine].segments[iSegment].point.y = current_coords[iLine * 4 + iSegment][1] * nc_side + paper.view.center.y;
            current_z += current_coords[iLine * 4 + iSegment][2];
        }
        nc.mean_z[iLine] = current_z * opacity_sign;
    }

    // depth sorting them
    z_order = nc.mean_z;
    sortWithIndeces(z_order);
    for (var iSide = 0; iSide < sides.length; iSide++) {
        nc.sides[z_order.sortIndices[iSide]].bringToFront();
        nc.edges[z_order.sortIndices[iSide]].bringToFront();
    }

    adjust_light();
}

function adjust_light() {
    // get data from controls
    var light_max = 1.0;
    var light_min = light_max - Math.abs(Number(nc_light.value));
    var current_opacity = Math.abs(Number(nc_light.value));
    for (var iLine = 0; iLine < sides.length; iLine++) {
        nc.sides[iLine].opacity = current_opacity;
    }
}
