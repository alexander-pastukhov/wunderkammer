window.onload = function () {
    var sfs_canvas = document.getElementById('SFS-Canvas');
    paper.setup(sfs_canvas);
    var smallest_dim = Math.min(paper.view.size.width, paper.view.size.height);

    // settings
    sfs = { 'N': 5, 'outer_radius_in_windows_width': 0.05, 'inner_radius_in_windows_width': 0.015, 'blob': [] };
    sfs.outer_radius = smallest_dim * sfs.outer_radius_in_windows_width;
    sfs.inner_radius = smallest_dim * sfs.inner_radius_in_windows_width;

    // creating a grid with lots of shapes-from-shading
    var step = 1.0 / (sfs.N + 2);
    var full_row = [];
    for(var istep = 0; istep < (sfs.N + 2) ; istep++) full_row.push(-0.5 + step * istep);
    full_row.push(0.5);

    for (var iX = 1; iX < full_row.length - 1; iX++) {
        for (var iY = 1; iY < full_row.length - 1; iY++) {
            var blob_center = new paper.Point(paper.view.center.x + full_row[iX] * paper.view.size.width, paper.view.center.y + full_row[iY] * paper.view.size.height)
            current_blob = {
                'outer': new paper.Path.Circle({ center: blob_center, radius: sfs.outer_radius }),
                'inner': new paper.Path.Circle({ center: blob_center, radius: sfs.inner_radius })
            }
            current_blob.outer.fillColor = {
                gradient: {
                    stops: [['black', 1], ['white', 0]],
                },
                origin: current_blob.outer.bounds.topCenter,
                destination: current_blob.outer.bounds.bottomCenter
            };
            current_blob['group'] = new paper.Group([current_blob.outer, current_blob.inner]);
            if (Math.random() < 0.5) {
                current_blob['group'].rotate(180);
            }
            current_blob.group.onClick= function(event) {
                this.rotate(180);
            }
            //current_blob.inner.fillColor = 'grey';
            sfs.blob.push(current_blob);
        }
    }

    paper.view.onFrame = function (event) {
    };
};

function flipAll() {
    for (var iBlob = 0; iBlob < sfs.blob.length; iBlob++) {
        sfs.blob[iBlob].group.rotate(180);
    }
};

function rotateCW() {
    for (var iBlob = 0; iBlob < sfs.blob.length; iBlob++) {
        sfs.blob[iBlob].group.rotate(10);
    }
};

function rotateCCW() {
    for (var iBlob = 0; iBlob < sfs.blob.length; iBlob++) {
        sfs.blob[iBlob].group.rotate(-10);
    }
};
