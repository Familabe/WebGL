window.onload = function () {
    myWebglStart();
};

//========================= GLOBAL VARIABLES ==========
var AMORTIZATION = 0.95;
var drag = false;
var old_x = 0, old_y = 0;
var dX = 0, dY = 0;
var THETA = 0, PHI = 0;
var move = 0;

var canvas;

var indices;

var verticesBuffer;
var texturePointBuffer;
var indicesBuffer;
var normalsBuffer;

var position;
var uv;
var normals;

var shaderprogram

var _Pmatrix;
var _Vmatrix;
var _Mmatrix;
var _sampler;
var _normalMatrix;

var cubeTexture;


function myWebglStart(){
	canvas = document.getElementById("canvas");
	canvas.width=window.innerWidth;
	canvas.height=window.innerHeight;
	canvas.addEventListener("mousedown", mouseDown, false);
    canvas.addEventListener("mouseup", mouseUp, false);
    canvas.addEventListener("mouseout", mouseUp, false);
    canvas.addEventListener("mousemove", mouseMove, false);
	if (canvas.addEventListener)
	{
		// IE9, Chrome, Safari, Opera
		canvas.addEventListener("mousewheel", mouseWheel, false);
		// Firefox
		canvas.addEventListener("DOMMouseScroll", mouseWheel, false);
	}
	
	
	var gl = initWebGl(canvas);
	//continue, if WebGl is working.
	if (gl){
		// gl.clearColor(0.0, 0.0, 0.0, 1.0);
		// gl.clearDepth(1.0);
		// gl.enable(gl.DEPTH_TEST);
		// gl.depthfunc(gl.LEQUAL);
	
	
	initShader(gl);
	
	initBuffer(gl);
	
	initTexture("./data/albedo.jpg");
	
	drawScene(gl);
		
	}
	
}



function initWebGl(canvas){
	gl = canvas.getContext("experimental-webgl");
	if (!gl) {
		alert("Unable to initialize WebGL!");
		return;
	}
	return gl;
}


function initShader(gl){
	// var vertCode = 
			// 'attribute vec3 a_position;\n' +
			// 'attribute vec2 a_uv;\n' +
			// 'attribute vec3 a_normals;\n' +
			// 'varying vec3 v_Lighting;\n' +
			// 'varying vec2 v_UV;\n' +
			// 'uniform mat4 u_NormalMatrix;\n' +
            // 'uniform mat4 u_Pmatrix;\n' +
            // 'uniform mat4 u_Vmatrix;\n' +
			// 'uniform mat4 u_Mmatrix;\n' +
            // 'void main(void) { \n' +
            // '    gl_Position = u_Pmatrix*u_Vmatrix*u_Mmatrix*vec4(a_position, 1.0); \n' +
			// '    v_UV = a_uv; \n' +
			// '	vec3 ambientLight = vec3(1.0, 1.0, 1.0); \n' +
			// '	vec3 directionalLightColor = vec3(1.0, 0.0, 0.0); \n' +
			// '	vec3 directionalVector = vec3(0.4, 0.2, 0.3); \n' +
			// '	vec4 transformedNormal = u_NormalMatrix * vec4(a_normals, 1.0); \n' +
			// '	float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0); \n' +
			// '	v_Lighting = ambientLight + (directionalLightColor * directional); \n' +
            // '}\n';
			
	// var fragCode = 
			// 'precision mediump float; \n' +
			// 'uniform sampler2D u_sampler;\n' +
			// 'varying vec2 v_UV;\n' +
			// 'varying vec3 v_Lighting;\n' +
            // 'void main(void) {\n' +
			// '   vec4 texelColor = texture2D(u_sampler, vUV);\n' +
            // '   gl_FragColor = vec4(texelColor.rgb * v_Lighting, texelColor.a);\n' +
            // '}\n';
	var vertCode = document.getElementById("2d-vertex-shader").text;
    var fragCode = document.getElementById("2d-fragment-shader").text;
	
    var vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, vertCode);
    gl.compileShader(vertShader);

    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, fragCode);
    gl.compileShader(fragShader);
		
    shaderprogram = gl.createProgram();
    gl.attachShader(shaderprogram, vertShader);
    gl.attachShader(shaderprogram, fragShader);
    gl.linkProgram(shaderprogram);
	
	
	// If creating the shader program failed, alert
	if (!gl.getProgramParameter(shaderprogram, gl.LINK_STATUS)) {
		alert("Unable to initialize the shader program: ");
	}
	
	gl.useProgram(shaderprogram);
	
	_Pmatrix = gl.getUniformLocation(shaderprogram, "u_Pmatrix");
    _Vmatrix = gl.getUniformLocation(shaderprogram, "u_Vmatrix");
    _Mmatrix = gl.getUniformLocation(shaderprogram, "u_Mmatrix");
	_sampler = gl.getUniformLocation(shaderprogram, "u_sampler");
	_normalMatrix = gl.getUniformLocation(shaderprogram,"u_normalMatrix");
	
	
	position = gl.getAttribLocation(shaderprogram, "a_position");
	gl.enableVertexAttribArray(position);
	
	uv = gl.getAttribLocation(shaderprogram, "a_uv");
	gl.enableVertexAttribArray(uv);
	
	normals = gl.getAttribLocation(shaderprogram, "a_normals");
	gl.enableVertexAttribArray(normals);
}


