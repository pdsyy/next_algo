"use client";

import React, {
    useEffect,
    useRef
} from "react";

import * as THREE from "three";

import algoImage from "./images/Gemini_Generated_Image_ufalucufalucufal 3 (1).png";


/*
    Положение ALGO-картинки и видео считается от верхней границы hero.
    Поэтому оно больше не зависит от высоты окна браузера.
*/
const ALGO_IMAGE_TOP_FALLBACK = 402;
const ALGO_IMAGE_BOTTOM_SPACE_FALLBACK = 102;


/* =========================================================
   SETTINGS

   Значения приведены 1:1 к оригинальному скрипту (noth.in).
   Главное отличие от предыдущей версии:
   - один splatRadius на velocity И dye (было два разных,
     dye был раздут почти в 23 раза)
   - splatForce поднят с 2400 до 5900
   - edgeSoftness/edgeWidth дают резкий, а не размытый край
   - добавлен scroll fade (ниже)
========================================================= */

const SETTINGS = {
    simResolution: 256,
    dyeResolution: 512,

    /*
        Множитель применяется к скорости КАЖДЫЙ кадр, поэтому
        разница даже в сотые доли даёт большой эффект за секунду:
        0.962^60 ≈ 0.10 (скорость гаснет почти мгновенно),
        0.99^60  ≈ 0.55 (течение ощутимо дольше после отпускания
        мыши). Подбирай в диапазоне 0.98–0.995 под свой вкус.
    */
    velocityDissipation: 0.98,
    dyeDissipation: 0.988,

    pressureIterations: 20,

    curlStrength: 0,

    /*
        Один радиус для velocity и dye, как в оригинале.

        0.00006 — значение с noth.in, оно подобрано под их
        размер hero-блока. На большом full-bleed блоке с
        крупным 3D-текстом такой радиус (~15px на широком
        экране) читается как тонкая царапина, а не как масса
        жидкости. Поэтому радиус увеличен — подбирай под свой
        размер блока: чем шире контейнер, тем больше нужно
        значение, чтобы визуальная толщина потока была той же.
    */
    splatRadius: 0.00035,

    splatForce: 5900,

    revealSize: 3.9,

    /*
        Более широкий edgeWidth даёт мягкий, растушёванный
        край вместо жёсткого «прорезанного» силуэта.
    */
    edgeSoftness: 0.4,
    edgeWidth: 0.05,

    /*
        Цвет "чернильного" пятна за пределами блока
        картинки/видео — там, где жидкость просто окрашивает
        поверх страницы, без composite base/video.
    */
    inkColor: 0x0a0a0a,

    /* VIDEO ALIGNMENT
       scale > 1 = video content appears larger
       offsetX: + moves video content right, - left
       offsetY: + moves video content up, - down
    */
    videoScale: 1.12,
    videoOffsetX: -0.02,

    /*
        Базовое UV-смещение видео.
        Продолжает работать как раньше.
    */
    videoOffsetY: 0.04,

    /*
        Отдельное физическое смещение всего VIDEO BOX в пикселях.
        Это НЕ меняет videoOffsetY и не смешивается с UV-настройкой.
    */
    /* Резервное значение. Основное задаётся CSS-переменной. */
    videoBoxOffsetYPx: -25,
};



/* =========================================================
   FULLSCREEN VERTEX
========================================================= */

const PASS_VERTEX = `

    varying vec2 vUv;


    void main() {

        vUv = uv;


        gl_Position = vec4(
            position.xy,
            0.0,
            1.0
        );
    }

`;



/* =========================================================
   SPLAT
========================================================= */

const SPLAT_FRAGMENT = `

    precision highp float;


    uniform sampler2D uTarget;

    uniform float uAspectRatio;

    uniform vec2 uPoint;

    uniform vec3 uColor;

    uniform float uRadius;


    varying vec2 vUv;


    void main() {

        vec2 p =
            vUv -
            uPoint;


        p.x *=
            uAspectRatio;


        vec3 splat =

            exp(
                -dot(p, p) /
                uRadius
            )

            *

            uColor;


        vec3 base =

            texture2D(
                uTarget,
                vUv
            ).xyz;


        gl_FragColor = vec4(
            base + splat,
            1.0
        );
    }

`;



/* =========================================================
   CURL
========================================================= */

const CURL_FRAGMENT = `

    precision highp float;


    uniform sampler2D uVelocity;

    uniform vec2 uTexelSize;


    varying vec2 vUv;


    void main() {

        float L =
            texture2D(
                uVelocity,
                vUv -
                vec2(
                    uTexelSize.x,
                    0.0
                )
            ).y;


        float R =
            texture2D(
                uVelocity,
                vUv +
                vec2(
                    uTexelSize.x,
                    0.0
                )
            ).y;


        float T =
            texture2D(
                uVelocity,
                vUv +
                vec2(
                    0.0,
                    uTexelSize.y
                )
            ).x;


        float B =
            texture2D(
                uVelocity,
                vUv -
                vec2(
                    0.0,
                    uTexelSize.y
                )
            ).x;


        float vorticity =
            R -
            L -
            T +
            B;


        gl_FragColor = vec4(
            0.5 * vorticity,
            0.0,
            0.0,
            1.0
        );
    }

`;



/* =========================================================
   VORTICITY
========================================================= */

