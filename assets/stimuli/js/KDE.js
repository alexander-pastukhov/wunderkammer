window.onload = function () {
    var sfm_canvas = document.getElementById('SFM-Canvas');
    var sfm_x_rpm = document.getElementById('sfm_x_rpm');
    var sfm_y_rpm = document.getElementById('sfm_y_rpm');
    var sfm_z_rpm = document.getElementById('sfm_z_rpm');
    var sfm_dot_size = document.getElementById('sfm_dot_size');
    var sfm_start_stop = document.getElementById("sfm_start_stop");

    paper.setup(sfm_canvas);
    var smallest_dim = Math.min(paper.view.size.width, paper.view.size.height);
    var sfm_dim = smallest_dim * 0.9;
    var dot_dim = smallest_dim * 0.005;

    // getting an xml
    stage= 'loading';
    loadXMLDoc();

    paper.view.onFrame = function (event) {
        if (stage=="ready" && sfm_start_stop.checked) {
            // get current speed values
            angleX = (Number(sfm_x_rpm.value) * 360 / (60 * 60.0)) * Math.PI / 180.0;
            angleY = (Number(sfm_y_rpm.value) * 360 / (60 * 60.0)) * Math.PI / 180.0;
            angleZ = (Number(sfm_z_rpm.value) * 360 / (60 * 60.0)) * Math.PI / 180.0;

            // compute the rotation matrix
            var sX = [[1, 0, 0], [0, Math.cos(angleX), -Math.sin(angleX)], [0, Math.sin(angleX), Math.cos(angleX)]];
            var sY = [[Math.cos(angleY), 0, Math.sin(angleY)], [0, 1, 0], [-Math.sin(angleY), 0, Math.cos(angleY)]];
            var sZ = [[Math.cos(angleZ), -Math.sin(angleZ), 0], [Math.sin(angleZ), Math.cos(angleZ), 0], [0, 0, 1]];

            // rotate dots
            current_coords = numeric.dotMMsmall(numeric.dotMMsmall(numeric.dotMMsmall(current_coords, sX), sY), sZ);

            // adjust visuals
            for (var iDot = 0; iDot < Ndots; iDot++) {
                // modify the location
                dots[iDot].position.x = paper.view.center.x + sfm_dim * current_coords[iDot][0] / 2;
                dots[iDot].position.y = paper.view.center.y + sfm_dim * current_coords[iDot][1] / 2;

                // modify the relative size of dots
                radius= Math.max(0, dot_dim * (1 - current_coords[iDot][2] * Number(sfm_dot_size.value)/100.0));
                dots[iDot].radius = radius;
            }
        }
    };

   //$(".sfm_shape_btn").click(function () {
    //     console.log('!')
    //     if (!$(this).hasClass('active'))
    //     {
    //         // only if new button is selected
    //         $(".sfm_shape_btn").removeClass('active');
    //         $(this).addClass('active')
    //         iCurrentShape = Number($(this).attr("index"));
    //         current_coords = sfm_shapes[iCurrentShape].coords;
    //     }
    // });


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
        xhttp.open("GET", "/assets/stimuli/kde-shapes.xml", true);
        xhttp.send();
    }

    function initialize_display() {
        var xmlDoc = xhttp.responseXML;

        // getting number of dots 
        var Ndots_node = xmlDoc.getElementsByTagName("N");
        Ndots = Number(Ndots_node[0].childNodes[0].nodeValue);

        // building list of shapes
        var radio_group = document.getElementById("kde-shape-group");
        var shape_nodes = xmlDoc.getElementsByTagName("shape");
        sfm_shapes = [];
        button_text = '';
        for (iShape = 0; iShape < shape_nodes.length; iShape++) {
            for (iNode = 0; iNode < shape_nodes[iShape].childNodes.length; iNode++) {
                if (shape_nodes[iShape].childNodes[iNode].nodeName == "label") {
                    current_label = shape_nodes[iShape].childNodes[iNode].childNodes[0].nodeValue;
                }
                if (shape_nodes[iShape].childNodes[iNode].nodeName == "X") {
                    current_x = shape_nodes[iShape].childNodes[iNode].childNodes[0].nodeValue.split(' ').map(Number);
                }
                if (shape_nodes[iShape].childNodes[iNode].nodeName == "Y") {
                    current_y = shape_nodes[iShape].childNodes[iNode].childNodes[0].nodeValue.split(' ').map(Number);
                }
                if (shape_nodes[iShape].childNodes[iNode].nodeName == "Z") {
                    current_z = shape_nodes[iShape].childNodes[iNode].childNodes[0].nodeValue.split(' ').map(Number);
                }

            }
            sfm_shapes[iShape] = { 'label': current_label, 'x': current_x, 'y': current_y, 'z': current_z, 'coords': numeric.transpose([current_x, current_y, current_z]) };

            var next_radio_div = document.createElement("div");
            next_radio_div.classList.add("form-check");

            var next_shape_radio = document.createElement("input");
            next_shape_radio.setAttribute("shape", current_label);
            next_shape_radio.name = "kde-shape";
            next_shape_radio.type = "radio";
            next_shape_radio.id = "shape" + (iShape + 1);
            next_shape_radio.setAttribute("index", iShape);
            next_shape_radio.onclick = function() {
                current_coords = sfm_shapes[Number(this.getAttribute("index"))].coords;
            }
            next_shape_radio.classList.add("form-check-input");
            if (iShape == 0) {
                next_shape_radio.checked = true;
            }
            next_radio_div.appendChild(next_shape_radio);
            

            var next_shape_label = document.createElement("label");
            next_shape_label.classList.add("form-check-label");
            next_shape_label.setAttribute("for", "shape" + (iShape + 1));
            next_shape_label.innerHTML = current_label;
            next_radio_div.appendChild(next_shape_label);

            radio_group.appendChild(next_radio_div);
        }

        // creating dots
        var iCurrentShape = 0;
        dots = [];
        for (var iDot = 0; iDot < Ndots; iDot++) {
            current_xy = new paper.Point(paper.view.center.x + sfm_dim * sfm_shapes[iCurrentShape].coords[iDot][0] / 2, paper.view.center.y + +sfm_dim * sfm_shapes[iCurrentShape].coords[iDot][1] / 2)
            dots[iDot] = new paper.Shape.Circle(current_xy, dot_dim);
            dots[iDot].fillColor = "white";
            dots[iDot].opacity = 0.7;
        }

        // setting
        current_coords = sfm_shapes[iCurrentShape].coords
        stage= 'ready';
    }

}