function initBuffer(gl){
			 
	// init geometry
	// set vertices
    var vertices = [
		// Front face
		-1.0, -1.0,  1.0,
		 1.0, -1.0,  1.0,
		 1.0,  1.0,  1.0,
		-1.0,  1.0,  1.0,

		// Back face
		-1.0, -1.0, -1.0,
		-1.0,  1.0, -1.0,
		 1.0,  1.0, -1.0,
		 1.0, -1.0, -1.0,

		// Top face
		-1.0,  1.0, -1.0,
		-1.0,  1.0,  1.0,
		 1.0,  1.0,  1.0,
		 1.0,  1.0, -1.0,

		// Bottom face
		-1.0, -1.0, -1.0,
		 1.0, -1.0, -1.0,
		 1.0, -1.0,  1.0,
		-1.0, -1.0,  1.0,

		// Right face
		 1.0, -1.0, -1.0,
		 1.0,  1.0, -1.0,
		 1.0,  1.0,  1.0,
		 1.0, -1.0,  1.0,

		// Left face
		-1.0, -1.0, -1.0,
		-1.0, -1.0,  1.0,
		-1.0,  1.0,  1.0,
		-1.0,  1.0, -1.0   
		];

	verticesBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	
	// set texture points
	var points = [
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0
		];
	texturePointBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, texturePointBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
	
	// set indeces
    indices = [
		0, 1,  2,
		0, 2,  3,
		
		4, 5,  6,
		4, 6,  7,
		
		8, 9,  10,
		8, 10, 11,
		
		12, 13, 14,
		12, 14, 15,

		16, 17, 18,
		16, 18, 19,
		
		20, 21, 22,
		20, 22, 23

	];
		
	indicesBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
	
	var cubeNormals = [
		// front
		 0.0,  0.0,  1.0,
		 0.0,  0.0,  1.0,
		 0.0,  0.0,  1.0,
		 0.0,  0.0,  1.0,
		
		// behind
		 0.0,  0.0, -1.0,
		 0.0,  0.0, -1.0,
		 0.0,  0.0, -1.0,
		 0.0,  0.0, -1.0,
		
		// up
		 0.0,  1.0,  0.0,
		 0.0,  1.0,  0.0,
		 0.0,  1.0,  0.0,
		 0.0,  1.0,  0.0,
		
		// bottom
		 0.0, -1.0,  0.0,
		 0.0, -1.0,  0.0,
		 0.0, -1.0,  0.0,
		 0.0, -1.0,  0.0,
		
		// right
		 1.0,  0.0,  0.0,
		 1.0,  0.0,  0.0,
		 1.0,  0.0,  0.0,
		 1.0,  0.0,  0.0,
		
		// left
		-1.0,  0.0,  0.0,
		-1.0,  0.0,  0.0,
		-1.0,  0.0,  0.0,
		-1.0,  0.0,  0.0
	 ];
	 
	normalsBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeNormals), gl.STATIC_DRAW);
	
}

function initTexture(image_URL){
	cubeTexture = setTexture(image_URL);	
}

