var SphereCordToCartesian = function (r, phi, theta) {
    var x = Math.cos(phi) * Math.sin(theta) * r;
    var y = Math.sin(phi) * Math.sin(theta) * r;
    var z = Math.cos(theta) * r;
    return new THREE.Vector3(x, y, z);
}
var UVSphere = function (radius, stacks, slices) {
    var geometry = new THREE.Geometry();
    var theta1, theta2, ph1, ph2;
    var vert1, vert2, vert3, vert4;
    var i = 0; index = 0;

    for (t = 0; t < stacks; t++) {
        i++;
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

var CreateDesert = function (size, verticies)
{
    var randomness = 60;
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
    var sunSet = (Math.random() > 0.9);
    // Setup scene
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    var renderer = new THREE.WebGLRenderer();

    if (sunSet)
    {
        renderer.setClearColor(0xFAD6A5);
    }
    else
    {
        renderer.setClearColor(0x7EC0EE);
    }

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    renderer.shadowMapEnabled = true;
    
    renderer.shadowCameraNear = 3;
    renderer.shadowCameraFar = camera.far;
    renderer.shadowCameraFov = 50;
    
    renderer.shadowMapBias = 0.0039;
    renderer.shadowMapDarkness = 1;
    renderer.shadowMapWidth = 1024;
    renderer.shadowMapHeight = 1024;

    // Setup geometry
    var horBands = 80; vertBands = 300; radius = 1;
    geometry = UVSphere(radius, vertBands, horBands);

    var spines = Math.floor(Math.random() * 12 + 4);
    var amount = radius;
    var mod = 0; y = 0; knots = 4;
    var spikeVerts = [];
    var verti;
    for (var i = 0; i < geometry.vertices.length; i++) {
        verti = geometry.vertices[i];
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
            geometry.colors[i] = new THREE.Color(0x8DBA92);
        }
        else if ((i - 1) % knots == 0) {
            verti.setLength(amount + .05);
            geometry.colors[i] = new THREE.Color(0x8DBA92);

        }
        else if (i % knots == 0) {
            verti.setLength(amount + .1);
            geometry.colors[i] = new THREE.Color(0xCCCB9B);
            if ((Math.floor(i / horBands) % spines) == 0) {
                
            if (i > vertBands * 2) {
                    geometry.vertices[i].setLength(amount + .13);
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
            geometry.colors[i] = new THREE.Color(0x739E77);
            verti.setLength(amount);
        }

    }

    var yScale = Math.random() + .3;
    var zScale = Math.random() + 2;
    var matrix = new THREE.Matrix4();
    matrix.set(yScale, 0, 0, 0,
                0, yScale, 0, 0,
                    0, 0, zScale, 0,
                    0, 0, 0, 1);

    geometry.applyMatrix(matrix);

    var spikeVertsNormals = [];
    var faceIndices = ['a', 'b', 'c', 'd'];
    for (i = 0; i < geometry.faces.length; i++) {
        
        face = geometry.faces[i];
        var numberOfSides = 3;
        for (j = 0; j < numberOfSides; j++) {
            vertexIndex = face[faceIndices[j]];
            face.vertexColors[j] = geometry.colors[vertexIndex];
        }
    }

    geometry.colorsNeedUpdate = true;
    var material = new THREE.MeshLambertMaterial();
    material.vertexColors = THREE.VertexColors;

    var cube = new THREE.Mesh(geometry, material);
    cube.castShadow = true;
    cube.receiveShadow = false;

    var material2 = new THREE.MeshLambertMaterial({ color: 0xF0F2C7 });
    var transformMatrix = new THREE.Matrix4();
    for (i = 0; i < spikeVerts.length; i++) {
        var vert = geometry.vertices[spikeVerts[i]];
        
        transformMatrix.set(1, 0, 0, vert.x,
                            0, 1, 0, vert.y,
                            0, 0, 1, vert.z,
                            0, 0, 0, 1);

        var cone = new THREE.ConeGeometry(1, 4, 12);
        cone.rotateX(Math.PI / 2);
        cone.lookAt(new THREE.Vector3(vert.x * 8, vert.y * 8, vert.z * 8));
        cone.scale(.01, .01, .04);
        cone.applyMatrix(transformMatrix);

        var coneFinal = new THREE.Mesh(cone, material2);
        coneFinal.castShadow = true;
        coneFinal.receiveShadow = false;
        cube.add(coneFinal);
    }

    scene.add(cube);
    cube.rotateX(Math.PI / 2);

    var floorSegments = 16;
    var floor = new THREE.PlaneGeometry(416, 416, floorSegments, floorSegments);
    CreateDesert(floorSegments, floor.vertices);
    floor.computeFaceNormals();
    floor.computeVertexNormals(true);
    floor.rotateX(Math.PI / 2);
    var difference = geometry.vertices[geometry.vertices.length - 1].y - floor.vertices[floorSegments / 2 * floorSegments].y;
    

    floor.translate(0, -30, 0);


    cube.position.set(floor.vertices[floorSegments / 2 * floorSegments].x, 0, floor.vertices[floorSegments / 2 * floorSegments].z)

    while(-1 > floor.vertices[floorSegments / 2 * floorSegments].y)
    {
        floor.translate(0, .2, 0);
    }
    var floorMaterial = new THREE.MeshLambertMaterial({ color: 0xc2b280, side: THREE.DoubleSide });
    //floorMaterial.wireframe = true;
    var floorMesh = new THREE.Mesh(floor, floorMaterial);
    floorMesh.receiveShadow = true;
    floorMesh.castShadow = false;
    scene.add(floorMesh);

    var ambient;
    if(sunSet)
    {
        ambient = new THREE.AmbientLight(0xFAD6A5);
    }
    else
    {
        ambient = new THREE.AmbientLight(0xeeeeee);
    }
    
    scene.add(ambient);

    var dirLight = new THREE.DirectionalLight(0xfffffff);
    dirLight.intensity = .4;
    dirLight.shadowDarkness = 10;
    
    var sunHeight = Math.random() * 60 + 40;
    if (sunSet)
    {
        sunHeight = Math.random() * 60 + 10;
    }
    dirLight.position.set(cube.position.x - 40, sunHeight, cube.position.z - 150);
    scene.add(dirLight.target);
    //dirLight.target.updateMatrixWorld();
    dirLight.target.position.set(cube.position.x, cube.position.y * 100, cube.position.z);
    scene.add(dirLight);
    dirLight.castShadow = true;
    dirLight.shadowCameraNear = 2;
    //dirLight.shadow.camera.lookAt(new THREE.Vector3(cube.position.x, cube.position.y * 100, cube.position.z));
    //dirLight.shadowCamera.target.lookAt(new THREE.Vector3(cube.position.x, cube.position.y, cube.position.z));
    dirLight.shadowCameraFar = 200;
    var d = 3;
    dirLight.shadowCameraLeft = -d;
    dirLight.shadowCameraRight = d;
    dirLight.shadowCameraTop = d;
    dirLight.shadowCameraBottom = -d;
    //dirLight.shadowCameraVisible = true;

    var helper = new THREE.CameraHelper(dirLight.shadow.camera);
    helper.update();
    //scene.add(helper);

    var helper2 = new THREE.DirectionalLightHelper(dirLight, 10);
    //scene.add(helper2);

    var sphere = new THREE.SphereGeometry(30, 32, 32);
    var sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xfff5c4 });
    var sphereMesh = new THREE.Mesh(sphere, sphereMaterial);
    sphereMesh.position.set(dirLight.position.x, dirLight.position.y, dirLight.position.z - 7) ;
    scene.add(sphereMesh);

    var xOffset = (Math.random() - 0.5) * 12;
    var yOffset = (Math.random()) * 4;
    var zOffset = (Math.random()) * 4;

    camera.position.x = cube.position.x + 4 + xOffset;
    camera.position.z = cube.position.z + 4 + zOffset;
    camera.position.y = 2 + yOffset;
    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    var render = function () {
        requestAnimationFrame(render);
        controls.update();
        renderer.render(scene, camera);
    };
    render();
}
Generate();