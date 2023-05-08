    window.onload = function() {
	var mib_canvas = document.getElementById('MIB-Canvas');
	paper.setup(mib_canvas);
	var smallest_dim = Math.min(paper.view.size.width, paper.view.size.height);

	// -------------------------------------------------------------------------------
	// 										grid 
	// -------------------------------------------------------------------------------
	// dimensions of the grid
	var grid_cross_N = 8;
	var grid_cross_spatial_period= 0.5; // in units of inter cross spacing
	var grid_width_in_window_widths= 0.62; // in units of window minimal dimension
	var grid_rotation_period_rpm= 15; // rotation speed

	var grid_width = grid_width_in_window_widths * smallest_dim;
	var grid_step = grid_width / (grid_cross_N - 1.0);
	var cross_arm_length = grid_step * grid_cross_spatial_period;

	// placing all crosses into a grid
	var grid= new paper.Group();
	for(var iX= 0; iX<grid_cross_N; iX++){
		for(var iY= 0; iY<grid_cross_N; iY++){
			// adding a horizontal arm to the group
			grid.addChild(new paper.Path.Line({
						from: [paper.view.center.x-grid_width/2.0+iX*grid_step-cross_arm_length/2.0, paper.view.center.y-grid_width/2.0+iY*grid_step],
						to: [paper.view.center.x-grid_width/2.0+iX*grid_step+cross_arm_length/2.0, paper.view.center.y-grid_width/2.0+iY*grid_step],
						strokeColor: 'blue',
						strokeWidth: 3
					}));					
			// adding a vertical arm to the group
			grid.addChild(new paper.Path.Line({
						from: [paper.view.center.x-grid_width/2.0+iX*grid_step, paper.view.center.y-grid_width/2.0+iY*grid_step-cross_arm_length/2.0],
						to: [paper.view.center.x-grid_width/2.0+iX*grid_step, paper.view.center.y-grid_width/2.0+iY*grid_step+cross_arm_length/2.0],
						strokeColor: 'blue',
						strokeWidth: 3
					}));					
		}
	}

	// -------------------------------------------------------------------------------
	// 										fixation 
	// -------------------------------------------------------------------------------
	// fixation settings
	var fixation_blinking_frequency_Hz= 0.5;
	var fixation_blinking_frames= 60*fixation_blinking_frequency_Hz;
	var fixation_frames_since_last_blink= 0;

	// adding a red fixation point
	var fixation= new paper.Path.Circle({
		center: paper.view.center,
		radius: 5,
		fillColor: 'red',
		strokeColor: 'black'
	});		
	
	// -------------------------------------------------------------------------------
	// 										targets 
	// -------------------------------------------------------------------------------
	// target settings
	target_radius_in_window_widths= 0.015;
	target_protection_zone_radius_in_window_widths= 0.02;
	target_eccentricity_in_window_widths= 0.28;
	target_eccentricity= target_eccentricity_in_window_widths*smallest_dim;
	target_blinking_frequency_Hz= 0.5;
	target_blinking_frames= 60*target_blinking_frequency_Hz;
	target_frames_since_last_blink= target_blinking_frames/2;
	target_blinking = false;

	if (mib_canvas.getAttribute('presentation_type') == 'main')
	{
	    // main presentation, using info from controls
	    var target_radius_pix = Number(document.getElementById('mib_target_radius').value);
	    var protection_zone_radius_pix = Number(document.getElementById('mib_protection_zone_radius').value);
	}
	else
	{
	    // preview, using relative sizes and hard-coded parameters
	    var target_radius_pix = target_radius_in_window_widths * smallest_dim;
	    var protection_zone_radius_pix= target_protection_zone_radius_in_window_widths*smallest_dim;
	}

	var targets_group = new paper.Group();
	targets = [];
	protection_zones = [];
	for(var iTarget= 0; iTarget<3; iTarget++)
	{
		target_coords= new paper.Point(paper.view.center.x+target_eccentricity*Math.cos(iTarget*(2*Math.PI/3.0)-Math.PI/2.0), paper.view.center.y+target_eccentricity*Math.sin(iTarget*(2*Math.PI/3.0)-Math.PI/2.0))
	    // protection zone
		protection_zones[iTarget] = new paper.Shape.Circle(target_coords, protection_zone_radius_pix);
		protection_zones[iTarget].fillColor = "black";
		targets_group.addChild(protection_zones[iTarget]);
		
		// target
		targets[iTarget] = new paper.Shape.Circle(target_coords, target_radius_pix);
		targets[iTarget].fillColor = "yellow";
		targets_group.addChild(targets[iTarget]);
	}
	
	// -------------------------------------------------------------------------------
	// 										onFrame
	// -------------------------------------------------------------------------------	
	paper.view.onFrame = function (event) {
	    if (document.getElementById('mib_start_stop').checked) {
	        // rotating the grid
	        grid.rotate(document.getElementById('mib_rpm').value * 360 / (60 * 60.0));			
		
	        // blinking the fixation
	        fixation_frames_since_last_blink++;
	        if (fixation_frames_since_last_blink>=fixation_blinking_frames)
	        {
	            fixation_frames_since_last_blink= 0;
	            fixation.visible = !fixation.visible;
	        }		
				
	        // blinking targets, if necessary
	        if (document.getElementById('mib_blinking_targets').checked)
	        {
	            target_frames_since_last_blink++;
	            if  (target_frames_since_last_blink>=target_blinking_frames)
	            {
	                target_frames_since_last_blink= 0;
	                targets_group.visible = !targets_group.visible;
	            }
	        } else {
				targets_group.visible = true;
			}
	    } 
		else {
			targets_group.visible = true;
			fixation.visible = true;
		}
	}
}

// -------------------------------------------------------------------------------
// 					    Target and protection zone radii
// -------------------------------------------------------------------------------
function adjust_target_radii() {
	// getting target radius and making sure it is within limits
	var new_target_radius = document.getElementById("mib_target_radius").value;
	var new_protection_zone_radius = document.getElementById("mib_protection_zone_radius").value;

	// making sure that target is smaller or equal to the protection zone
	if (new_target_radius > new_protection_zone_radius) {
		new_protection_zone_radius = new_target_radius;
		// document.getElementById("mib_protection_zone_radius").value = new_protection_zone_radius;
	}

	// assigning new values to targets and to protection zones
	for (var iTarget = 0; iTarget < targets.length ; iTarget++) {
		targets[iTarget].radius = new_target_radius;
		protection_zones[iTarget].radius = new_protection_zone_radius;
	}
};