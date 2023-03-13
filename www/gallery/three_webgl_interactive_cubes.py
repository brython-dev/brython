"""Adapted from https://threejs.org/examples/#webgl_interactive_cubes"""


import math
from random import random

from browser import console, document, html, window
import javascript


class Main:

    def __init__(self, THREE, stats_module):

        self.THREE = THREE
        self.Stats = stats_module['default']

        self.theta = 0
        self.pointer = THREE.Vector2.new()
        self.radius = 100
        self.camera = None
        self.scene = None
        self.raycaster = None
        self.renderer = None
        self.INTERSECTED = None
        self.stats = None

        self.ratio = 0.8

        self.init()
        self.animate()

    def set_size(self):
        self.renderer.setSize(self.ratio * window.innerWidth, 
                              self.ratio * window.innerHeight)

    def onWindowResize(self, ev):
        self.camera.aspect = window.innerWidth / window.innerHeight;
        self.camera.updateProjectionMatrix();

    def onPointerMove(self, event):
        self.pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1
        self.pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1

    def init(self):
        THREE = self.THREE
        document <= (container := html.DIV())
        self.camera = THREE.PerspectiveCamera.new(
                        70, window.innerWidth / window.innerHeight, 1, 10000)

        self.scene = THREE.Scene.new()
        self.scene.background = THREE.Color.new(0xf0f0f0)

        light = THREE.DirectionalLight.new(0xffffff, 1)
        light.position.set(1, 1, 1).normalize()
        self.scene.add(light)
        geometry = THREE.BoxGeometry.new(20, 20, 20)

        for _ in range(2000):

            obj = THREE.Mesh.new(
                      geometry,
                      THREE.MeshLambertMaterial.new({'color': random() * 0xffffff}))

            obj.position.x = random() * 800 - 400
            obj.position.y = random() * 800 - 400
            obj.position.z = random() * 800 - 400

            obj.rotation.x = random() * 2 * math.pi
            obj.rotation.y = random() * 2 * math.pi
            obj.rotation.z = random() * 2 * math.pi

            obj.scale.x = random() + 0.5
            obj.scale.y = random() + 0.5
            obj.scale.z = random() + 0.5

            self.scene.add(obj)

        self.raycaster = THREE.Raycaster.new()
        self.renderer = THREE.WebGLRenderer.new()
        self.renderer.setPixelRatio(window.devicePixelRatio)
        self.set_size()
        container <= self.renderer.domElement

        self.stats = self.Stats.new()
        container <= self.stats.dom

        document.bind('mousemove', self.onPointerMove)
        window.bind('resize', self.onWindowResize)

    def animate(self, *args):
        window.requestAnimationFrame(self.animate)
        self.render()
        self.stats.update()

    def render(self):
        degToRad = self.THREE.MathUtils.degToRad
        radius = self.radius
        self.theta += 0.1

        self.camera.position.x = radius * math.sin(degToRad(self.theta))
        self.camera.position.y = radius * math.sin(degToRad(self.theta))
        self.camera.position.z = radius * math.cos(degToRad(self.theta))
        self.camera.lookAt(self.scene.position)

        self.camera.updateMatrixWorld()

        # find intersections
        self.raycaster.setFromCamera(self.pointer, self.camera)

        intersects = self.raycaster.intersectObjects(self.scene.children, False)

        if intersects.length:
            if self.INTERSECTED != intersects[0].object:
                if self.INTERSECTED:
                    self.INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex)
                self.INTERSECTED = intersects[0].object
                self.INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex()
                self.INTERSECTED.material.emissive.setHex(0xff0000)
        else:
            if self.INTERSECTED:
                self.INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex)
            self.INTERSECTED = None

        self.renderer.render(self.scene, self.camera)

# import three.js modules
mods = ['https://threejs.org/build/three.module.js',
        'https://threejs.org/examples/jsm/libs/stats.module.js']

javascript.import_modules(mods, Main)
