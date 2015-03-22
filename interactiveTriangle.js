
var gl;

var points = [];
var prepoints = [];

var speed = 30;

var NumTimesToSubdivide = 5;

var u_FragColor;

var canvas;

var color = [1.0, 0.0, 0.0, 1.0];

var xMark=0, yMark=0;
var x=0, y=0;

var variance=0.02;

var mouseDown = false;

var mouseMode = "physics";
var xVel = 0, yVel = 0;
var xCent = .5, yCent = .5;

var gasketPoints;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    canvas.addEventListener("mousedown", doMouseDown, false);
    canvas.addEventListener("mouseup", doMouseUp, false);
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    
	var vertices = [
        vec2( -1,  -1),
        vec2( 0,  1),
        vec2( 1,  -1 ),
    ];
    
    divideTriangle( vertices[0], vertices[1], vertices[2],
                    NumTimesToSubdivide);
    gasketPoints = points.length;
	
    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    
    
    
    gl.useProgram( program );
    
    u_FragColor = gl.getUniformLocation(program, 'u_FragColor');
    
    // Load the data into the GPU    
    
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(vPosition);
    
    //thetaLoc = gl.getUniformLocation(program, "theta");
    
    // Initialize event handlers
    
    document.getElementById("subdivisions").onchange = function(event) {
    	    	
        NumTimesToSubdivide = event.srcElement.value;
        
        points = [];
        divideTriangle( vertices[0], vertices[1], vertices[2],
                    NumTimesToSubdivide);
                    
        gasketPoints = points.length;
		
    	gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
		render();

    };
    
    document.getElementById("variance").onchange = function () {
        
        variance = event.srcElement.value;
        points = [];
        divideTriangle( vertices[0], vertices[1], vertices[2],
                    NumTimesToSubdivide);

    	gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);		
		render();
    };
    
    document.getElementById("reset").onclick = function() {
		
      x = 0;
      y = 0;
      
      points = [];
      
      divideTriangle( vertices[0], vertices[1], vertices[2],
                    NumTimesToSubdivide);
      
     gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);	
	 render();
      
    };
    
    document.getElementById("rColor").onchange = function () {
        
        var red = event.srcElement.value;
        
        color[0] = red;
		gl.uniform4fv(u_FragColor, color);

    	gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);		
		render();
    };
    
    document.getElementById("bColor").onchange = function () {
        
        var green = event.srcElement.value;
        
        color[1] = green;
		gl.uniform4fv(u_FragColor, color);

    	gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);		
		render();
    };
    
    document.getElementById("gColor").onchange = function () {
        
        var blue = event.srcElement.value;
        
        color[2] = blue;
		gl.uniform4fv(u_FragColor, color);

    	gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);		
		render();
    };
    
    document.getElementById("mode").onclick = function() {
    	
    	if(mouseMode == "physics") {
    		mouseMode = "draw";
    		document.getElementById("mode").innerHTML = "Physics Mode";
    	}
    	else {
    		mouseMode = "physics";
    		document.getElementById("mode").innerHTML = "Draw Mode";
    	}
    	
    	
    	
    };
    
    canvas.onmousemove = function(event) {
    	
    	if(mouseMode == "draw") {
    		
    		xMark = event.clientX;
			yMark = event.clientY;
			var rect = event.target.getBoundingClientRect();
	
			xMark = ((xMark - rect.left) - canvas.height / 2) / (canvas.height / 2);
			yMark = (canvas.width / 2 - (yMark - rect.top)) / (canvas.width / 2);
		
			var n = vec2(xMark-.03, yMark-.03);
			var o = vec2(xMark+.03, yMark-.03);
			var p = vec2(xMark, yMark+.03);
		
			triangle(n, o, p);
		
		}
    	
    };

    window.onkeydown = function( event ) {
        var key = String.fromCharCode(event.keyCode);
        switch( key ) {
          case 'R':
			color = [1.0, 0.0, 0.0, 1.0];
			
			gl.uniform4fv(u_FragColor, color);
			
			gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
		
			
			render();
            break;

          case 'G':
			color = [0.0, 1.0, 0.0, 1.0];
			
			gl.uniform4fv(u_FragColor, color);
			
			gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
		
			
			render();
            break;

          case 'B':
			color = [0.0, 0.0, 1.0, 1.0];
			
			gl.uniform4fv(u_FragColor, color);
			
			//gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
		
			
			render();
            break;
        }
    };
    
    

	setInterval(render, 16);

    //render();
};




