let scene = new THREE.Scene(); {
    const color = 0x1A01B9;
    scene.fog = new THREE.Fog(color, 75, 200);
}

const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({
    canvas
});

const fov = 50;
const aspect = 2; // the canvas default
const near = 0.1;
const far = 200;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 20;

//renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x1A01B9, 1);

///////////////////////////// CANVAS TEXTURE

// let canvText = document.createElement("canvas");
// canvText.width = 512;
// canvText.height = 512;

// let texture = new THREE.CanvasTexture(canvText);
// let material = new THREE.MeshBasicMaterial({
//     map: texture,
//     transparent: true,
//     //opacity: 0.0
// });

// moreGeo = new THREE.PlaneGeometry(4, 4);
// moreMesh = new THREE.Mesh(moreGeo, material);
// scene.add(moreMesh);
// moreMesh.visible = false;

// let ctx = canvText.getContext("2d");
// ctx.clearRect(0, 0, canvText.width, canvText.height);
// ctx.fillStyle = "White";
// ctx.font = "80px sans-serif";
// ctx.fillText('więcej', 256, 80);

// const image = new Image();
// image.onload = drawImageActualSize;
// image.src = './assets/more.png';

// function drawImageActualSize() {

//     ctx.drawImage(this, 256, 100, this.width * 2, this.height * 2);
// }

let selectedTitle = "";
let selectedHandler = "";

//titleMesh.rotation.x = Math.PI / 2;

///////////////////////////// TITLE DIV

let titleDiv = document.createElement("div");
titleDiv.style.color = "white";
//titleDiv.innerHTML = '<img width = 32px height = 32px style="display: inline-block; margin-right: 10px" src="assets/x.png"><span style="vertical-align: middle;">Hello!</span>';
titleDiv.style.zIndex = "100";
titleDiv.style.display = "none";
titleDiv.style.alignItems = "center";
titleDiv.style.position = "absolute";
titleDiv.style.left = "24px";
titleDiv.style.top = "24px";
titleDiv.style.fontSize = "40px";
document.body.appendChild(titleDiv);

///////////////////////////// MORE DIV

let moreDiv = document.createElement("div");
moreDiv.style.color = "white";
// moreDiv.innerHTML = '<span style = "display:block; float: left">więcej</span></br><img width = 89px height = 44px style = "margin-top: 10px "  src="assets/more.png">';
moreDiv.style.zIndex = "100";
moreDiv.style.display = "none";
moreDiv.style.position = "absolute";
moreDiv.style.left = "24px";
moreDiv.style.bottom = "24px";
moreDiv.style.fontSize = "40px";
moreDiv.style.cursor = "pointer";
document.body.appendChild(moreDiv);

moreDiv.addEventListener('click', function () {
    console.log("handler: " + selectedHandler);
}, false);


///////////////////////////// BROWSER CHECK

let isSafari = false;


let isMobile = false;

if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    isMobile = true;
} else {
    isMobile = false;
}



/////////////////////// RAYCASTER

const raycaster = new THREE.Raycaster();
raycaster.layers.set(1);
let selectedPlane = null;

//////////////////////// STATS
// let stats;
// stats = new Stats();
// document.body.appendChild(stats.dom);

////////////////////// GUI
let params = {
    camRot: 0.15,
    planeSize: 12,
    planeSpread: 32,
    visFar: 200,
    visNear: 20,
    depthSpread: 10,
    fogStart: 75,
    fogEnd: 200
}

function changeParams() {
    for (let i = 0; i < projectsArr.length; i++) {
        projectsArr[i].size = params.planeSize;
        projectsArr[i].update();
    }
    scene.fog.near = params.fogStart;
    scene.fog.far = params.fogEnd;
}

/////////////////////// EVENTS

document.addEventListener('mousemove', onDocumentMouseMove, false);
document.addEventListener('click', onDocumentClick, false);
document.addEventListener('wheel', onDocumentWheel, false);

document.addEventListener("touchstart", function (event) {
    //event.preventDefault();
    return false;
}, false);

document.addEventListener("touchmove", onDocumentTouchmove, false);

let plusZ = 0;

function onDocumentWheel(event) {

    if (selectedPlane == null) plusZ += event.deltaY / 200;

}

let moveY = 0; //current y pos
let moveY2 = moveY; //previous y pos
let error = 5; //touch sensitivity, I found between 4 and 7 to be good values. 

function onDocumentTouchmove(event) {

    //get current y pos
    moveY = event.changedTouches[0].clientY;

    //ingnore user jitter
    if (Math.abs(moveY - moveY2) > error) {
        //find direction of y
        if (moveY > moveY2) {

            if (selectedPlane == null) plusZ += moveY / 1000;
        } else {

            if (selectedPlane == null) plusZ -= moveY / 1000;
        }
        //store current y pos
        moveY2 = moveY;
    }

    return false;

}

