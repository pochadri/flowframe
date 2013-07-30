
 * Copyright (c) 2009
 * Robert Böhme
 * 
 **/

if(!ORYX.Plugins)
	ORYX.Plugins = new Object();

ORYX.Plugins.LabelLayout = Clazz.extend({
		
	construct: function( facade ){
		this.facade = facade;	
		this.myLabel = undefined; //defines the current label
		this.labelSelected = false; //true->label is selected
		this.labelLength = undefined; //length of a label
		this.rotationPointCoordinates = {x:0, y:0};
		this.mouseCoordinates = {x:0, y:0};
		this.labelCoordinates = {x:0, y:0};
		this.myEdge = undefined;	// set the Edge Parent for the RotaionPoint	
		this.rotate = false; //true ->Rotation of label is active; False -> Rotation of Label is not active
		this.State = 0; 	//current States for Rotation
		this.prevState = 0;	//previous State for Rotation
		this.canvasLabel = undefined; //Reference to Canvas
		this.canvas = false; //true if Reference to Canvas was saved
		
		//Register Events
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN, this.handleMouseDown.bind(this));
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEOVER, this.handleMouseOver.bind(this));
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEMOVE, this.handleMouseMove.bind(this));
		
		//Visual representaion of the default RotationPoint		
		this.rotationPoint = ORYX.Editor.graft("http://www.w3.org/2000/svg", null,
				['path', {
					"stroke-width": 2.0, "stroke":"black", "d":  "M4,4 L0,6 M0,6 L-4,4 M-4,4 L-6,0 M-6,0 L-4,-4 M-4,-4 L0,-6 M0,-6 L4,-4 M4,-4 L6,2 M6,2 L2,0 M6,2 L8,0", "line-captions": "round"
					}]);		
		
		//Visual representation of the association line
		this.line = ORYX.Editor.graft("http://www.w3.org/2000/svg", null,
				['path', {
					'stroke-width': 1, stroke: 'silver', fill: 'none',
					'pointer-events': 'none'}]);
		
		//Visual representation of the moving arrows
		this.startMovingCross = ORYX.Editor.graft("http://www.w3.org/2000/svg", null,
				['path', {
					"stroke-width": 1.0, "stroke":"black", "d":  "M0,0 L-10,0 M-10,0 L-6,-4 M-10,0 L-6,4 M0,0 L10,0 M10,0 L6,4 M10,0 L6,-4 M0,0 L0,10 M0,10 L4,6 M0,10 L-4,6 M0,0 L0,-10 M0,-10 L4,-6 M0,-10 L-4,-6", "line-captions": "round"
					}]);
		
		//visual represetation to the set the position of a label
		this.endMovingCross = ORYX.Editor.graft("http://www.w3.org/2000/svg", null,
				['path', {
					"stroke-width": 1.0, "stroke":"black", "d":  "M-2,0 L-10,0 M2,0 L10,0 M0,2 L0,10 M0,-2 L0,-10 M-2,0 L-6,4 M-2,0 L-6,-4 M2,0 L6,4 M2,0 L6,-4 M0,-2 L4,-6 M0,-2 L-4,-6 M0,2 L4,6 M0,2 L-4,6", "line-captions": "round"
					}]);
		
		//Visual representation to move the mouse left/right to rotate the label
		this.moveLeftRight = ORYX.Editor.graft("http://www.w3.org/2000/svg", null,
				['path', {
					"stroke-width": 2.0, "stroke":"black", "d":  "M0,0 L-15,0 M-15,0 L-11,-4 M-15,0 L-11,4 M0,0 L15,0 M15,0 L11,4 M15,0 L11,-4", "line-captions": "round"
					}]);
		
		 /*
		 this.facade.offer({
	            'name': "Label rotate left",
	            'functionality': this.rotate_left.bind(this),
	            'group': "Rotation",
	            'icon': ORYX.PATH + "images/rotate_left.png",
	            'description': "rotate a label left",
	            'index': 1,
	            'minShape': 0,
	            'maxShape': 0
	        });
		 
		 this.facade.offer({
	            'name': "Label rotate right",
	            'functionality': this.rotate_right.bind(this),
	            'group': "Rotation",
	            'icon': ORYX.PATH + "images/rotate_right.png",
	            'description': "rotate a label right",
	            'index': 1,
	            'minShape': 0,
	            'maxShape': 0
	        });*/		 
},

/**
 * Mouse Over Handler
 */
handleMouseOver: function(event, uiObj) {

	//Save Canvas for Reference(used for showing Line between edge and label)
	if(this.canvas == false){
		if(uiObj instanceof ORYX.Core.Canvas){
			this.canvasLabel = uiObj;
			canvas = true;
		}
	}	
},

/**
 * Mouse Down Handler
 */
handleMouseDown: function(event, uiObj) {	
	
	if(this.myLabel && this.myLabel._text != ""){	
		//save MousePosition
		var MouseX = this.facade.eventCoordinates(event).x;
		var MouseY = this.facade.eventCoordinates(event).y;
		
		//refresh Coordinates
		this.calculateLabelCoordinates();
		this.calculateRotationPointCoordinates();
	
		//Set LabelPosition to MousePosition	
		if(this.labelSelected == true){				
			if(this.myLabel._rotate == 270 || this.myLabel._rotate == 315 || this.myLabel._rotate == 360 || this.myLabel._rotate == 45) {
				this.myLabel.x = this.facade.eventCoordinates(event).x+5;
				this.myLabel.y = this.facade.eventCoordinates(event).y-5;
			}else if (this.myLabel._rotate == 90 || this.myLabel._rotate == 135 || this.myLabel._rotate == 180 || this.myLabel._rotate == 225){
				this.myLabel.x = this.facade.eventCoordinates(event).x-5;
				this.myLabel.y = this.facade.eventCoordinates(event).y+5;
			}
			else {
				this.myLabel.x = this.facade.eventCoordinates(event).x+10;
				this.myLabel.y = this.facade.eventCoordinates(event).y-5;
			}
			
			//refresh real Rotationpoint
			if(this.myLabel._rotationPoint){
				this.myLabel._rotationPoint.x = MouseX;
				this.myLabel._rotationPoint.y = MouseY;
			}
			
			// save the current position of the label in edge.js, mark the label as free moved
			this.myLabel.edgePosition = "freeMoved";
			this.myLabel.update();			
		
			//Refresh Coordinates
			this.calculateLabelCoordinates();
			this.calculateRotationPointCoordinates();				
			this.showOverlay("RotationPoint", this.myEdge, this.rotationPointCoordinates, this.rotationPoint);
			this.hideOverlay("SettingArrows");
			
			//Show Moving Arrows		
			this.mouseCoordinates = {x:this.labelCoordinates.x, y:this.labelCoordinates.y};			
			this.showOverlay("MovingArrows", this.myEdge, this.mouseCoordinates, this.startMovingCross);			
			
			//show the Association line
			this.showLine();
		}
		else {		
			this.hideLine();
			this.hideOverlay("RotationPoint");
			this.hideOverlay("MovingArrows");
			this.hideOverlay("SettingArrows");
		}
	
		//Check if Mouse is in the ClickArea of the Label 
		if(	this.labelSelected == false && 
				MouseX >= this.labelCoordinates.x-20 && 
				MouseX <= this.labelCoordinates.x+20 && 
				MouseY <= this.labelCoordinates.y+20 && 
				MouseY >= this.labelCoordinates.y-20){		
		
			//Set Label as Selected
			this.labelSelected=true;
						
			//refresh and show RotationPoint
			this.calculateRotationPointCoordinates();
			this.showOverlay("RotationPoint", this.myEdge, this.rotationPointCoordinates, this.rotationPoint);
		}
		else {
			//Set Label as not selected
			this.labelSelected = false;	
		}
	
		//Check if MouseClick is on RotationPoint
		if(	this.rotate == false && 
			MouseX >= this.rotationPointCoordinates.x-20 && 
			MouseX <= this.rotationPointCoordinates.x+20 && 
			MouseY >= this.rotationPointCoordinates.y-20 && 
			MouseY <= this.rotationPointCoordinates.y+20){
		
			//acitvate Rotation
			this.rotate = true;
			
			//Set current RotationState
			this.State = 0;
			
			//show RotationArrows to show that rotation is active
			this.showOverlay("RotationPointActive", this.myEdge, this.rotationPointCoordinates, this.moveLeftRight);
		}
		else{
			//deactivate Rotation
			this.rotate = false;
			
			//Hide yellow RotationArrows
			this.hideOverlay("RotationPointActive");
		}	
	}
	
	//clicking on an Edge saves the label and show the line
	if( uiObj instanceof ORYX.Core.Edge){  		
		//Identify and set the label of the current Edge	
		if(uiObj._labels[uiObj.id+"condition"]){
			this.myLabel = uiObj._labels[uiObj.id+"condition"]; //for BPMN
		}else if (uiObj._labels[uiObj.id+"name"]){
			this.myLabel = uiObj._labels[uiObj.id+"name"]; //for UML
		}else {
			this.myLabel = uiObj._labels[uiObj.id+"text"];
		}
	 
		//save the edge for adding rotationpoint	
		this.myEdge = uiObj;

		//Show the RotationPoint and line of the label of the current Edge
		if(this.myLabel && this.myLabel._text != ""){
			this.calculateLabelCoordinates();
			this.calculateRotationPointCoordinates();
			this.showLine();			
			this.mouseCoordinates = {x:this.labelCoordinates.x, y:this.labelCoordinates.y};			
			this.showOverlay("MovingArrows", this.myEdge, this.mouseCoordinates, this.startMovingCross);
			this.showOverlay("RotationPoint", this.myEdge, this.rotationPointCoordinates, this.rotationPoint);
		}
	}
},

/**
 * Mouse Move Handler
 */
handleMouseMove: function(event, uiObj) {

	//if label is selected Posision is set to MousePosition
	if(this.labelSelected == true){
		if(this.myLabel){			
			//Set Label positon for different Rotations
			if(this.myLabel._rotate == 270 || this.myLabel._rotate == 315 || this.myLabel._rotate == 360 || this.myLabel._rotate == 45) {
				this.myLabel.x = this.facade.eventCoordinates(event).x+5;
				this.myLabel.y = this.facade.eventCoordinates(event).y-5;
				this.myLabel._rotationPoint.x = this.facade.eventCoordinates(event).x+10;
				this.myLabel._rotationPoint.y = this.facade.eventCoordinates(event).y-10;
			}else if(this.myLabel._rotate == 90 || this.myLabel._rotate == 135 || this.myLabel._rotate == 180 || this.myLabel._rotate == 225){
				this.myLabel.x = this.facade.eventCoordinates(event).x-5;
				this.myLabel.y = this.facade.eventCoordinates(event).y+5;
				this.myLabel._rotationPoint.x = this.facade.eventCoordinates(event).x-10;
				this.myLabel._rotationPoint.y = this.facade.eventCoordinates(event).y+10;
			}else {
				this.myLabel.x = this.facade.eventCoordinates(event).x+10;
				this.myLabel.y = this.facade.eventCoordinates(event).y-5;
				this.myLabel._rotationPoint.x = this.facade.eventCoordinates(event).x+10;
				this.myLabel._rotationPoint.y = this.facade.eventCoordinates(event).y-10;
			}
				
			this.myLabel.update();
		
			//refresh Coordinates
			this.calculateLabelCoordinates();
			this.calculateRotationPointCoordinates();		

			this.hideOverlay("RotationPoint");
			this.hideOverlay("MovingArrows");
			this.hideOverlay("SettingArrows");			
			
			//refresh Position of the Overlay arrows
			if(this.myLabel._rotate == 270 || this.myLabel._rotate == 315 || this.myLabel._rotate == 360 || this.myLabel._rotate == 45) {	
				this.mouseCoordinates = {x:this.facade.eventCoordinates(event).x, y:this.facade.eventCoordinates(event).y};	
				this.showOverlay("SettingArrows", this.myEdge, this.mouseCoordinates, this.endMovingCross);
			}else {
				this.mouseCoordinates = {x:this.facade.eventCoordinates(event).x, y:this.facade.eventCoordinates(event).y};	
				this.showOverlay("SettingArrows", this.myEdge, this.mouseCoordinates, this.endMovingCross);
			}			
			//Refresh the Line
			this.hideLine();
			this.showLine();
		}
	}
	
	//perform the Statevalidation for Rotation
	if(this.rotate == true) {
		
		//save MouseCoordinates
		var MouseX = this.facade.eventCoordinates(event).x;
		var MouseY = this.facade.eventCoordinates(event).y;

		//refresh Coordinates
		this.calculateLabelCoordinates();
		this.calculateRotationPointCoordinates();
		
		//defines the States for Rotation(every 20px there is a new State)
		if(MouseX < this.rotationPointCoordinates.x-150 ){
			this.State = -8;
		}
		else if (MouseX < this.rotationPointCoordinates.x-130 && MouseX >= this.rotationPointCoordinates.x-150){
			this.State = -7;	
		}
		else if (MouseX < this.rotationPointCoordinates.x-110 && MouseX >= this.rotationPointCoordinates.x-130){
			this.State =- 6;	
		}
		else if (MouseX < this.rotationPointCoordinates.x-90 && MouseX >= this.rotationPointCoordinates.x-110){
			this.State = -5;	
		}
		else if (MouseX < this.rotationPointCoordinates.x-70 && MouseX >= this.rotationPointCoordinates.x-90){
			this.State = -4;	
		}
		else if (MouseX < this.rotationPointCoordinates.x-50 && MouseX >= this.rotationPointCoordinates.x-70){
			this.State = -3;	
		}
		else if (MouseX < this.rotationPointCoordinates.x-30 && MouseX >= this.rotationPointCoordinates.x-50){
			this.State = -2;	
		}
		else if (MouseX < this.rotationPointCoordinates.x-10 && MouseX >= this.rotationPointCoordinates.x-30){
			this.State = -1;
		}
		else if (MouseX < this.rotationPointCoordinates.x+10 && MouseX >= this.rotationPointCoordinates.x-10){
			this.State = 0;	
		}
		else if (MouseX < this.rotationPointCoordinates.x+30 && MouseX >= this.rotationPointCoordinates.x+10){
			this.State = 1;	
		}
		else if (MouseX < this.rotationPointCoordinates.x+50 && MouseX >= this.rotationPointCoordinates.x+30){
			this.State = 2;
		}
		else if (MouseX < this.rotationPointCoordinates.x+70 && MouseX >= this.rotationPointCoordinates.x+50){
			this.State = 3;
		}
		else if ( MouseX < this.rotationPointCoordinates.x+90 && MouseX >= this.rotationPointCoordinates.x+70){
			this.State = 4;	
		}
		else if ( MouseX < this.rotationPointCoordinates.x+110 && MouseX >= this.rotationPointCoordinates.x+90){
			this.State = 5;	
		}
		else if ( MouseX < this.rotationPointCoordinates.x+130 && MouseX >= this.rotationPointCoordinates.x+110){
			this.State = 6;	
		}
		else if ( MouseX < this.rotationPointCoordinates.x+150 && MouseX >= this.rotationPointCoordinates.x+130){
			this.State7;	
		}
		else if(MouseX >= this.rotationPointCoordinates.x+150){
			this.State = 8;
		}
		
		//checks the way of moving the Mouse through the states and rotate
		if(this.State > this.prevState){
			this.rotate_right();
			this.prevState = this.State;
		}
		else if(this.State < this.prevState){
			this.rotate_left();
			this.prevState = this.State;
		}
	}
},

/**
 * rotate the label to the right with 45° (clockwise)
 * 
 */
rotate_right:function() {

	var myRotPoint = {x:this.labelCoordinates.x, y:this.labelCoordinates.y};
	var myRotation = this.myLabel._rotate;
	
	if(myRotation == 0 || myRotation < 45 && myRotation > 0 || myRotation == 360){
		this.myLabel.rotate(45, myRotPoint);
	}
	else if(myRotation == 45 || myRotation < 90 && myRotation > 45){
		this.myLabel.rotate(90, myRotPoint);
	}
	else if(myRotation == 315 || myRotation > 315 && myRotation < 360){
		this.myLabel.rotate(360,myRotPoint);
	}
	else if(myRotation == 270 || myRotation > 270 && myRotation < 315){
		this.myLabel.rotate(315,myRotPoint);
	}
	else if(myRotation == 90 || myRotation < 135 && myRotation > 90){
		this.myLabel.rotate(135,myRotPoint);
	}
	else if(myRotation == 135 || myRotation < 180 && myRotation > 135){
		this.myLabel.rotate(180,myRotPoint);
	}
	else if(myRotation == 180 || myRotation < 225 && myRotation > 180){
		this.myLabel.rotate(225,myRotPoint);		
	}
	else if(myRotation == 225 || myRotation < 270 && myRotation > 225){
		this.myLabel.rotate(270,myRotPoint);
	}
	this.myLabel.update();
},

/**
 * rotate the label to the left with 45° (anticlockwise)
 * 
 */
rotate_left:function() {
	var myRotPoint = {x:this.labelCoordinates.x, y:this.labelCoordinates.y};
	var myRotation = this.myLabel._rotate;
	
	if(myRotation == 0 || myRotation < 360 && myRotation > 315 || myRotation == 360){
		this.myLabel.rotate(315,myRotPoint);
	}
	else if(myRotation == 315 || myRotation < 315 && myRotation > 270){
		this.myLabel.rotate(270,myRotPoint);
	}
	else if(myRotation == 45||myRotation <45 && myRotation >0){
		this.myLabel.rotate(360,myRotPoint);
	}
	else if(myRotation == 90||myRotation < 90 && myRotation > 45){
		this.myLabel.rotate(45,myRotPoint);
	}
	else if(myRotation == 135 || myRotation < 135 && myRotation > 90){
		this.myLabel.rotate(90,myRotPoint);
	}
	else if(myRotation == 180 || myRotation < 180 && myRotation > 135){
		this.myLabel.rotate(135,myRotPoint);
	}
	else if(myRotation == 225 || myRotation < 225 && myRotation > 180){
		this.myLabel.rotate(180,myRotPoint);
	}
	else if(myRotation == 270 || myRotation < 270 && myRotation > 225){
		this.myLabel.rotate(225,myRotPoint);
	}
	this.myLabel.update();	
},

/**
 * set the Coordinates of the RotationPoint for different degree values
 * 
 */
calculateRotationPointCoordinates: function(){	
	if(this.rotate == false) {
		this.labelLength = this.myLabel._estimateTextWidth(this.myLabel._text,14);
	
		if(this.myLabel._rotate == 360){
			this.rotationPointCoordinates.x = this.labelCoordinates.x-8 + this.labelLength/3;
			this.rotationPointCoordinates.y = this.labelCoordinates.y-35;	
		}
		else if(this.myLabel._rotate == 90) {
			this.rotationPointCoordinates.x = this.labelCoordinates.x + 35;
			this.rotationPointCoordinates.y = this.labelCoordinates.y-8 + this.labelLength/3;			
		}
		else if(this.myLabel._rotate == 180) {
			this.rotationPointCoordinates.x = this.labelCoordinates.x - this.labelLength/2;
			this.rotationPointCoordinates.y = this.labelCoordinates.y+35;
		}
		else if(this.myLabel._rotate == 270) {
			this.rotationPointCoordinates.x = this.labelCoordinates.x-35;
			this.rotationPointCoordinates.y = this.labelCoordinates.y+8 - this.labelLength/2;	
		}
		else if(this.myLabel._rotate == 45) {
			this.rotationPointCoordinates.x = this.labelCoordinates.x+40;
			this.rotationPointCoordinates.y = this.labelCoordinates.y;	
		}
		else if(this.myLabel._rotate == 135) {
			this.rotationPointCoordinates.x = this.labelCoordinates.x;
			this.rotationPointCoordinates.y = this.labelCoordinates.y+40;	
		}
		else if(this.myLabel._rotate == 225) {
			this.rotationPointCoordinates.x = this.labelCoordinates.x-40;
			this.rotationPointCoordinates.y = this.labelCoordinates.y;	
		}
		else if(this.myLabel._rotate == 315) {
			this.rotationPointCoordinates.x = this.labelCoordinates.x;
			this.rotationPointCoordinates.y = this.labelCoordinates.y-40;	
		}
		else {
			//Default
			this.rotationPointCoordinates.x = this.labelCoordinates.x-8 + this.labelLength/3;
			this.rotationPointCoordinates.y = this.labelCoordinates.y-35;	
		}
	}
},

/**
 * set the Coordinates of the Label
 * 
 */
calculateLabelCoordinates: function(){		
		this.labelCoordinates.x = this.myLabel.x;
		this.labelCoordinates.y = this.myLabel.y;
},

/**
 * show a Overlay with a certain id and add it to parent Shape
 * 
 * @param {String} id
 * @param {Shape} shape
 * @param {Point} position
 * @param {SVG} visualObject
 */
showOverlay: function(id, shape, position, visualObject) {
	this.facade.raiseEvent({
		type: 			ORYX.CONFIG.EVENT_OVERLAY_SHOW,
		id: 			id,
		shapes: 		[shape],
		node:			visualObject,
		labelPoint:		position,
		dontCloneNode:	true
	});		
},

/**
 * hide a Overlay
 * 
 * @param {String} id
 */
hideOverlay: function(id) {
	this.facade.raiseEvent({
		type: ORYX.CONFIG.EVENT_OVERLAY_HIDE,
		id: id
	});	
},


/**
 * show the Association Line between Edge and Label
 * 
 */
showLine: function() {
	var x = this.myEdge.dockers[0].bounds.b.x-8;
	var y = this.myEdge.dockers[0].bounds.b.y-8;
	
	//Set the Position of the Line
	this.line.setAttributeNS(null, 'd', 'M'+x+' '+y+' L '+this.labelCoordinates.x+' '+this.labelCoordinates.y);

	this.facade.raiseEvent({
		type: 			ORYX.CONFIG.EVENT_OVERLAY_SHOW,
		id: 			"line",
		shapes: 		[this.canvasLabel],
		node:			this.line,
		position:		"northeast",
		dontCloneNode:	true
	});
	
},

/**
 * hide the Association Line between Edge and Label
 * 
 */
hideLine: function() {
	this.facade.raiseEvent({
		type: ORYX.CONFIG.EVENT_OVERLAY_HIDE,
		id: "line"
	});
}

});/**
 * Copyright (c) 2008
 * Willi Tscheschner
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 **/

if(!ORYX.Plugins)
	ORYX.Plugins = new Object();

/**
 * Supports EPCs by offering a syntax check and export and import ability..
 * 
 * 
 */
ORYX.Plugins.ProcessLink = Clazz.extend({

	facade: undefined,

	/**
	 * Offers the plugin functionality:
	 * 
	 */
	construct: function(facade) {

		this.facade = facade;
		
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_PROPERTY_CHANGED, this.propertyChanged.bind(this) );
		
	},


	/**
	 * 
	 * @param {Object} option
	 */
	propertyChanged: function( option, node){

		if( option.name !== "oryx-refuri" || !node instanceof ORYX.Core.Node ){ return }
		
		
		if( option.value && option.value.length > 0 && option.value != "undefined"){
			
			this.show( node, option.value );
					
		} else {

			this.hide( node );

		}				

	},
	
	/**
	 * Shows the Link for a particular shape with a specific url
	 * 
	 * @param {Object} shape
	 * @param {Object} url
	 */
	show: function( shape, url){

		
		// Generate the svg-representation of a link
		var link  = ORYX.Editor.graft("http://www.w3.org/2000/svg", null ,
					[ 'a',
						{'target': '_blank'},
						['path', 
							{ "stroke-width": 1.0, "stroke":"#00DD00", "fill": "#00AA00", "d":  "M3,3 l0,-2.5 l7.5,0 l0,-2.5 l7.5,4.5 l-7.5,3.5 l0,-2.5 l-8,0", "line-captions": "round"}
						]
					]);

		var link  = ORYX.Editor.graft("http://www.w3.org/2000/svg", null ,		
						[ 'a',
							{'target': '_blank'},
							['path', { "style": "fill:#92BFFC;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-width:0.72", "d": "M0 1.44 L0 15.05 L11.91 15.05 L11.91 5.98 L7.37 1.44 L0 1.44 Z"}],
							['path', { "style": "stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-width:0.72;fill:none;", "transform": "translate(7.5, -8.5)", "d": "M0 10.51 L0 15.05 L4.54 15.05"}],
							['path', { "style": "fill:#f28226;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-width:0.72", "transform": "translate(-3, -1)", "d": "M0 8.81 L0 13.06 L5.95 13.06 L5.95 15.05 A50.2313 50.2313 -175.57 0 0 10.77 11.08 A49.9128 49.9128 -1.28 0 0 5.95 6.54 L5.95 8.81 L0 8.81 Z"}],
						]);

	/*
	 * 
	 * 					[ 'a',
						{'target': '_blank'},
						['path', { "style": "fill:none;stroke-width:0.5px; stroke:#000000", "d": "M7,4 l0,2"}],
						['path', { "style": "fill:none;stroke-width:0.5px; stroke:#000000", "d": "M4,8 l-2,0 l0,6"}],
						['path', { "style": "fill:none;stroke-width:0.5px; stroke:#000000", "d": "M10,8 l2,0 l0,6"}],
						['rect', { "style": "fill:#96ff96;stroke:#000000;stroke-width:1", "width": 6, "height": 4, "x": 4, "y": 0}],
						['rect', { "style": "fill:#ffafff;stroke:#000000;stroke-width:1", "width": 6, "height": 4, "x": 4, "y": 6}],
						['rect', { "style": "fill:#96ff96;stroke:#000000;stroke-width:1", "width": 6, "height": 4, "x": 0, "y": 12}],
						['rect', { "style": "fill:#96ff96;stroke:#000000;stroke-width:1", "width": 6, "height": 4, "x": 8, "y": 12}],
						['rect', { "style": "fill:none;stroke:none;pointer-events:all", "width": 14, "height": 16, "x": 0, "y": 0}]
					]);
	 */
		
		// Set the link with the special namespace
		link.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", url);
		
		
		// Shows the link in the overlay					
		this.facade.raiseEvent({
					type: 			ORYX.CONFIG.EVENT_OVERLAY_SHOW,
					id: 			"arissupport.urlref_" + shape.id,
					shapes: 		[shape],
					node:			link,
					nodePosition:	"SE"
				});	
							
	},	

	/**
	 * Hides the Link for a particular shape
	 * 
	 * @param {Object} shape
	 */
	hide: function( shape ){

		this.facade.raiseEvent({
					type: 			ORYX.CONFIG.EVENT_OVERLAY_HIDE,
					id: 			"arissupport.urlref_" + shape.id
				});	
							
	}		
});
/**
 * Copyright (c) 2006
 * Martin Czuchra, Nicolas Peters, Daniel Polak, Willi Tscheschner, Gero Decker
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 **/
if (!ORYX.Plugins) 
    ORYX.Plugins = new Object();

