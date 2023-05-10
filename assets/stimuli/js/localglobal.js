window.onload = function () {
    // setting up the paper.js
    var lg_canvas = document.getElementById('LG-Canvas');
    paper.setup(lg_canvas);
    var smallest_dim = Math.min(paper.view.size.width, paper.view.size.height);

    // geometry settigs
    local_circle_R = 0.035;
    local_square_width = local_circle_R*1.7;
    local_triangle_R = local_circle_R * 1.3;

    global_circle_R = 0.35;
    global_square_width = global_circle_R * 1.7;
    global_triangle_R = global_circle_R * 1.3;

    // a red fixation point
    var fixation = new paper.Path.Circle({
        center: paper.view.center,
        radius: 5,
        fillColor: 'red',
        strokeColor: 'black',
        visible: false
    });

    // settings
    local_N = 24;

    // create local
    local = [];
    local[0] = { 'prototype': new paper.Shape.Circle(paper.view.center, smallest_dim * local_circle_R) };
    local[1] = { 'prototype': new paper.Shape.Rectangle(new paper.Point(0, 0), new paper.Point(smallest_dim * local_square_width, smallest_dim * local_square_width)) };
    local[2] = { 'prototype': new paper.Shape.Rectangle(new paper.Point(0, 0), new paper.Point(smallest_dim * local_square_width, smallest_dim * local_square_width)) };
    local[2].prototype.rotate(45);
    local[3] = { 'prototype': new paper.Path.RegularPolygon(paper.view.center, 3, smallest_dim * local_triangle_R) };
    for (var iPrimitive = 0; iPrimitive < local.length; iPrimitive++) {
        local[iPrimitive].prototype.strokeColor = 'black';
        local[iPrimitive].prototype.strokeWidth = 2;
        local[iPrimitive].prototype.fillColor = 'red';
        local[iPrimitive].symbol= new paper.Symbol(local[iPrimitive].prototype);
    }

    // cloning them 
    iLocal = 1;
    for (var iPrimitive = 0; iPrimitive < local.length; iPrimitive++) {
        local[iPrimitive].group = new paper.Group();
        local[iPrimitive].items = [];
        for(var iItem= 0; iItem<local_N; iItem++)
        {
            local[iPrimitive].items[iItem] = local[iPrimitive].symbol.place(paper.view.center);
            local[iPrimitive].group.addChild(local[iPrimitive].items[iItem]);
        }
        if (iPrimitive != iLocal) {
            local[iPrimitive].group.visible = false;
        }
    }

    // laying out global shapes: circle
    global = []
    global[0] = { 'label': 'circle', 'positions': [] }
    for (var iAngle = 0; iAngle < local_N; iAngle++) {
        global[0].positions[iAngle] = new paper.Point(paper.view.center.x + smallest_dim * global_circle_R * Math.cos(iAngle * 2 * Math.PI / local_N), paper.view.center.x + smallest_dim * global_circle_R * Math.sin(iAngle * 2 * Math.PI / local_N))
    }

    // laying out square and diamond
    single_side = numeric.linspace(-smallest_dim * global_square_width / 2, smallest_dim * global_square_width / 2, local_N / 4 + 1);
    single_side.pop();
    x = [];
    y = [];
    for (var iItem = 0; iItem < single_side.length; iItem++) {
        x.push(single_side[iItem]);
        y.push(- smallest_dim * global_square_width / 2);
    }
    for (var iItem = 0; iItem < single_side.length; iItem++) {
        x.push(+ smallest_dim * global_square_width / 2);
        y.push(single_side[iItem]);
    }
    for (var iItem = 0; iItem < single_side.length; iItem++) {
        x.push(-single_side[iItem]);
        y.push(+ smallest_dim * global_square_width / 2);
    }
    for (var iItem = 0; iItem < single_side.length; iItem++) {
        x.push(-smallest_dim * global_square_width / 2);
        y.push(-single_side[iItem]);
    }

    // putting it into a square
    global[1] = { 'label': 'square', 'positions': [] }
    for (var iItem = 0; iItem < local_N; iItem++) {
        global[1].positions[iItem] = new paper.Point(paper.view.center.x + x[iItem], paper.view.center.y + y[iItem])
    }

    // rotating by 45 degress and putting it into a diamond
    xy = numeric.transpose([x, y]);
    rotation_matrix = numeric.transpose([[Math.cos(Math.PI / 4), -Math.sin(Math.PI / 4)], [Math.sin(Math.PI / 4), Math.cos(Math.PI / 4)]]);
    xy = numeric.dotMMsmall(xy, rotation_matrix);
    global[2] = { 'label': 'diamond', 'positions': [] }
    for (var iItem = 0; iItem < local_N; iItem++) {
        global[2].positions[iItem] = new paper.Point(paper.view.center.x + xy[iItem][0], paper.view.center.y + xy[iItem][1])
    }


    // laying out a triangle
    global_triangle = new paper.Path.RegularPolygon(new paper.Point(paper.view.center.x, paper.view.center.y + smallest_dim * global_triangle_R*0.1), 3, smallest_dim * global_triangle_R);
    global_triangle.strokeColor = 'red';
    iStart= [0, 1, 2];
    iEnd= [1, 2, 0];
    global[3] = { 'label': 'triangle', 'positions': [] }
    for (var iSegment = 0; iSegment < 3; iSegment++) {
        current_x = numeric.linspace(global_triangle.segments[iStart[iSegment]].point.x, global_triangle.segments[iEnd[iSegment]].point.x, local_N / 3 + 1);
        current_x.pop();
        current_y = numeric.linspace(global_triangle.segments[iStart[iSegment]].point.y, global_triangle.segments[iEnd[iSegment]].point.y, local_N / 3 + 1);
        current_y.pop();
        for (var iItem = 0; iItem < current_x.length; iItem++) {
            global[3].positions.push(new paper.Point(current_x[iItem], current_y[iItem]));
        }
    }
    global_triangle.remove();

    // which local and global shapes we use
    iGlobal = 3;
    stage = 'demo-stationary';
    FramesSinceLastChange= 0;
    set_global_shape();

    // pretty color change
    function change_color()
    {
        for (var iPrimitive = 0; iPrimitive < local.length; iPrimitive++) {
                local[iPrimitive].symbol.definition.fillColor.hue += 1;
        }
    }

    // on frame
    paper.view.onFrame = function (event) {
        switch (stage) {
            // experiment
            case 'cue':
                cue_frame_count++;
                if (cue_frame_count > 2 * 60) {
                    cue_text.remove();
                    iLocal = -1;
                    set_local_shape();
                    fixation.visible = true;
                    stage = 'fixation';
                    fixation_frame_count = Math.floor(Math.random()*0.5*60+30);
                }
                break;
            case 'fixation':
                fixation_frame_count--;
                if (fixation_frame_count <= 0) {
                    iLocal = trial.iLocal[trial.iTrial];
                    iGlobal = trial.iGlobal[trial.iTrial];
                    set_global_shape();
                    set_local_shape();
                    var timer = new Date();
                    trial.start_time[trial.iTrial] = timer.getTime();
                    stage = 'response';
                }
                break;
            case 'game-over':
                game_over_frame_counter++;
                if (game_over_frame_counter >= 40) {
                    game_over_frame_counter = 0;
                    game_over_counter--;
                    game_over_sign.visible = !game_over_sign.visible;

                    if (game_over_counter == 0) {
                        game_over_sign.remove();
                        document.getElementById('LG-controls').style.display = 'block';
                        document.getElementById('LG-results').style.display = 'block';
                        FramesSinceLastChange = 180;
                        stage = 'demo-stationary';
                    }
                }
                break;

            // ------------------------------
            //              demo 
            // ------------------------------
            case 'demo-stationary':
                change_color();
                FramesSinceLastChange++;
                if (FramesSinceLastChange > 2 * 60) {
                    FramesSinceLastChange = 0;

                    // initiating a change
                    if (Math.random() < 0.5) {
                        // local shape change
                        iLocal = pick_different_shape(iLocal);
                        set_local_shape();
                    }
                    else {
                        // global shape change
                        iNewGlobal= pick_different_shape(iGlobal);
                        prepare_transition();
                        iGlobal = iNewGlobal;
                        stage = 'demo-transition';
                    }
                }

                break;
            case 'demo-transition':
                change_color();
                if (!do_transition()) {
                    stage = 'demo-stationary';
                }
                break;
        }
    }

    // response processing
    document.body.addEventListener('keydown', function (event) {
        if (stage == 'response') {
            // evaluating response
            if (event.keyCode == 39 || event.keyCode == 37) {
                var timer = new Date();
                trial.response_time[trial.iTrial] = timer.getTime();
                trial.RT[trial.iTrial] = trial.response_time[trial.iTrial] - trial.start_time[trial.iTrial];
                if ((event.keyCode == 39 && (trial.type[trial.iTrial] == 'l' || trial.type[trial.iTrial] == 'g')) || (event.keyCode == 37 && trial.type[trial.iTrial] == 'a')) {
                    trial.correct[trial.iTrial] = 1;
                }
                else {
                    trial.correct[trial.iTrial] = 0;
                }

                trial.iTrial++;
                if (trial.iTrial == trial.type.length) {
                    fixation.visible = false;
                    set_color('red');
                    stage = 'demo-stationary';

                    // doing stats
                    correct = { 'a': 0, 'l': 0, 'g': 0 };
                    total= { 'a': 0, 'l': 0, 'g': 0 };
                    RT = { 'a': [], 'l': [], 'g': [] };
                    for (var iTrial = 0; iTrial < trial.type.length; iTrial++)
                    {
                        correct[trial.type[iTrial]]+= trial.correct[iTrial];
                        total[trial.type[iTrial]]+= 1;
                        RT[trial.type[iTrial]].push(trial.RT[iTrial]);
                    }

                    // putting stats into HTML
                    condition= {'code': ['a', 'l', 'g'], 'id': ['LG-other', 'LG-local', 'LG-global']};
                    for (var iC = 0; iC < condition.code.length; iC++) {
                        document.getElementById(condition.id[iC] + '-correct').innerHTML = correct[condition.code[iC]] + ' / ' + total[condition.code[iC]];
                        stats = central_moments(RT[condition.code[iC]]);
                        document.getElementById(condition.id[iC] + '-RT').innerHTML = stats.mean.toFixed(2) + ' &plusmn; ' + stats.deviation.toFixed(2) +' ms';
                    }

                    iLocal = -1;
                    set_local_shape();

                    // showing a blinking sign
                    stage = 'game-over';
                    game_over_sign = new paper.PointText(paper.view.center);
                    game_over_sign.justification = 'center';
                    game_over_sign.fillColor = 'blue';
                    game_over_sign.fontSize = 64;
                    game_over_sign.content = 'Experiment over';
                    game_over_counter = 5;
                    game_over_frame_counter = 0;
                }
                else {
                    fixation_frame_count = Math.floor(Math.random() * 0.5 * 60 + 30);
                    iLocal = -1;
                    set_local_shape();
                    stage = 'fixation';
                }
            }
        }
    });
};

