interface ProgramInfo {
    program: WebGLProgram,
    attribLocations: {
        vertexPosition: number
    },
    uniformLocations: {
        projectionMatrix: WebGLUniformLocation,
        modelViewMatrix: WebGLUniformLocation
    }
}


const canvas = <HTMLCanvasElement>document.getElementsByTagName('canvas')[0];
const gl = <WebGLRenderingContext>canvas.getContext('webgl');
const cw = canvas.width;
const ch = canvas.height;
let shaders: string[] = [];

fetch("/res/shaders/someShader.glsl").then(res => res.text()).then(res => shaders.push(res.toString()))
fetch("/res/shaders/fragShader.glsl").then(res => res.text()).then(res => shaders.push(res.toString()))

function draw() {
    if (shaders.length < 2) return;
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    const shaderProgram = initShaderProgram(gl, shaders[0], shaders[1]);
    if (shaderProgram === null) return;
    const shaderProgramProjectionMatrix = gl.getUniformLocation(shaderProgram, 'uProjectionMatrix');
    const shaderProgramModelViewMatrix = gl.getUniformLocation(shaderProgram, 'uModelViewMatrix');
    if (shaderProgramModelViewMatrix === null || shaderProgramProjectionMatrix === null) {
        console.error('shaderProgramProjectionMatrix or shaderProgramModelViewMatrix is null');
        return;
    }
    const programInfo: ProgramInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition')
        },
        uniformLocations: {
            projectionMatrix: shaderProgramProjectionMatrix,
            modelViewMatrix: shaderProgramModelViewMatrix
        }
    }

    gl.clearColor(0, 0, 0, 1);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const fieldOfView = Math.PI / 4;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100;
    //@ts-ignore
    const projectionMatrix = mat4.create();


}


draw.rate = 30;

draw.interval = setInterval(draw, 1000 / draw.rate);

function initShaderProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    if (vertexShader === null || fragmentShader === null) return null;

    const shaderProgram = gl.createProgram();
    if (shaderProgram === null) return null;
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error("impossible d'initialiser le progamme de shader : " + gl.getProgramInfoLog(shaderProgram))
        return null;
    }

    return shaderProgram;
}

function loadShader(gl: WebGLRenderingContext, type: number, source: string) {
    const shader = gl.createShader(type);
    if (shader === null) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("an error occured while compiling the shader");
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function initBuffers(gl: WebGLRenderingContext) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
        1, 1,
        -1, 1,
        1, -1,
        -1, -1,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    return {
        position: positionBuffer
    };
}


