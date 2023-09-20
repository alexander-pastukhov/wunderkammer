window.onload = function () {
    // setting up the paper.js
    var sfm_canvas = document.getElementById('BioMotion-Canvas');
    paper.setup(sfm_canvas);
    var smallest_dim = Math.min(paper.view.size.width, paper.view.size.height);
    var dot_dim = smallest_dim * 0.005;

     // initializing dots
     current_biomotion = null;
     biomotion_dots = { 'dots': [], 'group': new paper.Group(), 'iFrame': 0, 'iSubFrame': 0 }
     for (var iDot = 0; iDot < 13; iDot++)
     {
         current_xy = new paper.Point(paper.view.center.x, paper.view.center.y);
         biomotion_dots.dots[iDot] = new paper.Shape.Circle(current_xy, dot_dim);
         biomotion_dots.dots[iDot].fillColor = "white";
         biomotion_dots.dots[iDot].opacity = 1;
     }

    // adjust dots for the current frame
    function point_light_for_frame() {
        current_frame = current_biomotion.frame[biomotion_dots.iFrame].coords;

        // rotating matrix
        angleX = 0; 
        angleY = (Number(document.getElementById("biomotion_orientation").value) + 90.0) * Math.PI / 180.0;
        angleZ = 0;
        var sX = [[1, 0, 0], [0, Math.cos(angleX), -Math.sin(angleX)], [0, Math.sin(angleX), Math.cos(angleX)]];
        var sY = [[Math.cos(angleY), 0, Math.sin(angleY)], [0, 1, 0], [-Math.sin(angleY), 0, Math.cos(angleY)]];
        var sZ = [[Math.cos(angleZ), -Math.sin(angleZ), 0], [Math.sin(angleZ), Math.cos(angleZ), 0], [0, 0, 1]];
        current_frame = numeric.dotMMsmall(numeric.dotMMsmall(numeric.dotMMsmall(current_frame, sX), sY), sZ);

        y_sign = document.getElementById("biomotion_inverted").checked ? -1 : 1;

        for (var iDot = 0; iDot < biomotion_dots.dots.length; iDot++) {
            biomotion_dots.dots[iDot].position = new paper.Point(paper.view.center.x + current_frame[iDot][0], paper.view.center.y - y_sign*current_frame[iDot][1]);
        }
    }

    paper.view.onFrame = function (event) {
        if (stage == "ready"){
            if (document.getElementById("biomotion_start_stop").checked) {
                biomotion_dots.iSubFrame++;
                if (biomotion_dots.iSubFrame == 2) {
                    biomotion_dots.iSubFrame = 0;
                    biomotion_dots.iFrame++;
                }
            }
            if (biomotion_dots.iFrame >= current_biomotion.frame_count)  biomotion_dots.iFrame = 0;
            point_light_for_frame(biomotion_dots.iFrame);
        }
    }

    // getting an xml
    stage= 'loading';
    loadXMLDoc();


    // loads an XML
    function loadXMLDoc() {
        if (window.XMLHttpRequest) {
            xhttp = new XMLHttpRequest();
        }
        else // code for IE5 and IE6
        {
            xhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xhttp.addEventListener("load", initialize_display);
        xhttp.open("GET", "/wunderkammer/assets/stimuli/biomotion.xml", true);
        xhttp.send();
    }

    function initialize_display() {
        var xmlDoc = xhttp.responseXML;

        // building list of shapes
        var radio_groups = [document.getElementById("biomotion-action-group1"), document.getElementById("biomotion-action-group2")];
        var igroup = 0;
        var action_nodes = xmlDoc.getElementsByTagName("action");
        biomotions = [];
        for (iAction = 0; iAction < action_nodes.length; iAction++) {
            for (iNode = 0; iNode < action_nodes[iAction].childNodes.length; iNode++) {
                if (action_nodes[iAction].childNodes[iNode].nodeName == "label") {
                    current_label = action_nodes[iAction].childNodes[iNode].childNodes[0].nodeValue;
                }
                if (action_nodes[iAction].childNodes[iNode].nodeName == "framesN") {
                    frames_n = Number(action_nodes[iAction].childNodes[iNode].childNodes[0].nodeValue);
                }
                if (action_nodes[iAction].childNodes[iNode].nodeName == "X") {
                    current_x = action_nodes[iAction].childNodes[iNode].childNodes[0].nodeValue.split(' ').map(Number);
                }
                if (action_nodes[iAction].childNodes[iNode].nodeName == "Y") {
                    current_y = action_nodes[iAction].childNodes[iNode].childNodes[0].nodeValue.split(' ').map(Number);
                }
                if (action_nodes[iAction].childNodes[iNode].nodeName == "Z") {
                    current_z = action_nodes[iAction].childNodes[iNode].childNodes[0].nodeValue.split(' ').map(Number);
                }
            }

            var new_biomotion = { 'frame_count': frames_n, 'frame' : []}
            irow = 0;
            for (var iFrame = 0; iFrame < new_biomotion.frame_count; iFrame++) {
                var frame_x = []; frame_x.length = 13;
                var frame_y = []; frame_y.length = 13;
                var frame_z = []; frame_z.length = 13;

                for (var iPoint = 0; iPoint < 13; iPoint++) {
                    frame_x[iPoint] = current_x[irow];
                    frame_y[iPoint] = current_z[irow];
                    frame_z[iPoint] = current_y[irow];
                    irow++;
                }
                new_biomotion.frame[iFrame] = {'coords': numeric.transpose([frame_x, frame_y, frame_z])};
            }
            biomotions[current_label] = new_biomotion;
            biomotion_dots.iFrame = 0;

            if (iAction == 0) {
                current_biomotion = new_biomotion;
            }

            // adding interface
            var next_radio_div = document.createElement("div");
            next_radio_div.classList.add("form-check");

            var next_action_radio = document.createElement("input");
            next_action_radio.setAttribute("action", current_label);
            next_action_radio.name = "biomotion-action";
            next_action_radio.type = "radio";
            next_action_radio.id = "action" + (iAction + 1);
            next_action_radio.setAttribute("index", iAction);
            next_action_radio.onclick = function() {
                current_biomotion =  biomotions[this.getAttribute("action")];
                biomotion_dots.iFrame = 0;
            }
            next_action_radio.classList.add("form-check-input");
            if (iAction == 0) {
                next_action_radio.checked = true;
            }
            next_radio_div.appendChild(next_action_radio);
            
            var next_action_label = document.createElement("label");
            next_action_label.classList.add("form-check-label");
            next_action_label.setAttribute("for", "action" + (iAction + 1));
            next_action_label.innerHTML = current_label;
            next_radio_div.appendChild(next_action_label);

            radio_groups[igroup].appendChild(next_radio_div);
            console.log(igroup)
            igroup++;
            if (igroup >= radio_groups.length) igroup = 0;
        }

        // setting
        stage = 'ready';
    }
}