ORYX.Plugins.SimplePnmlexport = ORYX.Plugins.AbstractPlugin.extend({

    facade: undefined,
    
    construct: function(facade){
        this.facade = facade;
        
        this.facade.offer({
            'name': ORYX.I18N.SimplePnmlexport.name,
            'functionality': this.exportIt.bind(this),
            'group': ORYX.I18N.SimplePnmlexport.group,
            dropDownGroupIcon: ORYX.PATH + "images/export2.png",
			'icon': ORYX.PATH + "images/page_white_gear.png",
            'description': ORYX.I18N.SimplePnmlexport.desc,
            'index': 1,
            'minShape': 0,
            'maxShape': 0
        });
        this.facade.offer({
            'name': "PNML For LOLA",
            'functionality': this.exportIt.bind(this,true),
            'group': ORYX.I18N.SimplePnmlexport.group,
            dropDownGroupIcon: ORYX.PATH + "images/export2.png",
			'icon': ORYX.PATH + "images/page_white_gear.png",
            'description': ORYX.I18N.SimplePnmlexport.desc,
            'index': 1,
            'minShape': 0,
            'maxShape': 0
        });
        
    },

    exportIt: function(lola){

		// raise loading enable event
        this.facade.raiseEvent({
            type: ORYX.CONFIG.EVENT_LOADING_ENABLE
        });
            
		// asynchronously ...
        window.setTimeout((function(){
			
			// ... save synchronously
            this.exportSynchronously(lola);
			
			// raise loading disable event.
            this.facade.raiseEvent({
                type: ORYX.CONFIG.EVENT_LOADING_DISABLE
            });
			
        }).bind(this), 10);

		return true;
    },

    exportSynchronously: function(lola) {

        var resource = location.href;
		var tool = "none";
		if(lola){
			tool = "lola";
		}
		
		try {
			var serialized_rdf = this.getRDFFromDOM();
			if (!serialized_rdf.startsWith("<?xml")) {
				serialized_rdf = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + serialized_rdf;
			}
			// Send the request to the server.
			new Ajax.Request(ORYX.CONFIG.SIMPLE_PNML_EXPORT_URL, {
				method: 'POST',
				asynchronous: false,
				parameters: {
					resource: resource,
					data: serialized_rdf,
					tool: tool
				},
				onSuccess: function(request){
					this.openDownloadWindow(window.document.title+".xml",request.responseText);
					/* 
					 * Data URIs do not work properly in chrome
					 * this.openXMLWindow(request.responseText);
					 * TODO Check for an better solution for download windows, without remaining open window
					 * @author Philipp Berger
					 */
				}.bind(this)
			});
			
		} catch (error){
			this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});
			Ext.Msg.alert(ORYX.I18N.Oryx.title, error);
	 	}
	}
});/**
 * Copyright (c) 2008
 * Willi Tscheschner
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 **/

if(!ORYX.Plugins)
	ORYX.Plugins = new Object();

/**
 * Supports EPCs by offering a syntax check and export and import ability..
 * 
 * 
 */
ORYX.Plugins.IBPMN2BPMN = Clazz.extend({

	facade: undefined,
	
	TransformServletURL: './ibpmn2bpmn',

	/**
	 * Offers the plugin functionality:
	 * 
	 */
	construct: function(facade) {
		
		this.facade = facade;
			
			
		this.facade.offer({
			'name':				"Transform from iBPMN to BPMN",
			'functionality': 	this.transform.bind(this),
			'icon': 			ORYX.PATH + "images/erdf_import_icon.png",
			'description': 		"Transformation from iBPMN to BPMN",
            'index': 1,
			'minShape': 		0,
			'maxShape': 		0,
			'group': ORYX.I18N.JSONSupport.imp.group,
            dropDownGroupIcon: ORYX.PATH + "images/import.png"

		});


	},

	
	/**
	 * Imports an AML description
	 * 
	 */
	transform: function(){
		this._showImportDialog();
	},		

	
	
	/**
	 * 
	 * 
	 * @param {Object} url
	 * @param {Object} params
	 * @param {Object} successcallback
	 */
	sendRequest: function( url, params, successcallback, failedcallback ){

		var suc = false;

		new Ajax.Request(url, {
            method			: 'POST',
            asynchronous	: false,
            parameters		: params,
			onSuccess		: function(transport) {
				
				suc = true;
				
				if(successcallback){
					successcallback( transport.responseText )	
				}
				
			}.bind(this),
			
			onFailure		: function(transport) {

				if(failedcallback){
					
					failedcallback( );
					
				} else {
					Ext.Msg.alert(ORYX.I18N.Oryx.title, ORYX.I18N.ERDFSupport.impFailed);
					ORYX.log.warn("Transform failed: " + transport.responseText);	
				}
				
			}.bind(this)		
		});
		
		
		return suc;
							
	},


	transformToBPMN: function( rdfString, success, failed ){
		
		var s 	= rdfString;
		s 		= s.startsWith('<?xml') ? s : '<?xml version="1.0" encoding="utf-8"?>'+s+'';	
						
		var parser	= new DOMParser();			
		var doc 	=  parser.parseFromString( s ,"text/xml");
							
		if( doc.firstChild.tagName == "parsererror" ){

			Ext.MessageBox.show({
					title: 		"Parse Error",
 					msg: 		"The given RDF is not xml valid.",
					buttons: 	Ext.MessageBox.OK,
					icon: 		Ext.MessageBox.ERROR
				});
																
			if(failed)
				failed();
				
		} else {
			
			/**
			 * SUCCESSCALLBACK for positive return while transformation
			 * 
			 */
			var transformSuccessCallback = function( e ){
				
				e = '<?xml version="1.0" encoding="utf-8"?><div>'+e+'</div>';

				var parser	= new DOMParser();			
				var doc 	=  parser.parseFromString( e ,"text/xml");
				
				this.facade.importERDF( doc );
				
			}.bind(this);
			
			var xsl = "";
			source=ORYX.PATH + "lib/extract-rdf.xsl";
			new Ajax.Request(source, {
				asynchronous: false,
				method: 'get',
				onSuccess: function(transport){
					xsl = transport.responseText
				}.bind(this),
				onFailure: (function(transport){
					ORYX.Log.error("XSL load failed" + transport);
				}).bind(this)
			});
			
			var parser = new DOMParser();
			var parsedDOM = parser.parseFromString(s, "text/xml");
			var xslObject = domParser.parseFromString(xsl, "text/xml");
			var xsltProcessor = new XSLTProcessor();
			xsltProcessor.importStylesheet(xslObject);
			try {
				var rdf = xsltProcessor.transformToFragment(parsedDOM, document);
				var serialized_rdf = (new XMLSerializer()).serializeToString(rdf);
				if (!serialized_rdf.startsWith("<?xml")) {
					serialized_rdf = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + serialized_rdf;
				}
						
				// Send request
				this.sendRequest( this.TransformServletURL, {data:serialized_rdf}, transformSuccessCallback)
			
			}catch(e){}
		
			if(success)
				success();
		
		}
	},

	

	/**
	 * Opens a upload dialog.
	 * 
	 */
	_showImportDialog: function( successCallback ){
	
	    var form = new Ext.form.FormPanel({
			baseCls: 		'x-plain',
	        labelWidth: 	50,
	        defaultType: 	'textfield',
	        items: [{
	            text : 		ORYX.I18N.ERDFSupport.selectFile, 
				style : 	'font-size:12px;margin-bottom:10px;display:block;',
	            anchor:		'100%',
				xtype : 	'label' 
	        },{
	            fieldLabel: ORYX.I18N.ERDFSupport.file,
	            name: 		'subject',
				inputType : 'file',
				style : 	'margin-bottom:10px;display:block;',
				itemCls :	'ext_specific_window_overflow'
	        }, {
	            xtype: 'textarea',
	            hideLabel: true,
	            name: 'msg',
	            anchor: '100% -63'  
	        }]
	    });



		// Create the panel
		var dialog = new Ext.Window({ 
			autoCreate: true, 
			layout: 	'fit',
			plain:		true,
			bodyStyle: 	'padding:5px;',
			title: 		ORYX.I18N.ERDFSupport.impERDF, 
			height: 	350, 
			width:		500,
			modal:		true,
			fixedcenter:true, 
			shadow:		true, 
			proxyDrag: 	true,
			resizable:	true,
			items: 		[form],
			buttons:[
				{
					text:ORYX.I18N.ERDFSupport.impBtn,
					handler:function(){
						
						var loadMask = new Ext.LoadMask(Ext.getBody(), {msg:ORYX.I18N.ERDFSupport.impProgress});
						loadMask.show();
						
						window.setTimeout(function(){
					
							
							var rdfString =  form.items.items[2].getValue();
							this.transformToBPMN(rdfString, function(){loadMask.hide();dialog.hide()}.bind(this), function(){loadMask.hide();}.bind(this))
														
														
							
						}.bind(this), 100);
			
					}.bind(this)
				},{
					text:ORYX.I18N.ERDFSupport.close,
					handler:function(){
						
						dialog.hide();
					
					}.bind(this)
				}
			]
		});
		
		// Destroy the panel when hiding
		dialog.on('hide', function(){
			dialog.destroy(true);
			delete dialog;
		});


		// Show the panel
		dialog.show();
		
				
		// Adds the change event handler to 
		form.items.items[1].getEl().dom.addEventListener('change',function(evt){
				var text = evt.target.files[0].getAsBinary();
				form.items.items[2].setValue( text );
			}, true)

	}
	
});/**
 * Copyright (c) 2008, Gero Decker, refactored by Kai Schlichting
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 **/
if (!ORYX.Plugins) 
    ORYX.Plugins = new Object();

/**
   This plugin is a generic syntax checker for different diagram types.
   Needs server communication.
   @class ORYX.Plugins.SyntaxChecker
   @constructor Creates a new instance
   @extends ORYX.Plugins.AbstractPlugin
*/
ORYX.Plugins.SyntaxChecker = ORYX.Plugins.AbstractPlugin.extend({
    /**@private*/
    construct: function(){
        arguments.callee.$.construct.apply(this, arguments);
                
        this.active = false;
        this.raisedEventIds = [];
        
        this.facade.offer({
            'name': ORYX.I18N.SyntaxChecker.name,
            'functionality': this.perform.bind(this),
            'group': ORYX.I18N.SyntaxChecker.group,
            'icon': ORYX.PATH + "images/checker_syntax.png",
            'description': ORYX.I18N.SyntaxChecker.desc,
            'index': 0,
            'toggle': true,
            'minShape': 0,
            'maxShape': 0
        });
        
        this.facade.registerOnEvent(ORYX.Plugins.SyntaxChecker.CHECK_FOR_ERRORS_EVENT, this.checkForErrors.bind(this));
        this.facade.registerOnEvent(ORYX.Plugins.SyntaxChecker.RESET_ERRORS_EVENT, this.resetErrors.bind(this));
        this.facade.registerOnEvent(ORYX.Plugins.SyntaxChecker.SHOW_ERRORS_EVENT, this.doShowErrors.bind(this));
    },
    
    perform: function(button, pressed){
        if (!pressed) {
            this.resetErrors();
        } else {
            this.checkForErrors({
                onNoErrors: function(){
                    this.setActivated(button, false);
                    this.facade.raiseEvent({
            			type:ORYX.CONFIG.EVENT_LOADING_STATUS,
            			text:ORYX.I18N.SyntaxChecker.noErrors,
            			timeout:10000
            		});
                    //Ext.Msg.alert(ORYX.I18N.Oryx.title, ORYX.I18N.SyntaxChecker.noErrors);
                }.bind(this),
                onErrors: function(){
                    this.enableDeactivationHandler(button);
                }.bind(this),
                onFailure: function(){
                    this.setActivated(button, false);
                    Ext.Msg.alert(ORYX.I18N.Oryx.title, ORYX.I18N.SyntaxChecker.invalid);
                }.bind(this)
            });      
        }
    },
    
    /**
     * Registers handler for deactivating syntax checker as soon as somewhere is clicked...
     * @param {Ext.Button} Toolbar button
     */
    enableDeactivationHandler: function(button){
        var deactivate = function(){
            this.setActivated(button, false);
            this.resetErrors();
            this.facade.unregisterOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN, deactivate);
        };
        
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN, deactivate.bind(this));
    },
    
    /**
     * Sets the activated state of the plugin
     * @param {Ext.Button} Toolbar button
     * @param {Object} activated
     */
    setActivated: function(button, activated){
        button.toggle(activated);
        if(activated === undefined){
            this.active = !this.active;
        } else {
            this.active = activated;
        }
    },
    
    /**
     * Performs request to server to check for errors on current model.
     * @methodOf ORYX.Plugins.SyntaxChecker.prototype
     * @param {Object} options Configuration hash
     * @param {String} context A context send to the syntax checker servlet
     * @param {Function} [options.onNoErrors] Raised when model has no errors.
     * @param {Function} [options.onErrors] Raised when model has errors.
     * @param {Function} [options.onFailure] Raised when server communcation failed.
     * @param {boolean} [options.showErrors=true] Display errors on nodes on canvas (by calling ORYX.Plugins.SyntaxChecker.prototype.showErrors)
     */
    checkForErrors: function(options){
        Ext.applyIf(options || {}, {
          showErrors: true,
          onErrors: Ext.emptyFn,
          onNoErrors: Ext.emptyFn,
          onFailure: Ext.emptyFn
        });
            
        Ext.Msg.wait(ORYX.I18N.SyntaxChecker.checkingMessage);

		var ss = this.facade.getStencilSets();
		var data = null;
		var includesJson = false;
		
		if(ss.keys().include("http://b3mn.org/stencilset/bpmn2.0#") ||
				ss.keys().include("http://b3mn.org/stencilset/bpmn2.0conversation#")) {
			data = this.facade.getSerializedJSON();
			includesJson = true;
		} else {
			data = this.getRDFFromDOM();
		}
        
        // Send the request to the server.
        new Ajax.Request(ORYX.CONFIG.SYNTAXCHECKER_URL, {
            method: 'POST',
            asynchronous: false,
            parameters: {
                resource: location.href,
                data: data,
                context: options.context,
				isJson: includesJson
            },
            onSuccess: function(request){
                var resp = (request&&request.responseText?request.responseText:"{}").evalJSON();
                
                Ext.Msg.hide();
                
                if (resp instanceof Object) {
                    resp = $H(resp)
                    if (resp.size() > 0) {
                        if(options.showErrors) this.showErrors(resp);
                 
                        options.onErrors();
                    }
                    else {
                        options.onNoErrors();
                    }
                }
                else {
                    options.onFailure();
                }
            }.bind(this),
            onFailure: function(){
                Ext.Msg.hide();
                options.onFailure();
            }
        });
    },
    
    /** Called on SHOW_ERRORS_EVENT.
     * 
     * @param {Object} event
     * @param {Object} args
     */
    doShowErrors: function(event, args){
        this.showErrors(event.errors);
    },
    
    /**
     * Shows overlays for each given error
     * @methodOf ORYX.Plugins.SyntaxChecker.prototype
     * @param {Hash|Object} errors
     * @example
     * showErrors({
     *     myShape1: "This has an error!",
     *     myShape2: "Another error!"
     * })
     */
    showErrors: function(errors){
        // If normal object is given, convert to hash
        if(!(errors instanceof Hash)){
            errors = new Hash(errors);
        }
        
        // Get all Valid ResourceIDs and collect all shapes
        errors.keys().each(function(value){
            var sh = this.facade.getCanvas().getChildShapeByResourceId(value);
            if (sh) {
                this.raiseOverlay(sh, this.parseCodeToMsg(errors[value]));
            }
        }.bind(this));
        this.active = !this.active;
        
        //show a status message with a hint to the error messages in the tooltip
        this.facade.raiseEvent({
			type:ORYX.CONFIG.EVENT_LOADING_STATUS,
			text:ORYX.I18N.SyntaxChecker.notice,
			timeout:10000
		});
    },
    parseCodeToMsg: function(code){
    	var msg = code.replace(/: /g, "<br />").replace(/, /g, "<br />");
    	var codes = msg.split("<br />");
    	for (var i=0; i < codes.length; i++) {
    		var singleCode = codes[i];
    		var replacement = this.parseSingleCodeToMsg(singleCode);
    		if (singleCode != replacement) {
    			msg = msg.replace(singleCode, replacement);
    		}
    	}
		
		return msg;
	},
	
	parseSingleCodeToMsg: function(code){
		return ORYX.I18N.SyntaxChecker[code]||code;
	},
    /**
     * Resets all (displayed) errors
     * @methodOf ORYX.Plugins.SyntaxChecker.prototype
     */
    resetErrors: function(){
        this.raisedEventIds.each(function(id){
            this.facade.raiseEvent({
                type: ORYX.CONFIG.EVENT_OVERLAY_HIDE,
                id: id
            });
        }.bind(this))
        
        this.raisedEventIds = [];
        this.active = false;
    },
    
    raiseOverlay: function(shape, errorMsg){
        var id = "syntaxchecker." + this.raisedEventIds.length;
        var crossId = ORYX.Editor.provideId();
        var cross = ORYX.Editor.graft("http://www.w3.org/2000/svg", null, ['path', {
            "id":crossId,
            "title":"",
            "stroke-width": 5.0,
            "stroke": "red",
            "d": "M20,-5 L5,-20 M5,-5 L20,-20",
            "line-captions": "round"
        }]);
        
        this.facade.raiseEvent({
            type: ORYX.CONFIG.EVENT_OVERLAY_SHOW,
            id: id,
            shapes: [shape],
            node: cross,
            nodePosition: shape instanceof ORYX.Core.Edge ? "START" : "NW"
        });
        
        var tooltip = new Ext.ToolTip({
        	showDelay:50,
        	html:errorMsg,
        	target:crossId
        });
        
        this.raisedEventIds.push(id);
        
        return cross;
    }
});

ORYX.Plugins.SyntaxChecker.CHECK_FOR_ERRORS_EVENT = "checkForErrors";
ORYX.Plugins.SyntaxChecker.RESET_ERRORS_EVENT = "resetErrors";
ORYX.Plugins.SyntaxChecker.SHOW_ERRORS_EVENT = "showErrors";

ORYX.Plugins.PetrinetSyntaxChecker = ORYX.Plugins.SyntaxChecker.extend({
    /*FIXME:: BPMN + EPC syntax checker needs rdf, but petri nets needs erdf.
     * So we override getRDFFromDOM from AbstractPlugin to return erdf.
     */
    getRDFFromDOM: function(){
        return this.facade.getERDF();
    }
});
/**
 * Copyright (c) 2008, Kai Schlichting
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 **/
if (!ORYX.Plugins) 
    ORYX.Plugins = new Object();

ORYX.Plugins.Validator = ORYX.Plugins.AbstractPlugin.extend({
    construct: function(facade){
        this.facade = facade;
        
        this.active = false;
        this.raisedEventIds = [];
        
        this.buttonId = ORYX.Editor.provideId();
        
        this.facade.offer({
            'name': ORYX.I18N.Validator.name,
            'id': this.buttonId,
            'functionality': this.load.bind(this),
            'group': "Verification",
            'icon': ORYX.PATH + "images/checker_validation.png",
            'description': ORYX.I18N.Validator.description,
            'index': 1,
            'toggle': true,
            'minShape': 0,
            'maxShape': 0
        });
    },
    
    load: function(button, pressed){
        if (!pressed) {
            this.hideOverlays();
            this.active = !this.active;
        }
        else {
            this.validate(button);
        }
    },
    
    setActive: function(active){
        this.active = active;
        this.facade.raiseEvent({
            type: ORYX.CONFIG.EVENT_BUTTON_UPDATE,
            id: this.buttonId,
            pressed: active
        });
    },
    
    hideOverlays: function(){
        this.raisedEventIds.each(function(id){
            this.facade.raiseEvent({
                type: ORYX.CONFIG.EVENT_OVERLAY_HIDE,
                id: id
            });
        }
.bind(this));
        
        this.raisedEventIds = [];
    },
    validate: function(button){
        this.facade.raiseEvent({
            type: ORYX.CONFIG.EVENT_LOADING_ENABLE,
            text: ORYX.I18N.Validator.checking
        });
      
        // Send the request to the server.
        new Ajax.Request(ORYX.CONFIG.VALIDATOR_URL, {
            method: 'POST',
            asynchronous: false,
            parameters: {
                resource: location.href,
                data: this.getRDFFromDOM()
            },
            onSuccess: function(request){
                var result = Ext.decode(request.responseText);
                
                this.facade.raiseEvent({
                    type: ORYX.CONFIG.EVENT_LOADING_DISABLE
                });
                
                // This should be implemented by child instances of validator 
                this.handleValidationResponse(result, button);
            }
.bind(this),
            onFailure: function(){
                this.facade.raiseEvent({
                    type: ORYX.CONFIG.EVENT_LOADING_DISABLE
                });
                Ext.Msg.alert(ORYX.I18N.Validator.error, ORYX.I18N.Validator.errorDesc);
            }.bind(this)
        });
    },
    
    showOverlay: function(shape, errorMsg, errorTitle){
    
        var id = "syntaxchecker." + this.raisedEventIds.length;
        
        var crossId = ORYX.Editor.provideId();
        
        var cross = ORYX.Editor.graft("http://www.w3.org/2000/svg", null, ['path', {
        	"id":crossId,
        	"title":"",
            "stroke-width": 5.0,
            "stroke": "red",
            "d": "M20,-5 L5,-20 M5,-5 L20,-20",
            "line-captions": "round"
        }]);
        
        this.facade.raiseEvent({
            type: ORYX.CONFIG.EVENT_OVERLAY_SHOW,
            id: id,
            shapes: [shape],
            node: cross,
            nodePosition: shape instanceof ORYX.Core.Edge ? "START" : "NW"
        });
        
        this.raisedEventIds.push(id);
        
        var tooltip = new Ext.ToolTip({
        	showDelay:50,
        	title:errorTitle,
        	html:errorMsg,
        	target:crossId
        });   
        
        return cross;
    },
    
    /**
     * Registers handler for deactivating syntax checker as soon as somewhere is clicked...
     * @param {Ext.Button} Toolbar button
     */
    enableDeactivationHandler: function(button){
        var deactivate = function(){
            this.setActive(false);
            this.facade.unregisterOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN, deactivate);
        };
        
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN, deactivate.bind(this));
    }
});

ORYX.Plugins.BPMNValidator = Ext.extend(ORYX.Plugins.Validator, {
    handleValidationResponse: function(result, button){
        var conflictingNodes = result.conflictingNodes;
        var leadsToEnd = result.leadsToEnd;
        var unsafeNode = result.unsafeNode;
        // Only stay active if there is anything to visualize
        this.setActive(conflictingNodes.size() > 0);
        
//        if (!leadsToEnd) {
//            Ext.Msg.alert("Validation Result", "The process will never reach a final state!");
//        }
        if (conflictingNodes.size() > 0) {
            conflictingNodes.each(function(node){
                sh = this.facade.getCanvas().getChildShapeByResourceId(node.id);
                if (sh) {
                    this.showOverlay(sh, ORYX.I18N.Validator.bpmnDeadlock,  ORYX.I18N.Validator.bpmnDeadlockTitle);
                }
            }.bind(this));
        }
        if(unsafeNode) {
        	var shape = this.facade.getCanvas().getChildShapeByResourceId(unsafeNode);
        	if (shape) {
                this.showOverlay(shape, ORYX.I18N.Validator.bpmnUnsafe, ORYX.I18N.Validator.bpmnUnsafeTitle);
            }
        }
        if(leadsToEnd && conflictingNodes.size() === 0 && !unsafeNode) {
        	this.facade.raiseEvent({
    			type:ORYX.CONFIG.EVENT_LOADING_STATUS,
    			text:ORYX.I18N.Validator.noErrors,
    			timeout:10000
    		});
        	//Ext.Msg.alert(ORYX.I18N.Validator.result, ORYX.I18N.Validator.noErrors);
        } else if(!leadsToEnd && conflictingNodes.size() === 0 && !unsafeNode){
        	Ext.Msg.alert(ORYX.I18N.Validator.bpmnLeadsToNoEndTitle, ORYX.I18N.Validator.bpmnLeadsToNoEnd);
        } else {
        	this.enableDeactivationHandler(button);
        	//show a status message with a hint to the error messages in the tooltip
            this.facade.raiseEvent({
    			type:ORYX.CONFIG.EVENT_LOADING_STATUS,
    			text:ORYX.I18N.SyntaxChecker.notice,
    			timeout:10000
    		});
        }
    }
});

