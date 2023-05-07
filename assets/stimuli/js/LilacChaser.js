window.onload = function () {
    var chaser_canvas = document.getElementById('LilacChaser-Canvas');
    paper.setup(chaser_canvas);
    var smallest_dim = Math.min(paper.view.size.width, paper.view.size.height);

    // defining fixation
    var fixation_radius_in_window_widths = 0.01;
    var fixation = new paper.Shape.Circle(paper.view.center, smallest_dim * fixation_radius_in_window_widths);
    fixation.strokeColor = 'black';
    fixation.strokeWidth = 2;

    // defining targets
    var target_radius_in_window_widths = 0.08;
    var target_radius = target_radius_in_window_widths * smallest_dim;
    var target_eccentricity_in_window_widths = 0.4;
    var target_eccentricity = target_eccentricity_in_window_widths * smallest_dim;

    var targets = [];
    for (var iTarget = 0; iTarget < 12; iTarget++) {
        target_coords = new paper.Point(paper.view.center.x + target_eccentricity * Math.cos(iTarget * (2 * Math.PI / 12.0)), paper.view.center.y + target_eccentricity * Math.sin(iTarget * (2 * Math.PI / 12.0)))
        targets[iTarget] = new paper.Path.Circle(target_coords, target_radius);
        targets[iTarget].fillColor = {gradient: {
            stops: [['#FF00FF', 0], ['#F3F3F3', 1]],
                radial: true
            },
            origin: targets[iTarget].position,
            destination: targets[iTarget].bounds.rightCenter
        };
    }
    var iTarget = 0;
    targets[iTarget].visible = false;

    // setting up going round
    if (document.getElementById("LilacChaser-Canvas").presentation_type == 'main') {
        // main presentation, using info from controls
        var rotation_speed_deg_per_frame = document.getElementById("chaser_rpm").value * 360 / (60 * 60.0);
    }
    else {
        // preview, using relative sizes and hard-coded parameters
        var rotation_speed_deg_per_frame = 30 * 360 / (60 * 60.0);
    }
    current_angle = 0;
    merry_go_round= true;

    paper.view.onFrame = function (event) {
        if (document.getElementById("chaser_start_stop").checked == true)
        {
            rotation_speed_deg_per_frame = document.getElementById("chaser_rpm").value * 360 / (60 * 60.0);
            current_angle += rotation_speed_deg_per_frame;
            if (current_angle>= 360/12)
            {
                current_angle = 0;
                targets[iTarget].visible = true;
                iTarget++;
                if (iTarget==targets.length)
                {
                    iTarget = 0;
                }
                targets[iTarget].visible = false;
            }

        }
    }
}