function doMouseDown(event) {
	
	//var canvas_x = event.pageX;
	//var canvas_y = event.pageY;
	
	//alert("X=" + canvas_x + " Y=" + canvas_y);
	
	if(mouseMode == "physics") {
		xMark = event.clientX;
		yMark = event.clientY;
		var rect = event.target.getBoundingClientRect();
	
		xMark = ((xMark - rect.left) - canvas.height / 2) / (canvas.height / 2);
		yMark = (canvas.width / 2 - (yMark - rect.top)) / (canvas.width / 2);
	}
	
	//alert(xMark + " " + yMark);
	
	//gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
	
	//render();
	
}

function doMouseUp(event) {
	
	var xRemark = event.clientX;
	var yRemark = event.clientY;
	var rect = event.target.getBoundingClientRect();
	
	xRemark = ((xRemark - rect.left) - canvas.height / 2) / (canvas.height / 2);
	yRemark = (canvas.width / 2 - (yRemark - rect.top)) / (canvas.width / 2);
	
	xVel = xRemark - xMark;
	yVel = yRemark - yMark;

	//gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
	render();
}

function triangle( a, b, c )
{
    points.push( a, b, c );
}

function divideTriangle( a, b, c, count )
{

    // check for end of recursion
    
    if ( count === 0 ) {
        triangle( a, b, c );
    }
    else {
    
        //bisect the sides        
        
        var ab = mix( a, b, .5 );
        var ac = mix( a, c, .5 );
        var bc = mix( b, c, .5 );
        
        --count;
        
        
        // perturb midpoints
        
		if(Math.random() > .5)
        	a[0] += Math.random()*variance;
        else
        	a[0] -= Math.random()*variance;
        if(Math.random() > .5)
        	a[1] += Math.random()*variance;
        else
        	a[1] -= Math.random()*variance;
        	
        if(Math.random() > .5)
        	b[0] += Math.random()*variance;
        else
        	b[0] -= Math.random()*variance;
        if(Math.random() > .5)
        	b[1] += Math.random()*variance;
        else
        	b[1] -= Math.random()*variance;
        	
        if(Math.random() > .5)
        	c[0] += Math.random()*variance;
        else
        	c[0] -= Math.random()*variance;
        if(Math.random() > .5)
        	c[1] += Math.random()*variance;
        else
        	c[1] -= Math.random()*variance;
        
        
        
        // three new triangles
        
        divideTriangle( a, ab, ac, count );
        divideTriangle( c, ac, bc, count );
        divideTriangle( b, bc, ab, count );
        
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    
    //var color = [1.0, 0.0, 1.0, 1.0];
	gl.uniform4fv(u_FragColor, color);
	
	if(mouseMode == "physics") {
		if(xVel != 0 && yVel != 0) {
		
			prepoints = points;
		
			xCent += xVel;
			yCent += yVel;
		
		

			for(var i=0; i < gasketPoints; i++) {
				points[i][0] = prepoints[i][0] + xVel/2;
				points[i][1] = prepoints[i][1] + yVel/2;
			
				if(i==0 || i == Math.floor(gasketPoints/3) || i == Math.floor(2*gasketPoints/3)) {
					points[i][0] += xVel/2;
					points[i][1] += yVel/2;
				}
			
			}

			xVel *= .9;
			yVel *= .9;
		
			if(xCent > 1 || xCent < 0)
				xVel *= -1;
			if(yCent > 1 || yCent < 0)
				yVel *= -1;

			if(Math.abs(xVel) < .01)
				xVel = 0;
			if(Math.abs(yVel) < .01)
				yVel = 0;

		}
	
	}
	//else if(mouseMode == "draw") {
		
		
		
		
	//}
	
	gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
	
	var saveColor = color;
	color = [0.5, 0.5, 1.0, 1.0];	
	gl.uniform4fv(u_FragColor, color);
	
	for(var i=gasketPoints; i < points.length; i+=3)
		gl.drawArrays( gl.TRIANGLES, i, 3 );
	
	color = saveColor;
	gl.uniform4fv(u_FragColor, color);
	
	for(var i=0; i < gasketPoints; i+=3)
		gl.drawArrays( gl.LINE_LOOP, i, 3 );
		
	
		

}