const VORTICITY_FRAGMENT = `

    precision highp float;


    uniform sampler2D uVelocity;

    uniform sampler2D uCurl;

    uniform vec2 uTexelSize;

    uniform float uCurlStrength;

    uniform float uDt;


    varying vec2 vUv;


    void main() {

        float L =
            texture2D(
                uCurl,
                vUv -
                vec2(
                    uTexelSize.x,
                    0.0
                )
            ).x;


        float R =
            texture2D(
                uCurl,
                vUv +
                vec2(
                    uTexelSize.x,
                    0.0
                )
            ).x;


        float T =
            texture2D(
                uCurl,
                vUv +
                vec2(
                    0.0,
                    uTexelSize.y
                )
            ).x;


        float B =
            texture2D(
                uCurl,
                vUv -
                vec2(
                    0.0,
                    uTexelSize.y
                )
            ).x;


        float C =
            texture2D(
                uCurl,
                vUv
            ).x;


        vec2 force =

            0.5 *

            vec2(
                abs(T) - abs(B),
                abs(R) - abs(L)
            );


        force /=

            length(force) +
            0.0001;


        force *=

            uCurlStrength *

            C;


        vec2 velocity =

            texture2D(
                uVelocity,
                vUv
            ).xy;


        velocity +=

            force *

            uDt;


        gl_FragColor = vec4(
            velocity,
            0.0,
            1.0
        );
    }

`;



/* =========================================================
   ADVECTION
========================================================= */

const ADVECTION_FRAGMENT = `

    precision highp float;


    uniform sampler2D uVelocity;

    uniform sampler2D uSource;

    uniform vec2 uTexelSize;

    uniform float uDt;

    uniform float uDissipation;


    varying vec2 vUv;


    void main() {

        vec2 velocity =

            texture2D(
                uVelocity,
                vUv
            ).xy;


        vec2 coord =

            vUv

            -

            uDt *

            velocity *

            uTexelSize;


        vec4 result =

            texture2D(
                uSource,
                coord
            );


        gl_FragColor =

            result *

            uDissipation;
    }

`;



/* =========================================================
   DIVERGENCE
========================================================= */

const DIVERGENCE_FRAGMENT = `

    precision highp float;


    uniform sampler2D uVelocity;

    uniform vec2 uTexelSize;


    varying vec2 vUv;


    void main() {

        float L =
            texture2D(
                uVelocity,
                vUv -
                vec2(
                    uTexelSize.x,
                    0.0
                )
            ).x;


        float R =
            texture2D(
                uVelocity,
                vUv +
                vec2(
                    uTexelSize.x,
                    0.0
                )
            ).x;


        float T =
            texture2D(
                uVelocity,
                vUv +
                vec2(
                    0.0,
                    uTexelSize.y
                )
            ).y;


        float B =
            texture2D(
                uVelocity,
                vUv -
                vec2(
                    0.0,
                    uTexelSize.y
                )
            ).y;


        float div =

            0.5 *

            (
                R -
                L +
                T -
                B
            );


        gl_FragColor = vec4(
            div,
            0.0,
            0.0,
            1.0
        );
    }

`;



/* =========================================================
   PRESSURE
========================================================= */

const PRESSURE_FRAGMENT = `

    precision highp float;


    uniform sampler2D uPressure;

    uniform sampler2D uDivergence;

    uniform vec2 uTexelSize;


    varying vec2 vUv;


    void main() {

        float L =
            texture2D(
                uPressure,
                vUv -
                vec2(
                    uTexelSize.x,
                    0.0
                )
            ).x;


        float R =
            texture2D(
                uPressure,
                vUv +
                vec2(
                    uTexelSize.x,
                    0.0
                )
            ).x;


        float T =
            texture2D(
                uPressure,
                vUv +
                vec2(
                    0.0,
                    uTexelSize.y
                )
            ).x;


        float B =
            texture2D(
                uPressure,
                vUv -
                vec2(
                    0.0,
                    uTexelSize.y
                )
            ).x;


        float divergence =

            texture2D(
                uDivergence,
                vUv
            ).x;


        float pressure =

            (
                L +
                R +
                T +
                B -
                divergence
            )

            *

            0.25;


        gl_FragColor = vec4(
            pressure,
            0.0,
            0.0,
            1.0
        );
    }

`;



/* =========================================================
   GRADIENT SUBTRACT
========================================================= */

const GRADIENT_FRAGMENT = `

    precision highp float;


    uniform sampler2D uPressure;

    uniform sampler2D uVelocity;

    uniform vec2 uTexelSize;


    varying vec2 vUv;


    void main() {

        float L =
            texture2D(
                uPressure,
                vUv -
                vec2(
                    uTexelSize.x,
                    0.0
                )
            ).x;


        float R =
            texture2D(
                uPressure,
                vUv +
                vec2(
                    uTexelSize.x,
                    0.0
                )
            ).x;


        float T =
            texture2D(
                uPressure,
                vUv +
                vec2(
                    0.0,
                    uTexelSize.y
                )
            ).x;


        float B =
            texture2D(
                uPressure,
                vUv -
                vec2(
                    0.0,
                    uTexelSize.y
                )
            ).x;


        vec2 velocity =

            texture2D(
                uVelocity,
                vUv
            ).xy;


        velocity -=

            vec2(
                R - L,
                T - B
            )

            *

            0.5;


        gl_FragColor = vec4(
            velocity,
            0.0,
            1.0
        );
    }

`;



/* =========================================================
   FINAL MASK
========================================================= */