ORYX.Plugins.EPCValidator = Ext.extend(ORYX.Plugins.Validator, {
  getLabelOfShape: function(node){
    if(node.properties["oryx-title"] === ""){
      return node.id;
    } else {
      return node.properties["oryx-title"];
    }
  },
  findShapeById: function(id){
    return this.facade.getCanvas().getChildShapeByResourceId(id);
  },
  
    handleValidationResponse: function(result, button){
      //TODO use Ext XTemplate
        var isSound = result.isSound;
        var badStartArcs = result.badStartArcs;
        var badEndArcs = result.badEndArcs;
        var goodInitialMarkings = result.goodInitialMarkings;
        var goodFinalMarkings = result.goodFinalMarkings;
        
        var message = "";
        
        if (isSound) {
          message += ORYX.I18N.Validator.epcIsSound;
        } else {
          message += ORYX.I18N.Validator.epcNotSound;
        }
        
        message += "<hr />";
        
        var arrayOfArraysToMessage = function(arrayOfArrays, formatter){
          var message = "<ul>"
          arrayOfArrays.each(function(array){
            message += "<li> - ";
            array.each(function(element){
              message += '"' + formatter(element) + '" ';
            });
            message += "</li>";
          });
          message += "</ul>";
          return message;
        }
        var arrayToMessage = function(array, formatter){
          var message = "<ul>"
          array.each(function(element){
            message += "<li> - " + formatter(element) + "</li>";
          });
          message += "</ul>";
          return message;
        }
        
        message += "<p>There are "+ goodInitialMarkings.length +" initial markings which does not run into a deadlock.</p>";
        message += arrayOfArraysToMessage(goodInitialMarkings, function(arc){
          return this.getLabelOfShape(this.findShapeById(arc.id).getIncomingShapes()[0]);
        }.createDelegate(this));
        message += "<p>The initial markings do not include "+ badStartArcs.length +" start nodes.</p>";
        message += arrayToMessage(badStartArcs, function(arc){
          return this.getLabelOfShape(this.findShapeById(arc.id).getIncomingShapes()[0]);
        }.createDelegate(this));
        
        message += "<hr />";
        
        message += "<p>There are "+ goodFinalMarkings.length +" final markings which can be reached from the initial markings.</p>";
        message += arrayOfArraysToMessage(goodFinalMarkings, function(arc){
          return this.getLabelOfShape(this.findShapeById(arc.id).getOutgoingShapes()[0]);
        }.createDelegate(this));
        message += "<p>The final markings do not include "+ badEndArcs.length +" end nodes.</p>";
        message += arrayToMessage(badEndArcs, function(arc){
          return this.getLabelOfShape(this.findShapeById(arc.id).getOutgoingShapes()[0]);
        }.createDelegate(this))
        
        message += "<hr />";
        
        message += "<p><i>Remark: Set titles of functions and events to get some nicer output (names instead of ids)</i></p>"
        
        Ext.Msg.alert('Validation Result', message);
        
        this.setActive(false);
    }
});/*
 * Copyright (c) 2008-2009, Steffen Ryll
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 **/
if (!ORYX.Plugins) 
    ORYX.Plugins = new Object();

ORYX.Plugins.QueryResultHighlighter = ORYX.Plugins.AbstractPlugin.extend({

	facade: undefined,
	
	isHighlighted: false,
	
	construct: function(facade){
	
		this.facade = facade;
		
		this.raisedEventIds = [];
		this.raisedHighlightEventIds = [];
		
		this.facade.offer({
			'name': "Query result highlighter",
			'functionality': this.buttonClick.bind(this),
			'group': ORYX.I18N.QueryEvaluator.group,
			'icon': ORYX.PATH + "images/xforms_export.png",
			'description': "This plugin highlights model parts which were matched by a query.",
			'index': 1,
			'toggle': true,
			'minShape': 0,
			'maxShape': 0,
			'isEnabled': 	 this._isQueryResultThere.bind(this)
		});
		
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_LOADED, this.highlightMatches.bind(this));
		
	},
	_isQueryResultThere: function(){
		var parameters = window.location.search;
		var PARAMKEY = "matches=";
		
		var paramStart = parameters.indexOf(PARAMKEY) + PARAMKEY.length;
		return (paramStart > PARAMKEY.length);

	},

	highlightMatches : function() {
		var elements = this.deserializeMatches();
		
		if (!elements) {
			return;
		}
		var maaatch=null;
		var diagnosis=null;
		var description = this.deserializeDescription();
		
		
		if (description)
		{
			description.each(function (item) {
				if (item.match)
				{
					maaatch = item.match;
				}
				if (item.diagnosis)
				{
					diagnosis = item.diagnosis;
				}
			})
			
			
		}
		else
		{
			maaatch = "pattern";
			diagnosis = "";
		}
		var color = "orange";
		var colorHex = "#FFFF00";
        if (diagnosis === "complies"){
        	color = "green";
        	colorHex = "#00FF00";
        }
        else if (diagnosis === "violation scenario")
        {
        	color = "red";
        	colorHex = "#FF0000";
        }
        else // either this is a does not comply or an ordinary query
        {
        	color = "orange";
        	colorHex = "#FF6600";
        }
		try {
			elements.each(function (item) {
				if (item.nodeType != null && item.nodeId != null) {
					var shape = this.getShapeById(item.nodeId);
				} else if (item.edgeType != null) {
					var shape = this.getEdgeByFromAndTo(item.from, item.to)
				} else return; // unknown element type
				
				if (!shape) return;
				
				//this.highlightSelectedTask(shape);
				// Commented by Ahmed Awad 30.07.09
				//this.raiseOverlay(shape,color,colorHex, "Moeep! Error when raising an overlay.");
				// Added by Ahmed Awad
				if (shape instanceof ORYX.Core.Node)
                {
        	       shape.setProperty("oryx-bgcolor",colorHex);
        	       shape.refresh();
                }
			}.bind(this));
		} catch (e) {
			Ext.MessageBox.alert(ORYX.I18N.Oryx.title, "Something went wrong while applying highlighting to shapes: " + e);
		}
		
		this.isHighlighted = true;
		//Ext.MessageBox.alert(ORYX.I18N.Oryx.title, "Finished highlighting!");
	},

	raiseOverlay: function(shape,color,colorHex, errorMsg){
        var id = "queryhighlighter." + this.raisedEventIds.length;
        // Added by Ahmed Awad to change the color of the matched node
        if (shape instanceof ORYX.Core.Node)
        {
        	shape.setProperty("oryx-bgcolor",colorHex);
        	shape.refresh();
        }
        
//     
        var cross = ORYX.Editor.graft("http://www.w3.org/2000/svg", null, ['path', {
            	"title": errorMsg,
            	"stroke-width": 5.0,
            	"stroke": color,
            	"d": "M20,-5 L5,-20 M5,-5 L20,-20",
            	"line-captions": "round"
        	}]);
        this.facade.raiseEvent({
            type: ORYX.CONFIG.EVENT_OVERLAY_SHOW,
            id: id,
            shapes: [shape],
            node: cross,
            nodePosition: shape instanceof ORYX.Core.Edge ? "START" : "NW"
        });
        
        this.raisedEventIds.push(id);
        
        return cross;
    },
	
	removeHighlighting: function(shape, errorMsg){
        this.raisedEventIds.each(function(id) {
	        this.facade.raiseEvent({
	            type: ORYX.CONFIG.EVENT_OVERLAY_HIDE,
	            id: id
	        });
		}.bind(this));
        
		this.raisedEventIds = [];
		
		this.raisedHighlightEventIds.each(function(id) {
	        this.facade.raiseEvent({
	            type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
	            id: id
	        });
		}.bind(this));
        
		this.raisedHighlightEventIds = [];
    },
	
	highlightSelectedTask: function(shape){ //edge marking of selected/ given task
		if(!(shape instanceof ORYX.Core.Shape)) return;
		this.facade.raiseEvent({
			type:			ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW, 
			highlightId:	shape.id,
			elements:		[shape],
			color:			'#FF0000'
		});
		this.raisedHighlightEventIds.push(task.id);
	},

	buttonClick: function(button, pressed) {
		if (this.isHighlighted) {
			this.removeHighlighting();
			this.isHighlighted = false;
		} else {
			this.highlightMatches();
			this.isHighlighted = true;
		}

		// skip buttons toggle if both aren't in sync. This is because we can't set the buttons to pressed initially 
		if (this.isHighlighted && !pressed) {		
			button.toggle();
		}
/*		if ((this.isHighlighted && !pressed)|| (!this.isHighlighted && pressed)) {		
			button.toggle();
		}
*/
	},
	
	/**
	 * returns an object (or array), which was passed in the URL query part 
	 * in JSON+URL-encoded form
	 */
	deserializeMatches : function() {
		var parameters = window.location.search;
		var PARAMKEY = "matches=";
		
		var paramStart = parameters.indexOf(PARAMKEY) + PARAMKEY.length;
		if (paramStart < PARAMKEY.length) {
			return null; // no highlighting info found
		}
		var paramEnd = parameters.indexOf("&", paramStart); // delimiter from potential other parameters
		
		var paramComponents = parameters.substring(paramStart, 
			(paramEnd > paramStart ? paramEnd : parameters.length ));
		
		try {
			var matchedElementsJson = decodeURIComponent(paramComponents);
			var matchedElements = Ext.decode(matchedElementsJson);
		} catch (e) {
			Ext.MessageBox.alert(ORYX.I18N.Oryx.title, "I found highlighting information from BPMN-Q, but they could not be understood: " + e);
			return null;
		}
		
		return matchedElements;
	},
	// Added by Ahmed Awad
	deserializeDescription : function() {
		var parameters = window.location.search;
		var PARAMKEY = "description=";
		
		var paramStart = parameters.indexOf(PARAMKEY) + PARAMKEY.length;
		if (paramStart < PARAMKEY.length) {
			return null; // no highlighting info found
		}
		var paramEnd = parameters.indexOf("&", paramStart); // delimiter from potential other parameters
		
		var paramComponents = parameters.substring(paramStart, 
			(paramEnd > paramStart ? paramEnd : parameters.length ));
		
		try {
			var descriptionJson = decodeURIComponent(paramComponents);
			var description = Ext.decode(descriptionJson);
		} catch (e) {
			Ext.MessageBox.alert(ORYX.I18N.Oryx.title, "I found description information from BPMN-Q, but they could not be understood: " + e);
			return null;
		}
		
		return description;
	},
	getShapeById: function(resourceId) {
		var shapes = this.facade.getCanvas().getChildShapeByResourceId(resourceId);
/*		var task;
		for (var index = 0; index < shapes.length; index++) {
    		if (shapes[index].properties["oryx-activitytype"] == "Task") {
				if (shapes[index].properties["oryx-id"] == taskId) {
					task = shapes[index];
					break;
				}
			}
    	} */
		return shapes;
	},
	
	getEdgeByFromAndTo: function(fromId, toId) {
		fromId = fromId.replace(/^.*#/, '');
		toId = toId.replace(/^.*#/, '');
		
		var edges = this.facade.getCanvas().getChildEdges(true);
		
		var suspectEdge = edges.find(function(edge) {
			return edge.incoming != null
			  && edge.incoming[0] != null
			  && edge.incoming[0].resourceId == fromId
			  && edge.outgoing != null
			  && edge.outgoing[0] != null
			  && edge.outgoing[0].resourceId == toId;
		}.bind(this));
		
		return suspectEdge;
	}

});
/**
 * Copyright (c) 2009
 * Ingo Kitzmann, Christoph Koenig
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 **/

if (!ORYX) 
	ORYX = new Object();
if (!ORYX.Plugins) 
	ORYX.Plugins = new Object();

ORYX.Plugins.BpmnLayouter = ORYX.Plugins.AbstractPlugin.extend({
	facade: undefined,
	construct: function(facade){
		this.facade = facade;
		this.facade.offer({
			'name' : "Layout-BPMN",
			'description' : "Layout BPMN Model",
			'functionality' : this.layout.bind(this),
			'group' : "Layout",
			'icon' : ORYX.PATH + "images/auto_layout.png",
			'index' : 1,
			'minShape' : 0,
			'maxShape' : 0
		});
	},
	layout: function(){
		
		this.facade.raiseEvent({
            type: ORYX.CONFIG.EVENT_LOADING_ENABLE,
			text: ORYX.I18N.Layouting.doing
        });
		
		
		new Ajax.Request(ORYX.CONFIG.BPMN_LAYOUTER, {
			method : 'POST',
			asynchronous : false,
			parameters : {
				data: this.facade.getSerializedJSON(),
				output: "coordinatesonly"
			},
			onFailure: function(request){
				Ext.Msg.alert("Layouting Error", "Error while layouting:!\n" + request.responseText);
            	this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});
			},
			onSuccess: function(request){

				/*Ext.Msg.alert("Oryx", "New Layout arrived:!\n" + request.responseText);*/
				
				var setLayoutCommandClass = ORYX.Core.Command.extend({
					construct: function(layoutArray, plugin){
						this.layoutArray = layoutArray;
						this.plugin = plugin;
						this.oldLayoutArray = [];
					},
					execute: function(){
						this.layoutArray.each(function(elem){
							/* get shape */
							var shape = this.plugin.facade.getCanvas().getChildShapeByResourceId(elem.id);
							
							/* save old layout for undo*/
							var oldLayout = {
								id : elem.id,
								bounds : shape.bounds.clone()
							};
							this.oldLayoutArray.push(oldLayout);
							
							/* set new bounds */
							var bound = elem.bounds.split(" ");
							shape.bounds.set(bound[0],bound[1],bound[2],bound[3]);
							
							/* set new dockers */
							if(elem.dockers != null){
								this.plugin.setDockersBad(shape,elem.dockers);
							}
							
							shape.update();
						}.bind(this));
						
						this.plugin.facade.getCanvas().update();
						this.plugin.facade.updateSelection();					
						
					},
					rollback: function(){
						this.oldLayoutArray.each(function(elem){
							var shape = this.plugin.facade.getCanvas().getChildShapeByResourceId(elem.id);
							shape.bounds.set(elem.bounds);
							shape.update();
						}.bind(this));
						
						this.plugin.facade.getCanvas().update();
						this.plugin.facade.updateSelection();	
					}
				});
				
				
				var resp = request.responseText.evalJSON();
				if (resp instanceof Array && resp.size() > 0) {
					/* create command */
					var command = new setLayoutCommandClass(resp, this);
					/* execute command */
					this.facade.executeCommands([command]);
				}
            	this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});
			}.bind(this)
		})
	},
	setDockersBad: function(shape, dockers){
		var dockersString = "";
		dockers.each(function(p){
			dockersString += p.x + " " + p.y + " ";
		});
		dockersString += " # ";
		shape.deserialize([{
								prefix: 'oryx',
								name: 'dockers',
								value: dockersString
							}]);
	},
	setDockersGood: function(shape, dockers){
		if(elem.dockers.length == 1){
			/* docked event */
			
		}else{
			
			/* clear all except of the first and last dockers */
			var dockers = shape.getDockers().slice(1,-1);
			dockers.each(function(docker){
				shape.removeDocker(docker);
			});
			
			/* set first and last docker */
			var firstDocker = shape.getDockers()[0];
			if (firstDocker.getDockedShape()) {
				firstDocker.setReferencePoint(elem.dockers[0]);
			}
			else {
				firstDocker.bounds.moveTo(elem.dockers[0].x,elem.dockers[0].y);
			}
			firstDocker.refresh();
			
			var lastDocker = shape.getDockers()[1];
			if (lastDocker.getDockedShape()) {
				lastDocker.setReferencePoint(elem.dockers[elem.dockers.length - 1]);
			}
			else {
				lastDocker.bounds.moveTo(elem.dockers[elem.dockers.length - 1].x, elem.dockers[elem.dockers.length - 1].y);
			}
			lastDocker.refresh();
			
			/* add new dockers except of the first and last */
			var dockersToAdd = elem.dockers.slice(1,-1);
			dockersToAdd.each(function(dockerPoint){
				var newDocker = shape.createDocker(undefined, dockerPoint);
				newDocker.parent = shape;
				newDocker.bounds.centerMoveTo(dockerPoint.x, dockerPoint.y);
				/*newDocker.setReferencePoint(dockerPoint);*/
				newDocker.update();
			});
		}		
	}
});

/**
 * Copyright (c) 2008
 * Kai Schlichting
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 **/
Ext.ns("Oryx.Plugins");

ORYX.Plugins.BPMNImport = Clazz.extend({
    converterUrl: ORYX.CONFIG.ROOT_PATH + "bpmn2pn",
    
    // Offers the plugin functionality
    construct: function(facade){
    
        this.facade = facade;
       
        this.importBpmn();
    },
    
    /**
     * General helper method for parsing a param out of current location url
     * E.g. "http://oryx.org?param=value", getParamFromUrl("param") => "value"
     * @param {Object} name
     */
    getParamFromUrl: function(name){
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(window.location.href);
        if (results == null) {
            return null;
        }
        else {
            return results[1];
        }
    },
    
    /**
     * Posts rdf (BPNM) to server and loads erdf (Petri net) into canvas
     * @param {Object} bpmnRdf
     */
    bpmnToPn: function(bpmnRdf){
        Ext.Msg.updateProgress(0.66, ORYX.I18N.BPMN2PNConverter.progress.convertingModel);
        
       Ext.Ajax.request({
            url: this.converterUrl,
            method: 'POST',
            success: function(request){
    	   		try{
	                var parser = new DOMParser();
	                Ext.Msg.updateProgress(1.0, ORYX.I18N.BPMN2PNConverter.progress.renderingModel);
	                var doc = parser.parseFromString(request.responseText, "text/xml");
	                this.facade.importERDF(doc);
    	   		}catch(e){
    	   			Ext.Msg.alert("Rendering Failed :\n"+e);
    	   		}
                Ext.Msg.hide();
            }.createDelegate(this),
            failure: function(){
                Ext.Msg.alert(ORYX.I18N.BPMN2PNConverter.error, ORYX.I18N.BPMN2PNConverter.errors.server);
            },
            params: {
                rdf: bpmnRdf
            }
        });
        
    },
    
    /**
     * Loads rdf of given bpmn url
     */
    importBpmn: function(){
        var importBPMNUrl = this.getParamFromUrl("importBPMN");
        
        if(!importBPMNUrl) return; //return if no model to import is given
        
        Ext.Msg.progress(ORYX.I18N.BPMN2PNConverter.progress.status, 
                         ORYX.I18N.BPMN2PNConverter.progress.importingModel
        );
        Ext.Msg.updateProgress(0.33, ORYX.I18N.BPMN2PNConverter.progress.fetchingModel);
        
        Ext.Ajax.request({
            url: this.getRdfUrl(importBPMNUrl),
            success: function(request){
                var bpmnRdf = request.responseText;
                this.bpmnToPn(bpmnRdf);
            }.createDelegate(this),
            failure: function(request){
                Ext.Msg.alert(ORYX.I18N.BPMN2PNConverter.error, ORYX.I18N.BPMN2PNConverter.errors.noRights)
            },
            method: "GET"
        })
    },
    
    /**
     * getRdfUrl("http://localhost:8080/backend/poem/model/7/self") 
     * => "http://localhost:8080/backend/poem/model/7/rdf"
     * getRdfUrl("http://localhost:8080/backend/poem/model/7/rdf" => "http://localhost:8080/backend/poem/model/7/rdf")
     * @param {String} url
     */
    getRdfUrl: function(url){
        return url.replace(/\/self(\/)?$/, "/rdf")
    }
});

ORYX.Plugins.PNExport = Clazz.extend({
    // Offers the plugin functionality
    construct: function(facade){
    
        this.facade = facade;
       
        this.facade.offer({
            'name': ORYX.I18N.BPMN2PNConverter.name,
            'functionality': this.exportIt.bind(this),
            'group': ORYX.I18N.BPMN2PNConverter.group,
            dropDownGroupIcon: ORYX.PATH + "images/export2.png",
			'icon': ORYX.PATH + "images/page_white_convert.png",
            'description': ORYX.I18N.BPMN2PNConverter.desc,
            'index': 3,
            'minShape': 0,
            'maxShape': 0
        });
    },
    
    exportIt: function(){
        //Throw error if model hasn't been saved before
    	var reqURI='';
		if(!location.hash.slice(1)){
            Ext.Msg.alert(ORYX.I18N.BPMN2PNConverter.error, ORYX.I18N.BPMN2PNConverter.errors.notSaved);
            return;
		}
		else{
			reqURI = '/backend/poem/'+(location.hash.slice(1).replace(/^\/?/,"").replace(/\/?$/,""))+"/rdf";
		}
        
        this.facade.raiseEvent({type: ORYX.Plugins.SyntaxChecker.RESET_ERRORS_EVENT});
        this.facade.raiseEvent({
            type: ORYX.Plugins.SyntaxChecker.CHECK_FOR_ERRORS_EVENT,
            context: "bpmn2pn",
            onNoErrors: function(){
                this.openPetriNetEditor(reqURI);
            }.bind(this)
        });
    },
    
    /**
     * Opens petri net editor with bpmn model import
     * @methodOf: ORYX.Plugins.BPMNImport.prototype
     */
    openPetriNetEditor: function(importUrl){
        window.open("/backend/poem/new?stencilset=/stencilsets/petrinets/petrinet.json&importBPMN=" + importUrl);
    }
});/**
 * Copyright (c) 2009
 * Stefan Krumnow, Ole Eckermann
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 **/

if(!ORYX.Plugins)
	ORYX.Plugins = new Object();

ORYX.Plugins.JPDLSupport = ORYX.Plugins.AbstractPlugin.extend({

	facade: undefined,
	
	
	stencilSetExtensionNamespace: 'http://oryx-editor.org/stencilsets/extensions/jbpm#',
	stencilSetExtensionDefinition: 'jbpm/jbpm.json',
	
	stencilSetNamespace: 'http://b3mn.org/stencilset/bpmn1.1#',
	stencilSetUrlSuffix: '/bpmn1.1/bpmn1.1.json',

	/**
	 * constructor method
	 * 
	 */
	construct: function(facade) {
		
		this.facade = facade;
			
		this.facade.offer({
			'name':				ORYX.I18N.jPDLSupport.exp,
			'functionality': 	this.exportJPDL.bind(this),
			'group': 			ORYX.I18N.jPDLSupport.group,
			'icon': 			ORYX.PATH + "images/jpdl_export_icon.png",
			'description': 		ORYX.I18N.jPDLSupport.expDesc,
            dropDownGroupIcon: ORYX.PATH + "images/export2.png",
			'index': 			1,
			'minShape': 		0,
			'maxShape': 		0,
			'maxShape': 		0,
			'isEnabled': 		this._isJpdlStencilSetExtensionLoaded.bind(this)
		});
					
		this.facade.offer({
			'name':				ORYX.I18N.jPDLSupport.imp,
			'functionality': 	this.importJPDL.bind(this),
			'group': 			ORYX.I18N.jPDLSupport.group,
            dropDownGroupIcon: ORYX.PATH + "images/import.png",
			'icon': 			ORYX.PATH + "images/jpdl_import_icon.png",
			'description': 		ORYX.I18N.jPDLSupport.impDesc,
			'index': 			2,
			'minShape': 		0,
			'maxShape': 		0
		});

	},
	
	/**
	 * Checks if the jPDL stencil set is loaded right now.
	 */
	_isJpdlStencilSetExtensionLoaded: function() {
		return this.isStencilSetExtensionLoaded(this.stencilSetExtensionNamespace);
	},

	/**
	 * Imports jPDL
	 * 
	 */
	importJPDL: function(){
		this._showImportDialog();
	},		

	/**
	 * Exports jPDL
	 * 
	 */
	exportJPDL: function(){
		// raise loading enable event
        this.facade.raiseEvent({
            type: ORYX.CONFIG.EVENT_LOADING_ENABLE
        });
            
		// asynchronously ...
        window.setTimeout((function(){
			
			// ... save synchronously
    		this._doExport();			
			// raise loading disable event.
            this.facade.raiseEvent({
                type: ORYX.CONFIG.EVENT_LOADING_DISABLE
            });
			
        }).bind(this), 10);

		return true;

		
	},
	
	/**
	 * Sends request to a given URL.
	 * 
	 */
	_sendRequest: function( url, method, params, successcallback, failedcallback ){

		var suc = false;

		new Ajax.Request(url, {
           method			: method,
           asynchronous	: false,
           parameters		: params,
		   onSuccess		: function(transport) {
				
				suc = true;
				
				if(successcallback){
					successcallback( transport.responseText )	
				}
				
			}.bind(this),
			
			onFailure		: function(transport) {

				if(failedcallback){
					
					failedcallback();
					
				} else {
					this._showErrorMessageBox(ORYX.I18N.Oryx.title, ORYX.I18N.jPDLSupport.impFailedReq);
					ORYX.log.warn("Import jPDL failed: " + transport.responseText);	
				}
				
			}.bind(this)		
		});
		
		return suc;		
	},
	
	/**
	 * Loads JSON into the editor
	 * 
	 */
	_loadJSON: function( jsonString ){
		
		if (jsonString) {
			var jsonObj = jsonString.evalJSON();
			if( jsonObj && this._hasStencilset(jsonObj) ) {
				if ( this._isJpdlStencilSetExtensionLoaded() ) {
					this.facade.importJSON(jsonString);
				} else {
					Ext.MessageBox.confirm(
						ORYX.I18N.jPDLSupport.loadSseQuestionTitle,
						ORYX.I18N.jPDLSupport.loadSseQuestionBody,
						function(btn){
							if (btn == 'yes') {
								
								if (this.loadStencilSetExtension(this.stencilSetNamespace, this.stencilSetExtensionDefinition)){
									this.facade.importJSON(jsonString);
								} else {
									this._showErrorMessageBox(ORYX.I18N.Oryx.title, ORYX.I18N.jPDLSupport.impFailedJson);
								}
								
							} else {
								this._showErrorMessageBox(ORYX.I18N.Oryx.title, ORYX.I18N.jPDLSupport.impFailedJsonAbort);
							}
						},
						this
					);
				}
				
			} else {
				this._showErrorMessageBox(ORYX.I18N.Oryx.title, ORYX.I18N.jPDLSupport.impFailedJson);
			}
		} else {
			this._showErrorMessageBox(ORYX.I18N.Oryx.title, ORYX.I18N.jPDLSupport.impFailedJson);
		}
	},
	
	loadStencilSetExtension: function(stencilSetNamespace, stencilSetExtensionDefinition) {
		var stencilset = this.facade.getStencilSets()[stencilSetNamespace];
		if (stencilset) {
			stencilset.addExtension(ORYX.CONFIG.SS_EXTENSIONS_FOLDER + stencilSetExtensionDefinition);
			this.facade.getRules().initializeRules(stencilset);
			this.facade.raiseEvent({type: ORYX.CONFIG.EVENT_STENCIL_SET_LOADED});
			return true;
		} 
		return false;
	},
	
	/**
	 * Checks if a json object references the jPDL stencil set extension.
	 * 
	 */
	_hasStencilset: function( jsonObj ){
		return jsonObj.properties.ssextension == this.stencilSetExtensionNamespace && jsonObj.stencilset.url.endsWith(this.stencilSetUrlSuffix);
	},
	

	/**
	 * Opens an export window / tab.
	 * 
	 */
	_doExport: function(){
		var serialized_json = this.facade.getSerializedJSON();

		this._sendRequest(
			ORYX.CONFIG.JPDLEXPORTURL,
			'POST',
			{ data:serialized_json },
			function( result ) { 
				var parser = new DOMParser();
				var parsedResult = parser.parseFromString(result, "text/xml");
				if (parsedResult.firstChild.localName == "error") {
					this._showErrorMessageBox(ORYX.I18N.Oryx.title, ORYX.I18N.jPDLSupport.expFailedXml + parsedResult.firstChild.firstChild.data);
				} else {
					this.openXMLWindow(result);
				}
			}.bind(this),
			function() { 
				this._showErrorMessageBox(ORYX.I18N.Oryx.title, ORYX.I18N.jPDLSupport.expFailedReq);
		 	}.bind(this)
		)
	}, 
	
	/**
	 * Opens a upload dialog.
	 * 
	 */
	_showImportDialog: function( successCallback ){
	
	    var form = new Ext.form.FormPanel({
			baseCls: 		'x-plain',
	        labelWidth: 	50,
	        defaultType: 	'textfield',
	        items: [{
	            text : 		ORYX.I18N.jPDLSupport.selectFile, 
				style : 	'font-size:12px;margin-bottom:10px;display:block;',
	            anchor:		'100%',
				xtype : 	'label' 
	        },{
	            fieldLabel: ORYX.I18N.jPDLSupport.file,
	            name: 		'subject',
				inputType : 'file',
				style : 	'margin-bottom:10px;display:block;',
				itemCls :	'ext_specific_window_overflow'
	        }, {
	            xtype: 'textarea',
	            hideLabel: true,
	            name: 'msg',
	            anchor: '100% -63'  
	        }]
	    });

		// Create the panel
		var dialog = new Ext.Window({ 
			autoCreate: true, 
			layout: 	'fit',
			plain:		true,
			bodyStyle: 	'padding:5px;',
			title: 		ORYX.I18N.jPDLSupport.impJPDL, 
			height: 	350, 
			width:		500,
			modal:		true,
			fixedcenter:true, 
			shadow:		true, 
			proxyDrag: 	true,
			resizable:	true,
			items: 		[form],
			buttons:[
				{
					text:ORYX.I18N.jPDLSupport.impBtn,
					handler:function(){
						
						var loadMask = new Ext.LoadMask(Ext.getBody(), {msg:ORYX.I18N.jPDLSupport.impProgress});
						loadMask.show();
						
						window.setTimeout(function(){
					
							var jpdlString =  form.items.items[2].getValue();
							
							this._sendRequest(
									ORYX.CONFIG.JPDLIMPORTURL,
									'POST',
									{ 'data' : jpdlString },
									function( arg ) { this._loadJSON( arg );  loadMask.hide();  dialog.hide(); }.bind(this),
									function() { loadMask.hide();  dialog.hide(); }.bind(this)
								);

						}.bind(this), 100);
			
					}.bind(this)
				},{
					text:ORYX.I18N.jPDLSupport.close,
					handler:function(){
						
						dialog.hide();
					
					}.bind(this)
				}
			]
		});
		
		// Destroy the panel when hiding
		dialog.on('hide', function(){
			dialog.destroy(true);
			delete dialog;
		});


		// Show the panel
		dialog.show();
		
				
		// Adds the change event handler to 
		form.items.items[1].getEl().dom.addEventListener('change',function(evt){
				var text = evt.target.files[0].getAsText('UTF-8');
				form.items.items[2].setValue( text );
			}, true)

	},
	
	_showErrorMessageBox: function(title, msg){
        Ext.MessageBox.show({
           title: title,
           msg: msg,
           buttons: Ext.MessageBox.OK,
           icon: Ext.MessageBox.ERROR
       });
	}
	
});/**
 * Copyright (c) 2009
 * Armin Zamani
 **/