let mouse = new THREE.Vector2();
let camTargetRotX = 0;
let camTargetRotY = 0;

let unmutedVideo = null;

function onDocumentClick(event) {

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0 && selectedPlane == null && intersects[0].object.visible) {

        //console.log(intersects[0].object);
        let parent;

        /////// SELECT
        for (let i = 0; i < projectsArr.length; i++) {
            if (intersects[0].object.uuid == projectsArr[i].uuid) {
                parent = projectsArr[i];
                selectedPlane = projectsArr[i].uuid;
                projectsArr[i].selected = true;
                selectedTitle = projectsArr[i].name;
                selectedHandler = projectsArr[i].handle;
                //console.log('index:', projectsArr[i].index);
            } else {
                projectsArr[i].blendMesh.material.color.setHex(0x1A01B9);
                projectsArr[i].blendMesh.material.opacity = 0.9;
            }
        }

        if (parent.isVideo) {
            for (let i = 0; i < projectsArr.length; i++) {

                if (projectsArr[i].isVideo && projectsArr[i].visible && projectsArr[i].uuid != parent.uuid) {
                    projectsArr[i].vid.pause();
                }
            }
            if (parent.videoLoaded) {
                unmutedVideo = parent.texture.image;
                if (parent.videoLoaded) parent.texture.image.muted = false;
            }
        }


        let localpos = new THREE.Vector3();
        localpos = camera.worldToLocal(intersects[0].object.position);
        intersects[0].object.parent = camera;

        ///////// TWEEN        

        let cameraZ = camera.position.z;
        let planeZ = 4;
        let distance = cameraZ - planeZ;
        let aspect = intersects[0].object.scale.x / intersects[0].object.scale.y;
        let screenAspect = window.innerWidth / window.innerHeight;
        let vFov = camera.fov * Math.PI / 180;
        let hFov = 2 * Math.atan(Math.tan(vFov / 2) * screenAspect);

        let planeHeightAtDistance = 2 * Math.tan(vFov / 2) * distance;
        let planeWidthAtDistance = planeHeightAtDistance * aspect;

        if (window.innerWidth < window.innerHeight) {
            planeWidthAtDistance = planeHeightAtDistance * screenAspect;
            planeHeightAtDistance = planeWidthAtDistance / aspect;
        }
        const coords = {
            x: localpos.x,
            y: localpos.y,
            z: localpos.z,
            rotx: intersects[0].object.rotation.x,
            roty: intersects[0].object.rotation.y,
            rotz: intersects[0].object.rotation.z,
            scalex: intersects[0].object.scale.x,
            scaley: intersects[0].object.scale.y
        }

        var tween = new TWEEN.Tween(coords)
            .to({
                x: 0,
                y: 0,
                z: -20,
                rotx: 0,
                roty: 0,
                rotz: 0,
                scalex: planeWidthAtDistance,
                scaley: planeHeightAtDistance
            }, 500)
            .easing(TWEEN.Easing.Back.Out)
            .onUpdate(() => {
                intersects[0].object.position.x = coords.x;
                intersects[0].object.position.y = coords.y;
                intersects[0].object.position.z = coords.z;
                intersects[0].object.rotation.x = coords.rotx;
                intersects[0].object.rotation.y = coords.roty;
                intersects[0].object.rotation.z = coords.rotz;
                intersects[0].object.scale.x = coords.scalex;
                intersects[0].object.scale.y = coords.scaley
            })
            .onComplete(function () {
                // moreMesh.visible = true;
                // moreMesh.parent = camera;
                // moreMesh.position.set(Math.tan(hFov / 2) * -16, Math.tan(vFov / 2) * -16, -19);
                titleDiv.style.display = "flex";
                titleDiv.innerHTML = '<img width = 32px height = 32px style="display: inline-block; margin-right: 10px" src="assets/x.png">' +
                    '<span style="vertical-align: middle; font-family: lazzer">' + selectedTitle + '</span>';
                moreDiv.style.display = "block";
                moreDiv.innerHTML = '<span style = "display:block; float: left; font-family: lazzer">więcej</span></a>' +
                    '</br><img width = 89px height = 44px style = "margin-top: 10px " src="assets/more.png">';

            })
            .start();

        //blendMesh.renderOrder = 998;
        //scene.fog.near = 20;
        //scene.fog.far = 50;
    } else {

        ///////////// CLOSE

        if (unmutedVideo != null) {
            unmutedVideo.muted = true;
            unmutedVideo = null;
            for (let i = 0; i < projectsArr.length; i++) {
                if (projectsArr[i].isVideo && projectsArr[i].visible) {
                    projectsArr[i].vid.play();
                }
            }
        }

        selectedPlane = null;
        titleDiv.style.display = "none";
        titleDiv.innerHTML = '';
        moreDiv.style.display = "none";
        moreDiv.innerHTML = '';
        //moreMesh.visible = false;
        //blendMesh.position.z = 100;
        //blendMesh.renderOrder = 0;
        for (let i = 0; i < projectsArr.length; i++) {
            projectsArr[i].blendMesh.material.opacity = 0.0;
            projectsArr[i].mesh.parent = scene;
            projectsArr[i].selected = false;
            projectsArr[i].update();
        }
    }
}

