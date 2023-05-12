window.onload = function () {
    // setting up the paper.js
    var vs_canvas = document.getElementById('VS-Canvas');
    paper.setup(vs_canvas);
    var smallest_dim = Math.min(paper.view.size.width, paper.view.size.height);

    // settings
    var symbol_width = smallest_dim * 0.05;
    items_N = 16;

    // creating search elements prototype
    var search_symbol_click_rect = new paper.Path.Rectangle(new paper.Point(0, 0), new paper.Point(symbol_width, 2 * symbol_width));
    search_symbol_click_rect.fillColor = 'grey';
    search_symbol_click_rect.opacity = 0;

    var search_symbol_path= new paper.Path();
    search_symbol_path.add(new paper.Point(0, 0));
    search_symbol_path.add(new paper.Point(symbol_width, 0));
    search_symbol_path.add(new paper.Point(symbol_width, symbol_width));
    search_symbol_path.add(new paper.Point(0, symbol_width));
    search_symbol_path.add(new paper.Point(0, 2 * symbol_width));
    search_symbol_path.add(new paper.Point(symbol_width, 2 * symbol_width));
    search_symbol_path.strokeColor = 'black';
    search_symbol_path.strokeWidth = 5;


    search_symbol_prototype = new paper.Group([search_symbol_click_rect, search_symbol_path]);
    search_symbol_prototype.position = paper.view.center;
    search_symbol_prototype.onClick = on_search_item_click;
    search_symbol_prototype.visible = false;

    // selecting initial condition
    search_items = { 'letter': [], 'color': [], 'path': [], 'x': [], 'y': [] };
    new_push();

    function randomize_trial()
    {
        clean_up();
        if (condition =='color') {
            if (Math.random() < 0.5) {
                target_color = 'green';
                other_color = 'red';
            }
            else {
                target_color = 'red';
                other_color = 'green';
            }
            search_items = color_search_identities(target_color, other_color);
        }
        else {
            if (Math.random() < 0.5) {
                target_color = 1;
                other_color = -1;
            }
            else {
                target_color = -1;
                other_color = 1;
            }
            search_items = letter_search_identities(target_color, other_color);
        }
        initial_placement(0.3);
    }

    // generating list of search targets for color condition
    function color_search_identities(target_color, distracter_color) {
        var new_search_items = { 'letter': [], 'color': [], 'path': [], 'x':[], 'y':[]};

        // putting in color
        new_search_items.color[0] = target_color;
        for (var iItem = 1; iItem < items_N; iItem++) {
            new_search_items.color[iItem] = distracter_color;
        }

        // putting in letter orientation (1 -> 2, -1 -> 5)
        if (Math.random() < 0.5) {
            current_symbol = 1;
        }
        else {
            current_symbol = -1;
        }
        for (var iItem = 0; iItem < items_N; iItem++) {
            new_search_items.letter[iItem] = current_symbol;
            current_symbol = -current_symbol;
        }

        return (new_search_items);
    }

    // generating list of search targets for color condition
    function letter_search_identities(letter_flip, distracter_flip) {
        var new_search_items = { 'letter': [], 'color': [], 'path': [], 'x': [], 'y': [] };

        // putting in color
        new_search_items.letter[0] = letter_flip;
        for (var iItem = 1; iItem < items_N; iItem++) {
            new_search_items.letter[iItem] = distracter_flip;
        }

        // putting in letter orientation (1 -> 2, -1 -> 5)
        if (Math.random() < 0.5) {
            iColor = 0;
        }
        else {
            iColor= 1;
        }
        colors= ['red', 'green']
        for (var iItem = 0; iItem < items_N; iItem++) {
            new_search_items.color[iItem] = colors[iColor];
            iColor = 1 - iColor;
        }

        return (new_search_items);
    }


    // place items initially, within a square 
    function initial_placement(margin)
    {
        for (var iItem = 0; iItem < items_N; iItem++) {
            search_items.path[iItem] = search_symbol_prototype.clone();
            search_items.x[iItem]= paper.view.size.width * (margin + (1-2*margin) * Math.random());
            search_items.y[iItem]= paper.view.size.height * (margin + (1-2*margin) * Math.random());
            search_items.path[iItem].position = new paper.Point(search_items.x[iItem], search_items.y[iItem]);
            search_items.path[iItem].lastChild.strokeColor = search_items.color[iItem];
            search_items.path[iItem].lastChild.scale(search_items.letter[iItem], 1);
            search_items.path[iItem].onClick = on_search_item_click;
            search_items.path[iItem].visible = true;
            if (iItem == 0)
                search_items.path[iItem].is_target = 1;
            else
                search_items.path[iItem].is_target = 0;
        }
    }


    paper.view.onFrame = function (event) {
        switch (stage) {
            // trial
            case 'fixation':
                fixation_counter++;
                if (fixation_counter >= trial.onset_delay[trial.iTrial]) {
                    stage = 'placing';
                    condition = trial.type[trial.iTrial];
                    randomize_trial(condition);
                    for (var iIter = 0; iIter < 120; iIter++) {
                        push_away();
                    }
                    var timer = new Date();
                    trial.start_time[trial.iTrial] = timer.getTime();
                    stage = 'response';
                }
                break;

            case 'game_over':
                game_over_frame_counter++;
                if (game_over_frame_counter >= 40) {
                    game_over_frame_counter = 0;
                    game_over_counter--;
                    game_over_sign.visible = !game_over_sign.visible;

                    if (game_over_counter==0)
                    {
                        game_over_sign.remove();
                        document.getElementById('VS-controls').style.display = "block";
                        document.getElementById('VS-results').style.display = "block";
                        new_push();
                    }
                }
                break;

            // demo
            case 'demo_push':
                push_counter++;
                if (push_counter > 2*60) {
                    stage = 'demo_steady';
                    steady_counter = 0;
                }
                else {
                    push_away();
                }
                break;
            case 'demo_steady':
                steady_counter++;
                if (steady_counter>3*60)
                {
                    new_push()
                }
                break;
        }
    };


    // response function
    function on_search_item_click(event) {
        if (stage == 'response')
        {
            stage = 'processing_response';

            // logging
            logger[condition].total++;
            logger[condition].correct += this.is_target;
            var timer = new Date();
            logger[condition].RT.push(timer.getTime() - trial.start_time[trial.iTrial]);

            // next trial
            trial.iTrial++;
            if (trial.iTrial < trial.type.length) {
                clean_up();
                stage = 'fixation';
                fixation_counter = 0;
            }
            else {
                // putting stats into HTML
                document.getElementById('VS-color-correct').innerHTML = logger.color.correct + ' / ' + logger.color.total;
                stats = central_moments(logger.color.RT);
                document.getElementById('VS-color-RT').innerHTML = stats.mean.toFixed(2) + ' &plusmn; ' + stats.deviation.toFixed(2) + ' ms';

                document.getElementById('VS-letter-correct').innerHTML = logger.letter.correct + ' / ' + logger.letter.total;
                stats = central_moments(logger.letter.RT);
                document.getElementById('VS-letter-RT').innerHTML = stats.mean.toFixed(2) + ' &plusmn; ' + stats.deviation.toFixed(2) + ' ms';

                // showing a blinking sign
                clean_up();
                stage = 'game_over';
                game_over_sign = new paper.PointText(paper.view.center);
                game_over_sign.justification = 'center';
                game_over_sign.fillColor = 'blue';
                game_over_sign.fontSize = 64;
                game_over_sign.content = 'Experiment over';
                game_over_counter = 5;
                game_over_frame_counter = 0;

            }
        }
    }

    // spring-like behavior, using minimal distance only
    function push_away()
    {
        new_x= [];
        new_y= [];
        for (var iItem = 0; iItem < search_items.x.length; iItem++) {
            // figuring out the closes item
            var minimal_distance = paper.view.size.width * 10;
            var iClosest = -1;
            for (var iOtherItem = 0; iOtherItem < search_items.x.length; iOtherItem++) {
                if (iItem != iOtherItem) {
                    var current_distance = Math.sqrt((search_items.x[iItem] - search_items.x[iOtherItem]) * (search_items.x[iItem] - search_items.x[iOtherItem]) + (search_items.y[iItem] - search_items.y[iOtherItem]) * (search_items.y[iItem] - search_items.y[iOtherItem]));
                    if (current_distance < minimal_distance) {
                        minimal_distance = current_distance;
                        iClosest = iOtherItem;
                    }
                }
            }

            // making a step away from it
            dx = (search_items.x[iItem] - search_items.x[iClosest]); // / minimal_distance;
            dy = (search_items.y[iItem] - search_items.y[iClosest]); // / minimal_distance;
            new_x[iItem] = search_items.x[iItem] + dx  / 50;
            if (new_x[iItem] < symbol_width * 1.5) {
                new_x[iItem] = symbol_width * 1.5;
            }
            if (new_x[iItem] > paper.view.size.width - symbol_width*1.5) {
                new_x[iItem] = paper.view.size.width - symbol_width * 1.5;
            }
            new_y[iItem] = search_items.y[iItem] + dy / 50;
            if (new_y[iItem] < symbol_width * 1.5) {
                new_y[iItem] = symbol_width * 1.5;
            }
            if (new_y[iItem] > paper.view.size.height - symbol_width * 1.5) {
                new_y[iItem] = paper.view.size.height - symbol_width * 1.5;
            }
        }

        // transferring new coordinates
        for (var iItem = 0; iItem < search_items.x.length; iItem++) {
            search_items.x[iItem] = new_x[iItem];
            search_items.y[iItem] = new_y[iItem];
            search_items.path[iItem].position.x = new_x[iItem];
            search_items.path[iItem].position.y = new_y[iItem];
        }

    }

    // computing stats
    function central_moments(a) {
        var r = { mean: 0, variance: 0, deviation: 0 }, t = a.length;
        for (var m, s = 0, l = t; l--; s += a[l]);
        for (m = r.mean = s / t, l = t, s = 0; l--; s += Math.pow(a[l] - m, 2));
        return r.deviation = Math.sqrt(r.variance = s / t), r;
    }


    // new push in demo
    function new_push() {
        if (Math.random() < 0.5) {
            condition = 'color';
        }
        else {
            condition = 'letter';
        }
        randomize_trial();
        stage = 'demo_push';
        push_counter = 0;
    }
};


// array in-place shuffle
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function clean_up()
{
    for (var iItem = 0; iItem < search_items.path.length; iItem++) {
        search_items.path[iItem].remove();
    }
    search_items.path = [];
}

function vs_start () {
    document.getElementById("VS-controls").style.display = 'none';
    document.getElementById('VS-results').style.display = "none";
    stage = 'generation';

    // initializing the logger
    logger = { 'color': { 'correct': 0, 'total': 0, 'RT': [] }, 'letter': { 'correct': 0, 'total': 0, 'RT': [] } };

    // trial randomization
    trial = { 'type': [], 'iTrial': 0, 'onset_delay': [], 'start_time': []};
    for (var iRep = 0; iRep < 10; iRep++) {
        trial.type.push('color');
        trial.type.push('letter');
    }
    trial.type = shuffleArray(trial.type)

    // onset randomization
    for (var iTrial = 0; iTrial < trial.type.length; iTrial++) {
        trial.onset_delay[iTrial]= Math.floor(Math.random() * 0.5 * 60 + 30);
    }

    clean_up();
    stage = 'fixation';
    fixation_counter = 0;
};