function drawScene(gl){
	
	var mo_matrix = [ 1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1 ];
    var view_matrix = new mat4.create();
	var proj_matrix = new mat4.create();
	mat4.perspective(proj_matrix, 45, canvas.width/canvas.height, 1, 100);
	
	var zTranslate = -6;
    view_matrix[14] = view_matrix[14] + zTranslate;
		
	var camera = [0, 0, 10];
	var target = [3, 0, 0];
	var up = [0, 1, 0];
	var cameraMatrix = m4.lookAt(camera, target, up);
	
	var inverseCameraMatrix = m4.inverse(cameraMatrix);
		
	mat4.scalar.multiply(view_matrix, view_matrix, inverseCameraMatrix);
	gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
	gl.vertexAttribPointer(position, 3, gl.FLOAT, false,0,0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, texturePointBuffer);	
	gl.vertexAttribPointer(uv, 2, gl.FLOAT, false,0,0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
	gl.vertexAttribPointer(normals, 3, gl.FLOAT, false, 0, 0);

	
	
    var animate = function(time) {
		
		resize(gl.canvas);
		
        if (!drag) {
           dX*=AMORTIZATION; 
		   dY*=AMORTIZATION;
           THETA+= dX, PHI+= dY;
        }
         	
		if( move != 0){
			zTranslate = view_matrix[14];
			   if( move > 0)
					view_matrix[14] += 1;
			   else if( move < 0)
					view_matrix[14] -= 1;

			move = 0;
		}	
		
		
		
		//set model matrix to I4
		mo_matrix = new mat4.create();	

		mat4.rotateY(mo_matrix, mo_matrix, THETA);
		mat4.rotateX(mo_matrix, mo_matrix, PHI);
		
		var nMatrix = m4.inverse(mo_matrix);
		mat4.transpose(nMatrix, nMatrix);
			
	
		
        gl.enable(gl.DEPTH_TEST);		
				
        gl.clearColor(0.5, 0.5, 0.5, 0.9);
        gl.clearDepth(1.0);
        gl.viewport(0.0, 0.0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.uniformMatrix4fv(_Pmatrix, false, proj_matrix);
        gl.uniformMatrix4fv(_Vmatrix, false, view_matrix);
        gl.uniformMatrix4fv(_Mmatrix, false, mo_matrix);
		gl.uniformMatrix4fv(_normalMatrix, false, nMatrix );
		
		if (cubeTexture.webglTexture) {
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, cubeTexture.webglTexture);
			gl.uniform1i(_sampler, 0);
		}
		
	

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
		gl.flush();
        window.requestAnimationFrame(animate);
    }
		
         animate(0);
	
}

function resize(canvas){
	var displayWidth = canvas.clientWidth;
	var displayHeight = canvas.clientHeight;
	
	if (canvas.width != displayWidth ||
		canvas.height != displayHeight){
			
		canvas.width = displayWidth;
		canvas.height = displayHeight;
	}
	
}

function getImage(image_URL){
	var image=new Image();
	image.src=image_URL;
	image.webglTexture=false;
	return image;
};

function degToRad(d) {
	return d * Math.PI / 180;
}

function radToDeg(r) {
	return r * 180 / Math.PI;
}

var mouseDown = function(e) {
    drag = true;
    old_x = e.pageX, old_y = e.pageY;
    e.preventDefault();
    return false;
};
 
var mouseUp = function(e){
    drag = false;
};
 
var mouseMove = function(e) {
    if (!drag) return false;
    dX = (e.pageX-old_x)*2*Math.PI/canvas.width,
    dY = (e.pageY-old_y)*2*Math.PI/canvas.height;
    THETA+= dX;
    PHI+=dY;
    old_x = e.pageX, old_y = e.pageY;
    e.preventDefault();
};



var mouseWheel = function (e) {
	
	if ((e.wheelDelta || e.detail) > 0)
		move = 1;
	else
		move = -1;

};

 var getImage = function(image_URL){
	var image=new Image();
	image.src=image_URL;
	image.webglTexture=false;
	return image;
 };	

var setTexture = function(image_URL){		  
	var image = getImage(image_URL);	  
	
	image.onload = function(e) {
		var texture = gl.createTexture();
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.bindTexture(gl.TEXTURE_2D, null);
		image.webglTexture = texture;
	};
  return image;
};