if (!ORYX.Plugins) 
    ORYX.Plugins = new Object();

ORYX.Plugins.BPMN2YAWLMapper = ORYX.Plugins.AbstractPlugin.extend({
	stencilSetExtensionNamespace: "http://oryx-editor.org/stencilsets/extensions/bpmn4yawlSubset#",

	construct: function(){
		arguments.callee.$.construct.apply(this, arguments);
		
        this.active = false;
        this.raisedEventIds = [];
		
		this.facade.offer({
			'name': ORYX.I18N.BPMN2YAWLMapper.name,
			'functionality': this.perform.bind(this),
			'group': ORYX.I18N.BPMN2YAWLMapper.group,
			'icon': ORYX.PATH + 'images/door.png',
			'description': ORYX.I18N.BPMN2YAWLMapper.desc,
            dropDownGroupIcon: ORYX.PATH + "images/export2.png",
			'index': 1,
			'minShape': 0,
			'maxShape': 0,
			'isEnabled': 		this._isStencilSetExtensionLoaded.bind(this)

		});
		
        this.facade.registerOnEvent(ORYX.Plugins.BPMN2YAWLMapper.RESET_ERRORS_EVENT, this.resetErrors.bind(this));
        this.facade.registerOnEvent(ORYX.Plugins.BPMN2YAWLMapper.SHOW_ERRORS_EVENT, this.doShowErrors.bind(this));
	},
	_isStencilSetExtensionLoaded: function() {
		return this.isStencilSetExtensionLoaded(this.stencilSetExtensionNamespace);
	},
	perform: function(button, pressed){
		this.resetErrors();
		this.checkSyntaxAndMapBPMNtoYAWL({
			onMappingSucceeded: function(){
			this.setActivated(false);

			Ext.Msg.alert("The BPMN to YAWL mapper succeeded and has created an YAWL file in your Eclipse directory");
		},
		onErrors: function(){
		},
		onFailure: function(){
			this.setActivated(false);
			Ext.Msg.alert("The connection to the server failed");
		}
		});
	},
	
	/**
     * Sets the activated state of the plugin
     * @param {Object} activated
     */
    setActivated: function(activated){
        if(activated === undefined){
            this.active = !this.active;
        } else {
            this.active = activated;
        }
    },
	
	checkSyntaxAndMapBPMNtoYAWL: function(options){
		Ext.applyIf(options || {}, {
	          showErrors: true,
	          ononMappingSucceeded: Ext.emptyFn,
	          onErrors: Ext.emptyFn,
	          onFailure: Ext.emptyFn
	        });
		
		var data = this.getRDFFromDOM();
		this.openDownload(ORYX.CONFIG.BPMN2YAWL_URL,data);
//		new Ajax.Request(ORYX.CONFIG.BPMN2YAWL_URL, {
//			method: 'POST',
//			asynchronous: false,
//			parameters : {
//				data: data
//			},
//			onSuccess: function(request){
//				var resp = request.responseText.evalJSON();
//				
//				Ext.Msg.hide();
//				
//				if (resp instanceof Object) {
//					resp = $H(resp)
//					if (resp.size() > 0) {
//						if(options.showErrors) this.showErrors(resp);
//						options.onErrors();
//					}
//					else {
//						Ext.Msg.alert("Mapping succeeded");
//						options.onMappingSucceeded();
//					}
//				}
//				else {
//					options.onFailure();
//				}
//			}.bind(this),
//			onFailure: function(){
//				Ext.Msg.hide();
//				options.onFailure();
//			}
//		});
	},
	
	/** Called on SHOW_ERRORS_EVENT.
     * 
     * @param {Object} event
     * @param {Object} args
     */
    doShowErrors: function(event, args){
        this.showErrors(event.errors);
    },
    
    /**
     * Shows overlays for each given error
     * @methodOf ORYX.Plugins.BPMN2YAWLMapper.prototype
     * @param {Hash|Object} errors
     * @example
     * showErrors({
     *     myShape1: "This has an error!",
     *     myShape2: "Another error!"
     * })
     */
    showErrors: function(errors){
        // If normal object is given, convert to hash
        if(!(errors instanceof Hash)){
            errors = new Hash(errors);
        }
        
        // Get all Valid ResourceIDs and collect all shapes
        errors.keys().each(function(value){
            var sh = this.facade.getCanvas().getChildShapeByResourceId(value);
            if (sh) {
                this.raiseOverlay(sh, errors[value]);
            }
        }.bind(this));
        //this.active = !this.active;
    },
    
    /**
     * Resets all (displayed) errors
     * @methodOf ORYX.Plugins.BPMN2YAWLMapper.prototype
     */
    resetErrors: function(){
        this.raisedEventIds.each(function(id){
            this.facade.raiseEvent({
                type: ORYX.CONFIG.EVENT_OVERLAY_HIDE,
                id: id
            });
        }.bind(this))
        
        this.raisedEventIds = [];
        this.active = false;
    },
    
    raiseOverlay: function(shape, errorMsg){
        var id = "syntaxchecker." + this.raisedEventIds.length;
        var crossId = ORYX.Editor.provideId();
        var cross = ORYX.Editor.graft("http://www.w3.org/2000/svg", null, ['path', {
        	"id":crossId,
        	"title": errorMsg,
            "stroke-width": 5.0,
            "stroke": "red",
            "d": "M20,-5 L5,-20 M5,-5 L20,-20",
            "line-captions": "round"
        }]);
        
        this.facade.raiseEvent({
            type: ORYX.CONFIG.EVENT_OVERLAY_SHOW,
            id: id,
            shapes: [shape],
            node: cross,
            nodePosition: shape instanceof ORYX.Core.Edge ? "START" : "NW"
        });
        
        this.raisedEventIds.push(id);
        
        return cross;
    },
	openDownload: function(url, content) {
		var win = window.open("");
		if (win != null) {
			win.document.open();
			win.document.write("<html><body>");
			var submitForm = win.document.createElement("form");
			win.document.body.appendChild(submitForm);
			
			var createHiddenElement = function(name, value) {
				var newElement = document.createElement("input");
				newElement.name=name;
				newElement.type="hidden";
				newElement.value = value;
				return newElement
			}
			
			submitForm.appendChild( createHiddenElement("data", content) );
			
			
			submitForm.method = "POST";
			win.document.write("</body></html>");
			win.document.close();
			submitForm.action= url;
			submitForm.submit();
			window.setTimeout(function(){
				win.close();
			}.bind(this), 1000);
		}		
	}
});

//Define the events
ORYX.Plugins.BPMN2YAWLMapper.RESET_ERRORS_EVENT = "resetErrors";
ORYX.Plugins.BPMN2YAWLMapper.SHOW_ERRORS_EVENT = "showErrors";/**
 * Copyright (c) 2010 Emilian Pascalau and Ahmed Awad

 * 
 * WARNING THIS IS ONLY TO PROVE A CONCEPT!!!! NOT TO BE USED IN PRODUCTION
 * ENVIRONMENT!!!!
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
if (!ORYX.Plugins) 
    ORYX.Plugins = new Object();

ORYX.Plugins.CreateProcessVariant = ORYX.Plugins.AbstractPlugin.extend({

    facade: undefined,
    
    // processGraph:undefined,
    
    construct: function(facade){
		
        this.facade = facade;
        
        this.active 		= false;
        this.raisedEventIds = [];
		
				
        this.createModel();
		
    },
    
    createModel:function(){
    	
    	   	
        if(oryxCreator1283772618640){
    			
            var respXML=oryxCreator1283772618640.variant;
    				
            var root=respXML.firstChild;
            var pg=root.getElementsByTagName("ProcessGraph");
            var processGraphElements=pg.item(0).childNodes;
                
            var posx=-30;
            var processGraphXML=new Array();
            var processGraphShape=new Array();
                
            for(var i=0;i<processGraphElements.length;i++){
                
                var ce=processGraphElements[i];
                if(ce.nodeName=="Activity" || ce.nodeName=="Gateway" || ce.nodeName=="Event" ){
                    posx=posx+150;
                	
                    var shape=this.drawNode(ce,posx);
                    processGraphXML.push(ce);
                    processGraphShape.push(shape);
                }
                	
                //it is assumed that all sequenceFlows are at the end
                if(ce.nodeName=="SequenceFlow"){
                    var fId=this.getSequenceFlowFrom(ce);
                		
                    var from=this.getShapeById(fId,processGraphXML,processGraphShape);
                    //                		alert(from);
                    //
                		
                    var tId=this.getSequenceFlowTo(ce);
                		
                    var to=this.getShapeById(tId,processGraphXML,processGraphShape);
                    //                		alert(to);
                		
                    shape=this.drawSequenceFlow(from,to);
                		
                    processGraphXML.push(ce);
                    processGraphShape.push(shape);
                		
                }
                	
            }
                
        // alert(processGraphXML.length);
        // alert(processGraphShape.length);
                
    

        // this.drawShape();
                
        }
    	
    },
    
    drawNode:function(element, posX){

        var parentShape=this.facade.getCanvas();
        var newShape;
    	
    	
        var pos={};
        pos['x']=posX;
        pos['y']=0;
    	
        var ssn 	= this.facade.getStencilSets().keys()[0];
        var stencil;
        if(element.nodeName=="Activity"){
    	
    							
            stencil = ORYX.Core.StencilSet.stencil(ssn + "Task");
    		
            //    	var option = {
            //				type:"http://b3mn.org/stencilset/bpmn1.1#Task",
            //				position:pos,
            //				namespace:parentShape.getStencil().namespace(),
            //				parent:parentShape
            //		};
            //newShape=this.facade.createShape(option);
    	
            newShape=new ORYX.Core.Node({
                'eventHandlerCallback':this.facade.raiseEvent
            },stencil);
    	
            //    	newShape.resourceId=element.getAttributeNode("id").nodeValue;
            var label=element.getAttributeNode("label").nodeValue;
            // alert(label);
    
            newShape.setProperty("oryx-name",label);
            this.facade.getCanvas().add(newShape);
        //this.facade.getCanvas().update();
        }
    	
        // deal with Events
        if(element.nodeName=="Event"){
        	
            var type2=element.getAttributeNode("type2").nodeValue;
            var type2LastChar=type2[type2.length-1];
            var eventType=type2.substring(0,type2.length-1);
            
//            alert("eventType "+eventType);

            
    		
            if(type2LastChar==1){
    		
                if(eventType=="MessageEvent"){
                    stencil = ORYX.Core.StencilSet.stencil(ssn + "StartMessageEvent");
                    newShape=new ORYX.Core.Node({
                        'eventHandlerCallback':this.facade.raiseEvent
                    },stencil);
                }
                else
                if(eventType=="TimerEvent"){
                    stencil = ORYX.Core.StencilSet.stencil(ssn + "StartTimerEvent");
                    newShape=new ORYX.Core.Node({
                        'eventHandlerCallback':this.facade.raiseEvent
                    },stencil);
                }else
                if(eventType=="ConditionalEvent"){
                    stencil = ORYX.Core.StencilSet.stencil(ssn + "StartConditionalEvent");
                    newShape=new ORYX.Core.Node({
                        'eventHandlerCallback':this.facade.raiseEvent
                    },stencil);
                }else
                if(eventType=="SignalEvent"){
                    stencil = ORYX.Core.StencilSet.stencil(ssn + "StartSignalEvent");
                    newShape=new ORYX.Core.Node({
                        'eventHandlerCallback':this.facade.raiseEvent
                    },stencil);
                }else
                if(eventType=="MultipleEvent"){
                    stencil = ORYX.Core.StencilSet.stencil(ssn + "StartMultipleEvent");
                    newShape=new ORYX.Core.Node({
                        'eventHandlerCallback':this.facade.raiseEvent
                    },stencil);
                }else
                {
                    stencil = ORYX.Core.StencilSet.stencil(ssn + "StartEvent");
                    newShape=new ORYX.Core.Node({
                        'eventHandlerCallback':this.facade.raiseEvent
                    },stencil);
                }
            }
    		
            if(type2LastChar==2){

               
                if(eventType=="MessageEventCatching"){
                    stencil = ORYX.Core.StencilSet.stencil(ssn + "IntermediateMessageEventCatching");
                    newShape=new ORYX.Core.Node({
                        'eventHandlerCallback':this.facade.raiseEvent
                    },stencil);
                }else
                if(eventType=="MessageEventThrowing"){
                    stencil = ORYX.Core.StencilSet.stencil(ssn + "IntermediateMessageEventThrowing");
                    newShape=new ORYX.Core.Node({
                        'eventHandlerCallback':this.facade.raiseEvent
                    },stencil);
                }else
                if(eventType=="TimerEvent"){
                    stencil = ORYX.Core.StencilSet.stencil(ssn + "IntermediateTimerEvent");
                    newShape=new ORYX.Core.Node({
                        'eventHandlerCallback':this.facade.raiseEvent
                    },stencil);
                }else
                if(eventType=="ErrorEvent"){
                    stencil = ORYX.Core.StencilSet.stencil(ssn + "IntermediateErrorEvent");
                    newShape=new ORYX.Core.Node({
                        'eventHandlerCallback':this.facade.raiseEvent
                    },stencil);
                }else
                if(eventType=="CancelEvent"){
                    stencil = ORYX.Core.StencilSet.stencil(ssn + "IntermediateCancelEvent");
                    newShape=new ORYX.Core.Node({
                        'eventHandlerCallback':this.facade.raiseEvent
                    },stencil);
                }else
                if(eventType=="CompensationEventCatching"){
                    stencil = ORYX.Core.StencilSet.stencil(ssn + "IntermediateCompensationEventCatching");
                    newShape=new ORYX.Core.Node({
                        'eventHandlerCallback':this.facade.raiseEvent
                    },stencil);
                }else
                if(eventType=="CompensationEventThrowing"){
                    stencil = ORYX.Core.StencilSet.stencil(ssn + "IntermediateCompensationEventThrowing");
                    newShape=new ORYX.Core.Node({
                        'eventHandlerCallback':this.facade.raiseEvent
                    },stencil);
                }else
                if(eventType=="ConditionalEvent"){
                    stencil = ORYX.Core.StencilSet.stencil(ssn + "IntermediateConditionalEvent");
                    newShape=new ORYX.Core.Node({
                        'eventHandlerCallback':this.facade.raiseEvent
                    },stencil);
                }else
                if(eventType=="SignalEventCatching"){
                    stencil = ORYX.Core.StencilSet.stencil(ssn + "IntermediateSignalEventCatching");
                    newShape=new ORYX.Core.Node({
                        'eventHandlerCallback':this.facade.raiseEvent
                    },stencil);
                }else
                if(eventType=="SignalEventThrowing"){
                    stencil = ORYX.Core.StencilSet.stencil(ssn + "IntermediateSignalEventThrowing");
                    newShape=new ORYX.Core.Node({
                        'eventHandlerCallback':this.facade.raiseEvent
                    },stencil);
                }else
                if(eventType=="MultipleEventCatching"){
                    stencil = ORYX.Core.StencilSet.stencil(ssn + "IntermediateMultipleEventCatching");
                    newShape=new ORYX.Core.Node({
                        'eventHandlerCallback':this.facade.raiseEvent
                    },stencil);
                }else
                if(eventType=="MultipleEventThrowing"){
                    stencil = ORYX.Core.StencilSet.stencil(ssn + "IntermediateMultipleEventThrowing");
                    newShape=new ORYX.Core.Node({
                        'eventHandlerCallback':this.facade.raiseEvent
                    },stencil);
                }else
                if(eventType=="LinkEventCatching"){
                    stencil = ORYX.Core.StencilSet.stencil(ssn + "IntermediateLinkEventCatching");
                    newShape=new ORYX.Core.Node({
                        'eventHandlerCallback':this.facade.raiseEvent
                    },stencil);
                }else
                if(eventType=="LinkEventThrowing"){
                    stencil = ORYX.Core.StencilSet.stencil(ssn + "IntermediateLinkEventThrowing");
                    newShape=new ORYX.Core.Node({
                        'eventHandlerCallback':this.facade.raiseEvent
                    },stencil);
                }else
                {
                    stencil = ORYX.Core.StencilSet.stencil(ssn + "IntermediateEvent");
                    newShape=new ORYX.Core.Node({
                        'eventHandlerCallback':this.facade.raiseEvent
                    },stencil);
                }

                
            }
    		
            if(type2LastChar==3){

              
                if(eventType=="MessageEvent"){
                    stencil = ORYX.Core.StencilSet.stencil(ssn + "EndMessageEvent");
                    newShape=new ORYX.Core.Node({
                        'eventHandlerCallback':this.facade.raiseEvent
                    },stencil);
                }else
                if(eventType=="ErrorEvent"){
                    stencil = ORYX.Core.StencilSet.stencil(ssn + "EndErrorEvent");
                    newShape=new ORYX.Core.Node({
                        'eventHandlerCallback':this.facade.raiseEvent
                    },stencil);
                }else
                if(eventType=="CancelEvent"){
                    stencil = ORYX.Core.StencilSet.stencil(ssn + "EndCancelEvent");
                    newShape=new ORYX.Core.Node({
                        'eventHandlerCallback':this.facade.raiseEvent
                    },stencil);
                }else
                if(eventType=="CompensationEvent"){
                    stencil = ORYX.Core.StencilSet.stencil(ssn + "EndCompensationEvent");
                    newShape=new ORYX.Core.Node({
                        'eventHandlerCallback':this.facade.raiseEvent
                    },stencil);
                }else
                if(eventType=="SignalEvent"){
                    stencil = ORYX.Core.StencilSet.stencil(ssn + "EndSignalEvent");
                    newShape=new ORYX.Core.Node({
                        'eventHandlerCallback':this.facade.raiseEvent
                    },stencil);
                }else
                if(eventType=="MultipleEvent"){
                    stencil = ORYX.Core.StencilSet.stencil(ssn + "EndMultipleEvent");
                    newShape=new ORYX.Core.Node({
                        'eventHandlerCallback':this.facade.raiseEvent
                    },stencil);
                }else
                if(eventType=="Terminate"){
                    stencil = ORYX.Core.StencilSet.stencil(ssn + "EndTerminateEvent");
                    newShape=new ORYX.Core.Node({
                        'eventHandlerCallback':this.facade.raiseEvent
                    },stencil);
                }else
                {
                    stencil = ORYX.Core.StencilSet.stencil(ssn + "EndEvent");
                    newShape=new ORYX.Core.Node({
                        'eventHandlerCallback':this.facade.raiseEvent
                    },stencil);                    
                }              
            	
            }  		
    		
            // var label=element.getAttributeNode("label").nodeValue;
            // newShape.setProperty("oryx-name",label);
            this.facade.getCanvas().add(newShape);
    		
        }
    	
        // deal with gateways
        if(element.nodeName=="Gateway"){
            var type2=element.getAttributeNode("type2").nodeValue;
    		
    		
    		
            if(type2.indexOf("XOR")>=0){
   		
                stencil = ORYX.Core.StencilSet.stencil(ssn + "Exclusive_Databased_Gateway");
                newShape=new ORYX.Core.Node({
                    'eventHandlerCallback':this.facade.raiseEvent
                },stencil);
            	
            }
    	

            if(type2.indexOf("OR")>=0 && type2.indexOf("XOR")==-1){
        		
            	
                stencil = ORYX.Core.StencilSet.stencil(ssn + "OR_Gateway");
                newShape=new ORYX.Core.Node({
                    'eventHandlerCallback':this.facade.raiseEvent
                },stencil);
            	
            }
    		
            if(type2.indexOf("AND")>=0 ){
        		          	
                stencil = ORYX.Core.StencilSet.stencil(ssn + "AND_Gateway");
                newShape=new ORYX.Core.Node({
                    'eventHandlerCallback':this.facade.raiseEvent
                },stencil);
            	
            }
    		
            // var label=element.getAttributeNode("label").nodeValue;
            // newShape.setProperty("oryx-name",label);
            this.facade.getCanvas().add(newShape);
    		
        }
    	
   	
        return newShape;
    	
    },
    
    getSequenceFlowFrom:function(sequenceFlow){
        var efrom=sequenceFlow.getAttributeNode("from").nodeValue;
    	
        var pos=efrom.indexOf("#");
        var type=efrom.substring(0,pos);
        var shapeId=efrom.substring(pos,efrom.length);
    	
        var from={};
        from['type']=type;
        from['shapeId']=shapeId;
    	
        //    	return from;
        return shapeId;
    },
    
    getSequenceFlowTo:function(sequenceFlow){
        var eto=sequenceFlow.getAttributeNode("to").nodeValue;
        ;
    	
        var pos=eto.indexOf("#");
        var type=eto.substring(0,pos);
        var shapeId=eto.substring(pos,eto.length);
    	
        var to={};
        to['type']=type;
        to['shapeId']=shapeId;
    	
        //    	return to;
        return shapeId;
    	
    },
    
    getShapeById:function(id,processGraphXML,processGraphShape){
        var pos=-1;
    	
        for(var k=0;k<processGraphXML.length;k++){
            var ce=processGraphXML[k];
            var ok=false;
            var ceId=ce.getAttributeNode("id").nodeValue;
            if (ceId==id){
                pos=k;
                ok=true;
            }
            if(ok) break;
    		
        }
        return processGraphShape[pos];
    },
    
    //from and to are shapes
    drawSequenceFlow:function(from,to){
    	
        //    	alert(from);
        //    	alert(to);
    	
        var newSequenceFlow;
        var parentShape=this.facade.getCanvas();
    	
        var ssn 	= this.facade.getStencilSets().keys()[0];
        var stencil = ORYX.Core.StencilSet.stencil(ssn + "SequenceFlow");
   	
        newSequenceFlow=new ORYX.Core.Edge({
            'eventHandlerCallback':this.facade.raiseEvent
        },stencil);
        ;
    	
        // Set the docker
        newSequenceFlow.dockers.first().setDockedShape( from );
        newSequenceFlow.dockers.first().setReferencePoint({
            x: from.bounds.width() / 2.0,
            y: from.bounds.height() / 2.0
        });
    	
        newSequenceFlow.dockers.last().setDockedShape( to );
        newSequenceFlow.dockers.last().setReferencePoint({
            x: to.bounds.width() / 2.0,
            y: to.bounds.height() / 2.0
        });
		
        //
        this.facade.getCanvas().add(newSequenceFlow);
        return newSequenceFlow;
    }
    
    
});



/**
 * Copyright (c) 2006
 * Martin Czuchra, Nicolas Peters, Daniel Polak, Willi Tscheschner
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 **/


if(!ORYX.Plugins) {
	ORYX.Plugins = new Object();
}