// -------------------------------------------------------------------------------
//                               utils
// -------------------------------------------------------------------------------
function pick_different_shape(current_shape)
{
    inew_shape = Math.floor(Math.random() * 4);
    while (inew_shape == current_shape) {
        inew_shape = Math.floor(Math.random() * 4);
    }
    return (inew_shape);
}

// moving locals to a supplied positions
function set_global_shape()
{
    for (var iPrimitive = 0; iPrimitive < local.length; iPrimitive++) {
        for (var iItem = 0; iItem < local_N; iItem++) {
            local[iPrimitive].items[iItem].position = global[iGlobal].positions[iItem];
        }
    }
}

// turning on only iLocal shapes
function set_local_shape()
{
    for (var iPrimitive = 0; iPrimitive < local.length; iPrimitive++) {
        if (iPrimitive == iLocal) {
            local[iPrimitive].group.visible = true;
        }
        else {
            local[iPrimitive].group.visible = false;
        }
    }
}

// setting color
function set_color(new_color) {
    for (var iPrimitive = 0; iPrimitive < local.length; iPrimitive++) {
        local[iPrimitive].symbol.definition.fillColor= new_color;
    }
}


function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}


// preparing a transition matrix for global-to-global transition
function prepare_transition()
{
    ifirst_list = shuffleArray(numeric.linspace(0, local_N - 1));
    isecond_list = shuffleArray(numeric.linspace(0, local_N - 1));

    transition = { 'frames_N': 30, 'points': [], 'iFrame': 0 };
    for (var iItem = 0; iItem < local_N; iItem++) {
        transition.points[ifirst_list[iItem]] = {
            'x': numeric.linspace(global[iGlobal].positions[ifirst_list[iItem]].x, global[iNewGlobal].positions[isecond_list[iItem]].x, transition.frames_N),
            'y': numeric.linspace(global[iGlobal].positions[ifirst_list[iItem]].y, global[iNewGlobal].positions[isecond_list[iItem]].y, transition.frames_N)
        };
    }
}
function do_transition()
{
    for (var iPrimitive = 0; iPrimitive < local.length; iPrimitive++) {
        for (var iItem = 0; iItem < local_N; iItem++) {
            local[iPrimitive].items[iItem].position.x = transition.points[iItem].x[transition.iFrame];
            local[iPrimitive].items[iItem].position.y = transition.points[iItem].y[transition.iFrame];
        }
    }
    transition.iFrame++;
    if (transition.iFrame == transition.frames_N)
        return (false);
    else
        return (true);
}

