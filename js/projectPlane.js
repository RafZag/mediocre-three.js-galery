class projectPlane {
    texture;
    poster;
    isVideo;
    material = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.0
    });
    geometry = new THREE.PlaneGeometry();
    mesh = new THREE.Mesh(this.geometry, this.material);

    blendMat = new THREE.MeshBasicMaterial({
        color: 0x1A01B9,
        transparent: true,
        opacity: 0.0
    });
    blendGeo = new THREE.PlaneGeometry();
    blendMesh = new THREE.Mesh(this.blendGeo, this.blendMat);

    ratio;
    pos = {
        x: 0,
        y: 0,
        z: 0
    }
    uuid;
    rot = {
        x: 0,
        y: 0,
        z: 0
    };
    selected = false;
    visible = false;
    loaded = false;
    videoLoaded = false;
    target = new THREE.Vector3(0, 0, 100);
    vid;

    static playingNo = 0;
    static get maxVideosPlaying() {
        return 6;
    }

    constructor(x, y, z, s, video, img, poster, index, handle, name) {
        this.pos.x = x;
        this.pos.y = y;
        this.pos.z = z;
        this.size = s;
        this.image = img;
        this.isVideo = video;
        this.index = index;
        this.handle = handle;
        this.name = name;
        this.poster = poster;
    }

    load() {
        if (this.isVideo) this.videoInit();
        else this.pictureInit();
        this.loaded = true;
        //console.log("loading:", this.image);
    }



    videoInit() {
        this.poster = new THREE.TextureLoader().load(this.poster, () => {
            //console.log("poster loaded!")
        });
        this.material.map = this.poster;
        this.material.opacity = 1;
        this.visible = true;
        this.mesh.layers.enable(1);
        this.mesh.visible = true;
        scene.add(this.mesh);

        this.uuid = this.mesh.uuid;
        this.mesh.x = this.pos.x;
        this.mesh.y = this.pos.y;
        this.mesh.z = this.pos.z;

        // const vid = document.getElementById('video');
        this.vid = document.createElement("video");
        this.vid.preload = "auto";
        this.vid.setAttribute("playsinline", "");
        this.vid.setAttribute("crossorigin", "anonymous");
        // this.vid.setAttribute("poster", "assets/poster.jpg");
        this.texture = new THREE.VideoTexture(this.vid);
        let source = document.createElement("source");
        source.type = "video/mp4";
        source.src = this.image;

        fetch(this.image, {
            method: 'HEAD'
        }).then((response) => {
            // console.log(response)
            source.src = response.url
            this.vid.appendChild(source);
        });

        this.vid.addEventListener('loadedmetadata', this.resize.bind(this), false);
        this.vid.addEventListener('canplaythrough', () => {
            // if (this.vid.buffered.end(0) >= this.vid.duration / 4) {
            this.videoLoaded = true;
            this.playVideo();
            // if (this.vid.muted) this.vid.muted = false;
            // }
        }, false);

        this.vid.loop = true;
        this.vid.muted = true;
        //this.vid.pause();
        this.vid.volume = 0.5;
    }

    pictureInit() {
        this.texture = new THREE.TextureLoader().load(this.image, this.resize.bind(this));
        //texture.minFilter = THREE.LinearFilter;
        this.material.map = this.texture;
        this.material.opacity = 0;
        //console.log(this.mesh.renderOrder);
        scene.add(this.mesh);
        //this.mesh.material.color.setHex( 0x1a01b9 );
        this.uuid = this.mesh.uuid;
        this.mesh.position.x = this.pos.x;
        this.mesh.position.y = this.pos.y;
        this.mesh.position.z = this.pos.z;
        this.mesh.layers.enable(1);
        this.show();
    }

    blendPlane() {

        this.blendMesh.position.z = 0.02;
        this.blendMesh.scale.x = 1.01;
        this.blendMesh.scale.y = 1.01;
        this.mesh.add(this.blendMesh);
    }

    hide() {
        this.visible = false;
        this.mesh.layers.disable(1);
        let tweenoff = new TWEEN.Tween(this.material).to({
            opacity: 0
        }, 250).
        onComplete(function () {
            this.mesh.visible = false;
            if (this.isVideo && this.videoLoaded) this.stopVideo();
        }.bind(this)).start();
    }

    show() {
        if (this.isVideo && this.videoLoaded) this.playVideo();
        this.visible = true;
        this.mesh.layers.enable(1);
        this.mesh.visible = true;
        let tweenoff = new TWEEN.Tween(this.material).to({
            opacity: 1
        }, 250).start();
    }

    stopVideo() {
        if (this.videoLoaded) {
            this.vid.pause();
            if (projectPlane.playingNo > 0) projectPlane.playingNo--;
            this.material.map = this.poster;
            console.log('%cvideo ' + this.name + " stopped", "color:red");
            // console.log("total playing: " + projectPlane.playingNo);
        }
    }

    playVideo() {
        if (Math.random() > 0.5) {
            if (this.videoLoaded && projectPlane.playingNo < projectPlane.maxVideosPlaying) {
                this.material.map = this.texture;
                this.vid.play();
                projectPlane.playingNo++;
                console.log('%cvideo ' + this.name + " started", "color:green");
                // console.log("total playing: " + projectPlane.playingNo);
            }
        }
    }

    resize() {
        //this.ratio = tex.image.width / tex.image.height; 
        if (this.isVideo) {
            this.ratio = this.texture.image.videoWidth / this.texture.image.videoHeight;
            //console.log(this.ratio);
        } else {
            this.ratio = this.texture.image.width / this.texture.image.height;
        }
        this.mesh.scale.x = this.size * this.ratio;
        this.mesh.scale.y = this.size;
        //this.mesh.lookAt(this.target);
        this.rot.x = this.mesh.rotation.x;
        this.rot.y = this.mesh.rotation.y;
        this.rot.z = this.mesh.rotation.z;
        this.blendPlane();
    }

    update() {

        this.mesh.position.x = this.pos.x;
        this.mesh.position.y = this.pos.y;
        this.mesh.position.z = this.pos.z;

        this.mesh.rotation.x = this.rot.x;
        this.mesh.rotation.y = this.rot.y;
        this.mesh.rotation.z = this.rot.z;

        this.mesh.scale.x = this.size * this.ratio;
        this.mesh.scale.y = this.size;
        //this.mesh.lookAt(this.target);
    }

    destroy() {
        this.geometry.dispose();
        this.material.dispose();
        scene.remove(this.mesh);
        renderer.renderLists.dispose();
    }
}