ORYX.Plugins.PropertyWindow = {

	facade: undefined,

	construct: function(facade) {
		// Reference to the Editor-Interface
		this.facade = facade;

		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_SHOW_PROPERTYWINDOW, this.init.bind(this));
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_LOADED, this.selectDiagram.bind(this));
		this.init();
	},
	
	init: function(){

		// The parent div-node of the grid
		this.node = ORYX.Editor.graft("http://www.w3.org/1999/xhtml",
			null,
			['div']);

		// If the current property in focus is of type 'Date', the date format
		// is stored here.
		this.currentDateFormat;

		// the properties array
		this.popularProperties = [];
		this.properties = [];
		
		/* The currently selected shapes whos properties will shown */
		this.shapeSelection = new Hash();
		this.shapeSelection.shapes = new Array();
		this.shapeSelection.commonProperties = new Array();
		this.shapeSelection.commonPropertiesValues = new Hash();
		
		this.updaterFlag = false;

		// creating the column model of the grid.
		this.columnModel = new Ext.grid.ColumnModel([
			{
				//id: 'name',
				header: ORYX.I18N.PropertyWindow.name,
				dataIndex: 'name',
				width: 90,
				sortable: true,
				renderer: this.tooltipRenderer.bind(this)
			}, {
				//id: 'value',
				header: ORYX.I18N.PropertyWindow.value,
				dataIndex: 'value',
				id: 'propertywindow_column_value',
				width: 110,
				editor: new Ext.form.TextField({
					allowBlank: false
				}),
				renderer: this.renderer.bind(this)
			},
			{
				header: "Pop",
				dataIndex: 'popular',
				hidden: true,
				sortable: true
			}
		]);

		// creating the store for the model.
        this.dataSource = new Ext.data.GroupingStore({
			proxy: new Ext.data.MemoryProxy(this.properties),
			reader: new Ext.data.ArrayReader({}, [
				{name: 'popular'},
				{name: 'name'},
				{name: 'value'},
				{name: 'icons'},
				{name: 'gridProperties'}
			]),
			sortInfo: {field: 'popular', direction: "ASC"},
			sortData : function(f, direction){
		        direction = direction || 'ASC';
		        var st = this.fields.get(f).sortType;
		        var fn = function(r1, r2){
		            var v1 = st(r1.data[f]), v2 = st(r2.data[f]);
					var p1 = r1.data['popular'], p2  = r2.data['popular'];
		            return p1 && !p2 ? -1 : (!p1 && p2 ? 1 : (v1 > v2 ? 1 : (v1 < v2 ? -1 : 0)));
		        };
		        this.data.sort(direction, fn);
		        if(this.snapshot && this.snapshot != this.data){
		            this.snapshot.sort(direction, fn);
				}
		    },
			groupField: 'popular'
        });
		this.dataSource.load();
		
		this.grid = new Ext.grid.EditorGridPanel({
			clicksToEdit: 1,
			stripeRows: true,
			autoExpandColumn: "propertywindow_column_value",
			width:'auto',
			// the column model
			colModel: this.columnModel,
			enableHdMenu: false,
			view: new Ext.grid.GroupingView({
				forceFit: true,
				groupTextTpl: '{[values.rs.first().data.popular ? ORYX.I18N.PropertyWindow.oftenUsed : ORYX.I18N.PropertyWindow.moreProps]}'
			}),
			
			// the data store
			store: this.dataSource
			
		});

		region = this.facade.addToRegion('east', new Ext.Panel({
			width: 220,
			layout: "fit",
			border: false,
			title: 'Properties',
			items: [
				this.grid 
			]
		}), ORYX.I18N.PropertyWindow.title)

		// Register on Events
		this.grid.on('beforeedit', this.beforeEdit, this, true);
		this.grid.on('afteredit', this.afterEdit, this, true);
		this.grid.view.on('refresh', this.hideMoreAttrs, this, true);
		
		//this.grid.on(ORYX.CONFIG.EVENT_KEYDOWN, this.keyDown, this, true);
		
		// Renderer the Grid
		this.grid.enableColumnMove = false;
		//this.grid.render();

		// Sort as Default the first column
		//this.dataSource.sort('name');

	},
	
	// Select the Canvas when the editor is ready
	selectDiagram: function() {
		this.shapeSelection.shapes = [this.facade.getCanvas()];
		
		this.setPropertyWindowTitle();
		this.identifyCommonProperties();
		this.createProperties();
	},

	specialKeyDown: function(field, event) {
		// If there is a TextArea and the Key is an Enter
		if(field instanceof Ext.form.TextArea && event.button == ORYX.CONFIG.KEY_Code_enter) {
			// Abort the Event
			return false
		}
	},
	tooltipRenderer: function(value, p, record) {
		/* Prepare tooltip */
		p.cellAttr = 'title="' + record.data.gridProperties.tooltip + '"';
		return value;
	},
	
	renderer: function(value, p, record) {
		
		this.tooltipRenderer(value, p, record);
				
		if(value instanceof Date) {
			// TODO: Date-Schema is not generic
			value = value.dateFormat(ORYX.I18N.PropertyWindow.dateFormat);
		} else if(String(value).search("<a href='") < 0) {
			// Shows the Value in the Grid in each Line
			value = String(value).gsub("<", "&lt;");
			value = String(value).gsub(">", "&gt;");
			value = String(value).gsub("%", "&#37;");
			value = String(value).gsub("&", "&amp;");

			if(record.data.gridProperties.type == ORYX.CONFIG.TYPE_COLOR) {
				value = "<div class='prop-background-color' style='background-color:" + value + "' />";
			}			

			record.data.icons.each(function(each) {
				if(each.name == value) {
					if(each.icon) {
						value = "<img src='" + each.icon + "' /> " + value;
					}
				}
			});
		}

		return value;
	},

	beforeEdit: function(option) {

		var editorGrid 		= this.dataSource.getAt(option.row).data.gridProperties.editor;
		var editorRenderer 	= this.dataSource.getAt(option.row).data.gridProperties.renderer;

		if(editorGrid) {
			// Disable KeyDown
			this.facade.disableEvent(ORYX.CONFIG.EVENT_KEYDOWN);

			option.grid.getColumnModel().setEditor(1, editorGrid);
			
			editorGrid.field.row = option.row;
			// Render the editor to the grid, therefore the editor is also available 
			// for the first and last row
			editorGrid.render(this.grid);
			
			//option.grid.getColumnModel().setRenderer(1, editorRenderer);
			editorGrid.setSize(option.grid.getColumnModel().getColumnWidth(1), editorGrid.height);
		} else {
			return false;
		}
		
		var key = this.dataSource.getAt(option.row).data.gridProperties.propId;
		
		this.oldValues = new Hash();
		this.shapeSelection.shapes.each(function(shape){
			this.oldValues[shape.getId()] = shape.properties[key];
		}.bind(this)); 
	},

	afterEdit: function(option) {
		//Ext1.0: option.grid.getDataSource().commitChanges();
		option.grid.getStore().commitChanges();

		var key 			 = option.record.data.gridProperties.propId;
		var selectedElements = this.shapeSelection.shapes;
		
		var oldValues 	= this.oldValues;	
		
		var newValue	= option.value;
		var facade		= this.facade;
		

		// Implement the specific command for property change
		var commandClass = ORYX.Core.Command.extend({
			construct: function(){
				this.key 		= key;
				this.selectedElements = selectedElements;
				this.oldValues = oldValues;
				this.newValue 	= newValue;
				this.facade		= facade;
			},			
			execute: function(){
				this.selectedElements.each(function(shape){
					if(!shape.getStencil().property(this.key).readonly()) {
						shape.setProperty(this.key, this.newValue);
					}
				}.bind(this));
				this.facade.setSelection(this.selectedElements);
				this.facade.getCanvas().update();
				this.facade.updateSelection();
			},
			rollback: function(){
				this.selectedElements.each(function(shape){
					shape.setProperty(this.key, this.oldValues[shape.getId()]);
				}.bind(this));
				this.facade.setSelection(this.selectedElements);
				this.facade.getCanvas().update();
				this.facade.updateSelection();
			}
		})		
		// Instanciated the class
		var command = new commandClass();
		
		// Execute the command
		this.facade.executeCommands([command]);


		// extended by Kerstin (start)
//
		this.facade.raiseEvent({
			type 		: ORYX.CONFIG.EVENT_PROPWINDOW_PROP_CHANGED, 
			elements	: selectedElements,
			key			: key,
			value		: option.value
		});
		// extended by Kerstin (end)
	},
	
	// Cahnges made in the property window will be shown directly
	editDirectly:function(key, value){
		
		this.shapeSelection.shapes.each(function(shape){
			if(!shape.getStencil().property(key).readonly()) {
				shape.setProperty(key, value);
				//shape.update();
			}
		}.bind(this));
		
		/* Propagate changed properties */
		var selectedElements = this.shapeSelection.shapes;
		
		this.facade.raiseEvent({
			type 		: ORYX.CONFIG.EVENT_PROPWINDOW_PROP_CHANGED, 
			elements	: selectedElements,
			key			: key,
			value		: value
		});

		this.facade.getCanvas().update();
		
	},
	
	// if a field becomes invalid after editing the shape must be restored to the old value
	updateAfterInvalid : function(key) {
		this.shapeSelection.shapes.each(function(shape) {
			if(!shape.getStencil().property(key).readonly()) {
				shape.setProperty(key, this.oldValues[shape.getId()]);
				shape.update();
			}
		}.bind(this));
		
		this.facade.getCanvas().update();
	},

	// extended by Kerstin (start)	
	dialogClosed: function(data) {
		var row = this.field ? this.field.row : this.row 
		this.scope.afterEdit({
			grid:this.scope.grid, 
			record:this.scope.grid.getStore().getAt(row), 
			//value:this.scope.grid.getStore().getAt(this.row).get("value")
			value: data
		})
		// reopen the text field of the complex list field again
		this.scope.grid.startEditing(row, this.col);
	},
	// extended by Kerstin (end)
	
	/**
	 * Changes the title of the property window panel according to the selected shapes.
	 */
	setPropertyWindowTitle: function() {
		if(this.shapeSelection.shapes.length == 1) {
			// add the name of the stencil of the selected shape to the title
				region.setTitle(ORYX.I18N.PropertyWindow.title +' ('+this.shapeSelection.shapes.first().getStencil().title()+')' );
		} else {
			region.setTitle(ORYX.I18N.PropertyWindow.title +' ('
							+ this.shapeSelection.shapes.length
							+ ' '
							+ ORYX.I18N.PropertyWindow.selected 
							+')');
		}
	},
	/**
	 * Sets this.shapeSelection.commonPropertiesValues.
	 * If the value for a common property is not equal for each shape the value
	 * is left empty in the property window.
	 */
	setCommonPropertiesValues: function() {
		this.shapeSelection.commonPropertiesValues = new Hash();
		this.shapeSelection.commonProperties.each(function(property){
			var key = property.prefix() + "-" + property.id();
			var emptyValue = false;
			var firstShape = this.shapeSelection.shapes.first();
			
			this.shapeSelection.shapes.each(function(shape){
				if(firstShape.properties[key] != shape.properties[key]) {
					emptyValue = true;
				}
			}.bind(this));
			
			/* Set property value */
			if(!emptyValue) {
				this.shapeSelection.commonPropertiesValues[key]
					= firstShape.properties[key];
			}
		}.bind(this));
	},
	
	/**
	 * Returns the set of stencils used by the passed shapes.
	 */
	getStencilSetOfSelection: function() {
		var stencils = new Hash();
		
		this.shapeSelection.shapes.each(function(shape) {
			stencils[shape.getStencil().id()] = shape.getStencil();
		})
		return stencils;
	},
	
	/**
	 * Identifies the common Properties of the selected shapes.
	 */
	identifyCommonProperties: function() {
		this.shapeSelection.commonProperties.clear();
		
		/* 
		 * A common property is a property, that is part of 
		 * the stencil definition of the first and all other stencils.
		 */
		var stencils = this.getStencilSetOfSelection();
		var firstStencil = stencils.values().first();
		var comparingStencils = stencils.values().without(firstStencil);
		
		
		if(comparingStencils.length == 0) {
			this.shapeSelection.commonProperties = firstStencil.properties();
		} else {
			var properties = new Hash();
			
			/* put all properties of on stencil in a Hash */
			firstStencil.properties().each(function(property){
				properties[property.namespace() + '-' + property.id() 
							+ '-' + property.type()] = property;
			});
			
			/* Calculate intersection of properties. */
			
			comparingStencils.each(function(stencil){
				var intersection = new Hash();
				stencil.properties().each(function(property){
					if(properties[property.namespace() + '-' + property.id()
									+ '-' + property.type()]){
						intersection[property.namespace() + '-' + property.id()
										+ '-' + property.type()] = property;
					}
				});
				properties = intersection;	
			});
			
			this.shapeSelection.commonProperties = properties.values();
		}
	},
	
	onSelectionChanged: function(event) {
		/* Event to call afterEdit method */
		this.grid.stopEditing();
		
		/* Selected shapes */
		this.shapeSelection.shapes = event.elements;
		
		/* Case: nothing selected */
		if(event.elements.length == 0) {
			this.shapeSelection.shapes = [this.facade.getCanvas()];
		}
		
		/* subselection available */
		if(event.subSelection){
			this.shapeSelection.shapes = [event.subSelection];
		}
		
		this.setPropertyWindowTitle();
		this.identifyCommonProperties();
		this.setCommonPropertiesValues();
		
		// Create the Properties
		
		this.createProperties();
	},
	
	/**
	 * Creates the properties for the ExtJS-Grid from the properties of the
	 * selected shapes.
	 */
	createProperties: function() {
		this.properties = [];
		this.popularProperties = [];

		if(this.shapeSelection.commonProperties) {
			
			// add new property lines
			this.shapeSelection.commonProperties.each((function(pair, index) {

				var key = pair.prefix() + "-" + pair.id();
				
				// Get the property pair
				var name		= pair.title();
				var icons		= [];
				var attribute	= this.shapeSelection.commonPropertiesValues[key];
				
				var editorGrid = undefined;
				var editorRenderer = null;
				
				var refToViewFlag = false;

				if(!pair.readonly()){
					switch(pair.type()) {
						case ORYX.CONFIG.TYPE_STRING:
							// If the Text is MultiLine
							if(pair.wrapLines()) {
								// Set the Editor as TextArea
								var editorTextArea = new Ext.form.TextArea({alignment: "tl-tl", allowBlank: pair.optional(),  msgTarget:'title', maxLength:pair.length()});
								editorTextArea.on('keyup', function(textArea, event) {
									this.editDirectly(key, textArea.getValue());
								}.bind(this));								
								
								editorGrid = new Ext.Editor(editorTextArea);
							} else {
								// If not, set the Editor as InputField
								var editorInput = new Ext.form.TextField({allowBlank: pair.optional(),  msgTarget:'title', maxLength:pair.length()});
								editorInput.on('keyup', function(input, event) {
									this.editDirectly(key, input.getValue());
								}.bind(this));
								
								// reverts the shape if the editor field is invalid
								editorInput.on('blur', function(input) {
									if(!input.isValid(false))
										this.updateAfterInvalid(key);
								}.bind(this));
								
								editorInput.on("specialkey", function(input, e) {
									if(!input.isValid(false))
										this.updateAfterInvalid(key);
								}.bind(this));
								
								editorGrid = new Ext.Editor(editorInput);
							}
							break;
						case ORYX.CONFIG.TYPE_BOOLEAN:
							// Set the Editor as a CheckBox
							var editorCheckbox = new Ext.form.Checkbox();
							editorCheckbox.on('check', function(c,checked) {
								this.editDirectly(key, checked);
							}.bind(this));
							
							editorGrid = new Ext.Editor(editorCheckbox);
							break;
						case ORYX.CONFIG.TYPE_INTEGER:
							// Set as an Editor for Integers
							var numberField = new Ext.form.NumberField({allowBlank: pair.optional(), allowDecimals:false, msgTarget:'title', minValue: pair.min(), maxValue: pair.max()});
							numberField.on('keyup', function(input, event) {
								this.editDirectly(key, input.getValue());
							}.bind(this));							
							
							editorGrid = new Ext.Editor(numberField);
							break;
						case ORYX.CONFIG.TYPE_FLOAT:
							// Set as an Editor for Float
							var numberField = new Ext.form.NumberField({ allowBlank: pair.optional(), allowDecimals:true, msgTarget:'title', minValue: pair.min(), maxValue: pair.max()});
							numberField.on('keyup', function(input, event) {
								this.editDirectly(key, input.getValue());
							}.bind(this));
							
							editorGrid = new Ext.Editor(numberField);

							break;
						case ORYX.CONFIG.TYPE_COLOR:
							// Set as a ColorPicker
							// Ext1.0 editorGrid = new gEdit(new form.ColorField({ allowBlank: pair.optional(),  msgTarget:'title' }));

							var editorPicker = new Ext.ux.ColorField({ allowBlank: pair.optional(),  msgTarget:'title', facade: this.facade });
							
							/*this.facade.registerOnEvent(ORYX.CONFIG.EVENT_COLOR_CHANGE, function(option) {
								this.editDirectly(key, option.value);
							}.bind(this));*/
							
							editorGrid = new Ext.Editor(editorPicker);

							break;
						case ORYX.CONFIG.TYPE_CHOICE:
							var items = pair.items();
							if (console) {
								console.log(pair);
							}
							var options = [];
							items.each(function(value) {
								if(value.value() == attribute)
									attribute = value.title();
									
								if(value.refToView()[0])
									refToViewFlag = true;
																
								options.push([value.icon(), value.title(), value.value()]);
															
								icons.push({
									name: value.title(),
									icon: value.icon()
								});
							});
							
							var store = new Ext.data.SimpleStore({
						        fields: [{name: 'icon'},
									{name: 'title'},
									{name: 'value'}	],
						        data : options // from states.js
						    });
							
							// Set the grid Editor

						    var editorCombo = new Ext.form.ComboBox({
								tpl: '<tpl for="."><div class="x-combo-list-item">{[(values.icon) ? "<img src=\'" + values.icon + "\' />" : ""]} {title}</div></tpl>',
						        store: store,
						        displayField:'title',
								valueField: 'value',
						        typeAhead: true,
						        mode: 'local',
						        triggerAction: 'all',
						        selectOnFocus:true
						    });
								
							editorCombo.on('select', function(combo, record, index) {
								this.editDirectly(key, combo.getValue());
							}.bind(this))
							
							editorGrid = new Ext.Editor(editorCombo);

							break;
						case ORYX.CONFIG.TYPE_DATE:
							var currFormat = ORYX.I18N.PropertyWindow.dateFormat
							if(!(attribute instanceof Date))
								attribute = Date.parseDate(attribute, currFormat)
							editorGrid = new Ext.Editor(new Ext.form.DateField({ allowBlank: pair.optional(), format:currFormat,  msgTarget:'title'}));
							break;

						case ORYX.CONFIG.TYPE_TEXT:
							
							var cf = new Ext.form.ComplexTextField({
								allowBlank: pair.optional(),
								dataSource:this.dataSource,
								grid:this.grid,
								row:index,
								facade:this.facade
							});
							cf.on('dialogClosed', this.dialogClosed, {scope:this, row:index, col:1,field:cf});							
							editorGrid = new Ext.Editor(cf);
							break;
							
						// extended by Kerstin (start)
						case ORYX.CONFIG.TYPE_COMPLEX:
							
							var cf = new Ext.form.ComplexListField({ allowBlank: pair.optional()}, pair.complexItems(), key, this.facade);
							cf.on('dialogClosed', this.dialogClosed, {scope:this, row:index, col:1,field:cf});							
							editorGrid = new Ext.Editor(cf);
							break;
						// extended by Kerstin (end)
						
						// extended by Gerardo (Start)
						case "CPNString":
							var editorInput = new Ext.form.TextField(
									{
										allowBlank: pair.optional(),
										msgTarget:'title', 
										maxLength:pair.length(), 
										enableKeyEvents: true
									});
							
							editorInput.on('keyup', function(input, event) {
								this.editDirectly(key, input.getValue());
								console.log(input.getValue());
								alert("huhu");
							}.bind(this));
							
							editorGrid = new Ext.Editor(editorInput);							
							break;
						// extended by Gerardo (End)
						
						default:
							var editorInput = new Ext.form.TextField({ allowBlank: pair.optional(),  msgTarget:'title', maxLength:pair.length(), enableKeyEvents: true});
							editorInput.on('keyup', function(input, event) {
								this.editDirectly(key, input.getValue());
							}.bind(this));
							
							editorGrid = new Ext.Editor(editorInput);
					}


					// Register Event to enable KeyDown
					editorGrid.on('beforehide', this.facade.enableEvent.bind(this, ORYX.CONFIG.EVENT_KEYDOWN));
					editorGrid.on('specialkey', this.specialKeyDown.bind(this));

				} else if(pair.type() === ORYX.CONFIG.TYPE_URL || pair.type() === ORYX.CONFIG.TYPE_DIAGRAM_LINK){
					attribute = String(attribute).search("http") !== 0 ? ("http://" + attribute) : attribute;
					attribute = "<a href='" + attribute + "' target='_blank'>" + attribute.split("://")[1] + "</a>"
				}
				
				// Push to the properties-array
				if(pair.visible()) {
					// Popular Properties are those with a refToView set or those which are set to be popular
					if (pair.refToView()[0] || refToViewFlag || pair.popular()) {
						pair.setPopular();
					} 
					
					if(pair.popular()) {
						this.popularProperties.push([pair.popular(), name, attribute, icons, {
							editor: editorGrid,
							propId: key,
							type: pair.type(),
							tooltip: pair.description(),
							renderer: editorRenderer
						}]);
					}
					else {					
						this.properties.push([pair.popular(), name, attribute, icons, {
							editor: editorGrid,
							propId: key,
							type: pair.type(),
							tooltip: pair.description(),
							renderer: editorRenderer
						}]);
					}
				}

			}).bind(this));
		}

		this.setProperties();
	},
	
	hideMoreAttrs: function(panel) {
		// TODO: Implement the case that the canvas has no attributes
		if (this.properties.length <= 0){ return }
		
		// collapse the "more attr" group
		this.grid.view.toggleGroup(this.grid.view.getGroupId(this.properties[0][0]), false);
		
		// prevent the more attributes pane from closing after a attribute has been edited
		this.grid.view.un("refresh", this.hideMoreAttrs, this);
	},

	setProperties: function() {
		var props = this.popularProperties.concat(this.properties);
		
		this.dataSource.loadData(props);
	}
}
ORYX.Plugins.PropertyWindow = Clazz.extend(ORYX.Plugins.PropertyWindow);



/**
 * Editor for complex type
 * 
 * When starting to edit the editor, it creates a new dialog where new attributes
 * can be specified which generates json out of this and put this 
 * back to the input field.
 * 
 * This is implemented from Kerstin Pfitzner
 * 
 * @param {Object} config
 * @param {Object} items
 * @param {Object} key
 * @param {Object} facade
 */


Ext.form.ComplexListField = function(config, items, key, facade){
    Ext.form.ComplexListField.superclass.constructor.call(this, config);
	this.items 	= items;
	this.key 	= key;
	this.facade = facade;
};

/**
 * This is a special trigger field used for complex properties.
 * The trigger field opens a dialog that shows a list of properties.
 * The entered values will be stored as trigger field value in the JSON format.
 */