// computing stats
function central_moments(a) {
    var r = {mean: 0, variance: 0, deviation: 0}, t = a.length;
    for(var m, s = 0, l = t; l--; s += a[l]);
    for(m = r.mean = s / t, l = t, s = 0; l--; s += Math.pow(a[l] - m, 2));
    return r.deviation = Math.sqrt(r.variance = s / t), r;
}


// ---------------------------------------------------------------------------------------------
//                              Experimental part
// ---------------------------------------------------------------------------------------------
function start_experiment() {
    trial = { 'target': 3, 'correct': [], 'RT': [], 'start_time':[], 'response_time': [], 'iTrial': 0  };

    // randomize trial type
    trial.type= [];
    for(var iIt= 0; iIt<10; iIt++)
        trial.type.push('a')
    for (var iIt = 0; iIt < 5; iIt++)
        trial.type.push('l')
    for (var iIt = 0; iIt < 5; iIt++)
        trial.type.push('g')
    trial.type = shuffleArray(trial.type);

    // picking shape combinations
    trial.iLocal = [];
    trial.iGlobal = [];
    for (var iTrial = 0; iTrial < trial.type.length; iTrial++)
    {
        switch(trial.type[iTrial])
        {
            case 'a':
                trial.iLocal[iTrial]= pick_different_shape(trial.target);
                trial.iGlobal[iTrial] = pick_different_shape(trial.target);
                break;
            case 'l':
                trial.iLocal[iTrial] = trial.target;
                trial.iGlobal[iTrial] = pick_different_shape(trial.target);
                break;
            case 'g':
                trial.iLocal[iTrial] = pick_different_shape(trial.target);
                trial.iGlobal[iTrial] = trial.target;
        }
    }

    // removing extra info
    document.getElementById('LG-controls').style.display = 'none';
    document.getElementById('LG-results').style.display = 'none';


    // presenting the  target 
    iGlobal = trial.target;
    iLocal = trial.target;
    set_color('white');
    set_global_shape();
    set_local_shape();

    // and the prompt
    cue_text = new paper.PointText(paper.view.center);
    cue_text.justification = 'center';
    cue_text.fillColor = 'white';
    cue_text.fontSize = 32;
    cue_text.content = 'This is\nthe target shape';

    stage = 'cue';
    cue_frame_count = 0;
};

