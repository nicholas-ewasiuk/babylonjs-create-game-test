
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";

import { Engine, Scene, Vector3, Mesh, Color3, Color4, ShadowGenerator, GlowLayer, PointLight, FreeCamera, CubeTexture, Sound, PostProcess, Effect, SceneLoader, Matrix, MeshBuilder, Quaternion, AssetsManager } from "@babylonjs/core";
import { PlayerInput } from "./inputController";
import { Player } from "./characterController";
import { Hud } from "./ui";
import { AdvancedDynamicTexture, StackPanel, Button, TextBlock, Rectangle, Control, Image } from "@babylonjs/gui";
import { Environment } from "./environment";

enum State { START = 0, GAME = 1, LOSE = 2, CUTSCENE = 3 }

class App {
  // Generel Entire Application
  private _scene: Scene;
  private _canvas: HTMLCanvasElement;
  private _engine: Engine;

  //Game State Related
  public assets;
  private _input: PlayerInput;
  private _player: Player;
  private _ui: HDRCubeTexture;
  private _environment;

  //Sounds
  //public sfx: Sound;
  public game: Sound;
  public end: Sound;

  //Scene - related
  private _state: number = 0;
  private _gamescene: Scene;
  private _cutScene: Scene;

  //post process
  private _transition: boolean = false;

  constructor() {
    // create the canvas html element and attach it to the webpage
    this._canvas = this._createCanvas();

    // Initialize Babylon scene and engine
    this._engine = new Engine(this._canvas, true);
    this._scene = new Scene(this._engine);

            // hide/show the Inspector
        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+I
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
                if (this._scene.debugLayer.isVisible()) {
                    this._scene.debugLayer.hide();
                } else {
                    this._scene.debugLayer.show();
                }
            }
        });

        // run the main render loop
        this._engine.runRenderLoop(() => {
            this._scene.render();
        });
    }

    //Set up the canvas
    private _createCanvas(): HTMLCanvasElement {

      //create the canvas html element and attach it to the webpage
      this._canvas = document.createElement("canvas");
      this._canvas.style.width = "100%";
      this._canvas.style.height = "100%";
      this._canvas.id = "gameCanvas";
      document.body.appendChild(this._canvas);

      return this._canvas;
    }

    private async _goToStart() {
      this._engine.displayLoadingUI(); //make sure to wait for start to load

      //--Scene setup--
      //Dont detect any inputs from this ui while the game is loading
      this._scene.detachControl();
      let scene = new Scene(this._engine);
      scene.clearColor = new Color4(0, 0, 0, 1);
      //Creates and positions a free camera
      let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), scene);
      camera.setTarget(Vector3.Zero()); //targets the camera to scene origin

      //--Sounds--
      const start = new Sound("startSong", "./sounds/copycat(revised).mp3", scene, function () {
      }, {
        volume: 0.25,
        loop: true,
        autoplay: true
      });
      const sfx = new Sound("selection", "./sounds/vgmenuselect.wav", scene, function() {
      });

      //--GUI--
      const guiMenu = AdvancedDynamicTexture.CreateFullscreen("UI");
      guiMenu.ideaHeight = 720;

      //Background image
      const imageRect = new Rectangle("titleContainer");
      imageRect.width = 0.8;
      imageRect.thickness = 0;
      guiMenu.addControl(imageRect);

      const startbg = new Image("startbg", "sprites/start.jpeg");
      imageRect.addControl(startbg);

      const title = new TextBlock("title", "SUMMER'S FESTIVAL");
      title.resizeToFit = true;
      title.fontFamily = "Ceviche One";
      title.fontSize = "64px";
      title.color = "white";
      title.top = "14px";
      title.width = 0.8;
      title.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
      imageRect.addControl(title);

      const startBtn = Button.CreateSimpleButton("start", "PLAY");
      startBtn.fontFamily = "Viga";
      startBtn.width = 0.2
      startBtn.height = "40px";
      startBtn.color = "white";
      startBtn.top = "-14px";
      startBtn.thickness = 0;
      startBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
      imageRect.addControl(startBtn);

      //Set up transition effect: modified version of https://www.babylonjs-playground.com/#2FGYE8#0
      Effect.RegisterShader("fade", 
        "precision highp float;" +
        "varying vec2 vUV;" +
        "uniform sampler2D textureSampler; " +
        "uniform float fadeLevel; " +
        "void main(void){" +
        "vec4 baseColor = texture2D(textureSampler, vUV) * fadeLevel;" +
        "baseColor.a = 1.0;" +
        "gl_FragColor = baseColor;" +
        "}");
      
      let fadeLevel = 1.0;
      this._transition = false;
      scene.registerBeforeRender(() => {
        if (this._transition) {
          fadeLevel -= .05;
          if(fadeLevel <= 0){
            this._goToCutScene();
            this._transition = false;
          }
        }
      })

      startBtn.onPointerDownObservable.add(() => {
        //fade screen
        const postProcess = new PostProcess("Fade", "fade", ["fadelevel"], null, 1.0, camera);
        postProcess.onApply = (effect) => {
          effect.setFloat("fadeLevel", fadeLevel);
        };
        this._transition = true;
        //sounds
        sfx.play();

        scene.detachControl(); //observables disabled 
    });

    let isMobile = false;
    //--MOBILE--
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      isMobile = true;
      //popup for mobile to rotate screen
      const rect1 = new Rectangle();
      rect1.height = 0.2;
      rect1.width = 0.3;
      rect1.verticalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
      rect1.horizontalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
      rect1.background == "white";
      rect1.alpha = 0.8;
      guiMenu.addControl(rect1);

      const rect = new Rectangle();
      
    }
}
new App();