Ext.extend(Ext.form.ComplexListField, Ext.form.TriggerField,  {
	/**
     * @cfg {String} triggerClass
     * An additional CSS class used to style the trigger button.  The trigger will always get the
     * class 'x-form-trigger' and triggerClass will be <b>appended</b> if specified.
     */
    triggerClass:	'x-form-complex-trigger',
	readOnly:		true,
	emptyText: 		ORYX.I18N.PropertyWindow.clickIcon,
		
	/**
	 * Builds the JSON value from the data source of the grid in the dialog.
	 */
	buildValue: function() {
		var ds = this.grid.getStore();
		ds.commitChanges();
		
		if (ds.getCount() == 0) {
			return "";
		}
		
		var jsonString = "[";
		for (var i = 0; i < ds.getCount(); i++) {
			var data = ds.getAt(i);		
			jsonString += "{";	
			for (var j = 0; j < this.items.length; j++) {
				var key = this.items[j].id();
				jsonString += key + ':' + ("" + data.get(key)).toJSON();
				if (j < (this.items.length - 1)) {
					jsonString += ", ";
				}
			}
			jsonString += "}";
			if (i < (ds.getCount() - 1)) {
				jsonString += ", ";
			}
		}
		jsonString += "]";
		
		jsonString = "{'totalCount':" + ds.getCount().toJSON() + 
			", 'items':" + jsonString + "}";
		return Object.toJSON(jsonString.evalJSON());
	},
	
	/**
	 * Returns the field key.
	 */
	getFieldKey: function() {
		return this.key;
	},
	
	/**
	 * Returns the actual value of the trigger field.
	 * If the table does not contain any values the empty
	 * string will be returned.
	 */
    getValue : function(){
		// return actual value if grid is active
		if (this.grid) {
			return this.buildValue();			
		} else if (this.data == undefined) {
			return "";
		} else {
			return this.data;
		}
    },
	
	/**
	 * Sets the value of the trigger field.
	 * In this case this sets the data that will be shown in
	 * the grid of the dialog.
	 * 
	 * @param {Object} value The value to be set (JSON format or empty string)
	 */
	setValue: function(value) {	
		if (value.length > 0) {
			// set only if this.data not set yet
			// only to initialize the grid
			if (this.data == undefined) {
				this.data = value;
			}
		}
	},
	
	/**
	 * Returns false. In this way key events will not be propagated
	 * to other elements.
	 * 
	 * @param {Object} event The keydown event.
	 */
	keydownHandler: function(event) {
		return false;
	},
	
	/**
	 * The listeners of the dialog. 
	 * 
	 * If the dialog is hidded, a dialogClosed event will be fired.
	 * This has to be used by the parent element of the trigger field
	 * to reenable the trigger field (focus gets lost when entering values
	 * in the dialog).
	 */
    dialogListeners : {
        show : function(){ // retain focus styling
            this.onFocus();	
			this.facade.registerOnEvent(ORYX.CONFIG.EVENT_KEYDOWN, this.keydownHandler.bind(this));
			this.facade.disableEvent(ORYX.CONFIG.EVENT_KEYDOWN);
			return;
        },
        hide : function(){

            var dl = this.dialogListeners;
            this.dialog.un("show", dl.show,  this);
            this.dialog.un("hide", dl.hide,  this);
			
			this.dialog.destroy(true);
			this.grid.destroy(true);
			delete this.grid;
			delete this.dialog;
			
			this.facade.unregisterOnEvent(ORYX.CONFIG.EVENT_KEYDOWN, this.keydownHandler.bind(this));
			this.facade.enableEvent(ORYX.CONFIG.EVENT_KEYDOWN);
			
			// store data and notify parent about the closed dialog
			// parent has to handel this event and start editing the text field again
			this.fireEvent('dialogClosed', this.data);
			
			Ext.form.ComplexListField.superclass.setValue.call(this, this.data);
        }
    },	
	
	/**
	 * Builds up the initial values of the grid.
	 * 
	 * @param {Object} recordType The record type of the grid.
	 * @param {Object} items      The initial items of the grid (columns)
	 */
	buildInitial: function(recordType, items) {
		var initial = new Hash();
		
		for (var i = 0; i < items.length; i++) {
			var id = items[i].id();
			initial[id] = items[i].value();
		}
		
		var RecordTemplate = Ext.data.Record.create(recordType);
		return new RecordTemplate(initial);
	},
	
	/**
	 * Builds up the column model of the grid. The parent element of the
	 * grid.
	 * 
	 * Sets up the editors for the grid columns depending on the 
	 * type of the items.
	 * 
	 * @param {Object} parent The 
	 */
	buildColumnModel: function(parent) {
		var cols = [];
		for (var i = 0; i < this.items.length; i++) {
			var id 		= this.items[i].id();
			var header 	= this.items[i].name();
			var width 	= this.items[i].width();
			var type 	= this.items[i].type();
			var editor;
			
			if (type == ORYX.CONFIG.TYPE_STRING) {
				editor = new Ext.form.TextField({ allowBlank : this.items[i].optional(), width : width});
			} else if (type == ORYX.CONFIG.TYPE_CHOICE) {				
				var items = this.items[i].items();
				var select = ORYX.Editor.graft("http://www.w3.org/1999/xhtml", parent, ['select', {style:'display:none'}]);
				var optionTmpl = new Ext.Template('<option value="{value}">{value}</option>');
				items.each(function(value){ 
					optionTmpl.append(select, {value:value.value()}); 
				});				
				
				editor = new Ext.form.ComboBox(
					{ typeAhead: true, triggerAction: 'all', transform:select, lazyRender:true,  msgTarget:'title', width : width});			
			} else if (type == ORYX.CONFIG.TYPE_BOOLEAN) {
				editor = new Ext.form.Checkbox( { width : width } );
			}
					
			cols.push({
				id: 		id,
				header: 	header,
				dataIndex: 	id,
				resizable: 	true,
				editor: 	editor,
				width:		width
	        });
			
		}
		return new Ext.grid.ColumnModel(cols);
	},
	
	/**
	 * After a cell was edited the changes will be commited.
	 * 
	 * @param {Object} option The option that was edited.
	 */
	afterEdit: function(option) {
		option.grid.getStore().commitChanges();
	},
		
	/**
	 * Before a cell is edited it has to be checked if this 
	 * cell is disabled by another cell value. If so, the cell editor will
	 * be disabled.
	 * 
	 * @param {Object} option The option to be edited.
	 */
	beforeEdit: function(option) {

		var state = this.grid.getView().getScrollState();
		
		var col = option.column;
		var row = option.row;
		var editId = this.grid.getColumnModel().config[col].id;
		// check if there is an item in the row, that disables this cell
		for (var i = 0; i < this.items.length; i++) {
			// check each item that defines a "disable" property
			var item = this.items[i];
			var disables = item.disable();
			if (disables != undefined) {
				
				// check if the value of the column of this item in this row is equal to a disabling value
				var value = this.grid.getStore().getAt(row).get(item.id());
				for (var j = 0; j < disables.length; j++) {
					var disable = disables[j];
					if (disable.value == value) {
						
						for (var k = 0; k < disable.items.length; k++) {
							// check if this value disables the cell to select 
							// (id is equals to the id of the column to edit)
							var disItem = disable.items[k];
							if (disItem == editId) {
								this.grid.getColumnModel().getCellEditor(col, row).disable();
								return;
							}
						}
					}
				}		
			}
		}
		this.grid.getColumnModel().getCellEditor(col, row).enable();
		//this.grid.getView().restoreScroll(state);
	},
	
    /**
     * If the trigger was clicked a dialog has to be opened
     * to enter the values for the complex property.
     */
    onTriggerClick : function(){
        if(this.disabled){
            return;
        }	
		
		//if(!this.dialog) { 
		
			var dialogWidth = 0;
			var recordType 	= [];
			
			for (var i = 0; i < this.items.length; i++) {
				var id 		= this.items[i].id();
				var width 	= this.items[i].width();
				var type 	= this.items[i].type();	
					
				if (type == ORYX.CONFIG.TYPE_CHOICE) {
					type = ORYX.CONFIG.TYPE_STRING;
				}
						
				dialogWidth += width;
				recordType[i] = {name:id, type:type};
			}			
			
			if (dialogWidth > 800) {
				dialogWidth = 800;
			}
			dialogWidth += 22;
			
			var data = this.data;
			if (data == "") {
				// empty string can not be parsed
				data = "{}";
			}
			
			
			var ds = new Ext.data.Store({
		        proxy: new Ext.data.MemoryProxy(eval("(" + data + ")")),				
				reader: new Ext.data.JsonReader({
		            root: 'items',
		            totalProperty: 'totalCount'
		        	}, recordType)
	        });
			ds.load();
					
				
			var cm = this.buildColumnModel();
			
			this.grid = new Ext.grid.EditorGridPanel({
				store:		ds,
		        cm:			cm,
				stripeRows: true,
				clicksToEdit : 1,
				autoHeight:true,
		        selModel: 	new Ext.grid.CellSelectionModel()
		    });	
			
									
			//var gridHead = this.grid.getView().getHeaderPanel(true);
			var toolbar = new Ext.Toolbar(
			[{
				text: ORYX.I18N.PropertyWindow.add,
				handler: function(){
					var ds = this.grid.getStore();
					var index = ds.getCount();
					this.grid.stopEditing();
					var p = this.buildInitial(recordType, this.items);
					ds.insert(index, p);
					ds.commitChanges();
					this.grid.startEditing(index, 0);
				}.bind(this)
			},{
				text: ORYX.I18N.PropertyWindow.rem,
		        handler : function(){
					var ds = this.grid.getStore();
					var selection = this.grid.getSelectionModel().getSelectedCell();
					if (selection == undefined) {
						return;
					}
					this.grid.getSelectionModel().clearSelections();
		            this.grid.stopEditing();					
					var record = ds.getAt(selection[0]);
					ds.remove(record);
					ds.commitChanges();           
				}.bind(this)
			}]);			
		
			// Basic Dialog
			this.dialog = new Ext.Window({ 
				autoScroll: true,
				autoCreate: true, 
				title: ORYX.I18N.PropertyWindow.complex, 
				height: 350, 
				width: dialogWidth, 
				modal:true,
				collapsible:false,
				fixedcenter: true, 
				shadow:true, 
				proxyDrag: true,
				keys:[{
					key: 27,
					fn: function(){
						this.dialog.hide
					}.bind(this)
				}],
				items:[toolbar, this.grid],
				bodyStyle:"background-color:#FFFFFF",
				buttons: [{
	                text: ORYX.I18N.PropertyWindow.ok,
	                handler: function(){
	                    this.grid.stopEditing();	
						// store dialog input
						this.data = this.buildValue();
						this.dialog.hide()
	                }.bind(this)
	            }, {
	                text: ORYX.I18N.PropertyWindow.cancel,
	                handler: function(){
	                	this.dialog.hide()
	                }.bind(this)
	            }]
			});		
				
			this.dialog.on(Ext.apply({}, this.dialogListeners, {
	       		scope:this
	        }));
		
			this.dialog.show();	
		
	
			this.grid.on('beforeedit', 	this.beforeEdit, 	this, true);
			this.grid.on('afteredit', 	this.afterEdit, 	this, true);
			
			this.grid.render();			
	    
		/*} else {
			this.dialog.show();		
		}*/
		
	}
});





Ext.form.ComplexTextField = Ext.extend(Ext.form.TriggerField,  {

	defaultAutoCreate : {tag: "textarea", rows:1, style:"height:16px;overflow:hidden;" },

    /**
     * If the trigger was clicked a dialog has to be opened
     * to enter the values for the complex property.
     */
    onTriggerClick : function(){
		
        if(this.disabled){
            return;
        }	
		        
		var grid = new Ext.form.TextArea({
	        anchor		: '100% 100%',
			value		: this.value,
			listeners	: {
				focus: function(){
					this.facade.disableEvent(ORYX.CONFIG.EVENT_KEYDOWN);
				}.bind(this)
			}
		})
		
		
		// Basic Dialog
		var dialog = new Ext.Window({ 
			layout		: 'anchor',
			autoCreate	: true, 
			title		: ORYX.I18N.PropertyWindow.text, 
			height		: 500, 
			width		: 500, 
			modal		: true,
			collapsible	: false,
			fixedcenter	: true, 
			shadow		: true, 
			proxyDrag	: true,
			keys:[{
				key	: 27,
				fn	: function(){
						dialog.hide()
				}.bind(this)
			}],
			items		:[grid],
			listeners	:{
				hide: function(){
					this.fireEvent('dialogClosed', this.value);
					//this.focus.defer(10, this);
					dialog.destroy();
				}.bind(this)				
			},
			buttons		: [{
                text: ORYX.I18N.PropertyWindow.ok,
                handler: function(){	 
					// store dialog input
					var value = grid.getValue();
					this.setValue(value);
					
					this.dataSource.getAt(this.row).set('value', value)
					this.dataSource.commitChanges()

					dialog.hide()
                }.bind(this)
            }, {
                text: ORYX.I18N.PropertyWindow.cancel,
                handler: function(){
					this.setValue(this.value);
                	dialog.hide()
                }.bind(this)
            }]
		});		
				
		dialog.show();		
		grid.render();

		this.grid.stopEditing();
		grid.focus( false, 100 );
		
	}
});/**
 * Copyright (c) 2008
 * Willi Tscheschner
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 **/

if(!ORYX.Plugins)
	ORYX.Plugins = new Object();

/**
 * Supports EPCs by offering a syntax check and export and import ability..
 * 
 * 
 */
ORYX.Plugins.ERDFSupport = Clazz.extend({

	facade: undefined,
	
	ERDFServletURL: '/erdfsupport',

	/**
	 * Offers the plugin functionality:
	 * 
	 */
	construct: function(facade) {
		
		this.facade = facade;
			
			
		this.facade.offer({
			'name':				ORYX.I18N.ERDFSupport.exp,
			'functionality': 	this.exportERDF.bind(this),
			'group': 			'Export',
            dropDownGroupIcon: ORYX.PATH + "images/export2.png",
			'icon': 			ORYX.PATH + "images/erdf_export_icon.png",
			'description': 		ORYX.I18N.ERDFSupport.expDesc,
			'index': 			0,
			'minShape': 		0,
			'maxShape': 		0
		});
					
		this.facade.offer({
			'name':				ORYX.I18N.ERDFSupport.imp,
			'functionality': 	this.importERDF.bind(this),
			'group': 			'Export',
            dropDownGroupIcon: ORYX.PATH + "images/import.png",
			'icon': 			ORYX.PATH + "images/erdf_import_icon.png",
			'description': 		ORYX.I18N.ERDFSupport.impDesc,
			'index': 			1,
			'minShape': 		0,
			'maxShape': 		0
		});

	},

	
	/**
	 * Imports an AML description
	 * 
	 */
	importERDF: function(){
		this._showImportDialog();
	},		

	
	/**
	 * Imports an AML description
	 * 
	 */
	exportERDF: function(){
        // Show deprecation message
        Ext.Msg.show({
           title:ORYX.I18N.ERDFSupport.deprTitle,
           msg: ORYX.I18N.ERDFSupport.deprText,
           buttons: Ext.Msg.YESNO,
           fn: function(buttonId){
               if(buttonId === 'yes'){
                    var s   = this.facade.getERDF();
                    
                    //this.openXMLWindow( s );
                    this.openDownloadWindow(window.document.title + ".xml", s);
               }
           }.bind(this),
           icon: Ext.MessageBox.WARNING 
        });
	},
	
	/**
	 * 
	 * 
	 * @param {Object} url
	 * @param {Object} params
	 * @param {Object} successcallback
	 */
	sendRequest: function( url, params, successcallback, failedcallback ){

		var suc = false;

		new Ajax.Request(url, {
            method			: 'POST',
            asynchronous	: false,
            parameters		: params,
			onSuccess		: function(transport) {
				
				suc = true;
				
				if(successcallback){
					successcallback( transport.result )	
				}
				
			}.bind(this),
			
			onFailure		: function(transport) {

				if(failedcallback){
					
					failedcallback();
					
				} else {
					Ext.Msg.alert(ORYX.I18N.Oryx.title, ORYX.I18N.ERDFSupport.impFailed);
					ORYX.log.warn("Import ERDF failed: " + transport.responseText);	
				}
				
			}.bind(this)		
		});
		
		
		return suc;
							
	},


	loadERDF: function( erdfString, success, failed ){
		
		var s 	= erdfString;
		s 		= s.startsWith('<?xml') ? s : '<?xml version="1.0" encoding="utf-8"?>'+s+'';	
						
		var parser	= new DOMParser();			
		var doc 	=  parser.parseFromString( s ,"text/xml");
							
		if( doc.firstChild.tagName == "parsererror" ){

			Ext.MessageBox.show({
					title: 		ORYX.I18N.ERDFSupport.error,
 					msg: 		ORYX.I18N.ERDFSupport.impFailed2 + doc.firstChild.textContent.escapeHTML(),
					buttons: 	Ext.MessageBox.OK,
					icon: 		Ext.MessageBox.ERROR
				});
																
			if(failed)
				failed();
				
		} else if( !this.hasStencilSet(doc) ){
			
			if(failed)
				failed();		
		
		} else {
			
			this.facade.importERDF( doc );
			
			if(success)
				success();
		
		}
	},

	hasStencilSet: function( doc ){
		
		var getElementsByClassNameFromDiv 	= function(doc, id){ return $A(doc.getElementsByTagName('div')).findAll(function(el){ return $A(el.attributes).any(function(attr){ return attr.nodeName == 'class' && attr.nodeValue == id }) })	}

		// Get Canvas Node
		var editorNode 		= getElementsByClassNameFromDiv( doc, '-oryx-canvas')[0];
		
		if( !editorNode ){
			this.throwWarning(ORYX.I18N.ERDFSupport.noCanvas);
			return false
		}
		
		var stencilSetNode 	= $A(editorNode.getElementsByTagName('a')).find(function(node){ return node.getAttribute('rel') == 'oryx-stencilset'});

		if( !stencilSetNode ){
			this.throwWarning(ORYX.I18N.ERDFSupport.noSS);
			return false
		}
		
		var stencilSetUrl	= stencilSetNode.getAttribute('href').split("/")
		stencilSetUrl		= stencilSetUrl[stencilSetUrl.length-2] + "/" + stencilSetUrl[stencilSetUrl.length-1];
		
//		var isLoaded = this.facade.getStencilSets().values().any(function(ss){ return ss.source().endsWith( stencilSetUrl ) })
//		if( !isLoaded ){
//			this.throwWarning(ORYX.I18N.ERDFSupport.wrongSS);
//			return false
//		}
				
		return true;
	},
	
	throwWarning: function( text ){
		Ext.MessageBox.show({
					title: 		ORYX.I18N.Oryx.title,
 					msg: 		text,
					buttons: 	Ext.MessageBox.OK,
					icon: 		Ext.MessageBox.WARNING
				});
	},
	
	/**
	 * Opens a new window that shows the given XML content.
	 * 
	 * @param {Object} content The XML content to be shown.
	 */
	openXMLWindow: function(content) {
		var win = window.open(
		   'data:application/xml,' + encodeURIComponent(
		     content
		   ),
		   '_blank', "resizable=yes,width=600,height=600,toolbar=0,scrollbars=yes"
		);
	},
	
	/**
	 * Opens a download window for downloading the given content.
	 * 
	 */
	openDownloadWindow: function(file, content) {
		var win = window.open("");
		if (win != null) {
			win.document.open();
			win.document.write("<html><body>");
			var submitForm = win.document.createElement("form");
			win.document.body.appendChild(submitForm);
			
			submitForm.appendChild( this.createHiddenElement("download", content));
			submitForm.appendChild( this.createHiddenElement("file", file));
			
			
			submitForm.method = "POST";
			win.document.write("</body></html>");
			win.document.close();
			submitForm.action= ORYX.PATH + "/download";
			submitForm.submit();
		}		
	},
	
	/**
	 * Creates a hidden form element to communicate parameter values.
	 * 
	 * @param {Object} name  The name of the hidden field
	 * @param {Object} value The value of the hidden field
	 */
	createHiddenElement: function(name, value) {
		var newElement = document.createElement("input");
		newElement.name=name;
		newElement.type="hidden";
		newElement.value = value;
		return newElement
	},

	/**
	 * Opens a upload dialog.
	 * 
	 */
	_showImportDialog: function( successCallback ){
	
	    var form = new Ext.form.FormPanel({
			baseCls: 		'x-plain',
	        labelWidth: 	50,
	        defaultType: 	'textfield',
	        items: [{
	            text : 		ORYX.I18N.ERDFSupport.selectFile, 
				style : 	'font-size:12px;margin-bottom:10px;display:block;',
	            anchor:		'100%',
				xtype : 	'label' 
	        },{
	            fieldLabel: ORYX.I18N.ERDFSupport.file,
	            name: 		'subject',
				inputType : 'file',
				style : 	'margin-bottom:10px;display:block;',
				itemCls :	'ext_specific_window_overflow'
	        }, {
	            xtype: 'textarea',
	            hideLabel: true,
	            name: 'msg',
	            anchor: '100% -63'  
	        }]
	    });



		// Create the panel
		var dialog = new Ext.Window({ 
			autoCreate: true, 
			layout: 	'fit',
			plain:		true,
			bodyStyle: 	'padding:5px;',
			title: 		ORYX.I18N.ERDFSupport.impERDF, 
			height: 	350, 
			width:		500,
			modal:		true,
			fixedcenter:true, 
			shadow:		true, 
			proxyDrag: 	true,
			resizable:	true,
			items: 		[form],
			buttons:[
				{
					text:ORYX.I18N.ERDFSupport.impBtn,
					handler:function(){
						
						var loadMask = new Ext.LoadMask(Ext.getBody(), {msg:ORYX.I18N.ERDFSupport.impProgress});
						loadMask.show();
						
						window.setTimeout(function(){
					
							
							var erdfString =  form.items.items[2].getValue();
							this.loadERDF(erdfString, function(){loadMask.hide();dialog.hide()}.bind(this), function(){loadMask.hide();}.bind(this))
														
														
							
						}.bind(this), 100);
			
					}.bind(this)
				},{
					text:ORYX.I18N.ERDFSupport.close,
					handler:function(){
						
						dialog.hide();
					
					}.bind(this)
				}
			]
		});
		
		// Destroy the panel when hiding
		dialog.on('hide', function(){
			dialog.destroy(true);
			delete dialog;
		});


		// Show the panel
		dialog.show();
		
				
		// Adds the change event handler to 
		form.items.items[1].getEl().dom.addEventListener('change',function(evt){
				var text = evt.target.files[0].getAsText('UTF-8');
				form.items.items[2].setValue( text );
			}, true)

	}
	
});
/**
 * Copyright (c) 2009
 * Kai Schlichting
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 **/
if (!ORYX.Plugins) 
    ORYX.Plugins = new Object();

/**
 * Enables exporting and importing current model in JSON.
 */
ORYX.Plugins.JSONSupport = ORYX.Plugins.AbstractPlugin.extend({

    construct: function(){
        // Call super class constructor
        arguments.callee.$.construct.apply(this, arguments);
        
        this.facade.offer({
            'name': ORYX.I18N.JSONSupport.exp.name,
            'functionality': this.exportJSON.bind(this),
            'group': ORYX.I18N.JSONSupport.exp.group,
            dropDownGroupIcon: ORYX.PATH + "images/export2.png",
			'icon': ORYX.PATH + "images/page_white_javascript.png",
            'description': ORYX.I18N.JSONSupport.exp.desc,
            'index': 0,
            'minShape': 0,
            'maxShape': 0
        });
        if (!(ORYX.CONFIG.IS_TEMPLATE)) {
	        this.facade.offer({
	            'name': ORYX.I18N.JSONSupport.imp.name,
	            'functionality': this.showImportDialog.bind(this),
	            'group': ORYX.I18N.JSONSupport.imp.group,
	            dropDownGroupIcon: ORYX.PATH + "images/import.png",
				'icon': ORYX.PATH + "images/page_white_javascript.png",
	            'description': ORYX.I18N.JSONSupport.imp.desc,
	            'index': 1,
	            'minShape': 0,
	            'maxShape': 0
	        });
        }
    },
    
    exportJSON: function(){
        var json = this.facade.getSerializedJSON();
        this.openDownloadWindow(window.document.title + ".json", json);
    },
    
    /**
     * Opens a upload dialog.
     *
     */
    showImportDialog: function(successCallback){
    
        var form = new Ext.form.FormPanel({
            baseCls: 'x-plain',
            labelWidth: 50,
            defaultType: 'textfield',
            items: [{
                text: ORYX.I18N.JSONSupport.imp.selectFile,
                style: 'font-size:12px;margin-bottom:10px;display:block;',
                anchor: '100%',
                xtype: 'label'
            }, {
                fieldLabel: ORYX.I18N.JSONSupport.imp.file,
                name: 'subject',
                inputType: 'file',
                style: 'margin-bottom:10px;display:block;',
                itemCls: 'ext_specific_window_overflow'
            }, {
                xtype: 'textarea',
                hideLabel: true,
                name: 'msg',
                anchor: '100% -63'
            }]
        });
        
        // Create the panel
        var dialog = new Ext.Window({
            autoCreate: true,
            layout: 'fit',
            plain: true,
            bodyStyle: 'padding:5px;',
            title: ORYX.I18N.JSONSupport.imp.name,
            height: 350,
            width: 500,
            modal: true,
            fixedcenter: true,
            shadow: true,
            proxyDrag: true,
            resizable: true,
            items: [form],
            buttons: [{
                text: ORYX.I18N.JSONSupport.imp.btnImp,
                handler: function(){
                
                    var loadMask = new Ext.LoadMask(Ext.getBody(), {
                        msg: ORYX.I18N.JSONSupport.imp.progress
                    });
                    loadMask.show();
                    
                    window.setTimeout(function(){
                        var json = form.items.items[2].getValue();
                        try {
                            this.facade.importJSON(json, true);
                            dialog.close();
                        } 
                        catch (error) {
                            Ext.Msg.alert(ORYX.I18N.JSONSupport.imp.syntaxError, error.message);
                        }
                        finally {
                            loadMask.hide();
                        }
                    }.bind(this), 100);
                    
                }.bind(this)
            }, {
                text: ORYX.I18N.JSONSupport.imp.btnClose,
                handler: function(){
                    dialog.close();
                }.bind(this)
            }]
        });
        
        // Show the panel
        dialog.show();
        
        // Adds the change event handler to 
        form.items.items[1].getEl().dom.addEventListener('change', function(evt){
            var text = evt.target.files[0].getAsText('UTF-8');
            form.items.items[2].setValue(text);
        }, true)
        
    }
    
});
/**
 * Copyright (c) 2009, Matthias Kunze, Kai Schlichting
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 **/
if (!ORYX.Plugins) 
    ORYX.Plugins = {};

if (!ORYX.Config)
	ORYX.Config = {};

ORYX.Config.Feedback = {
	VISIBLE_STATE: "visible",
	HIDDEN_STATE: "hidden",
	INFO: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, set eiusmod tempor incidunt et labore et dolore magna aliquam. Ut enim ad minim veniam, quis nostrud exerc. Irure dolor in reprehend incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse molestaie cillum. Tia non ob ea soluad incommod quae egen ium improb fugiend. Officia",
	CSS_FILE: ORYX.PATH + "/css/feedback.css"
}

