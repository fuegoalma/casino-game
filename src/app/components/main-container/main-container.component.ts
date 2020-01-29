import * as _ from 'lodash';
import * as THREE from 'three-full';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-main-container',
  templateUrl: './main-container.component.html',
  styleUrls: ['./main-container.component.css']
})
export class MainContainerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('container', { static: true }) public elementRef: ElementRef;
  private container: HTMLElement;

  private scene3d: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private roomMeshes: THREE.Mesh[] = [null, null, null];
  private roomMaterial: THREE.MeshBasicMaterial;

  protected onWindowResize: () => void;

  private animationDuration = 2000;
  private animationDelay = 500;
  private animationStarted = false;
  private animationStatus = [false, false, false];
  private generatedResult = [];

  private texturesToLoad = {
    mainTexture: 'slots.png'
  };

  private loadedTextures = {
    mainTexture: null
  };

  private countOfLoadedTextures = 0;
  private countOfTextures = 0;
  private userScores = 50000;

  public winLabel = 'Here will be your result';

  constructor() {}

  public ngOnInit(): void {
    this.countOfTextures = Object.keys(this.texturesToLoad).length;

    this.onWindowResize = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    };
  }

  public ngAfterViewInit(): void {
    const screen = {
        width: window.innerWidth,
        height: window.innerHeight
    },
        view = {
            angle: 100,
            aspect: screen.width / screen.height,
            near: 0.1,
            far: 2000
        };
  
    this.container = this.elementRef.nativeElement;
  
    this.scene3d = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(view.angle, view.aspect, view.near, view.far);
  
    this.camera.position.set(0, 0, 2000);
  
    this.scene3d.add(this.camera);
  
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(screen.width, screen.height);
    this.renderer.setClearColor( 0xdddddd, 1 );
    this.container.appendChild(this.renderer.domElement);
  
    window.addEventListener('resize', this.onWindowResize, false);

    this.loadTextures();
  }

  protected loadTextures(): void {
    if (this.countOfLoadedTextures >= this.countOfTextures) {
      this.startApp();
      return;
    }

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setPath('/assets/textures/');

    let keys: string[] = Object.keys(this.texturesToLoad);
    if (!keys || keys.length === 0) {
      return;
    }

    textureLoader.load(this.texturesToLoad[keys[this.countOfLoadedTextures]], (object) => {
        this.loadedTextures[keys[this.countOfLoadedTextures]] = object;
        this.countOfLoadedTextures++;

        if (this.countOfLoadedTextures === this.countOfTextures) {
          this.startApp();
        } else {
          this.loadTextures();
        }
    });
  }
  
  public startApp():void {
    this.setupSceneTexture();
    this.render();
  }

  protected setupSceneTexture(): void {
    for (let i = 0; i < this.roomMeshes.length; i++) {
      this.scene3d.remove(this.roomMeshes[i]);
      this.roomMeshes[i] = null;
    }

    let geometry;
    geometry = new THREE.CylinderGeometry(500, 500, 500, 64, 1, true);

    this.roomMaterial = new THREE.MeshBasicMaterial({
        map: this.loadedTextures.mainTexture,
        side: THREE.DoubleSide
    });

    // material.opacity = 0.2;
    // material.transparent = true;

    this.roomMeshes[0] = new THREE.Mesh(geometry, this.roomMaterial);
    this.roomMeshes[0].rotation.x = -Math.PI / 5.5;
    this.roomMeshes[0].rotation.z = 1.57;
    this.roomMeshes[0].position.set(-500, 0, 0);
    this.scene3d.add(this.roomMeshes[0]);

    this.roomMeshes[1] = new THREE.Mesh(geometry, this.roomMaterial);
    this.roomMeshes[1].rotation.x = -Math.PI / 5.5;
    this.roomMeshes[1].rotation.z = 1.57;
    this.roomMeshes[1].position.set(0, 0, 0);
    this.scene3d.add(this.roomMeshes[1]);

    this.roomMeshes[2] = new THREE.Mesh(geometry, this.roomMaterial);
    this.roomMeshes[2].rotation.x = -Math.PI / 5.5;
    this.roomMeshes[2].rotation.z = 1.57;
    this.roomMeshes[2].position.set(500, 0, 0);
    this.scene3d.add(this.roomMeshes[2]);
  }

  protected render(): void {
  
    const self: MainContainerComponent = this;
  
    (function render() {
        self.animate();
        self.renderer.render(self.scene3d, self.camera);
        requestAnimationFrame(render);
    }());
  }

  protected animate(): void {
      const speed = 0.15;
      if (!this.animationStarted) {
        return;
      }

      for (let i = 0; i < this.animationStatus.length; i++) {
        if (this.animationStatus[i] || this.generatedResult[i].scrollTo > this.roomMeshes[i].rotation.x) {
          this.roomMeshes[i].rotation.x += speed;
          if (!this.animationStatus[i] && this.roomMeshes[i].rotation.x > this.generatedResult[i].scrollTo) {
            this.roomMeshes[i].rotation.x = this.generatedResult[i].scrollTo;
          }
        } else if (i === this.animationStatus.length - 1 && this.animationStarted) {
          // test win and finish animation
          this.animationStarted = false;
          this.clearRotationFromCircles();
          this.checkWin();
        }
      }
  }

  private clearRotationFromCircles(): void {
    for (let i = 0; i < this.animationStatus.length; i++) {
      let countOfRounds = Math.floor(this.roomMeshes[i].rotation.x / (2 * Math.PI));
      this.roomMeshes[i].rotation.x -= countOfRounds * 2 * Math.PI;
    }
  }

  public play(): void {
    if (this.animationStarted) {
      return;
    }

    this.userScores--;
    this.animationStarted = true;
    this.animationStatus = [true, true, true];

    this.generateWinResult();

    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.animationStatus[i] = false;
        let countOfRounds = Math.floor(this.roomMeshes[i].rotation.x / (2 * Math.PI));
        let donePath = this.roomMeshes[i].rotation.x - countOfRounds * 2 * Math.PI;
        if (donePath > this.generatedResult[i].scrollTo) {
          countOfRounds++;
        }
        let scrollBack = Math.PI / (this.generatedResult[i].count ? 5.5 : 2.7);
        this.generatedResult[i].scrollTo += countOfRounds * 2 * Math.PI - scrollBack;
      }, this.animationDuration + this.animationDelay * i);
    }
  }

  private generateWinResult(): void {
    this.generatedResult = [];
    for(let i = 0; i < 3; i++) {
      let result = {
        count: Math.round(Math.random()),
        element: Math.floor(Math.random() * Math.floor(5)),
        scrollTo: 0
      };

      result.scrollTo = (2 * Math.PI / 5) * result.element;

      this.generatedResult.push(result);
    }
  }

  public checkWin(): void {
    let wonNothing = false;
    for (let i = 0; i < this.generatedResult.length - 1; i++) {
      if (this.generatedResult[i].count !== this.generatedResult[i + 1].count) {
        wonNothing = true;
        break;
      }
    }

    if (!wonNothing) {
      let elements = [];
      for (let i = 0; i < this.generatedResult.length; i++) {
        elements.push(this.generatedResult[i].element);
      }

      let result: number = this.checkCombination(elements, !!this.generatedResult[0].count);

      if (!result) {
        wonNothing = true;
      } else {
        this.userScores += result;
        this.winLabel = 'You won ' + result + ' coins!';
      }
    }

    if (wonNothing) {
      this.winLabel = 'You won nothing';
    } 
  }

  private checkCombination(elements: number[], isDouble: boolean): number {
    /* 7 -> 0, cherry -> 1, bar -> 2, barx2 -> 3, barx3 -> 4 */
    let winCombinations = [
      // for single
      [
        // cherries
        [1, 1, 1],
        // sevens
        [0, 0, 0],
        // cherries and sevens
        [1, 1, 0],

        [1, 0, 0],
        // 3xbars
        [4, 4, 4],
        // 2xbars
        [3, 3, 3],
        // bars
        [2, 2, 2],
        // 3 any bars
        [2, 3, 3],
        [2, 4, 4],
        [3, 2, 2],
        [3, 4, 4],
        [4, 2, 2],
        [4, 3, 3],
        [2, 3, 4]
      ],
      // for double
      [
        // cherries
        [1, 1, 1],
        // sevens
        [0, 0, 0],
        // cherries and sevens
        [1, 1, 0],

        [1, 0, 0],
        // 3xbars
        [4, 4, 4],
        // 2xbars
        [3, 3, 3],
        // bars
        [2, 2, 2],
        // 3 any bars
        [2, 3, 3],
        [2, 4, 4],
        [3, 2, 2],
        [3, 4, 4],
        [4, 2, 2],
        [4, 3, 3],
        [2, 3, 4]
      ]
    ];

    let winPrice = [
      // for single
      [
        // cherries
        1000,
        // sevens
        150,
        // cherries and sevens
        75,
        75,
        // 3xbars
        50,
        // 2xbars
        20,
        // bars
        10,
        // 3 any bars
        5,
        5,
        5,
        5,
        5,
        5,
        5
      ],
      // for double
      [
        // cherries
        2000,
        // sevens
        4000,
        // cherries and sevens
        75,
        75,
        // 3xbars
        150,
        // 2xbars
        50,
        // bars
        20,
        // 3 any bars
        5,
        5,
        5,
        5,
        5,
        5,
        5
      ]
    ];

    if (!isDouble) {
      for (let i = 0; i < winCombinations[0].length; i++) {
        if (_.isEqual(_.sortBy(winCombinations[0][i]), _.sortBy(elements))) {
          return winPrice[0][i];
        }
      }
    } else {
      for (let i = 0; i < winCombinations[1].length; i++) {
        if (_.isEqual(_.sortBy(winCombinations[1][i]), _.sortBy(elements))) {
          return winPrice[1][i];
        }
      }
    }
    return 0;
  }

  public ngOnDestroy(): void {
  }
}
