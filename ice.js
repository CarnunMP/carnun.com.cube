// Written using https://webgl2fundamentals.org/webgl/lessons/webgl-fundamentals.html as a jumping-off point.

var canvas = document.querySelector("#c");
var gl = canvas.getContext("webgl2");
if (!gl) {
  // TODO: provide proper fallback
  alert("No WebGL for you!");
}


/* --- helpers --- */
function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

// from https://webgl2fundamentals.org/webgl/resources/webgl-utils.js
function resizeCanvasToDisplaySize(canvas, multiplier) {
  multiplier = multiplier || 1;
  const width  = canvas.clientWidth  * multiplier | 0;
  const height = canvas.clientHeight * multiplier | 0;
  if (canvas.width !== width ||  canvas.height !== height) {
    canvas.width  = width;
    canvas.height = height;
    return true;
  }
  return false;
}

function executeProgram(primitiveType, count) {
  // resize based on CSS
  resizeCanvasToDisplaySize(gl.canvas);
  // map -1<->+1 'clip space' to 0<->gl.canvas.width etc. 'screen space'
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  // clear the screen
  gl.clearColor(1, 0, 0, 0.1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  // and draw
  var offset = 0;
  gl.drawArrays(primitiveType, offset, count);
}


/* --- shaders --- */
var vertexShaderSource = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec4 a_position;

// all shaders have a main function
void main() {

  // gl_Position is a special variable a vertex shader
  // is responsible for setting
  gl_Position = a_position;
}
`;

var fragmentShaderSource = `#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  // Just set the output to a constant reddish-purple
  outColor = vec4(1, 0, 0.5, 1);
}
`;


/* --- create 'program' --- */
var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
var program = createProgram(gl, vertexShader, fragmentShader);


/* --- set up the program's state --- */
// look up location of attribute
var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
// 'attributes get data from buffers, so we need to create a buffer'
var positionBuffer = gl.createBuffer();
// set global buffer (gl.ARRAY_BUFFER) to this buffer
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

// three 2d points
var positions = [
  0, 0, // (3rd and 4th vec4 points will be the default: 0 and 1 respectively)
  0, 0.5,
  0.7, 0
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

// create special collection of attribute data
var vertexArrayObj = gl.createVertexArray();
// bind it (for subsequent calls)
gl.bindVertexArray(vertexArrayObj);
// 'turn it on'
gl.enableVertexAttribArray(positionAttributeLocation);
// specify how the vertex shader will pull the data out
var size = 2;          // 2 components per iteration
var type = gl.FLOAT;   // 32 bit floats
var normalize = false;
var stride = 0;        // (like Clojure partition size)
var offset = 0;
// bind current ARRAY_BUFFER to the attribute, freeing up ARRAY_BUFFER (if we want)
gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

// tell WebGL to use our program
gl.useProgram(program);

// now, execute!
executeProgram(gl.TRIANGLES, 3);