ORYX.Plugins.Feedback = ORYX.Plugins.AbstractPlugin.extend({
	
    construct: function(facade, data){
		/*
		 * data.name == "ORYX.Plugins.Feedback"
		 * data.source == "feedback.js"
		 * data.properties ... properties defined in plugins.xml/profiles.xml [{key:value}, ...]
		 */
	
		this.facade = facade;
	
		// extract properties, we're interested in
		((data && data.properties) || []).each(function(property){
			if (property.cssfile) {ORYX.Config.Feedback.CSS_FILE = property.css_file}
		}.bind(this));
		
        // load additional css information
        var fileref = document.createElement("link");
            fileref.setAttribute("rel", "stylesheet");
            fileref.setAttribute("type", "text/css");
            fileref.setAttribute("href", ORYX.Config.Feedback.CSS_FILE);
        document.getElementsByTagName("head")[0].appendChild(fileref);

        // declare HTML references
        this.elements = {
    		container: null,
    		tab: null,
    		dialog: null,
			form: null,
			info: null
    	}
        
        // create feedback tab
        this.createFeedbackTab();
        
    },
    
    /**
     * Creates the feedback tab, which is used to open the feedback dialog.
     */
    createFeedbackTab: function(){
    	this.elements.tab = document.createElement("div");
    	this.elements.tab.setAttribute("class", "tab");
		this.elements.tab.innerHTML = (ORYX.I18N.Feedback.name + " &#8226;")
    	
    	this.elements.container = document.createElement("div");
    	this.elements.container.setAttribute("id", "feedback");
    	
    	this.elements.container.appendChild(this.elements.tab);
    	document.body.appendChild(this.elements.container);
          	    	
    	// register events
    	Event.observe(this.elements.tab, "click", this.toggleDialog.bindAsEventListener(this));
    },
    
    /**
     * Hides or shows the feedback dialog
     */
    toggleDialog: function(event) {

		if (event) {
			Event.stop(event);			
		}

    	var dialog = this.elements.dialog || this.createDialog();
    	
    	if (ORYX.Config.Feedback.VISIBLE_STATE == dialog.state) {
			this.elements.tab.innerHTML = (ORYX.I18N.Feedback.name + " &#8226;");
    		Element.hide(dialog);
    		dialog.state = ORYX.Config.Feedback.HIDDEN_STATE;
    	} 
    	else {
			this.elements.tab.innerHTML = (ORYX.I18N.Feedback.name + " &#215;");
    		Element.show(dialog);
    		dialog.state = ORYX.Config.Feedback.VISIBLE_STATE;
    	}

    },
    
    /**
     * Creates the feedback dialog
     */
    createDialog: function() {
    	if (this.elements.dialog) {
    		return this.elements.dialog;
    	}

		// reset the input formular
		var resetForm = function() {
			[description, title, mail].each(function(element){
				element.value = element._defaultText || "";
				element.className = "low";
			});
		}

		// wrapper for field focus behavior
		var fieldOnFocus = function(event) {
			var e = Event.element(event);
			if (e._defaultText && e.value.strip() == e._defaultText.strip()) {
				e.value = "";
				e.className = "high";
			}
		}		
		var fieldOnBlur = function(event) {
			var e = Event.element(event);
			if (e._defaultText && e.value.strip() == "") {
				e.value = e._defaultText;
				e.className = "low";
			}
		}

    	// create form and submit logic (ajax)
		this.elements.form = document.createElement("form");
		this.elements.form.action = ORYX.CONFIG.ROOT_PATH + "feedback";
		this.elements.form.method = "POST";
		this.elements.form.onsubmit = function(){
			
			try {
				
				var failure = function() {
					Ext.Msg.alert(ORYX.I18N.Feedback.failure, ORYX.I18N.Feedback.failureMsg);
	                this.facade.raiseEvent({
	                    type: ORYX.CONFIG.EVENT_LOADING_DISABLE
	                });
					// show dialog again with old information
					this.toggleDialog();
				}
				
				var success = function(transport) {
					if (transport.status < 200 || transport.status >= 400) {
						return failure(transport);
					}
					this.facade.raiseEvent({
						type:ORYX.CONFIG.EVENT_LOADING_STATUS,
						text:ORYX.I18N.Feedback.success
					});
					resetForm();
				}
				
			
				this.elements.form.model.value = this.facade.getSerializedJSON();
				this.elements.form.environment.value = this.getEnv();
			
				var params = {};
				$A(this.elements.form.elements).each(function(element){
					params[element.name] = element.value;
				});
				params["name"]= ORYX.Editor.Cookie.getParams().identifier;
				params["subject"] = ("[" + params["subject"] + "] " + params["title"]);
				this.facade.raiseEvent({
					type:ORYX.CONFIG.EVENT_LOADING_STATUS,
					text:ORYX.I18N.Feedback.sending
				});
				new Ajax.Request(ORYX.CONFIG.ROOT_PATH + "feedback", {
					method: "POST",
					parameters: params,
					onSuccess: success.bind(this),
					onFailure: failure.bind(this)
				});
			
				// hide dialog immediately 
				this.toggleDialog();
			}
			catch(e) {
				failure();
				ORYX.Log.warn(e);
			}
			// stop form submission through browser
			return false; 
		}.bind(this);
		
		
		// create input fields
		var fieldset = document.createElement("div");
			fieldset.className = "fieldset";
		    
		var f_subject = document.createElement("input");
		    f_subject.type = "hidden";
			f_subject.name = "subject";
			f_subject.style.display = "none";
		
		var description = document.createElement("textarea");
			description._defaultText = ORYX.I18N.Feedback.descriptionDesc;
		    description.name = "description";
		Event.observe(description, "focus", fieldOnFocus.bindAsEventListener());
		Event.observe(description, "blur", fieldOnBlur.bindAsEventListener());
		
		var title = document.createElement("input");
			title._defaultText = ORYX.I18N.Feedback.titleDesc;
			title.type = "text";
			title.name = "title";
		Event.observe(title, "focus", fieldOnFocus.bindAsEventListener());
		Event.observe(title, "blur", fieldOnBlur.bindAsEventListener());
			
		var mail = document.createElement("input");
			mail._defaultText = ORYX.I18N.Feedback.emailDesc;
			mail.type = "text";
			mail.name = "email";
		Event.observe(mail, "focus", fieldOnFocus.bindAsEventListener());
		Event.observe(mail, "blur", fieldOnBlur.bindAsEventListener());
		
		var submit = document.createElement("input");
			submit.type = "button";
			submit.className = "submit";
			submit.onclick=this.elements.form.onsubmit;
			if (ORYX.I18N.Feedback.submit) {
				submit.value = ORYX.I18N.Feedback.submit;
			}
			
		var environment = document.createElement("input");
			environment.name = "environment";
			environment.type = "hidden";
			environment.style.display = "none";
			
		var model = document.createElement("input");
			model.name = "model"
			model.type = "hidden";
			model.style.display = "none";
			
		fieldset.appendChild(f_subject);
		fieldset.appendChild(description);
		fieldset.appendChild(title);
		fieldset.appendChild(mail);
		fieldset.appendChild(environment);
		fieldset.appendChild(model);
		fieldset.appendChild(submit);
		
		// (p)reset default values of input fields
		resetForm();
			
		// create subjects
		var list = document.createElement("ul");
	    list.setAttribute("class", "subjects");
		
		var l_subjects = [];
		
		$A(ORYX.I18N.Feedback.subjects).each( function(subject, index){
			try {
				
				// create list item
				var item = document.createElement("li");
					item._subject = subject.id;
				    item.className = subject.id;
					item.innerHTML = subject.name;
					item.style.width = parseInt(100/$A(ORYX.I18N.Feedback.subjects).length)+"%"; // set width corresponding to number of subjects
				
				// add subjects to list
				l_subjects.push(item);
				list.appendChild(item);

				var handler = function(){
					l_subjects.each(function(element) {
						if (element.className.match(subject.id)) { // if current element is selected
							element.className = element._subject + " active";
							f_subject.value = subject.name;
							
							// update description, depending on subject if input field is empty
							if (description.value == description._defaultText) {
								description.value = subject.description;
							}
							
							// set _defaultText to newly selected subject
							description._defaultText = subject.description;
							
							// set info pane if appropriate
							if (subject.info && (""+subject.info).strip().length > 0) {
								this.elements.info.innerHTML = subject.info;
							}
							else {
								this.elements.info.innerHTML = ORYX.I18N.Feedback.info || "";
							}
						}
						else {
							element.className = element._subject;
						}
					}.bind(this));
				}.bind(this);
				
				// choose/unchoose topics
				Event.observe(item, "click", handler);
				
				// select last item
				if (index == (ORYX.I18N.Feedback.subjects.length - 1)) {
					description.value = "";
					description._defaultText = "";
					
					handler();
				}
				
			} // if something goes wrong, we wont give up, just ignore it
			catch (e) {
				ORYX.Log.warn("Incomplete I10N for ORYX.I18N.Feedback.subjects", subject, ORYX.I18N.Feedback.subjects)
			}
		}.bind(this));
	
		this.elements.form.appendChild(list);
		this.elements.form.appendChild(fieldset);
		
		this.elements.info = document.createElement("div");
		this.elements.info.setAttribute("class", "info");
		this.elements.info.innerHTML = ORYX.I18N.Feedback.info || "";
		
		var head = document.createElement("div");
			head.setAttribute("class", "head");

    	this.elements.dialog = document.createElement("div");
		this.elements.dialog.setAttribute("class", "dialog");
		this.elements.dialog.appendChild(head);
		this.elements.dialog.appendChild(this.elements.info);
		this.elements.dialog.appendChild(this.elements.form);

		
		this.elements.container.appendChild(this.elements.dialog);
		
    	return this.elements.dialog;
    },

    getEnv: function(){
        var env = "";
        
        env += "Browser: " + navigator.userAgent;
        
        env += "\n\nBrowser Plugins: ";
        if (navigator.plugins) {
            for (var i = 0; i < navigator.plugins.length; i++) {
                var plugin = navigator.plugins[i];
                env += plugin.name + ", ";
            }
        }
        
        if ((typeof(screen.width) != "undefined") && (screen.width && screen.height)) 
            env += "\n\nScreen Resolution: " + screen.width + 'x' + screen.height;
        
        return env;
    }
});

 * Copyright (c) 2010
 * Robert Böhme, Philipp Berger
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 **/

if(!ORYX.Plugins)
	ORYX.Plugins = new Object();

ORYX.Plugins.DockerCreation = Clazz.extend({
	
	construct: function( facade ){
		this.facade = facade;		
		this.active = false; //true-> a ghostdocker is shown; false->ghostdocker is hidden

		//visual representation of the Ghostdocker
		this.circle = ORYX.Editor.graft("http://www.w3.org/2000/svg", null ,
				['g', {"pointer-events":"none"},
					['circle', {cx: "8", cy: "8", r: "3", fill:"yellow"}]]); 	
		
		//Event registrations
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN, this.handleMouseDown.bind(this));
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEOVER, this.handleMouseOver.bind(this));
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEOUT, this.handleMouseOut.bind(this));
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEMOVE, this.handleMouseMove.bind(this));
		/*
		 * Double click is reserved for label access, so abort action
		 */
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DBLCLICK,function(){window.clearTimeout(this.timer)}.bind(this));
		/*
		 * click is reserved for selecting, so abort action when mouse goes up
		 */
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEUP,function(){window.clearTimeout(this.timer)}.bind(this));

	},
	
	/**
	 * MouseOut Handler
	 * 
	 *hide the Ghostpoint when Leaving the mouse from an edge
	 */
	handleMouseOut: function(event, uiObj) {
		
		if (this.active) {		
			this.hideOverlay();
			this.active = false;
		}	
	},
	
	/**
	 * MouseOver Handler
	 * 
	 *show the Ghostpoint if the edge is selected
	 */
	handleMouseOver: function(event, uiObj) {
		//show the Ghostdocker on the edge
		if (uiObj instanceof ORYX.Core.Edge && this.isEdgeDocked(uiObj)){
			this.showOverlay(uiObj, this.facade.eventCoordinates(event));
		}
		//ghostdocker is active
		this.active = true;
		
	},
	
	/**
	 * MouseDown Handler
	 * 
	 *create a Docker when clicking on a selected edge
	 */
	handleMouseDown: function(event, uiObj) {	
		if (event.which==1 && uiObj instanceof ORYX.Core.Edge && this.isEdgeDocked(uiObj)){
			//Timer for Doubleclick to be able to create a label
			window.clearTimeout(this.timer);
			
			this.timer = window.setTimeout(function () {
				// Give the event to enable one click creation and drag
				this.addDockerCommand({
		            edge: uiObj,
					event: event,
		            position: this.facade.eventCoordinates(event)
		        });
	
			}.bind(this),200);
			this.hideOverlay();
	
		}
	},
	
	/**
	 * MouseMove Handler
	 * 
	 *refresh the ghostpoint when moving the mouse over an edge
	 */
	handleMouseMove: function(event, uiObj) {		
			if (uiObj instanceof ORYX.Core.Edge && this.isEdgeDocked(uiObj)){
				if (this.active) {	
					//refresh Ghostpoint
					this.hideOverlay();			
					this.showOverlay( uiObj, this.facade.eventCoordinates(event));
				}else{
					this.showOverlay( uiObj, this.facade.eventCoordinates(event));	
				}		
			}	
	},
	
	/**
	 * returns true if the edge is docked to at least one node
	 */
	isEdgeDocked: function(edge){
		return !!(edge.incoming.length || edge.outgoing.length);
	},
	
	
	/**
	 * Command for creating a new Docker
	 * 
	 * @param {Object} options
	 */
	addDockerCommand: function(options){
	    if(!options.edge)
	        return;
	    
	    var commandClass = ORYX.Core.Command.extend({
	        construct: function(edge, docker, pos, facade, options){            
	            this.edge = edge;
	            this.docker = docker;
	            this.pos = pos;
	            this.facade = facade;
				this.options= options;
	        },
	        execute: function(){
	            this.docker = this.edge.addDocker(this.pos, this.docker);
				this.index = this.edge.dockers.indexOf(this.docker);                                    
	            this.facade.getCanvas().update();
	            this.facade.updateSelection();
	            this.options.docker=this.docker;
	
	        },
	        rollback: function(){
	          
	             if (this.docker instanceof ORYX.Core.Controls.Docker) {
	                    this.edge.removeDocker(this.docker);
	             }             
	            this.facade.getCanvas().update();
	            this.facade.updateSelection(); 
	        }
	    });
	    var command = new commandClass(options.edge, options.docker, options.position, this.facade, options);    
	    this.facade.executeCommands([command]);
	
	    
		this.facade.raiseEvent({
			uiEvent:	options.event,
			type:		ORYX.CONFIG.EVENT_DOCKERDRAG}, options.docker );
	    
	},
	
	/**
	 *show the ghostpoint overlay
	 *
	 *@param {Shape} edge
	 *@param {Point} point
	 */
	showOverlay: function(edge, point){
		var best = point;
		var pair = [0,1];
		var min_distance = Infinity;
	
		// calculate the optimal point ON THE EDGE to display the docker
		for (var i=0, l=edge.dockers.length; i < l-1; i++) {
			var intersection_point = ORYX.Core.Math.getPointOfIntersectionPointLine(
				edge.dockers[i].bounds.center(),
				edge.dockers[i+1].bounds.center(),
				point,
				true // consider only the current segment instead of the whole line ("Strecke, statt Gerade") for distance calculation
			);
			
			
			if(!intersection_point) {
				continue;
			}
	
			var current_distance = ORYX.Core.Math.getDistancePointToPoint(point, intersection_point);
			if (min_distance > current_distance) {
				min_distance = current_distance;
				best = intersection_point;
			}
		}
	
		this.facade.raiseEvent({
				type: 			ORYX.CONFIG.EVENT_OVERLAY_SHOW,
				id: 			"ghostpoint",
				shapes: 		[edge],
				node:			this.circle,
				ghostPoint:		best,
				dontCloneNode:	true
			});			
	},
	
	/**
	 *hide the ghostpoint overlay
	 */
	hideOverlay: function() {
		
		this.facade.raiseEvent({
			type: ORYX.CONFIG.EVENT_OVERLAY_HIDE,
			id: "ghostpoint"
		});	
	}

});
 * Copyright (c) 2008
 * Willi Tscheschner
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * 
 * HOW to USE the OVERLAY PLUGIN:
 * 	You can use it via the event mechanism from the editor
 * 	by using facade.raiseEvent( <option> )
 * 
 * 	As an example please have a look in the overlayexample.js
 * 
 * 	The option object should/have to have following attributes:
 * 
 * 	Key				Value-Type							Description
 * 	================================================================
 * 
 *	type 			ORYX.CONFIG.EVENT_OVERLAY_SHOW | ORYX.CONFIG.EVENT_OVERLAY_HIDE		This is the type of the event	
 *	id				<String>							You have to use an unified id for later on hiding this overlay
 *	shapes 			<ORYX.Core.Shape[]>					The Shapes where the attributes should be changed
 *	attributes 		<Object>							An object with svg-style attributes as key-value pair
 *	node			<SVGElement>						An SVG-Element could be specified for adding this to the Shape
 *	nodePosition	"N"|"NE"|"E"|"SE"|"S"|"SW"|"W"|"NW"|"START"|"END"	The position for the SVG-Element relative to the 
 *														specified Shape. "START" and "END" are just using for a Edges, then
 *														the relation is the start or ending Docker of this edge.
 *	
 * 
 **/
if (!ORYX.Plugins) 
    ORYX.Plugins = new Object();

ORYX.Plugins.Overlay = Clazz.extend({

    facade: undefined,
	
	styleNode: undefined,
    
    construct: function(facade){
		
        this.facade = facade;

		this.changes = [];

		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_OVERLAY_SHOW, this.show.bind(this));
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_OVERLAY_HIDE, this.hide.bind(this));	

		this.styleNode = document.createElement('style')
		this.styleNode.setAttributeNS(null, 'type', 'text/css')
		
		document.getElementsByTagName('head')[0].appendChild( this.styleNode )

    },
	
	/**
	 * Show the overlay for specific nodes
	 * @param {Object} options
	 * 
	 * 	String				options.id		- MUST - Define the id of the overlay (is needed for the hiding of this overlay)		
	 *	ORYX.Core.Shape[] 	options.shapes 	- MUST - Define the Shapes for the changes
	 * 	attr-name:value		options.changes	- Defines all the changes which should be shown
	 * 
	 * 
	 */
	show: function( options ){
		
		// Checks if all arguments are available
		if( 	!options || 
				!options.shapes || !options.shapes instanceof Array ||
				!options.id	|| !options.id instanceof String || options.id.length == 0) { 
				
					return
					
		}
		
		//if( this.changes[options.id]){
		//	this.hide( options )
		//}
			

		// Checked if attributes are setted
		if( options.attributes ){
			
			// FOR EACH - Shape
			options.shapes.each(function(el){
				
				// Checks if the node is a Shape
				if( !el instanceof ORYX.Core.Shape){ return }
				
				this.setAttributes( el.node , options.attributes )
				
			}.bind(this))

		}	
		
		var isSVG = true
		try {
			isSVG = options.node && options.node instanceof SVGElement;
		} catch(e){}
		
		// Checks if node is setted and if this is an SVGElement		
		if ( options.node && isSVG) {
			
			options["_temps"] = []
						
			// FOR EACH - Node
			options.shapes.each(function(el, index){
				
				// Checks if the node is a Shape
				if( !el instanceof ORYX.Core.Shape){ return }
				
				var _temp = {}
				_temp.svg = options.dontCloneNode ? options.node : options.node.cloneNode( true );
				
				// Add the svg node to the ORYX-Shape
				el.node.firstChild.appendChild( _temp.svg )		
				
				// If
				if (el instanceof ORYX.Core.Edge && !options.nodePosition) {
					options['nodePosition'] = "START"
				}
						
				// If the node position is setted, it has to be transformed
				if( options.nodePosition ){
					
					var b = el.bounds;
					var p = options.nodePosition.toUpperCase();
										
					// Check the values of START and END
					if( el instanceof ORYX.Core.Node && p == "START"){
						p = "NW";
					} else if(el instanceof ORYX.Core.Node && p == "END"){
						p = "SE";
					} else if(el instanceof ORYX.Core.Edge && p == "START"){
						b = el.getDockers().first().bounds
					} else if(el instanceof ORYX.Core.Edge && p == "END"){
						b = el.getDockers().last().bounds
					}

					// Create a callback for the changing the position 
					// depending on the position string
					_temp.callback = function(){
						
						var x = 0; var y = 0;
						
						if( p == "NW" ){
							// Do Nothing
						} else if( p == "N" ) {
							x = b.width() / 2;
						} else if( p == "NE" ) {
							x = b.width();
						} else if( p == "E" ) {
							x = b.width(); y = b.height() / 2;
						} else if( p == "SE" ) {
							x = b.width(); y = b.height();
						} else if( p == "S" ) {
							x = b.width() / 2; y = b.height();
						} else if( p == "SW" ) {
							y = b.height();
						} else if( p == "W" ) {
							y = b.height() / 2;
						} else if( p == "START" || p == "END") {
							x = b.width() / 2; y = b.height() / 2;
						}						
						else {
							return
						}
						
						if( el instanceof ORYX.Core.Edge){
							x  += b.upperLeft().x ; y  += b.upperLeft().y ;
						}
						
						_temp.svg.setAttributeNS(null, "transform", "translate(" + x + ", " + y + ")")
					
					}.bind(this)
					
					_temp.element = el;
					_temp.callback();
					
					b.registerCallback( _temp.callback );
					
				}
				
				// Show the ghostpoint
				if(options.ghostPoint){
					var point={x:0, y:0};
					point=options.ghostPoint;
					_temp.callback = function(){
						
						var x = 0; var y = 0;
						x = point.x -7;
						y = point.y -7;
						_temp.svg.setAttributeNS(null, "transform", "translate(" + x + ", " + y + ")")
						
					}.bind(this)
					
					_temp.element = el;
					_temp.callback();
					
					b.registerCallback( _temp.callback );
				}
				
				if(options.labelPoint){
					var point={x:0, y:0};
					point=options.labelPoint;
					_temp.callback = function(){
						
						var x = 0; var y = 0;
						x = point.x;
						y = point.y;
						_temp.svg.setAttributeNS(null, "transform", "translate(" + x + ", " + y + ")")
						
					}.bind(this)
					
					_temp.element = el;
					_temp.callback();
					
					b.registerCallback( _temp.callback );
				}
				
				
				options._temps.push( _temp )	
				
			}.bind(this))
			
			
			
		}		
	

		// Store the changes
		if( !this.changes[options.id] ){
			this.changes[options.id] = [];
		}
		
		this.changes[options.id].push( options );
				
	},
	
	/**
	 * Hide the overlay with the spefic id
	 * @param {Object} options
	 */
	hide: function( options ){
		
		// Checks if all arguments are available
		if( 	!options || 
				!options.id	|| !options.id instanceof String || options.id.length == 0 ||
				!this.changes[options.id]) { 
				
					return
					
		}		
		
		
		// Delete all added attributes
		// FOR EACH - Shape
		this.changes[options.id].each(function(option){
			
			option.shapes.each(function(el, index){
				
				// Checks if the node is a Shape
				if( !el instanceof ORYX.Core.Shape){ return }
				
				this.deleteAttributes( el.node )
							
			}.bind(this));

	
			if( option._temps ){
				
				option._temps.each(function(tmp){
					// Delete the added Node, if there is one
					if( tmp.svg && tmp.svg.parentNode ){
						tmp.svg.parentNode.removeChild( tmp.svg )
					}
		
					// If 
					if( tmp.callback && tmp.element){
						// It has to be unregistered from the edge
						tmp.element.bounds.unregisterCallback( tmp.callback )
					}
							
				}.bind(this))
				
			}
		
			
		}.bind(this));

		
		this.changes[options.id] = null;
		
		
	},
	
	
	/**
	 * Set the given css attributes to that node
	 * @param {HTMLElement} node
	 * @param {Object} attributes
	 */
	setAttributes: function( node, attributes ) {
		
		
		// Get all the childs from ME
		var childs = this.getAllChilds( node.firstChild.firstChild )
		
		var ids = []
		
		// Add all Attributes which have relation to another node in this document and concate the pure id out of it
		// This is for example important for the markers of a edge
		childs.each(function(e){ ids.push( $A(e.attributes).findAll(function(attr){ return attr.nodeValue.startsWith('url(#')}) )})
		ids = ids.flatten().compact();
		ids = ids.collect(function(s){return s.nodeValue}).uniq();
		ids = ids.collect(function(s){return s.slice(5, s.length-1)})
		
		// Add the node ID to the id
		ids.unshift( node.id + ' .me')
		
		var attr				= $H(attributes);
        var attrValue			= attr.toJSON().gsub(',', ';').gsub('"', '');
        var attrMarkerValue		= attributes.stroke ? attrValue.slice(0, attrValue.length-1) + "; fill:" + attributes.stroke + ";}" : attrValue;
        var attrTextValue;
        if( attributes.fill ){
            var copyAttr        = Object.clone(attributes);
        	copyAttr.fill		= "black";
        	attrTextValue		= $H(copyAttr).toJSON().gsub(',', ';').gsub('"', '');
        }
                	
        // Create the CSS-Tags Style out of the ids and the attributes
        csstags = ids.collect(function(s, i){return "#" + s + " * " + (!i? attrValue : attrMarkerValue) + "" + (attrTextValue ? " #" + s + " text * " + attrTextValue : "") })
		
		// Join all the tags
		var s = csstags.join(" ") + "\n" 
		
		// And add to the end of the style tag
		this.styleNode.appendChild(document.createTextNode(s));
		
		
	},
	
	/**
	 * Deletes all attributes which are
	 * added in a special style sheet for that node
	 * @param {HTMLElement} node 
	 */
	deleteAttributes: function( node ) {
				
		// Get all children which contains the node id		
		var delEl = $A(this.styleNode.childNodes)
					 .findAll(function(e){ return e.textContent.include( '#' + node.id ) });
		
		// Remove all of them
		delEl.each(function(el){
			el.parentNode.removeChild(el);
		});		
	},
	
	getAllChilds: function( node ){
		
		var childs = $A(node.childNodes)
		
		$A(node.childNodes).each(function( e ){ 
		        childs.push( this.getAllChilds( e ) )
		}.bind(this))

    	return childs.flatten();
	}

    
});
/**
};
    ORYX.Plugins = new Object();

ORYX.Plugins.PluginLoader = Clazz.extend({
	
    facade: undefined,
	mask: undefined,
	processURI: undefined,
	
    construct: function(facade){
		this.facade = facade;
		if (!(ORYX.CONFIG.IS_TEMPLATE)) {
			this.facade.offer({
				'name': ORYX.I18N.PluginLoad.AddPluginButtonName,
				'functionality': this.showManageDialog.bind(this),
				'group': ORYX.I18N.SSExtensionLoader.group,
				'icon': ORYX.PATH + "images/labs/script_add.png",
				'description': ORYX.I18N.PluginLoad.AddPluginButtonDesc,
				'index': 8,
				'minShape': 0,
				'maxShape': 0
			});
		}
	},
	showManageDialog: function(){
			this.mask = new Ext.LoadMask(Ext.getBody(), {msg:ORYX.I18N.Oryx.pleaseWait});
			this.mask.show();
	var data=[];
	//(var plugins=this.facade.getAvailablePlugins();
	var plugins=[];
	var loadedStencilSetsNamespaces = this.facade.getStencilSets().keys();
	//get all plugins which could be acivated
	this.facade.getAvailablePlugins().each(function(match) {
	if ((!match.requires 	|| !match.requires.namespaces 	
			|| match.requires.namespaces.any(function(req){ return loadedStencilSetsNamespaces.indexOf(req) >= 0 }) )
		&&(!match.notUsesIn 	|| !match.notUsesIn.namespaces 	
				|| !match.notUsesIn.namespaces.any(function(req){ return loadedStencilSetsNamespaces.indexOf(req) >= 0 }))){
		plugins.push( match );

	}});
	
	plugins.each(function(plugin){
			data.push([plugin.name, plugin.engaged===true]);
			})
		if(data.length==0){return};
		var reader = new Ext.data.ArrayReader({}, [
        {name: 'name'},
		{name: 'engaged'} ]);
		
		var sm = new Ext.grid.CheckboxSelectionModel({
			listeners:{
			beforerowselect: function(sm,nbr,exist,rec){
			this.mask = new Ext.LoadMask(Ext.getBody(), {msg:ORYX.I18N.Oryx.pleaseWait});
			this.mask.show();
				this.facade.activatePluginByName(rec.data.name, 
						function(sucess,err){
						this.mask.hide();

							if(!!sucess){
								sm.suspendEvents();
								sm.selectRow(nbr, true);
								sm.resumeEvents();
							}else{
								Ext.Msg.show({
		   							   title: ORYX.I18N.PluginLoad.loadErrorTitle,
									   msg: ORYX.I18N.PluginLoad.loadErrorDesc + ORYX.I18N.PluginLoad[err],
									   buttons: Ext.MessageBox.OK
									});
							}}.bind(this));
				return false;
				}.bind(this),
			rowdeselect: function(sm,nbr,rec){
						sm.suspendEvents();
						sm.selectRow(nbr, true);
						sm.resumeEvents();
					}
			}});
	    var grid2 = new Ext.grid.GridPanel({
	    		store: new Ext.data.Store({
		            reader: reader,
		            data: data
		        	}),
		        cm: new Ext.grid.ColumnModel([
		            
		            {id:'name',width:390, sortable: true, dataIndex: 'name'},
					sm]),
			sm: sm,
	        width:450,
	        height:250,
	        frame:true,
			hideHeaders:true,
	        iconCls:'icon-grid',
			listeners : {
				render: function() {
					var recs=[];
					this.grid.getStore().each(function(rec){

						if(rec.data.engaged){
							recs.push(rec);
						}
					}.bind(this));
					this.suspendEvents();
					this.selectRecords(recs);
					this.resumeEvents();
				}.bind(sm)
			}
	    });

		var newURLWin = new Ext.Window({
					title:		ORYX.I18N.PluginLoad.WindowTitle, 
					//bodyStyle:	"background:white;padding:0px", 
					width:		'auto', 
					height:		'auto',
					modal:		true
					//html:"<div style='font-weight:bold;margin-bottom:10px'></div><span></span>",
				});
		newURLWin.add(grid2);
		newURLWin.show();
		this.mask.hide();

		}
		})
			/**
 * Copyright (c) 2009
 * Sven Wagner-Boysen
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 **/