const DISPLAY_FRAGMENT = `

    precision highp float;


    uniform sampler2D uBaseTexture;

    uniform sampler2D uRevealTexture;

    uniform sampler2D uDye;


    uniform float uRevealSize;

    uniform float uEdgeSoftness;

    uniform float uEdgeWidth;


    uniform float uBaseImageAspect;

    uniform float uRevealImageAspect;

    uniform vec2 uRevealScale;
    uniform vec2 uRevealOffset;

    uniform float uPlaneAspect;


    /*
        Прямоугольник исходного блока картинки/видео —
        в нормализованных координатах ВСЕГО канваса (0..1),
        а не в координатах самого блока.
    */
    uniform vec2 uBoxMin;
    uniform vec2 uBoxMax;

    /*
        Отдельный box для reveal-video.
        Базовая картинка и fluid-блок могут иметь свою геометрию,
        а video box — свою, с независимым пиксельным смещением.
    */
    uniform vec2 uVideoBoxMin;
    uniform vec2 uVideoBoxMax;

    uniform float uBoxAspect;


    uniform vec3 uInkColor;


    varying vec2 vUv;



    vec2 coverUv(
        vec2 uv,
        float imageAspect,
        float planeAspect
    ) {

        vec2 ratio = vec2(

            min(
                planeAspect /
                imageAspect,
                1.0
            ),

            min(
                imageAspect /
                planeAspect,
                1.0
            )
        );


        return vec2(

            uv.x *
            ratio.x

            +

            (
                1.0 -
                ratio.x
            ) *
            0.5,


            uv.y *
            ratio.y

            +

            (
                1.0 -
                ratio.y
            ) *
            0.5
        );
    }



    void main() {

        float dye =

            texture2D(
                uDye,
                vUv
            ).r;


        float raw =

            dye *

            uRevealSize;


        float mask =

            smoothstep(

                uEdgeSoftness,

                uEdgeSoftness +
                uEdgeWidth,

                raw
            );


        bool insideBox =

            vUv.x >= uBoxMin.x &&
            vUv.x <= uBoxMax.x &&
            vUv.y >= uBoxMin.y &&
            vUv.y <= uBoxMax.y;


        if (insideBox) {

            /*
                Локальные UV блока (0..1 внутри самого блока),
                чтобы base/video считались cover ровно так же,
                как если бы канвас был размером с этот блок —
                картинка не тянется на весь hero.
            */

            vec2 boxUv =

                (
                    vUv -
                    uBoxMin
                )

                /

                (
                    uBoxMax -
                    uBoxMin
                );


            vec2 baseUv =

                coverUv(
                    boxUv,
                    uBaseImageAspect,
                    uBoxAspect
                );


            /*
                VIDEO BOX имеет отдельные границы.
                Это физически двигает весь reveal-слой,
                не трогая videoOffsetY.
            */
            vec2 videoBoxUv =

                (
                    vUv -
                    uVideoBoxMin
                )

                /

                (
                    uVideoBoxMax -
                    uVideoBoxMin
                );


            vec2 revealUv =

                coverUv(
                    videoBoxUv,
                    uRevealImageAspect,
                    uBoxAspect
                );

            /*
                Independent positioning of the reveal video.
                Scale is applied around the center of the video.
            */
            revealUv =
                (revealUv - vec2(0.5)) / uRevealScale + vec2(0.5);

            revealUv -= uRevealOffset;


            /*
    Базовую ALGO-картинку здесь больше НЕ рисуем.

    Она выводится обычным DOM <img> под canvas, поэтому
    браузер показывает исходный PNG без WebGL color-space /
    alpha / texture sampling изменений.

    Canvas внутри ALGO-блока рисует только reveal-video
    по fluid-mask.
*/

vec4 revealColor =
    texture2D(
        uRevealTexture,
        revealUv
    );

gl_FragColor =
    vec4(
        revealColor.rgb,
        mask
    );

        } else {

            /*
                За пределами блока картинки — никакого base/video,
                просто "чернильный" цвет там, где прошла жидкость,
                и полная прозрачность там, где её нет (реальный
                текст/фон страницы остаются видны как есть).
            */

            gl_FragColor =

                vec4(
                    uInkColor,
                    mask
                );
        }
    }

`;



/* =========================================================
   DOUBLE FBO
========================================================= */

type DoubleFBO = {

    read:
        THREE.WebGLRenderTarget;

    write:
        THREE.WebGLRenderTarget;

    swap:
        () => void;
};



/* =========================================================
   COMPONENT
========================================================= */