function onDocumentMouseMove(event) {

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    if (!isMobile) {
        camTargetRotX = mouse.y * params.camRot;
        camTargetRotY = -mouse.x * params.camRot;
    }

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
        if (intersects[0].object.visible) document.body.style.cursor = "pointer";

    } else {
        document.body.style.cursor = "default";
    }
}

/////////////////////// PLANES

let projectsArr = [];

function getRnd(min, max) {
    return Math.random() * (max - min) + min;
}

function newPlane(n, vid, url, han, tit) {
    let p = new projectPlane(
        getRnd(-params.planeSpread * camera.aspect, params.planeSpread * camera.aspect),
        getRnd(-params.planeSpread, params.planeSpread),
        -20 - n * params.depthSpread,
        params.planeSize,
        vid,
        url,
        "assets/poster.jpg",
        n,
        han,
        tit);
    projectsArr.push(p);
}


function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width = Math.round(canvas.clientWidth * pixelRatio);
    const height = Math.round(canvas.clientHeight * pixelRatio);
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}

/////////////////////// ANIMATE

let animate = function (time) {

    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }

    plusZ += (0 - plusZ) * 0.05;

    for (let i = 0; i < projectsArr.length; i++) {

        // if (plusZ > 0.2 || plusZ < -0.2) {
        //     if (projectsArr[i].isVideo && projectsArr[i].vid && projectsArr[i].visible) projectsArr[i].vid.pause();
        // } else {
        //     if (projectsArr[i].isVideo && projectsArr[i].vid && projectsArr[i].visible) projectsArr[i].vid.play();
        // }

        if (selectedPlane == null) projectsArr[i].pos.z += plusZ;

        if (projectsArr[i].pos.z >= -params.visFar && projectsArr[i].pos.z <= -params.visNear) {
            if (!projectsArr[i].loaded) projectsArr[i].load();
            if (!projectsArr[i].visible) {
                projectsArr[i].show();
            }
        } else {
            if (projectsArr[i].loaded && projectsArr[i].visible) {
                projectsArr[i].hide();
            }
        }

        if (projectsArr[i].pos.z > camera.position.z - params.visNear) {
            projectsArr[i].pos.x = getRnd(-params.planeSpread * camera.aspect, params.planeSpread * camera.aspect);
            projectsArr[i].pos.y = getRnd(-params.planeSpread, params.planeSpread);
            projectsArr[i].pos.z = projectsArr[i].pos.z - projectsArr.length * params.depthSpread;
            projectsArr[i].update();

            projectsArr[i].rot.x = projectsArr[i].mesh.rotation.x;
            projectsArr[i].rot.y = projectsArr[i].mesh.rotation.y;
            projectsArr[i].rot.z = projectsArr[i].mesh.rotation.z;
        }

        if (projectsArr[i].pos.z < -projectsArr.length * params.depthSpread) {

            projectsArr[i].pos.x = getRnd(-params.planeSpread * camera.aspect, params.planeSpread * camera.aspect);
            projectsArr[i].pos.y = getRnd(-params.planeSpread, params.planeSpread);
            projectsArr[i].pos.z = projectsArr[i].pos.z + projectsArr.length * params.depthSpread;
            projectsArr[i].update();

            projectsArr[i].rot.x = projectsArr[i].mesh.rotation.x;
            projectsArr[i].rot.y = projectsArr[i].mesh.rotation.y;
            projectsArr[i].rot.z = projectsArr[i].mesh.rotation.z;
        }

        if (projectsArr[i].uuid != selectedPlane) {
            //console.log(selectedPlane);
            projectsArr[i].update();
        }
    }


    camera.rotation.x += (camTargetRotX - camera.rotation.x) * 0.03;
    camera.rotation.y += (camTargetRotY - camera.rotation.y) * 0.03;

    TWEEN.update(time);

    //stats.begin();

    renderer.render(scene, camera);
    requestAnimationFrame(animate);

    //stats.end();
};

animate();