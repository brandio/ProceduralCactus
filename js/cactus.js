var SphereCordToCartesian = function (r, phi, theta) {
    var x = Math.cos(phi) * Math.sin(theta) * r;
    var y = Math.sin(phi) * Math.sin(theta) * r;
    var z = Math.cos(theta) * r;
    return new THREE.Vector3(x, y, z);
}

// Creates sphere geometry
var UVSphere = function (radius, stacks, slices) {
    var geometry = new THREE.Geometry();
    var theta1, theta2, ph1, ph2;
    var vert1, vert2, vert3, vert4;
    var index = 0;

    for (t = 0; t < stacks; t++) {
        theta1 = (t / stacks) * Math.PI;
        theta2 = ((t + 1) / stacks) * Math.PI;
        for (p = 0; p < slices; p++) {
            ph1 = (p / slices) * 2 * Math.PI;
            ph2 = ((p + 1) / slices) * 2 * Math.PI;

            vert1 = SphereCordToCartesian(radius, ph1, theta1);
            vert3 = SphereCordToCartesian(radius, ph2, theta1);
            vert2 = SphereCordToCartesian(radius, ph2, theta2);
            vert4 = SphereCordToCartesian(radius, ph1, theta2);

            geometry.vertices.push(vert1, vert2, vert3, vert4);

            if (t == 0) {
                geometry.faces.push(new THREE.Face3(0 + index, 1 + index, 3 + index));
            }
            else if (t + 1 == stacks) {
                geometry.faces.push(new THREE.Face3(1 + index, 0 + index, 2 + index));
            }
            else {
                geometry.faces.push(new THREE.Face3(0 + index, 2 + index, 3 + index));
                geometry.faces.push(new THREE.Face3(2 + index, 1 + index, 3 + index));
            }
            index += 4;
        }

    }
    geometry.mergeVertices();
    geometry.normalize();
    geometry.computeFaceNormals();
    geometry.computeVertexNormals(true);
    return geometry;
}

var CreateDesertTerrain = function (size)
{
    var desert = new THREE.PlaneGeometry(416, 416, size, size);
    verticies = desert.vertices;
    const randomness = 60;

    // Start by setting the corners to random values
    var a = Math.random() * randomness - randomness/2;
    var b = Math.random() * randomness - randomness/2;
    var c = Math.random() * randomness - randomness/1.5;
    var d = Math.random() * randomness - randomness/2;

    verticies[0].setZ(a);
    verticies[size].setZ(b);
    verticies[(size + 1) * size].setZ(c);
    verticies[(size + 1) * (size + 1) - 1].setZ(d);

    DiamondSquare(a, b, c, d, verticies, randomness / 1.5);
    return desert;
}

// Recursive function
var DiamondSquare = function (a, b, c, d, verticies, random)
{
    var halfAcross = Math.floor(Math.sqrt(verticies.length) / 2);
    var middle = Math.floor(verticies.length / 2);

    var middleHeight = ((a + b + c + d) / 4) + (Math.random() -.5) * random;

    var ab = (a + b + middleHeight) / 3 + (Math.random() -.5)  * random;
    var ac = (a + c + middleHeight) / 3 + (Math.random() -.5)  * random;
    var cd = (c + d + middleHeight) / 3 + (Math.random() -.5)  * random;
    var bd = (b + d + middleHeight) / 3 + (Math.random() -.5)  * random;

    verticies[middle].setZ(middleHeight);

    verticies[halfAcross].setZ(ab);
    verticies[middle - halfAcross].setZ(ac);
    verticies[middle + halfAcross].setZ(bd);
    verticies[verticies.length - halfAcross].setZ(cd);

    if(verticies.length <= 9)
    {
        return;
    }

    var size = Math.sqrt(verticies.length);

    var topLeft = [];
    for(var i = 0; i < halfAcross + 1; i++)
    {
        topLeft = topLeft.concat(verticies.slice(i * size, i * size + halfAcross + 1));
    }
    DiamondSquare(a, ab, ac, middleHeight, topLeft, random / 1.5);

    var topRight = [];
    for (var i = 0; i < halfAcross + 1; i++) {
        topRight = topRight.concat(verticies.slice(i * size + halfAcross, i * size + size));
    }
    DiamondSquare(ab, b, middleHeight, bd, topRight, random / 1.5);

    var bottomLeft = [];
    for (var i = 0; i < halfAcross + 1; i++) {
        bottomLeft = bottomLeft.concat(verticies.slice(i * size + size * halfAcross, i * size + size * halfAcross + halfAcross + 1));
    }
    DiamondSquare(ac, middleHeight, c, cd, bottomLeft, random / 1.5);

    var bottomRight = [];
    for (var i = 0; i < halfAcross + 1; i++) {
        bottomRight = bottomRight.concat(verticies.slice(i * size + size * halfAcross + halfAcross, i * size + size * halfAcross + size));
    }
    DiamondSquare(middleHeight, bd, cd, d, bottomRight, random / 1.5);
}

