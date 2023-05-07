window.onload = function () {
    var WE_canvas = document.getElementById('WE-Canvas');
    var WE_axis_ratio = document.getElementById('WE_axis_ratio');
    var WE_contrast = document.getElementById('WE_contrast');

    paper.setup(WE_canvas);
    smallest_dim = Math.min(paper.view.size.width, paper.view.size.height);
    ellipse_max_radius = (smallest_dim/2) * 0.7;

    ellipse = new paper.Shape.Ellipse({ center: paper.view.center,
                                        radius: [ellipse_max_radius, ellipse_max_radius * WE_axis_ratio.value], 
                                        fillColor: new paper.Color(WE_contrast.value / 100.0) });

    sattelites_group = new paper.Group();
    sattelites = [];
    for (var iSat = 0; iSat < 4; iSat++) {
        sattelites[iSat] = new paper.Shape.Ellipse(new paper.Rectangle(paper.view.center, new paper.Size(ellipse_max_radius * 0.05, ellipse_max_radius * 0.05)));
        sattelites[iSat].fillColor = 'red';
        sattelites[iSat].position = new paper.Point(paper.view.center.x + (ellipse_max_radius * 1.1 ) * Math.cos(Math.PI / 4.0 + iSat * Math.PI / 2), paper.view.center.x + (ellipse_max_radius * 1.1 ) * Math.sin(Math.PI / 4.0 + iSat * Math.PI / 2))
        sattelites_group.addChild(sattelites[iSat]);
    }
    sattelites_group.visible = document.getElementById("WE_sattelites").checked;


    paper.view.onFrame = function (event) {
        if (document.getElementById("WE_start_stop").checked)
        {
            rotation_speed_deg_per_frame = document.getElementById("WE_rpm").value * 360 / (60 * 60.0);
            ellipse.rotate(rotation_speed_deg_per_frame);
            var sat_sign = 1;
            if (document.getElementById("WE_sattelites_direction").checked) {
                sat_sign = 1;
            }
            else {
                sat_sign = -1;
            }
            sattelites_group.rotate(sat_sign * rotation_speed_deg_per_frame);
        }
    };


};

function on_WE_sattelites_change() {
    sattelites_group.visible = document.getElementById("WE_sattelites").checked;
};


// axis ratio
function adjust_axes_ratio() {
    ellipse.radius = [ellipse_max_radius, ellipse_max_radius * WE_axis_ratio.value];
};


// contrast
function adjust_contrast() {
    ellipse.fillColor = new paper.Color(WE_contrast.value / 100.0);
};
