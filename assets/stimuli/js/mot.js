window.onload = function () {
    // setting up the paper.js
    var mot_canvas = document.getElementById('MOT-Canvas');
    mot_canvas.height = mot_canvas.width;
    paper.setup(mot_canvas);
    var smallest_dim = Math.min(paper.view.size.width, paper.view.size.height);

    // loading the plane and setting everything up, once it is loaded
    plane = [];
    stage = 'preparing planes';
    plane_url = document.getElementById("plane").src;
    paper.project.importSVG(plane_url, function (item) {
        plane[0] = { 'path': item, 'orientation': 0, 'speed': 0 }
        for(var iPlane= 1; iPlane<16; iPlane++)
        {
            plane[iPlane] = { 'path': plane[0].path.clone(), 'orientation': 0, 'speed': 0 };
        }

        randomize_planes();
        stage = 'demo';
    });

    // randomizing planes positions and orientations
    function randomize_planes()
    {
        for(var iPlane= 0; iPlane<plane.length; iPlane++)
        {
            // rotating planes back first, so that we don't have problems with odd orientation
            plane[iPlane].path.rotate(-plane[iPlane].orientation * 180 / Math.PI);

            plane[iPlane].x = paper.view.size.width * 0.8 * Math.random() + 0.1;
            plane[iPlane].path.position.x = plane[iPlane].x;
            plane[iPlane].y = paper.view.size.width * 0.8 * Math.random() + 0.1;
            plane[iPlane].path.position.y = plane[iPlane].y;
            plane[iPlane].orientation = 2 * Math.PI * Math.random();
            plane[iPlane].path.rotate(plane[iPlane].orientation*180/Math.PI);
            plane[iPlane].speed = (Math.random() + 0.5) * (smallest_dim * 0.005);
            plane[iPlane].dx = plane[iPlane].speed * Math.cos(plane[iPlane].orientation)
            plane[iPlane].dy = plane[iPlane].speed * Math.sin(plane[iPlane].orientation)
        }
    }

    // moving planes around
    function move_planes()
    {
        for (var iPlane = 0; iPlane < plane.length; iPlane++) {
            // moving the plain around
            plane[iPlane].x += plane[iPlane].dx;
            plane[iPlane].y += plane[iPlane].dy;

            // boundary checks
            var orientation_change = false;
            if (plane[iPlane].path.position.x < plane[iPlane].path.bounds.width / 2) {
                orientation_change = true;
                plane[iPlane].dx = Math.abs(plane[iPlane].dx);
            }
            if (plane[iPlane].path.position.x > paper.view.bounds.width - plane[iPlane].path.bounds.width / 2) {
                orientation_change = true;
                plane[iPlane].dx = -Math.abs(plane[iPlane].dx);
            }
            if (plane[iPlane].path.position.y < plane[iPlane].path.bounds.height / 2) {
                orientation_change = true;
                plane[iPlane].dy = Math.abs(plane[iPlane].dy);
            }
            if (plane[iPlane].path.position.y > paper.view.bounds.height - plane[iPlane].path.bounds.height / 2) {
                orientation_change = true;
                plane[iPlane].dy = -Math.abs(plane[iPlane].dy);
            }

            // adjusting orientation, if required
            if (orientation_change) {
                // rotating back 
                plane[iPlane].path.rotate(-plane[iPlane].orientation * 180 / Math.PI);
                plane[iPlane].orientation = Math.atan2(plane[iPlane].dy, plane[iPlane].dx);
                plane[iPlane].path.rotate(plane[iPlane].orientation * 180 / Math.PI);
            }

            // putting in the position
            plane[iPlane].path.position.x = plane[iPlane].x;
            plane[iPlane].path.position.y = plane[iPlane].y;
        }
    }

    // do plane blinking with predefined color
    function blink_planes()
    {
        blink.frames--;
        if (blink.frames<=0)
        {
            blink.frames = blink.blink_in_frames;
            if (!blink.endless) {
                blink.blinks_left--;
            }

            // changing the state
            blink.on = !blink.on;
            for (var iTarget = 0; iTarget<blink.planes.length; iTarget++)
            {
                iPlane = blink.planes[iTarget];
                if (blink.on && blink.blinks_left>0) {
                    plane[iPlane].path.fillColor = blink.color;
                }
                else {
                    plane[iPlane].path.fillColor = 'black';
                }
            }
        }
    }

    paper.view.onFrame = function (event) {
        switch (stage) {
            case 'demo':
                move_planes();
                break;
            case 'cue targets':
                blink_planes();
                if (blink.blinks_left < 0) {
                    trial_frames_left = Number(document.getElementById("mot_duration").value) * 60;
                    stage = 'track';
                }
                break;
            case 'track':
                move_planes();
                trial_frames_left--;
                if (trial_frames_left < 0) {
                    if (Math.random() < 0.5)
                    {
                        was_target = true;
                        targets_list = [0];
                    }
                    else
                    {
                        was_target = false;
                        targets_list = [Number(document.getElementById("mot_total").value) - 1];
                    }
                    blink = { 'blink_in_frames': 20, 'blinks_left': 7, 'frames': 0, 'on': false, 'color': 'yellow', 'planes': targets_list, 'endless': true };
                    create_response_menu();
                    stage = 'response';
                }
                break;
            case 'response':
                blink_planes();
                break;
            case 'feedback':
                blink_planes();
                if (blink.blinks_left < 0) {
                    stage = 'demo';
                    for (var iPlane = 0; iPlane < plane.length; iPlane++) {
                        plane[iPlane].path.visible = true;
                    }
                    disableControlsState(false);
                }
                break;
        }
    };

    function process_response(response)
    {
        if (stage == 'response') {
            // evaluating response
            if ((response == 'target' && was_target) || (response== 'other' && !was_target)) {
                feedback_color = "green";
            }
            else {
                feedback_color = "red";
            }
            // removing response menu
            response_group.remove();

            // painting all planes black
            for (var iPlane = 0; iPlane < plane.length; iPlane++) {
                plane[iPlane].path.fillColor = 'black';
            }

            // setting up the feedback
            targets_list = [];
            for (var iPlane = 0; iPlane < Number(document.getElementById("mot_targets").value) ; iPlane++) {
                targets_list[iPlane] = iPlane;
            }
            stage = "feedback";
            blink = { 'blink_in_frames': 20, 'blinks_left': 7, 'frames': 0, 'on': false, 'color': feedback_color, 'planes': targets_list, 'endless': false };
        }
    }

    // response menu
    function create_response_menu()
    {
        // creating two buttons
        target_text = new paper.PointText(paper.view.center);
        target_text.justification = 'center';
        target_text.fillColor = 'white';
        target_text.fontSize = 24;
        target_text.content = ' Target plane ';

        target_frame = new paper.Shape.Rectangle(target_text.bounds);
        target_frame.insertBelow(target_text)
        target_frame.strokeColor = 'black';
        target_frame.fillColor = 'green';

        target_button = new paper.Group([target_frame, target_text]);
        target_button.onClick = function (event) {
            process_response("target");
        }

        other_text = new paper.PointText(paper.view.center);
        other_text.justification = 'center';
        other_text.fillColor = 'white';
        other_text.fontSize = 24;
        other_text.content = 'Other plane';

        other_frame = new paper.Shape.Rectangle(target_text.bounds);
        other_frame.insertBelow(other_text)
        other_frame.strokeColor = 'black';
        other_frame.fillColor = 'red';

        other_button = new paper.Group([other_frame, other_text]);
        other_button.position.y = target_button.bounds.bottom + target_button.bounds.height / 2 + 2;
        other_button.onClick = function (event) {
            process_response("other");
        }

        response_group= new paper.Group([target_button, other_button])

        // positioning it next to the highlighted plane
        response_group.position.x = plane[targets_list[0]].path.bounds.left-response_group.bounds.width/2-5;
        response_group.position.y = plane[targets_list[0]].path.bounds.top - response_group.bounds.height / 2 - 5;

        // check if we are still within bounds
        if (response_group.bounds.left<0)
            response_group.position.x = plane[targets_list[0]].path.bounds.right + response_group.bounds.width / 2 + 5;
        if (response_group.bounds.top < 0)
            response_group.position.y = plane[targets_list[0]].path.bounds.bottom + response_group.bounds.height / 2 + 5;

    }
}