var Generate = function () {
    
    // Setup scene
    var canvas = document.getElementById("3dCanvas");
    var renderer = new THREE.WebGLRenderer({ canvas: canvas });
    //var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    var scene = new THREE.Scene(); width = 2000; height = 1000;

    var camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    
    renderer.setSize(width, height);
    scene.fog = new THREE.FogExp2(0xefd1b5, .002);
    renderer.setClearColor(scene.fog.color);
    document.body.appendChild(renderer.domElement);

    // Determine if sun set mode or not
    //var sunSet = (Math.random() > 0.85);
    var sunSet = (Math.random() > 1.85);


    // Set up shadow map/camera
    renderer.shadowMapEnabled = true;
    renderer.shadowCameraNear = 3;
    renderer.shadowCameraFar = camera.far;
    renderer.shadowCameraFov = 50;
    renderer.shadowMapBias = 0.0039;
    renderer.shadowMapDarkness = 1;
    renderer.shadowMapWidth = 1024;
    renderer.shadowMapHeight = 1024;

    // Create Background
    var vertBands = 4;
    if (sunSet) {
        vertBands = 5;
    }

    var backGround = new THREE.PlaneGeometry(5000, 1000, 3, vertBands);
    var backGroundMaterial = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors });
    var backGroundMesh = new THREE.Mesh(backGround, backGroundMaterial);
    backGround.translate(0, 440, -220);

    // Light blue, Very light blue
    const bottomSkyColors = [new THREE.Color(0x7ec0ee), new THREE.Color(0xfdffc9), new THREE.Color(0xffc180), new THREE.Color(0xddc9ff)];
    const ambientLightColors = [new THREE.Color(0xeeeeee), new THREE.Color(0xfeffe6), new THREE.Color(0xffe6cc), new THREE.Color(0xddc9ff)];
    const topSkyColors = [new THREE.Color(0x7ecfff), new THREE.Color(0x72b1e5), new THREE.Color(0x7aa2e8)];
    const sunSetSkyColors = [new THREE.Color(0x7ec0ee), new THREE.Color(0xeeeeeeff), new THREE.Color(0xffc9e8)];
    var ambientLightColor;

    if (sunSet)
    {
        var topColor = sunSetSkyColors[Math.floor(Math.random() * sunSetSkyColors.length)];
        var bottomColor = sunSetSkyColors[Math.floor(Math.random() * sunSetSkyColors.length)];
        var middleColor = sunSetSkyColors[Math.floor(Math.random() * sunSetSkyColors.length)];
        for (var i = 0; i < backGround.vertices.length; i++) {
            backGround.colors[i] = topColor;
            if (i >= 20) {
                backGround.colors[i] = middleColor;
            }
            if (i >= 16) {
                backGround.colors[i] = bottomColor;
            }
        }
    }
    else
    {
        var topColor = topSkyColors[Math.floor(Math.random() * topSkyColors.length)];
        var bottomColorIndex = Math.floor(Math.random() * bottomSkyColors.length);
        var bottomColor = bottomSkyColors[bottomColorIndex];
        ambientLightColor = ambientLightColors[bottomColorIndex];
        for (var i = 0; i < backGround.vertices.length; i++) {
            backGround.colors[i] = topColor;
            if (i >= 16) {
                backGround.colors[i] = bottomColor;
            }
        }
        
    }

    const faceIndices = ['a', 'b', 'c', 'd'];
    for (i = 0; i < backGround.faces.length; i++) {
        face = backGround.faces[i];
        var numberOfSides = 3;
        for (j = 0; j < numberOfSides; j++) {
            vertexIndex = face[faceIndices[j]];
            face.vertexColors[j] = backGround.colors[vertexIndex];
        }
    }
    scene.add(backGroundMesh);

    // Setup cactus
    var horBands = 80; vertBands = 300; radius = 1;
    var cactusGeometry = UVSphere(radius, vertBands, horBands);

    var spines = Math.floor(Math.random() * 12 + 4);
    var amount = radius;
    var mod = 0; y = 0; knots = 4;
    var spikeVerts = [];
    var verti;
    for (var i = 0; i < cactusGeometry.vertices.length; i++) {
        verti = cactusGeometry.vertices[i];
        verti.negate();
        if (i > vertBands * 10) {
            amount += mod;
            amount += (Math.random() * 2 - 1) * 0.0005;
            if (((y < (verti.y + .01)) && (y > (verti.y - .01)))) {
                if (Math.random() * 20 > 10 || y < 0) {
                    mod = 0.00016;
                }
                else {
                    mod = -0.00016;
                }
            }
        }
        if ((i + 1) % knots == 0) {
            verti.setLength(amount + .05);
            cactusGeometry.colors[i] = new THREE.Color(0x8DBA92);
        }
        else if ((i - 1) % knots == 0) {
            verti.setLength(amount + .05);
            cactusGeometry.colors[i] = new THREE.Color(0x8DBA92);

        }
        else if (i % knots == 0) {
            verti.setLength(amount + .1);
            cactusGeometry.colors[i] = new THREE.Color(0xCCCB9B);
            if ((Math.floor(i / horBands) % spines) == 0) {
                
            if (i > vertBands * 2) {
                cactusGeometry.vertices[i].setLength(amount + .13);
                    spikeVerts.push(i);
                }
            }
            else if ((Math.floor((i + horBands) / horBands) % spines) == 0 || (Math.floor((i - horBands) / horBands) % spines) == 0) {
                verti.setLength(amount + .115);
            }
            else if ((Math.floor((i + horBands * 2) / horBands) % spines) == 0 || (Math.floor((i - horBands * 2) / horBands) % spines) == 0) {
                verti.setLength(amount + .105);
            }
        }
        else {
            cactusGeometry.colors[i] = new THREE.Color(0x739E77);
            verti.setLength(amount);
        }

    }

    var yScale = Math.random() + .3;
    var zScale = Math.random() + 2;
    cactusGeometry.scale(yScale, yScale, zScale);

    // Figure out the vertex colors
    for (i = 0; i < cactusGeometry.faces.length; i++) {
        
        face = cactusGeometry.faces[i];
        var numberOfSides = 3;
        for (j = 0; j < numberOfSides; j++) {
            vertexIndex = face[faceIndices[j]];
            face.vertexColors[j] = cactusGeometry.colors[vertexIndex];
        }
    }

    var cactusMaterial = new THREE.MeshLambertMaterial();
    cactusMaterial.vertexColors = THREE.VertexColors;

    var cactus = new THREE.Mesh(cactusGeometry, cactusMaterial);
    cactus.castShadow = true;
    cactus.receiveShadow = false;

    // Put the spines on
    var spikeMaterial = new THREE.MeshLambertMaterial({ color: 0xF0F2C7 });
    var transformMatrix = new THREE.Matrix4();
    for (i = 0; i < spikeVerts.length; i++) {
        var vert = cactusGeometry.vertices[spikeVerts[i]];
        transformMatrix.set(1, 0, 0, vert.x,
                            0, 1, 0, vert.y,
                            0, 0, 1, vert.z,
                            0, 0, 0, 1);

        var cone = new THREE.ConeGeometry(1, 4, 12);
        cone.rotateX(Math.PI / 2);
        cone.lookAt(new THREE.Vector3(vert.x * 8, vert.y * 8, vert.z * 8));
        cone.scale(.01, .01, .04);
        cone.applyMatrix(transformMatrix);

        var coneFinal = new THREE.Mesh(cone, spikeMaterial);
        coneFinal.castShadow = true;
        coneFinal.receiveShadow = false;
        cactus.add(coneFinal);
    }

    scene.add(cactus);
    cactus.rotateX(Math.PI / 2);

    // Create desert floor
    var floorSegments = 16;
    var floor = CreateDesertTerrain(floorSegments);
    floor.computeFaceNormals();
    floor.computeVertexNormals(true);
    floor.rotateX(Math.PI / 2);    
    floor.translate(0, -30, 0);

    var floorMaterial = new THREE.MeshLambertMaterial({ color: 0xc2b280, side: THREE.DoubleSide });
    var floorMesh = new THREE.Mesh(floor, floorMaterial);
    floorMesh.receiveShadow = true;
    floorMesh.castShadow = false;
    scene.add(floorMesh);

    // Make sure cactus is above the floor
    cactus.position.set(floor.vertices[floorSegments / 2 * floorSegments].x, 0, floor.vertices[floorSegments / 2 * floorSegments].z)
    while(-1 > floor.vertices[floorSegments / 2 * floorSegments].y)
    {
        floor.translate(0, .2, 0);
    }

    // Set up lights
    var ambient 
    if(sunSet)
    {
        ambient = new THREE.AmbientLight(0xFAD6A5 + ambientLightColor);
    }
    else
    {
        ambient = new THREE.AmbientLight(ambientLightColor);
    }
    scene.add(ambient);

    // Set up sunlight
    var dirLight = new THREE.DirectionalLight(0xfffffff);
    dirLight.intensity = .4;
    dirLight.shadowDarkness = 10;
    
    var sunHeight = Math.random() * 60 + 80;
    if (sunSet)
    {
        sunHeight = Math.random() * 60 + 10;
    }
    var sunX = (Math.random() - .5) * 50;
    dirLight.position.set(cactus.position.x + sunX, sunHeight, cactus.position.z - 150);
    scene.add(dirLight.target);
    dirLight.target.position.set(cactus.position.x, cactus.position.y * 100, cactus.position.z);
    scene.add(dirLight);
    dirLight.castShadow = true;
    dirLight.shadowCameraNear = 2;

    dirLight.shadowCameraFar = 200;
    var d = 3;
    dirLight.shadowCameraLeft = -d;
    dirLight.shadowCameraRight = d;
    dirLight.shadowCameraTop = d;
    dirLight.shadowCameraBottom = -d;

    // Uncomment to add sun debug helper
    var helper = new THREE.CameraHelper(dirLight.shadow.camera);
    helper.update();
    //scene.add(helper);

    var helper2 = new THREE.DirectionalLightHelper(dirLight, 10);
    //scene.add(helper2);

    // lens flares
    //addLight(scene, 0.55, 0.9, 0.5, 0, 6, 0);
    function addLight(scene, h, s, l, x, y, z) {
        THREE.ImageUtils.crossOrigin = '';
        var textureLoader = new THREE.TextureLoader();
        var textureFlare0 = textureLoader.load("https://s3.amazonaws.com/jsfiddle1234/lensflare0.png");

        var light = new THREE.PointLight(0xffffff, 1.5, 10);
        light.color.setHSL(h, s, l);
        light.position.set(x, y, z);
        scene.add(light);
        light = light;

        var flareColor = new THREE.Color(0xaaaaaaa);
        flareColor.setHSL(h, s, l + 0.5);

        var lensFlare = new THREE.LensFlare(textureFlare0, 200, 0.0, THREE.AdditiveBlending, flareColor);

        lensFlare.position.copy(light.position);
        scene.add(lensFlare);
    }
    
    // Create sun sphere
    var sphere = new THREE.SphereGeometry(24, 32, 32);
    var sphereMaterial;
    if (sunSet)
    {
        var sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xfffcef });
    }
    else
    {
        var sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xfffcef });
    }
    var sphereMesh = new THREE.Mesh(sphere, sphereMaterial);
    sphereMesh.position.set(dirLight.position.x, dirLight.position.y, dirLight.position.z - 70) ;
    scene.add(sphereMesh);

    // Determine camera position
    var xOffset = (Math.random() - 0.5) * 15;
    var yOffset = (Math.random()) * 5;
    var zOffset = (Math.random()) * 5 + (Math.random()) * 5;

    camera.position.x = cactus.position.x;
    camera.position.z = cactus.position.z + 4;
    camera.lookAt(cactus);
    camera.position.x +=  xOffset;
    camera.position.z += zOffset;
    camera.position.y = 2 + yOffset;
    //var controls = new THREE.OrbitControls(camera, renderer.domElement);
    var render = function () {
        //requestAnimationFrame(render);
        //controls.update();
        renderer.render(scene, camera);
    };
    render();

    // save canvas image as data url (png format by default)
    var dataURL = canvas.toDataURL();

    // set canvasImg image src to dataURL
    // so it can be saved as an image
    document.getElementById('canvasImg').src = dataURL;
}
Generate();