/**
   @namespace Oryx name space for plugins
   @name ORYX.Plugins
*/
 if(!ORYX.Plugins)
	ORYX.Plugins = new Object();
	

/**
 * This plugin provides methods to layout elements that typically contain 
 * a bunch of child elements, such as subprocesses or lanes.
 * 
 * @class ORYX.Plugins.ContainerLayouter
 * @extends ORYX.Plugins.AbstractPlugin
 * @param {Object} facade
 * 		The facade of the Editor
 */
ORYX.Plugins.ContainerLayouter = {

	/**
	 *	Constructor
	 *	@param {Object} Facade: The Facade of the Editor
	 */
	construct: function(facade){
		this.facade = facade;

		// this does NOT work, because lanes and pools are loaded at start and initialized with a default size
		// if the lane was saved and had a bigger size, the dockers/edges will be corrupted, because the first 
		// positioning is handled as a resize event which triggers the layout with incorrect oldBounds!
		
		//this.facade.registerOnEvent('layout.container.minBounds', 
		//							this.handleLayoutContainerMinBounds.bind(this));
		//this.facade.registerOnEvent('layout.container.dockers', 
		//							this.handleLayoutContainerDockers.bind(this));
		
		this.hashedContainers = new Hash();
	},
	
	handleLayoutContainerDockers: function(event) {
		var sh = event.shape;
		
		if (!this.hashedContainers[sh.resourceId]) {
			this.hashedContainers[sh.resourceId] = sh.bounds.clone();
			return;
		}
		
		var offset = sh.bounds.upperLeft();
		offset.x -= this.hashedContainers[sh.resourceId].upperLeft().x;
		offset.y -= this.hashedContainers[sh.resourceId].upperLeft().y;
		
		this.hashedContainers[sh.resourceId] = sh.bounds.clone();
		
		this.moveChildDockers(sh, offset);
	},
	
	/**
	 * 
	 * 
	 * @param {Object} event
	 * 		The layout event object
	 */
	handleLayoutContainerMinBounds: function(event) {
		var shape = event.shape;
		var topOffset = event.topOffset;
		var oldBounds = shape._oldBounds;
		var options = event.options;
		var ignoreList = (options.ignoreChildsWithId ? options.ignoreChildsWithId : new Array());
		
		var childsBounds = this.retrieveChildsIncludingBounds(shape, ignoreList);
		if(!childsBounds) {return;}
		
		/* Get the upper left child shape */
		var ulShape = this.getChildShapesWithout(shape, ignoreList).find(function(node) {
			return childsBounds.upperLeft().y == node.bounds.upperLeft().y;
		});
		
		/* Ensure minimum size of the container */
		if(this.ensureContainersMinimumSize(shape, childsBounds, ulShape.absoluteBounds(), ignoreList, options)) {
			return;
		};
		
		
		var childsUl = childsBounds.upperLeft();
		var childsLr = childsBounds.lowerRight();
		var bottomTopSpaceRatio = (childsUl.y ? childsUl.y : 1) / 
				((oldBounds.height() - childsLr.y) ? (oldBounds.height() - childsLr.y) : 1);
		
		var newYValue = bottomTopSpaceRatio * (shape.bounds.height() - childsBounds.height())
						/ (1 + bottomTopSpaceRatio );
		
		this.getChildShapesWithout(shape, ignoreList).each(function(childShape){
			var innerOffset = childShape.bounds.upperLeft().y - childsUl.y;
			childShape.bounds.moveTo({	x: childShape.bounds.upperLeft().x,	
										y: newYValue + innerOffset});
		});
		
		/* Calculate adjustment for dockers */
		var yAdjustment = ulShape.bounds.upperLeft().y - ulShape._oldBounds.upperLeft().y;
		
		/* Move docker by adjustment */
		this.moveChildDockers(shape, {x: 0, y: yAdjustment});
	},
	
	/**
	 * Ensures that the container has a minimum height and width to place all
	 * child elements inside.
	 * 
	 * @param {Object} shape
	 * 		The container.
	 * @param {Object} childsBounds
	 * 		The bounds including all children
	 * @param {Object} ulChildAbsBounds
	 * 		The absolute bounds including all children
	 */
	ensureContainersMinimumSize: function(shape, childsBounds, ulChildAbsBounds, ignoreList, options) {
		var bounds = shape.bounds;
		var ulShape = bounds.upperLeft();
		var lrShape = bounds.lowerRight();
		var ulChilds = childsBounds.upperLeft();
		var lrChilds = childsBounds.lowerRight();
		var absBounds = shape.absoluteBounds();
		if(!options) {
			options = new Object();
		}
		
		if(!shape.isResized) {
			/* Childs movement after widening the conatiner */
			var yMovement = 0;
			var xMovement = 0;
			var changeBounds = false;
			
			/* Widen the shape by the child bounds */
			var ulx = ulShape.x;
			var uly = ulShape.y;
			var lrx = lrShape.x;
			var lry = lrShape.y;
			
			if(ulChilds.x < 0) {
				ulx += ulChilds.x;
				xMovement -= ulChilds.x;
				changeBounds = true;
			}
			
			if(ulChilds.y < 0) {
				uly += ulChilds.y;
				yMovement -= ulChilds.y;
				changeBounds = true;
			}
			
			var xProtrusion = xMovement + ulChilds.x + childsBounds.width()
								- bounds.width();
			if(xProtrusion > 0) {
				lrx += xProtrusion;
				changeBounds = true;
			}
			
			var yProtrusion = yMovement + ulChilds.y + childsBounds.height()
								- bounds.height();
			if(yProtrusion > 0) {
				lry += yProtrusion;
				changeBounds = true;
			}
			
			bounds.set(ulx, uly, lrx, lry);
			
			/* Update hashed bounds for docker positioning */
			if(changeBounds) {
				this.hashedContainers[shape.resourceId] = bounds.clone();
			}
			
			this.moveChildsBy(shape, {x: xMovement, y: yMovement}, ignoreList);
			
			/* Signals that children are already move to correct position */
			return true;
		}
		
		/* Resize container to minimum size */
		
		var ulx = ulShape.x;
		var uly = ulShape.y;
		var lrx = lrShape.x;
		var lry = lrShape.y;
		changeBounds = false;
			
		/* Ensure height */
		if(bounds.height() < childsBounds.height()) {
			/* Shape was resized on upper left in height */
			if(ulShape.y != shape._oldBounds.upperLeft().y &&
				lrShape.y == shape._oldBounds.lowerRight().y) {
				uly = lry - childsBounds.height() - 1;	
				if(options.fixedY) {
					uly -= childsBounds.upperLeft().y;
				}
				changeBounds = true;
			} 
			/* Shape was resized on lower right in height */
			else if(ulShape.y == shape._oldBounds.upperLeft().y &&
				lrShape.y != shape._oldBounds.lowerRight().y) {
				lry = uly + childsBounds.height() + 1;	
				if(options.fixedY) {
					lry += childsBounds.upperLeft().y;
				}
				changeBounds = true;
			} 
			/* Both upper left and lower right changed */
			else if(ulChildAbsBounds) {
				var ulyDiff = absBounds.upperLeft().y - ulChildAbsBounds.upperLeft().y;
				var lryDiff = absBounds.lowerRight().y - ulChildAbsBounds.lowerRight().y;
				uly -= ulyDiff;
				lry -= lryDiff;
				uly--;
				lry++;
				changeBounds = true;
			}
		}
		
		/* Ensure width */
		if(bounds.width() < childsBounds.width()) {
			/* Shape was resized on upper left in height */
			if(ulShape.x != shape._oldBounds.upperLeft().x &&
				lrShape.x == shape._oldBounds.lowerRight().x) {
				ulx = lrx - childsBounds.width() - 1;
				if(options.fixedX) {
					ulx -= childsBounds.upperLeft().x;
				}	
				changeBounds = true;
			} 
			/* Shape was resized on lower right in height */
			else if(ulShape.x == shape._oldBounds.upperLeft().x &&
				lrShape.x != shape._oldBounds.lowerRight().x) {
				lrx = ulx + childsBounds.width() + 1;
				if(options.fixedX) {
					lrx += childsBounds.upperLeft().x;
				}	
				changeBounds = true;
			} 
			/* Both upper left and lower right changed */
			else if(ulChildAbsBounds) {
				var ulxDiff = absBounds.upperLeft().x - ulChildAbsBounds.upperLeft().x;
				var lrxDiff = absBounds.lowerRight().x - ulChildAbsBounds.lowerRight().x;
				ulx -= ulxDiff;
				lrx -= lrxDiff;
				ulx--;
				lrx++;
				changeBounds = true;
			}
		}
		
		/* Set minimum bounds */
		bounds.set(ulx, uly, lrx, lry);
		if(changeBounds) {
			//this.hashedContainers[shape.resourceId] = bounds.clone();
			this.handleLayoutContainerDockers({shape:shape});
		}
	},
	
	/**
	 * Moves all child shapes and related dockers of the container shape by the 
	 * relative move point.
	 * 
	 * @param {Object} shape
	 * 		The container shape
	 * @param {Object} relativeMovePoint
	 * 		The point that defines the movement
	 */
	moveChildsBy: function(shape, relativeMovePoint, ignoreList) {
		if(!shape || !relativeMovePoint) {
			return;
		}
		
		/* Move child shapes */
		this.getChildShapesWithout(shape, ignoreList).each(function(child) {
			child.bounds.moveBy(relativeMovePoint);
		});
		
		/* Move related dockers */
		//this.moveChildDockers(shape, relativeMovePoint);
	},
	
	/**
	 * Retrieves the absolute bounds that include all child shapes.
	 * 
	 * @param {Object} shape
	 */
	getAbsoluteBoundsForChildShapes: function(shape) {
//		var childsBounds = this.retrieveChildsIncludingBounds(shape);
//		if(!childsBounds) {return undefined}
//		
//		var ulShape = shape.getChildShapes(false).find(function(node) {
//			return childsBounds.upperLeft().y == node.bounds.upperLeft().y;
//		});
//		
////		var lrShape = shape.getChildShapes(false).find(function(node) {
////			return childsBounds.lowerRight().y == node.bounds.lowerRight().y;
////		});
//		
//		var absUl = ulShape.absoluteBounds().upperLeft();
//		
//		this.hashedContainers[shape.getId()].childsBounds = 
//						new ORYX.Core.Bounds(absUl.x, 
//											absUl.y,
//											absUl.x + childsBounds.width(),
//											absUl.y + childsBounds.height());
//		
//		return this.hashedContainers[shape.getId()];
	},
	
	/**
	 * Moves the docker when moving shapes.
	 * 
	 * @param {Object} shape
	 * @param {Object} offset
	 */
	moveChildDockers: function(shape, offset){
		
		if (!offset.x && !offset.y) {
			return;
		} 
		
		// Get all nodes
		shape.getChildNodes(true)
			// Get all incoming and outgoing edges
			.map(function(node){
				return [].concat(node.getIncomingShapes())
						.concat(node.getOutgoingShapes())
			})
			// Flatten all including arrays into one
			.flatten()
			// Get every edge only once
			.uniq()
			// Get all dockers
			.map(function(edge){
				return edge.dockers.length > 2 ? 
						edge.dockers.slice(1, edge.dockers.length-1) : 
						[];
			})
			// Flatten the dockers lists
			.flatten()
			.each(function(docker){
				docker.bounds.moveBy(offset);
			})
	},
	
	/**
	 * Calculates the bounds that include all child shapes of the given shape.
	 * 
	 * @param {Object} shape
	 * 		The parent shape.
	 */
	retrieveChildsIncludingBounds: function(shape, ignoreList) {
		var childsBounds = undefined;
		this.getChildShapesWithout(shape, ignoreList).each(function(childShape, i) {
			if(i == 0) {
				/* Initialize bounds that include all direct child shapes of the shape */
				childsBounds = childShape.bounds.clone();
				return;
			}
			
			/* Include other child elements */
			childsBounds.include(childShape.bounds);			
		});
		
		return childsBounds;
	},
	
	/**
	 * Returns the direct child shapes that are not on the ignore list.
	 */
	getChildShapesWithout: function(shape, ignoreList) {
		var childs = shape.getChildShapes(false);
		return childs.findAll(function(child) {
					return !ignoreList.member(child.getStencil().id());				
				});
	}
}

ORYX.Plugins.ContainerLayouter = ORYX.Plugins.AbstractPlugin.extend(ORYX.Plugins.ContainerLayouter);
/**
 * Copyright (c) 2009
 * Willi Tscheschner
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 **/

if(!ORYX.Plugins) { ORYX.Plugins = {} }
if(!ORYX.Plugins.Layouter) { ORYX.Plugins.Layouter = {} }

new function(){
	
	/**
	 * Edge layouter is an implementation to layout an edge
	 * @class ORYX.Plugins.Layouter.EdgeLayouter
	 * @author Willi Tscheschner
	 */
	ORYX.Plugins.Layouter.EdgeLayouter = ORYX.Plugins.AbstractLayouter.extend({
		
		/**
		 * Layout only Edges
		 */
		layouted : [	"http://b3mn.org/stencilset/bpmn1.1#SequenceFlow", 
						"http://b3mn.org/stencilset/bpmn1.1#MessageFlow",
						"http://b3mn.org/stencilset/bpmn2.0#MessageFlow",
						"http://b3mn.org/stencilset/bpmn2.0#SequenceFlow", 
						"http://b3mn.org/stencilset/bpmn2.0conversation#ConversationLink",
						"http://b3mn.org/stencilset/epc#ControlFlow",
						"http://www.signavio.com/stencilsets/processmap#ProcessLink",
						"http://www.signavio.com/stencilsets/organigram#connection"],
		
		/**
		 * Layout a set on edges
		 * @param {Object} edges
		 */
		layout: function(edges){
			edges.each(function(edge){
				this.doLayout(edge)
			}.bind(this))
		},
		
		/**
		 * Layout one edge
		 * @param {Object} edge
		 */
		doLayout: function(edge){
			// Get from and to node
			var from 	= edge.getIncomingNodes()[0]; 
			var to 		= edge.getOutgoingNodes()[0];
			
			// Return if one is null
			if (!from || !to) { return }
			
			var positions = this.getPositions(from, to, edge);
		
			if (positions.length > 0){
				this.setDockers(edge, positions[0].a, positions[0].b);
			}
				
		},
		
		/**
		 * Returns a set on positions which are not containt either 
		 * in the bounds in from or to.
		 * @param {Object} from Shape where the edge is come from
		 * @param {Object} to Shape where the edge is leading to
		 * @param {Object} edge Edge between from and to
		 */
		getPositions : function(from, to, edge){
			
			// Get absolute bounds
			var ab = from.absoluteBounds();
			var bb = to.absoluteBounds();
			
			// Get center from and to
			var a = ab.center();
			var b = bb.center();
			
			var am = ab.midPoint();
			var bm = bb.midPoint();
		
			// Get first and last reference point
			var first = Object.clone(edge.dockers.first().referencePoint);
			var last = Object.clone(edge.dockers.last().referencePoint);
			// Get the absolute one
			var aFirst = edge.dockers.first().getAbsoluteReferencePoint();
			var aLast = edge.dockers.last().getAbsoluteReferencePoint(); 
			
			// IF ------>
			// or  |
			//     V
			// Do nothing
			if (Math.abs(aFirst.x-aLast.x) < 1 || Math.abs(aFirst.y-aLast.y) < 1) {
				return []
			}
			
			// Calc center position, between a and b
			// depending on there weight
			var m = {}
			m.x = a.x < b.x ? 
					(((b.x - bb.width()/2) - (a.x + ab.width()/2))/2) + (a.x + ab.width()/2): 
					(((a.x - ab.width()/2) - (b.x + bb.width()/2))/2) + (b.x + bb.width()/2);

			m.y = a.y < b.y ? 
					(((b.y - bb.height()/2) - (a.y + ab.height()/2))/2) + (a.y + ab.height()/2): 
					(((a.y - ab.height()/2) - (b.y + bb.height()/2))/2) + (b.y + bb.height()/2);
								
								
			// Enlarge both bounds with 10
			ab.widen(5); // Wide the from less than 
			bb.widen(20);// the to because of the arrow from the edge
								
			var positions = [];
			var off = this.getOffset.bind(this);
			
			// Checks ----+
			//            |
			//            V
			if (!ab.isIncluded(b.x, a.y)&&!bb.isIncluded(b.x, a.y)) {
				positions.push({
					a : {x:b.x+off(last,bm,"x"),y:a.y+off(first,am,"y")},
					z : this.getWeight(from, a.x < b.x ? "r" : "l", to, a.y < b.y ? "t" : "b", edge)
				});
			}
						
			// Checks | 
			//        +--->
			if (!ab.isIncluded(a.x, b.y)&&!bb.isIncluded(a.x, b.y)) {
				positions.push({
					a : {x:a.x+off(first,am,"x"),y:b.y+off(last,bm,"y")},
					z : this.getWeight(from, a.y < b.y ? "b" : "t", to, a.x < b.x ? "l" : "r", edge)
				});
			}
						
			// Checks  --+
			//           |
			//           +--->
			if (!ab.isIncluded(m.x, a.y)&&!bb.isIncluded(m.x, b.y)) {
				positions.push({
					a : {x:m.x,y:a.y+off(first,am,"y")},
					b : {x:m.x,y:b.y+off(last,bm,"y")},
					z : this.getWeight(from, "r", to, "l", edge, a.x > b.x)
				});
			}
			
			// Checks | 
			//        +---+
			//            |
			//            V
			if (!ab.isIncluded(a.x, m.y)&&!bb.isIncluded(b.x, m.y)) {
				positions.push({
					a : {x:a.x+off(first,am,"x"),y:m.y},
					b : {x:b.x+off(last,bm,"x"),y:m.y},
					z : this.getWeight(from, "b", to, "t", edge, a.y > b.y)
				});
			}	
			
			// Sort DESC of weights
			return positions.sort(function(a,b){ return a.z < b.z ? 1 : (a.z == b.z ? -1 : -1)});
		},
		
		/**
		 * Returns a offset for the pos to the center of the bounds
		 * 
		 * @param {Object} val
		 * @param {Object} pos2
		 * @param {String} dir Direction x|y
		 */
		getOffset: function(pos, pos2, dir){
			return pos[dir] - pos2[dir];
		},
		
		/**
		 * Returns a value which shows the weight for this configuration
		 * 
		 * @param {Object} from Shape which is coming from
		 * @param {String} d1 Direction where is goes
		 * @param {Object} to Shape which goes to
		 * @param {String} d2 Direction where it comes to
		 * @param {Object} edge Edge between from and to
		 * @param {Boolean} reverse Reverse the direction (e.g. "r" -> "l")
		 */
		getWeight: function(from, d1, to, d2, edge, reverse){
			
			d1 = (d1||"").toLowerCase();
			d2 = (d2||"").toLowerCase();
			
			if (!["t","r","b","l"].include(d1)){ d1 = "r"}
			if (!["t","r","b","l"].include(d2)){ d1 = "l"}
			
			// If reverse is set
			if (reverse) {
				// Reverse d1 and d2
				d1 = d1=="t"?"b":(d1=="r"?"l":(d1=="b"?"t":(d1=="l"?"r":"r")))
				d2 = d2=="t"?"b":(d2=="r"?"l":(d2=="b"?"t":(d2=="l"?"r":"r")))
			}
			
					
			var weight = 0;
			// Get rules for from "out" and to "in"
			var dr1 = this.facade.getRules().getLayoutingRules(from, edge)["out"];
			var dr2 = this.facade.getRules().getLayoutingRules(to, edge)["in"];

			var fromWeight = dr1[d1];
			var toWeight = dr2[d2];


			/**
			 * Return a true if the center 1 is in the same direction than center 2
			 * @param {Object} direction
			 * @param {Object} center1
			 * @param {Object} center2
			 */
			var sameDirection = function(direction, center1, center2){
				switch(direction){
					case "t": return Math.abs(center1.x - center2.x) < 2 && center1.y < center2.y
					case "r": return center1.x > center2.x && Math.abs(center1.y - center2.y) < 2
					case "b": return Math.abs(center1.x - center2.x) < 2 && center1.y > center2.y
					case "l": return center1.x < center2.x && Math.abs(center1.y - center2.y) < 2
					default: return false;
				}
			}

			// Check if there are same incoming edges from 'from'
			var sameIncomingFrom = from
								.getIncomingShapes()
								.findAll(function(a){ return a instanceof ORYX.Core.Edge})
								.any(function(e){ 
									return sameDirection(d1, e.dockers[e.dockers.length-2].bounds.center(), e.dockers.last().bounds.center());
								});

			// Check if there are same outgoing edges from 'to'
			var sameOutgoingTo = to
								.getOutgoingShapes()
								.findAll(function(a){ return a instanceof ORYX.Core.Edge})
								.any(function(e){ 
									return sameDirection(d2, e.dockers[1].bounds.center(), e.dockers.first().bounds.center());
								});
			
			// If there are equivalent edges, set 0
			//fromWeight = sameIncomingFrom ? 0 : fromWeight;
			//toWeight = sameOutgoingTo ? 0 : toWeight;
			
			// Get the sum of "out" and the direction plus "in" and the direction 						
			return (sameIncomingFrom||sameOutgoingTo?0:fromWeight+toWeight);
		},
		
		/**
		 * Removes all current dockers from the node 
		 * (except the start and end) and adds two new
		 * dockers, on the position a and b.
		 * @param {Object} edge
		 * @param {Object} a
		 * @param {Object} b
		 */
		setDockers: function(edge, a, b){
			if (!edge){ return }
			
			// Remove all dockers (implicit,
			// start and end dockers will not removed)
			edge.dockers.each(function(r){
				edge.removeDocker(r);
			});
			
			// For a and b (if exists), create
			// a new docker and set position
			[a, b].compact().each(function(pos){
				var docker = edge.createDocker(undefined, pos);
				docker.bounds.centerMoveTo(pos);
			});
			
			// Update all dockers from the edge
			edge.dockers.each(function(docker){
				docker.update()
			})
			
			// Update edge
			//edge.refresh();
			edge._update(true);
			
		}
	});
	
	
}()
if(!ORYX.Plugins)
	ORYX.Plugins = new Object();
if (!ORYX.Config) {
	ORYX.Config = new Object();
}
/*
 * http://oryx.processwave.org/gadget/oryx_stable.xml
 */
ORYX.Config.WaveThisGadgetUri = "http://ddj0ahgq8zch6.cloudfront.net/gadget/oryx_stable.xml";
ORYX.Plugins.WaveThis = Clazz.extend({
	
	/**
	 *	Constructor
	 *	@param {Object} Facade: The Facade of the Editor
	 */
	construct: function(facade) {
		this.facade = facade;
		this.facade.offer({
			'name':				ORYX.I18N.WaveThis.name,
			'functionality': 	this.waveThis.bind(this),
			'group': 			ORYX.I18N.WaveThis.group,
			'icon': 			ORYX.PATH + "images/waveThis.png",
			'description': 		ORYX.I18N.WaveThis.desc,
            'dropDownGroupIcon':ORYX.PATH + "images/export2.png",

		});
		
		this.changeDifference = 0;
		
		// Register on events for executing commands and save, to monitor the changed status of the model 
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_UNDO_EXECUTE, function(){ this.changeDifference++ }.bind(this) );
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_EXECUTE_COMMANDS, function(){ this.changeDifference++ }.bind(this) );
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_UNDO_ROLLBACK, function(){ this.changeDifference-- }.bind(this) );
		
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MODEL_SAVED, function(){ this.changeDifference =0}.bind(this) );

	},
	waveThis: function(){
		var modelUri;
		if(!location.hash.slice(1)){
			Ext.Msg.alert(ORYX.I18N.WaveThis.name, ORYX.I18N.WaveThis.failUnsaved);
			return;
		}
		else{
			modelUri = ORYX.CONFIG.WEB_URL+'/backend/poem/'+(location.hash.slice(1).replace(/^\/?/,"").replace(/\/?$/,""))+"/json";
		}
		if(this.changeDifference!=0){
	        Ext.Msg.confirm(ORYX.I18N.WaveThis.name, "You have unsaved changes in your model. Proceed?", function(id){
	        	if(id=="yes"){
	        		this._openWave(modelUri);
	        	}
	        },this);
		}else{
			this._openWave(modelUri);
		}
		
	},
	_openWave: function(modelUri){
		var win = window.open("");
		if (win != null) {
			win.document.open();
			win.document.write("<html><body>");
			var submitForm = win.document.createElement("form");
			win.document.body.appendChild(submitForm);
			
			var createHiddenElement = function(name, value) {
				var newElement = document.createElement("input");
				newElement.name=name;
				newElement.type="hidden";
				newElement.value = value;
				return newElement
			}
			
			submitForm.appendChild( createHiddenElement("u", modelUri) );
			submitForm.appendChild( createHiddenElement("g", ORYX.Config.WaveThisGadgetUri) );
			
			
			submitForm.method = "POST";
			win.document.write("</body></html>");
			win.document.close();
			submitForm.action= "https://wave.google.com/wave/wavethis?t=Oryx%20Model%20Export";
			submitForm.submit();
		}
	}
})/**
		})) {
	}