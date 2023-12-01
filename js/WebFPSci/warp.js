var renderedImage = new THREE.WebGLMultisampleRenderTarget(window.innerWidth, window.innerHeight, {
    format: THREE.RGBFormat,
      stencilBuffer: false,
      depthBuffer: true,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.NearestFilter
});
  
var warpTransform = new THREE.Matrix4();
var warpScene = new THREE.Scene();
  
var warpQuad = new THREE.Mesh(          // Use a single textured quad for warp
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      vertexShader: `
      uniform mat4 uTransform;
      varying vec2 texCoord;
      void main() {
        texCoord = uv;
        gl_Position = uTransform * vec4(position.xy, 0.0, 1.0);
      }
      `,
      fragmentShader:`
      uniform sampler2D uScene;
      varying vec2 texCoord;
      void main() {
        gl_FragColor = texture(uScene, texCoord);
      }
      `,
      //depthWrite: false,
      //depthTest: false,
      uniforms: {
        uTransform: { value: warpTransform },
        uScene: { value: renderedImage.texture },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      },
    })
);

function applyLatewarp() {
  const recentCameraToWorld = new THREE.Matrix4().makeRotationFromEuler(rawInputState.cameraRotation);
  const recentWorldToCamera = new THREE.Matrix4().getInverse(recentCameraToWorld);
  var oldWorldToCamera = camera.matrixWorld.clone();
  oldWorldToCamera.setPosition(0.0, 0.0, 0.0);
  warpTransform.copy(camera.projectionMatrix);
  warpTransform.multiply(recentWorldToCamera);
  warpTransform.multiply(oldWorldToCamera);
  warpTransform.multiply(camera.projectionMatrixInverse);
  renderer.setRenderTarget( null );                           // Render to the frame buffer
  renderer.shadowMap.enabled = false;
  renderer.render( warpScene, warpCamera );                   // Render the scene
  renderer.shadowMap.enabled = true;
}