const AlgoReveal = () => {

    const containerRef =
        useRef<HTMLDivElement>(null);


    const canvasRef =
        useRef<HTMLCanvasElement>(null);


    const videoRef =
        useRef<HTMLVideoElement>(null);



    useEffect(() => {

        const container =
            containerRef.current;


        const canvas =
            canvasRef.current;


        const video =
            videoRef.current;


        if (
            !container ||
            !canvas ||
            !video
        ) {
            return;
        }



        /* =====================================================
           VIDEO
        ===================================================== */

        video.muted =
            true;


        video.defaultMuted =
            true;


        video.loop =
            true;


        video.playsInline =
            true;


        const playVideo =
            () => {

                video
                    .play()
                    .catch(
                        () => {}
                    );
            };


        playVideo();


        video.addEventListener(
            "canplay",
            playVideo
        );



        /* =====================================================
           RENDERER
        ===================================================== */

        const renderer =

            new THREE.WebGLRenderer({

                canvas,

                alpha: true,

                antialias: false,

                premultipliedAlpha:
                    false,

                powerPreference:
                    "high-performance",
            });


        renderer.setPixelRatio(

            Math.min(
                window.devicePixelRatio ||
                1,

                2
            )
        );


        renderer.setClearColor(
            0x000000,
            0
        );


        renderer.autoClear =
            false;



        /* =====================================================
           SCENES
        ===================================================== */

        const passScene =
            new THREE.Scene();


        const passCamera =
            new THREE.OrthographicCamera(
                -1,
                1,
                1,
                -1,
                0,
                1
            );


        const passGeometry =
            new THREE.PlaneGeometry(
                2,
                2
            );


        const passMesh =
            new THREE.Mesh(
                passGeometry
            );


        passScene.add(
            passMesh
        );



        const displayScene =
            new THREE.Scene();


        const displayCamera =
            new THREE.OrthographicCamera(
                -1,
                1,
                1,
                -1,
                0,
                1
            );



        /* =====================================================
           TEXTURES
        ===================================================== */

        const baseTexture =

            new THREE.TextureLoader()
                .load(
                    algoImage.src
                );


        baseTexture.minFilter =
            THREE.LinearFilter;


        baseTexture.magFilter =
            THREE.LinearFilter;


        baseTexture.colorSpace =
            THREE.SRGBColorSpace;



        const videoTexture =

            new THREE.VideoTexture(
                video
            );


        videoTexture.minFilter =
            THREE.LinearFilter;


        videoTexture.magFilter =
            THREE.LinearFilter;


        videoTexture.generateMipmaps =
            false;


        videoTexture.colorSpace =
            THREE.SRGBColorSpace;



        /* =====================================================
           ASPECTS
        ===================================================== */

        let baseAspect =
            1057 / 273;


        let revealAspect =
            16 / 9;


        const updateBaseAspect =
            () => {

                const image =
                    baseTexture.image as
                        HTMLImageElement;


                if (
                    image?.naturalWidth &&
                    image?.naturalHeight
                ) {

                    baseAspect =

                        image.naturalWidth /

                        image.naturalHeight;
                }
            };


        baseTexture.onUpdate =
            updateBaseAspect;



        const updateVideoAspect =
            () => {

                if (
                    video.videoWidth &&
                    video.videoHeight
                ) {

                    revealAspect =

                        video.videoWidth /

                        video.videoHeight;
                }
            };


        video.addEventListener(
            "loadedmetadata",
            updateVideoAspect
        );


        video.addEventListener(
            "loadeddata",
            updateVideoAspect
        );



        /* =====================================================
           FBO
        ===================================================== */

        const createRT = (
            width: number,
            height: number,
            minFilter: THREE.MinificationTextureFilter,
            magFilter: THREE.MagnificationTextureFilter
        ) => {
            const rt = new THREE.WebGLRenderTarget(
                width,
                height,
                {
                    minFilter,
                    magFilter,

                    format: THREE.RGBAFormat,
                    type: THREE.HalfFloatType,

                    depthBuffer: false,
                    stencilBuffer: false,
                }
            );

            rt.texture.wrapS = THREE.ClampToEdgeWrapping;
            rt.texture.wrapT = THREE.ClampToEdgeWrapping;

            return rt;
        };



        const createDoubleFBO = (
            width: number,
            height: number,
            minFilter: THREE.MinificationTextureFilter,
            magFilter: THREE.MagnificationTextureFilter
        ): DoubleFBO => {
            const result = {} as DoubleFBO;

            result.read = createRT(
                width,
                height,
                minFilter,
                magFilter
            );

            result.write = createRT(
                width,
                height,
                minFilter,
                magFilter
            );

            result.swap = () => {
                const temp = result.read;

                result.read = result.write;
                result.write = temp;
            };

            return result;
        };



        /* =====================================================
           FLUID BUFFERS
        ===================================================== */

        const simRes =
            SETTINGS.simResolution;


        const dyeRes =
            SETTINGS.dyeResolution;



        const velocity = createDoubleFBO(
            simRes,
            simRes,
            THREE.LinearFilter,
            THREE.LinearFilter
        );



        const pressure = createDoubleFBO(
            simRes,
            simRes,
            THREE.NearestFilter,
            THREE.NearestFilter
        );



        const dye = createDoubleFBO(
            dyeRes,
            dyeRes,
            THREE.LinearFilter,
            THREE.LinearFilter
        );



        const curlRT = createRT(
            simRes,
            simRes,
            THREE.NearestFilter,
            THREE.NearestFilter
        );



        const divergenceRT = createRT(
            simRes,
            simRes,
            THREE.NearestFilter,
            THREE.NearestFilter
        );



        const simTexelSize =

            new THREE.Vector2(
                1 / simRes,
                1 / simRes
            );



        const dyeTexelSize =

            new THREE.Vector2(
                1 / dyeRes,
                1 / dyeRes
            );



        /* =====================================================
           PASS MATERIAL HELPER
        ===================================================== */

        const createPassMaterial = (
            fragmentShader: string,
            uniforms: any
        ) => {

            return new THREE.ShaderMaterial({

                vertexShader:
                PASS_VERTEX,

                fragmentShader,

                uniforms,

                depthTest: false,

                depthWrite: false,
            });
        };



        /* =====================================================
           MATERIALS
        ===================================================== */

        const splatMaterial =
            createPassMaterial(
                SPLAT_FRAGMENT,
                {
                    uTarget: {
                        value: null
                    },

                    uAspectRatio: {
                        value: 1
                    },

                    uPoint: {
                        value:
                            new THREE.Vector2()
                    },

                    uColor: {
                        value:
                            new THREE.Vector3()
                    },

                    uRadius: {
                        value:
                        SETTINGS.splatRadius
                    },
                }
            );



        const curlMaterial =

            createPassMaterial(
                CURL_FRAGMENT,
                {

                    uVelocity: {
                        value: null
                    },

                    uTexelSize: {
                        value:
                        simTexelSize
                    },
                }
            );



        const vorticityMaterial =

            createPassMaterial(
                VORTICITY_FRAGMENT,
                {

                    uVelocity: {
                        value: null
                    },

                    uCurl: {
                        value: null
                    },

                    uTexelSize: {
                        value:
                        simTexelSize
                    },

                    uCurlStrength: {
                        value:
                        SETTINGS
                            .curlStrength
                    },

                    uDt: {
                        value:
                            0.016
                    },
                }
            );



        const advectionMaterial =

            createPassMaterial(
                ADVECTION_FRAGMENT,
                {

                    uVelocity: {
                        value: null
                    },

                    uSource: {
                        value: null
                    },

                    uTexelSize: {
                        value:
                        simTexelSize
                    },

                    uDt: {
                        value: 1
                    },

                    uDissipation: {
                        value: 1
                    },
                }
            );



        const divergenceMaterial =

            createPassMaterial(
                DIVERGENCE_FRAGMENT,
                {

                    uVelocity: {
                        value: null
                    },

                    uTexelSize: {
                        value:
                        simTexelSize
                    },
                }
            );



        const pressureMaterial =

            createPassMaterial(
                PRESSURE_FRAGMENT,
                {

                    uPressure: {
                        value: null
                    },

                    uDivergence: {
                        value: null
                    },

                    uTexelSize: {
                        value:
                        simTexelSize
                    },
                }
            );



        const gradientMaterial =

            createPassMaterial(
                GRADIENT_FRAGMENT,
                {

                    uPressure: {
                        value: null
                    },

                    uVelocity: {
                        value: null
                    },

                    uTexelSize: {
                        value:
                        simTexelSize
                    },
                }
            );



        /* =====================================================
           FINAL DISPLAY MATERIAL
        ===================================================== */

        const displayMaterial =

            new THREE.ShaderMaterial({

                vertexShader:
                PASS_VERTEX,

                fragmentShader:
                DISPLAY_FRAGMENT,

                transparent:
                    true,

                depthTest:
                    false,

                depthWrite:
                    false,

                blending:
                THREE.NormalBlending,

                uniforms: {

                    uBaseTexture: {
                        value:
                        baseTexture
                    },

                    uRevealTexture: {
                        value:
                        videoTexture
                    },

                    uDye: {
                        value:
                        dye.read.texture
                    },

                    uRevealSize: {
                        value:
                        SETTINGS.revealSize
                    },

                    uEdgeSoftness: {
                        value:
                        SETTINGS.edgeSoftness
                    },

                    uEdgeWidth: {
                        value:
                        SETTINGS.edgeWidth
                    },

                    uBaseImageAspect: {
                        value:
                        baseAspect
                    },

                    uRevealImageAspect: {
                        value:
                        revealAspect
                    },

                    uRevealScale: {
                        value:
                            new THREE.Vector2(
                                SETTINGS.videoScale,
                                SETTINGS.videoScale
                            )
                    },

                    uRevealOffset: {
                        /*
                            Только ручная UV-настройка контента видео.
                            Физический пиксельный сдвиг делается отдельно
                            через uVideoBoxMin/uVideoBoxMax.
                        */
                        value:
                            new THREE.Vector2(
                                SETTINGS.videoOffsetX,
                                SETTINGS.videoOffsetY
                            )
                    },

                    uPlaneAspect: {
                        value: 1
                    },

                    uBoxMin: {
                        value:
                            new THREE.Vector2(
                                0,
                                0
                            )
                    },

                    uBoxMax: {
                        value:
                            new THREE.Vector2(
                                1,
                                1
                            )
                    },

                    uVideoBoxMin: {
                        value:
                            new THREE.Vector2(
                                0,
                                0
                            )
                    },

                    uVideoBoxMax: {
                        value:
                            new THREE.Vector2(
                                1,
                                1
                            )
                    },

                    uBoxAspect: {
                        value:
                            1057 / 273
                    },

                    uInkColor: {
                        value:
                            new THREE.Color(
                                SETTINGS.inkColor
                            )
                    },
                },
            });



        const displayMesh =

            new THREE.Mesh(
                new THREE.PlaneGeometry(
                    2,
                    2
                ),

                displayMaterial
            );


        displayScene.add(
            displayMesh
        );



        /* =====================================================
           PASS
        ===================================================== */

        const renderPass = (
            material:
                THREE.ShaderMaterial,

            target:
                THREE.WebGLRenderTarget
        ) => {

            passMesh.material =
                material;


            renderer.setRenderTarget(
                target
            );


            renderer.render(
                passScene,
                passCamera
            );
        };



        /* =====================================================
           CLEAR
        ===================================================== */

        renderer.setClearColor(
            0x000000,
            0
        );


        const clearTarget = (
            target:
                THREE.WebGLRenderTarget
        ) => {

            renderer.setRenderTarget(
                target
            );


            renderer.clear();
        };


        [
            velocity.read,
            velocity.write,

            pressure.read,
            pressure.write,

            dye.read,
            dye.write,

            curlRT,
            divergenceRT,

        ].forEach(
            clearTarget
        );


        renderer.setRenderTarget(
            null
        );



        /* =====================================================
           SIZE
        ===================================================== */

        let renderWidth =
            1;


        let renderHeight =
            1;


        const resize =
            () => {

                const rect =

                    container
                        .getBoundingClientRect();


                renderWidth =
                    Math.max(
                        1,
                        rect.width
                    );


                renderHeight =
                    Math.max(
                        1,
                        rect.height
                    );


                renderer.setSize(
                    renderWidth,
                    renderHeight,
                    false
                );


                displayMaterial.uniforms
                    .uPlaneAspect.value =

                    renderWidth /
                    renderHeight;


                /* =========================================
                   ALGO IMAGE BOX INSIDE FULL HERO

                   Canvas занимает весь hero,
                   но base/video остаются в размере ALGO-блока.
                ========================================= */

                const algoAspect =
                    algoImage.width /
                    algoImage.height;


                const cssAlgoImageWidth =
                    getComputedStyle(container)
                        .getPropertyValue("--algo-image-width")
                        .trim();


                const cssAlgoImageWidthPercent =
                    parseFloat(cssAlgoImageWidth);


                const cssAlgoImageOffsetX =
                    parseFloat(
                        getComputedStyle(container)
                            .getPropertyValue("--algo-image-offset-x")
                    );


                const imageOffsetX =
                    Number.isFinite(cssAlgoImageOffsetX)
                        ? cssAlgoImageOffsetX
                        : 0;


                const boxWidth =

                    Math.min(
                        1057,
                        renderWidth *
                        (
                            Number.isFinite(cssAlgoImageWidthPercent)
                                ? cssAlgoImageWidthPercent / 100
                                : 0.70
                        )
                    );


                const boxHeight =

                    boxWidth /
                    algoAspect;


                const hero =
                    container.parentElement;


                const cssAlgoImageBottomSpace =
                    parseFloat(
                        getComputedStyle(container)
                            .getPropertyValue("--algo-image-bottom-space")
                    );


                const boxLeft =

                    (
                        renderWidth -
                        boxWidth
                    ) / 2 +
                    imageOffsetX;


                const cssAlgoImageTop =
                    parseFloat(
                        getComputedStyle(container)
                            .getPropertyValue("--algo-image-top")
                    );

                const configuredBoxTop =
                    Number.isFinite(cssAlgoImageTop)
                        ? cssAlgoImageTop
                        : ALGO_IMAGE_TOP_FALLBACK;


                const cssContentImageGap =
                    parseFloat(
                        getComputedStyle(container)
                            .getPropertyValue("--algo-content-image-gap")
                    );


                const contentImageGap =
                    Number.isFinite(cssContentImageGap)
                        ? cssContentImageGap
                        : 12;


                const mainInfo =
                    hero?.querySelector<HTMLElement>(".main_block_info") ??
                    null;


                const heroRect =
                    hero?.getBoundingClientRect();


                const mainInfoRect =
                    mainInfo?.getBoundingClientRect();


                const contentBasedBoxTop =
                    heroRect && mainInfoRect
                        ? mainInfoRect.bottom - heroRect.top + contentImageGap
                        : configuredBoxTop;


                /*
                    Для короткого текста сохраняем позицию из Figma.
                    Если перевод стал выше, картинка и видео автоматически
                    уходят под кнопку с заданным промежутком.
                */
                const boxTop =
                    Math.max(
                        configuredBoxTop,
                        Math.ceil(contentBasedBoxTop)
                    );


                if (hero) {
                    hero.style.setProperty(
                        "--algo-image-top-resolved",
                        `${boxTop}px`
                    );
                }


                const boxBottomSpace =
                    Number.isFinite(cssAlgoImageBottomSpace)
                        ? cssAlgoImageBottomSpace
                        : ALGO_IMAGE_BOTTOM_SPACE_FALLBACK;


                /*
                    Hero всегда заканчивается после картинки:
                    top картинки + её реальная адаптивная высота
                    + заданный нижний отступ.
                */
                const calculatedHeroHeight =
                    Math.ceil(
                        boxTop +
                        boxHeight +
                        boxBottomSpace
                    );


                if (hero) {
                    hero.style.setProperty(
                        "--hero-calculated-height",
                        `${calculatedHeroHeight}px`
                    );
                }


                const minX =

                    boxLeft /
                    renderWidth;


                const maxX =

                    (
                        boxLeft +
                        boxWidth
                    ) /
                    renderWidth;


                /*
                    WebGL UV идёт снизу вверх,
                    DOM — сверху вниз.
                */

                const minY =

                    (
                        renderHeight -
                        (
                            boxTop +
                            boxHeight
                        )
                    ) /
                    renderHeight;


                const maxY =

                    (
                        renderHeight -
                        boxTop
                    ) /
                    renderHeight;


                displayMaterial.uniforms
                    .uBoxMin.value.set(
                    minX,
                    minY
                );


                displayMaterial.uniforms
                    .uBoxMax.value.set(
                    maxX,
                    maxY
                );


                /*
                    VIDEO BOX

                    Двигаем весь video/reveal слой физически на нужное
                    количество пикселей, НЕ меняя SETTINGS.videoOffsetY.

                    Положительное videoBoxOffsetYPx = ниже.
                    Отрицательное = выше.
                */
                const cssVideoBoxOffsetY =
                    parseFloat(
                        getComputedStyle(container)
                            .getPropertyValue("--algo-video-box-offset-y")
                    );


                const videoBoxOffsetY =
                    Number.isFinite(cssVideoBoxOffsetY)
                        ? cssVideoBoxOffsetY
                        : SETTINGS.videoBoxOffsetYPx;


                const videoBoxTop =
                    boxTop +
                    videoBoxOffsetY;

                const videoMinY =
                    (
                        renderHeight -
                        (
                            videoBoxTop +
                            boxHeight
                        )
                    ) /
                    renderHeight;

                const videoMaxY =
                    (
                        renderHeight -
                        videoBoxTop
                    ) /
                    renderHeight;

                displayMaterial.uniforms
                    .uVideoBoxMin.value.set(
                    minX,
                    videoMinY
                );

                displayMaterial.uniforms
                    .uVideoBoxMax.value.set(
                    maxX,
                    videoMaxY
                );


                displayMaterial.uniforms
                    .uBoxAspect.value =

                    boxWidth /
                    boxHeight;
            };


        resize();



        const resizeObserver =

            new ResizeObserver(
                resize
            );


        resizeObserver.observe(
            container
        );


        const mainInfo =
            container.parentElement
                ?.querySelector<HTMLElement>(".main_block_info");


        if (mainInfo) {
            resizeObserver.observe(mainInfo);
        }



        /* =====================================================
           SCROLL FADE

           Как в оригинале: пока верхняя граница блока
           не достигла верха вьюпорта — эффект работает
           на полную. Когда блок начинает уходить вверх
           за пределы экрана — сила сплэта плавно гасится
           до нуля (в квадрате, для более резкого затухания
           в конце).
        ===================================================== */

        const computeScrollFade = () => {

            const rect =

                container
                    .getBoundingClientRect();


            const height =

                rect.height ||
                1;


            let n =
                -rect.top /
                height;


            if (n < 0) n = 0;

            if (n > 1) n = 1;


            return n;
        };



        /* =====================================================
           POINTER

           Canvas intentionally has pointer-events: none so it never
           blocks buttons/links above it. Therefore mouse movement is
           listened to on window, but splats are generated only while
           the pointer is actually inside this hero/container.
        ===================================================== */

        const mouse = {
            x: 0.5,
            y: 0.5
        };

        const prevMouse = {
            x: 0.5,
            y: 0.5
        };

        let mouseHasMoved = false;
        let initialized = false;
        let pointerInside = false;

        const handleMouseMove = (event: MouseEvent) => {
            const rect = container.getBoundingClientRect();

            if (!rect.width || !rect.height) {
                return;
            }

            const inside =
                event.clientX >= rect.left &&
                event.clientX <= rect.right &&
                event.clientY >= rect.top &&
                event.clientY <= rect.bottom;

            // Pointer has just entered the hero. Start a new trajectory
            // from the current position so there is no long line from a
            // stale mouse position outside the block.
            if (inside && !pointerInside) {
                pointerInside = true;

                mouse.x =
                    (event.clientX - rect.left) / rect.width;

                mouse.y =
                    1 - (event.clientY - rect.top) / rect.height;

                prevMouse.x = mouse.x;
                prevMouse.y = mouse.y;

                initialized = true;
                mouseHasMoved = false;
                return;
            }

            // Outside hero: do not add new dye/velocity. Existing fluid
            // can continue to dissipate naturally.
            if (!inside) {
                pointerInside = false;
                initialized = false;
                mouseHasMoved = false;
                return;
            }

            mouse.x =
                (event.clientX - rect.left) / rect.width;

            mouse.y =
                1 - (event.clientY - rect.top) / rect.height;

            if (!initialized) {
                prevMouse.x = mouse.x;
                prevMouse.y = mouse.y;
                initialized = true;
                mouseHasMoved = false;
                return;
            }

            mouseHasMoved = true;
        };

        window.addEventListener(
            "mousemove",
            handleMouseMove,
            { passive: true }
        );



        /* =====================================================
           SPLAT

           Как в оригинале: один сплэт за кадр, координаты —
           текущая позиция мыши, цвет velocity строится из
           сырой (без нормализации/интерполяции) дельты
           mouse - prevMouse, умноженной на splatForce и
           scroll fade. Радиус velocity и dye — один и тот же.
           Цвет dye — это сам scroll fade (s, s, s), без
           дополнительных множителей.
        ===================================================== */

        const splat = (
            x: number,
            y: number,
            dx: number,
            dy: number,
            fade: number
        ) => {

            const aspectRatio =
                renderWidth /
                renderHeight;


            /* velocity */

            splatMaterial.uniforms
                .uTarget.value =
                velocity.read.texture;


            splatMaterial.uniforms
                .uAspectRatio.value =
                aspectRatio;


            splatMaterial.uniforms
                .uPoint.value.set(
                x,
                y
            );


            splatMaterial.uniforms
                .uColor.value.set(
                dx *
                SETTINGS.splatForce *
                fade,

                dy *
                SETTINGS.splatForce *
                fade,

                0
            );


            splatMaterial.uniforms
                .uRadius.value =
                SETTINGS.splatRadius;


            renderPass(
                splatMaterial,
                velocity.write
            );


            velocity.swap();


            /* dye */

            splatMaterial.uniforms
                .uTarget.value =
                dye.read.texture;


            splatMaterial.uniforms
                .uPoint.value.set(
                x,
                y
            );


            splatMaterial.uniforms
                .uColor.value.set(
                fade,
                fade,
                fade
            );


            splatMaterial.uniforms
                .uRadius.value =
                SETTINGS.splatRadius;


            renderPass(
                splatMaterial,
                dye.write
            );


            dye.swap();
        };



        /* =====================================================
           STEP
        ===================================================== */

        const stepFluid =
            () => {


                /* =============================================
                   INPUT

                   Один сплэт за кадр, без искусственных
                   промежуточных шагов — так же, как в оригинале.
                ============================================= */

                const scrollFade =
                    computeScrollFade();


                const fadeSquared =

                    scrollFade *
                    scrollFade;


                const s =

                    1 -
                    fadeSquared;


                if (
                    mouseHasMoved &&
                    pointerInside
                ) {

                    const dx =

                        mouse.x -
                        prevMouse.x;


                    const dy =

                        mouse.y -
                        prevMouse.y;


                    const distance =

                        Math.sqrt(
                            dx * dx +
                            dy * dy
                        );


                    if (
                        distance > 0 &&
                        s > 0.001
                    ) {

                        splat(
                            mouse.x,
                            mouse.y,
                            dx,
                            dy,
                            s
                        );
                    }


                    prevMouse.x =
                        mouse.x;


                    prevMouse.y =
                        mouse.y;


                    mouseHasMoved =
                        false;
                }



                /* =============================================
                   CURL
                ============================================= */

                curlMaterial.uniforms
                    .uVelocity.value =

                    velocity.read.texture;


                renderPass(
                    curlMaterial,
                    curlRT
                );



                /* =============================================
                   VORTICITY
                ============================================= */

                vorticityMaterial.uniforms
                    .uVelocity.value =

                    velocity.read.texture;


                vorticityMaterial.uniforms
                    .uCurl.value =

                    curlRT.texture;


                vorticityMaterial.uniforms
                    .uCurlStrength.value =

                    SETTINGS.curlStrength;


                vorticityMaterial.uniforms
                    .uDt.value =

                    0.016;


                renderPass(
                    vorticityMaterial,
                    velocity.write
                );


                velocity.swap();



                /* =============================================
                   VELOCITY ADVECTION
                ============================================= */

                advectionMaterial.uniforms
                    .uVelocity.value =

                    velocity.read.texture;


                advectionMaterial.uniforms
                    .uSource.value =

                    velocity.read.texture;


                advectionMaterial.uniforms
                    .uTexelSize.value =

                    simTexelSize;


                advectionMaterial.uniforms
                    .uDt.value =

                    1;


                advectionMaterial.uniforms
                    .uDissipation.value =

                    SETTINGS
                        .velocityDissipation;


                renderPass(
                    advectionMaterial,
                    velocity.write
                );


                velocity.swap();



                /* =============================================
                   DYE ADVECTION
                ============================================= */

                advectionMaterial.uniforms
                    .uVelocity.value =

                    velocity.read.texture;


                advectionMaterial.uniforms
                    .uSource.value =

                    dye.read.texture;


                advectionMaterial.uniforms
                    .uTexelSize.value =

                    dyeTexelSize;


                advectionMaterial.uniforms
                    .uDt.value =

                    1;


                advectionMaterial.uniforms
                    .uDissipation.value =

                    SETTINGS
                        .dyeDissipation;


                renderPass(
                    advectionMaterial,
                    dye.write
                );


                dye.swap();



                /* =============================================
                   DIVERGENCE
                ============================================= */

                divergenceMaterial.uniforms
                    .uVelocity.value =

                    velocity.read.texture;


                renderPass(
                    divergenceMaterial,
                    divergenceRT
                );



                /* =============================================
                   RESET PRESSURE
                ============================================= */

                renderer.setRenderTarget(
                    pressure.read
                );


                renderer.clear();



                /* =============================================
                   PRESSURE × 20
                ============================================= */

                pressureMaterial.uniforms
                    .uDivergence.value =

                    divergenceRT.texture;


                for (
                    let i = 0;

                    i <
                    SETTINGS.pressureIterations;

                    i++
                ) {

                    pressureMaterial.uniforms
                        .uPressure.value =

                        pressure.read.texture;


                    renderPass(
                        pressureMaterial,
                        pressure.write
                    );


                    pressure.swap();
                }



                /* =============================================
                   GRADIENT SUBTRACTION
                ============================================= */

                gradientMaterial.uniforms
                    .uPressure.value =

                    pressure.read.texture;


                gradientMaterial.uniforms
                    .uVelocity.value =

                    velocity.read.texture;


                renderPass(
                    gradientMaterial,
                    velocity.write
                );


                velocity.swap();
            };



        /* =====================================================
           VISIBILITY
        ===================================================== */

        let visible =
            true;


        const intersectionObserver =

            new IntersectionObserver(

                entries => {

                    visible =

                        entries[0]
                            ?.isIntersecting
                        ??
                        true;
                },

                {
                    threshold: 0.01
                }
            );


        intersectionObserver.observe(
            container
        );



        /* =====================================================
           ANIMATION
        ===================================================== */

        let raf =
            0;


        const animate =
            () => {

                raf =

                    requestAnimationFrame(
                        animate
                    );


                if (!visible) {
                    return;
                }


                stepFluid();



                updateVideoAspect();


                displayMaterial.uniforms
                    .uDye.value =

                    dye.read.texture;


                displayMaterial.uniforms
                    .uBaseImageAspect.value =

                    baseAspect;


                displayMaterial.uniforms
                    .uRevealImageAspect.value =

                    revealAspect;


                displayMaterial.uniforms
                    .uRevealSize.value =

                    SETTINGS.revealSize;


                displayMaterial.uniforms
                    .uEdgeSoftness.value =

                    SETTINGS.edgeSoftness;


                displayMaterial.uniforms
                    .uEdgeWidth.value =

                    SETTINGS.edgeWidth;


                renderer.setRenderTarget(
                    null
                );


                renderer.clear();


                renderer.render(
                    displayScene,
                    displayCamera
                );
            };


        animate();



        /* =====================================================
           CLEANUP
        ===================================================== */

        return () => {

            cancelAnimationFrame(
                raf
            );


            window.removeEventListener(
                "mousemove",
                handleMouseMove
            );


            resizeObserver.disconnect();


            intersectionObserver.disconnect();


            video.removeEventListener(
                "canplay",
                playVideo
            );


            video.removeEventListener(
                "loadedmetadata",
                updateVideoAspect
            );


            video.removeEventListener(
                "loadeddata",
                updateVideoAspect
            );


            splatMaterial.dispose();

            curlMaterial.dispose();

            vorticityMaterial.dispose();

            advectionMaterial.dispose();

            divergenceMaterial.dispose();

            pressureMaterial.dispose();

            gradientMaterial.dispose();

            displayMaterial.dispose();


            passGeometry.dispose();

            displayMesh.geometry.dispose();


            baseTexture.dispose();

            videoTexture.dispose();


            velocity.read.dispose();

            velocity.write.dispose();


            pressure.read.dispose();

            pressure.write.dispose();


            dye.read.dispose();

            dye.write.dispose();


            curlRT.dispose();

            divergenceRT.dispose();


            renderer.dispose();
        };

    }, []);



    return (

        <div
            ref={containerRef}
            className="algo_reveal"

            /*
                Заполняет весь родительский блок (main_block_new)
                и НЕ перехватывает события мыши/клики — они должны
                свободно проходить к тексту и кнопке, лежащим поверх.
                mousemove всё равно слушается на window, так что
                трекинг курсора работает даже с pointer-events: none.
            */
            style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
            }}
        >

            {/*
                Video нужен как источник VideoTexture.
                Пользователь его напрямую не видит.
            */}

            {/*
                Исходная ALGO-картинка отображается как обычный DOM image.
                Никакого WebGL-пересчёта цвета/фона: это буквально
                algo_main_image.png в исходном виде.

                Геометрия 1:1 совпадает с uBoxMin/uBoxMax:
                width = min(1057px, 70% hero)
                bottom = 22px
            */}
            <img
                src={algoImage.src}
                alt=""
                draggable={false}
                className="algo_reveal_base_image"
                style={{
                    position: "absolute",
                    left: "calc(50% + var(--algo-image-offset-x, 0px))",
                    top: "var(--algo-image-top-resolved, var(--algo-image-top, 402px))",
                    bottom: "auto",
                    width: "min(1057px, var(--algo-image-width, 70%))",
                    height: "auto",
                    transform: "translateX(-50%)",
                    display: "block",
                    pointerEvents: "none",
                    userSelect: "none",
                    zIndex: 0,
                }}
            />


            <video
                ref={videoRef}
                src="/algo_main_bg.mp4"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"

                style={{
                    position: "absolute",
                    width: 1,
                    height: 1,
                    opacity: 0,
                    pointerEvents: "none",
                    left: "-9999px",
                    top: "-9999px",
                }}
            />


            <canvas
                ref={canvasRef}
                className="algo_reveal_canvas"

                style={{
                    display: "block",
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                    position: "absolute",
                    inset: 0,
                    zIndex: 1,
                }}
            />

        </div>
    );
};


export default AlgoReveal;