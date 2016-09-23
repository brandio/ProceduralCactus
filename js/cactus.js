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
    var i = 0;
    var index = 0;

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

var Generate = function () {
    // Setup scene
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    var renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x7EC0EE);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    renderer.shadowMapEnabled = true;
    //renderer.shadowMapSoft = true;

    renderer.shadowCameraNear = 3;
    renderer.shadowCameraFar = camera.far;
    renderer.shadowCameraFov = 50;

    renderer.shadowMapBias = 0.0039;
    renderer.shadowMapDarkness = 1;
    renderer.shadowMapWidth = 1024;
    renderer.shadowMapHeight = 1024;

    // Setup geometry
    var horBands = 80;
    var vertBands = 300;
    var radius = 1;
    geometry = UVSphere(radius, vertBands, horBands);

    var spines = Math.floor(Math.random() * 12 + 4);
    var amount = radius;
    var mod = 0;
    var knots = 4;
    var spikeVerts = [];
    var y = 0;
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
                geometry.vertices[i].setLength(amount + .13);
                if (i > vertBands * 2) {
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

    var xScale = Math.random() + 1;
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
            if (geometry.colors[vertexIndex] == 0) {



                // spikeVertsNormals.push(face.normals[j]);
            }
            face.vertexColors[j] = geometry.colors[vertexIndex];
        }
    }

    geometry.colorsNeedUpdate = true;
    var material = new THREE.MeshLambertMaterial();
    material.vertexColors = THREE.VertexColors;

    //var material = new THREE.MeshNormalMaterial();
    //var material = new THREE.MeshBasicMaterial({ color: 0x80ff80 });
    //material.opacity = .14;
    //material.transparent = true;
    //material.wireframe = true;
    var cube = new THREE.Mesh(geometry, material);
    cube.castShadow = true;
    cube.receiveShadow = false;

    var group = new THREE.Object3D();

    //scene.add(cube);
    var material2 = new THREE.MeshLambertMaterial({ color: 0xF0F2C7 });
    for (i = 0; i < spikeVerts.length; i++) {

        var vert = geometry.vertices[spikeVerts[i]];

        var transformMatrix = new THREE.Matrix4();
        transformMatrix.set(1, 0, 0, vert.x,
                            0, 1, 0, vert.y,
                            0, 0, 1, vert.z,
                            0, 0, 0, 1);
        var cone = new THREE.ConeGeometry(1, 4, 12);
        cone.rotateX(Math.PI / 2);
        cone.lookAt(new THREE.Vector3(vert.x * 8, vert.y * 8, vert.z * 8));

        cone.scale(.01, .01, .04);
        cone.applyMatrix(transformMatrix);

        //cone.vertices[0].setLength(1.2);

        var coneFinal = new THREE.Mesh(cone, material2);
        coneFinal.castShadow = true;
        coneFinal.receiveShadow = false;
        coneFinal.rotation.set(coneFinal.rotation.x, coneFinal.rotation.y, 0);
        coneFinal.updateMatrix();
        cube.add(coneFinal);
        //scene.add(coneFinal);
    }
    scene.matrixAutoUpdate = false;
    scene.add(cube);

    cube.rotateX(Math.PI / 2);

    var floor = new THREE.BoxGeometry(200, 1, 200);
    floor.translate(0, -2.2, 0);
    var floorMaterial = new THREE.MeshLambertMaterial({ color: 0xc2b280 });
    var floorMesh = new THREE.Mesh(floor, floorMaterial);
    floorMesh.receiveShadow = true;
    floorMesh.castShadow = false;
    scene.add(floorMesh);

    var ambient = new THREE.AmbientLight(0xeeeeeee);
    scene.add(ambient);
    var spotLight = new THREE.DirectionalLight(0xfffffff);
    spotLight.intensity = .4;
    spotLight.shadowDarkness = 10;
    spotLight.position.set(-25, 40, 16);
    scene.add(spotLight);
    spotLight.castShadow = true;

    camera.position.z = 5;
    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    var render = function () {
        requestAnimationFrame(render);
        //cube.rotation.z += 0.005;
        //cube.position.x += 0.001;
        controls.update();
        renderer.render(scene, camera);
    };
    render();
}
Generate();