function onTotalChange(){
    document.getElementById("mot_total_label").innerHTML = document.getElementById("mot_total").value;

    if (Number(document.getElementById("mot_total").value) < Number(document.getElementById("mot_targets").value)) {
        document.getElementById("mot_targets").value = document.getElementById("mot_total").value;
        document.getElementById("mot_targets_label").innerHTML = document.getElementById("mot_total").value;
    }
}

function onTargetsChange(){
    document.getElementById("mot_targets_label").innerHTML = document.getElementById("mot_targets").value;

    if (Number(document.getElementById("mot_targets").value) > Number(document.getElementById("mot_total").value)) {
        document.getElementById("mot_total").value = document.getElementById("mot_targets").value;
        document.getElementById("mot_total_label").innerHTML = document.getElementById("mot_targets").value;
    }
}

function onDurationChange(){
    document.getElementById("mot_duration_label").innerHTML = document.getElementById("mot_duration").value;
}

function onPreset(total, targets){
    document.getElementById("mot_total").value = total;
    document.getElementById("mot_total_label").innerHTML = total;
    document.getElementById("mot_targets").value = targets;
    document.getElementById("mot_targets_label").innerHTML = targets;
}

function disableControlsState(disabled) {
    var childNodes = document.getElementById("mot_controls").getElementsByTagName('*');
    for (var node of childNodes) {
        node.disabled = disabled;
    }
}

// game start
function onStart() {
    disableControlsState(true);
    
    // randomize location and hide extra planes
    for(var iPlane= Number(document.getElementById("mot_total").value); iPlane<plane.length; iPlane++)
    {
        plane[iPlane].path.visible = false;
    }

    // go to "cue targets" stage
    targets_list = [];
    for (var iPlane = 0; iPlane < Number(document.getElementById("mot_targets").value) ; iPlane++)
    {
        targets_list[iPlane] = iPlane;
    }
    stage = "cue targets";
    blink = {'blink_in_frames': 20, 'blinks_left': 7, 'frames': 0, 'on': false, 'color':'green', 'planes':targets_list, 'endless':false};
};
