package com.xunay.filament;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;
import android.view.Choreographer;
import android.view.SurfaceView;

import com.google.android.filament.Engine;
import com.google.android.filament.EntityManager;
import com.google.android.filament.Filament;
import com.google.android.filament.IndirectLight;
import com.google.android.filament.LightManager;
import com.google.android.filament.Scene;
import com.google.android.filament.android.UiHelper;
import com.google.android.filament.utils.Manipulator;
import com.google.android.filament.utils.ModelViewer;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.ByteBuffer;

import kotlin.jvm.functions.Function1;

public class MainActivity extends Activity {
    private static final String TAG = "XunayFilament";
    static {
        Filament.init();
        System.loadLibrary("gltfio-jni");
        System.loadLibrary("filament-utils-jni");
    }

    private SurfaceView surfaceView;
    private ModelViewer modelViewer;
    private final Choreographer choreographer = Choreographer.getInstance();

    private static final boolean SHADOWS = __SHADOWS__;
    private static final boolean BLOOM_ENABLED = __BLOOM_ENABLED__;
    private static final boolean SSAO_ENABLED = __SSAO_ENABLED__;
    private static final float SSAO_RADIUS = __SSAO_RADIUS__f;
    private static final float SSAO_INTENSITY = __SSAO_INTENSITY__f;
    private static final String AA_MODE = __AA_MODE__;
    private static final String TONEMAP = __TONEMAP__;
    private static final float BLOOM_STRENGTH = __BLOOM_STRENGTH__f;
    private static final int ANIM_INDEX = __ANIM_INDEX__;
    private static final float ANIM_SPEED = __ANIM_SPEED__f;
    private static final boolean PARTICLE_ENABLED = __PARTICLE_ENABLED__;
    private static final int PARTICLE_COUNT = __PARTICLE_COUNT__;
    private static final float PARTICLE_SPREAD = __PARTICLE_SPREAD__f;
    private static final float PARTICLE_SPREAD_Y = __PARTICLE_SPREAD_Y__f;
    private static final float PARTICLE_GRAVITY = __PARTICLE_GRAVITY__f;
    private static final float PARTICLE_SPEED = __PARTICLE_SPEED__f;
    private static final float PARTICLE_LIFE = __PARTICLE_LIFE__f;
    private static final boolean AUDIO_ENABLED = __AUDIO_ENABLED__;
    private static final String[][] AUDIO_LIST = __AUDIO_LIST__;
    private final java.util.Map<String, android.media.MediaPlayer> audioPool = new java.util.HashMap<>();
    private final java.util.Map<String, String> audioPaths = new java.util.HashMap<>();
    private static final int INST_COUNT = __INST_COUNT__;
    private static final float INST_SPREAD = __INST_SPREAD__f;
    private static final float INST_SPREAD_Y = __INST_SPREAD_Y__f;
    private static final float CAM_DIST = __CAM_DIST__f;
    private static final float CAM_CX = __CAM_CENTER_X__f;
    private static final float CAM_CY = __CAM_CENTER_Y__f;
    private static final float CAM_CZ = __CAM_CENTER_Z__f;

    private final AnimNode[] animNodes = __ANIMS__;
    private int[] animInstances = null;
    private long firstFrameNanos = 0L;
    private boolean userInteracted = false;
    private com.google.android.filament.gltfio.Animator animator = null;
    private int[] particleInstances = null;
    private float[] particlePos = null;
    private float[] particleVel = null;
    private float[] particleAge = null;
    private long lastFrameNanos = 0L;

    private final Choreographer.FrameCallback frameCallback = new Choreographer.FrameCallback() {
        @Override
        public void doFrame(long frameTimeNanos) {
            if (modelViewer != null) {
                if (firstFrameNanos == 0L) firstFrameNanos = frameTimeNanos;
                updateAnimations(frameTimeNanos);
                modelViewer.render(frameTimeNanos);
            }
            choreographer.postFrameCallback(this);
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        surfaceView = new SurfaceView(this);
        setContentView(surfaceView);

        Engine engine = Engine.create();
        UiHelper uiHelper = new UiHelper(UiHelper.ContextErrorPolicy.DONT_CHECK);

        Manipulator manipulator = new Manipulator.Builder()
                .targetPosition(CAM_CX, CAM_CY, CAM_CZ)
                .orbitHomePosition(CAM_CX, CAM_CY, CAM_CZ + CAM_DIST)
                .build(Manipulator.Mode.ORBIT);

        modelViewer = new ModelViewer(surfaceView, engine, uiHelper, manipulator);
        surfaceView.setOnTouchListener((v, ev) -> {
            userInteracted = true;
            return modelViewer.onTouch(v, ev);
        });

        ByteBuffer gltf = readAsset("scene.gltf");
        if (gltf == null) { Log.e(TAG, "scene.gltf 读取失败"); return; }
        Log.i(TAG, "scene.gltf: " + gltf.remaining() + " bytes");

        Function1<String, ByteBuffer> resolver = new Function1<String, ByteBuffer>() {
            @Override
            public ByteBuffer invoke(String uri) {
                return readAsset(uri);
            }
        };
        modelViewer.loadModelGltf(gltf, resolver);
        Log.i(TAG, "loadModelGltf done (dist=" + CAM_DIST + " center=(" + CAM_CX + "," + CAM_CY + "," + CAM_CZ + "))");

        // 音频
        setupAudios();

        // 粒子系统
        setupParticles();

        // glTF 自带动画：通过 FilamentInstance.getAnimator() 获取
        try {
            com.google.android.filament.gltfio.FilamentInstance inst =
                    modelViewer.getAsset().getInstance();
            if (inst != null) {
                animator = inst.getAnimator();
            }
            int animCount = (animator != null) ? animator.getAnimationCount() : 0;
            Log.i(TAG, "animator: " + animCount + " animations");
            if (animCount > 0) {
                int idx = ANIM_INDEX >= 0 && ANIM_INDEX < animCount ? ANIM_INDEX : 0;
                Log.i(TAG, "animation[" + idx + "] name=" + animator.getAnimationName(idx)
                        + " duration=" + animator.getAnimationDuration(idx));
            }
        } catch (Throwable t) {
            Log.w(TAG, "animation setup failed", t);
        }

__LIGHTS__

        IndirectLight ibl = new IndirectLight.Builder()
                .intensity(__IBL_INTENSITY__f)
                .build(engine);
        modelViewer.getScene().setIndirectLight(ibl);
        Log.i(TAG, "IndirectLight added");

        // Bloom 后处理
        if (BLOOM_ENABLED) {
            try {
                com.google.android.filament.View.BloomOptions bo = new com.google.android.filament.View.BloomOptions();
                bo.strength = BLOOM_STRENGTH;
                modelViewer.getView().setBloomOptions(bo);
                Log.i(TAG, "BloomOptions: strength=" + BLOOM_STRENGTH);
            } catch (Throwable t) {
                Log.w(TAG, "bloom failed", t);
            }
        }

        // SSAO
        if (SSAO_ENABLED) {
            try {
                com.google.android.filament.View.AmbientOcclusionOptions ao = new com.google.android.filament.View.AmbientOcclusionOptions();
                ao.enabled = true;
                ao.radius = SSAO_RADIUS;
                ao.intensity = SSAO_INTENSITY;
                ao.quality = com.google.android.filament.View.QualityLevel.HIGH;
                modelViewer.getView().setAmbientOcclusionOptions(ao);
                Log.i(TAG, "SSAO: radius=" + SSAO_RADIUS + " intensity=" + SSAO_INTENSITY);
            } catch (Throwable t) { Log.w(TAG, "ssao failed", t); }
        }

        // 抗锯齿
        try {
            com.google.android.filament.View.AntiAliasing aa = com.google.android.filament.View.AntiAliasing.NONE;
            if (AA_MODE.equals("fxaa")) aa = com.google.android.filament.View.AntiAliasing.FXAA;
            else if (AA_MODE.equals("none")) aa = com.google.android.filament.View.AntiAliasing.NONE;
            modelViewer.getView().setAntiAliasing(aa);
            Log.i(TAG, "AA: " + AA_MODE);
        } catch (Throwable t) { Log.w(TAG, "aa failed", t); }

        // 色调映射
        try {
            com.google.android.filament.ColorGrading.ToneMapping tm = com.google.android.filament.ColorGrading.ToneMapping.ACES;
            if (TONEMAP.equals("filmic")) tm = com.google.android.filament.ColorGrading.ToneMapping.FILMIC;
            else if (TONEMAP.equals("aces")) tm = com.google.android.filament.ColorGrading.ToneMapping.ACES;
            com.google.android.filament.ColorGrading.Builder cgb = new com.google.android.filament.ColorGrading.Builder();
            com.google.android.filament.ColorGrading cg = cgb.toneMapping(tm).build(engine);
            modelViewer.getView().setColorGrading(cg);
            Log.i(TAG, "ToneMapping: " + TONEMAP);
        } catch (Throwable t) { Log.w(TAG, "tonemap failed", t); }

        setupAnimations();
        Log.i(TAG, "=== onCreate end ===");
    }

    @Override
    protected void onResume() {
        super.onResume();
        choreographer.postFrameCallback(frameCallback);
    }

    @Override
    protected void onPause() {
        super.onPause();
        choreographer.removeFrameCallback(frameCallback);
    }

    private static void addLight(Engine engine, Scene scene,
                                 float r, float g, float b, float intensity,
                                 float dx, float dy, float dz) {
        int le = EntityManager.get().create();
        new LightManager.Builder(LightManager.Type.DIRECTIONAL)
                .color(r, g, b)
                .intensity(intensity)
                .direction(dx, dy, dz)
                .castShadows(SHADOWS)
                .build(engine, le);
        scene.addEntity(le);
        Log.i(TAG, "Light added");
    }

    public static class AnimNode {
        public final String name;
        public final float px, py, pz;
        public final float spinX, spinY, spinZ, spinSpeed;
        public final float bobAmp, bobSpeed;
        public AnimNode(String name, float px, float py, float pz,
                        float spinX, float spinY, float spinZ, float spinSpeed,
                        float bobAmp, float bobSpeed) {
            this.name = name;
            this.px = px; this.py = py; this.pz = pz;
            this.spinX = spinX; this.spinY = spinY; this.spinZ = spinZ;
            this.spinSpeed = spinSpeed;
            this.bobAmp = bobAmp; this.bobSpeed = bobSpeed;
        }
    }

    private void setupAnimations() {
        if (animNodes.length == 0) {
            Log.i(TAG, "setupAnimations: no anim nodes");
            return;
        }
        try {
            int[] entities = modelViewer.getAsset().getEntities();
            com.google.android.filament.TransformManager tm =
                    modelViewer.getEngine().getTransformManager();
            java.util.Map<String, Integer> nameToInst = new java.util.HashMap<>();
            for (int e : entities) {
                String n = modelViewer.getAsset().getName(e);
                if (n == null) continue;
                int inst = tm.getInstance(e);
                if (inst != 0) nameToInst.put(n, inst);
            }
            animInstances = new int[animNodes.length];
            for (int i = 0; i < animNodes.length; i++) {
                Integer inst = nameToInst.get(animNodes[i].name);
                animInstances[i] = (inst == null) ? 0 : inst;
            }
            Log.i(TAG, "setupAnimations: " + animNodes.length + " nodes, " + nameToInst.size() + " entities matched");
        } catch (Throwable t) {
            Log.w(TAG, "setupAnimations failed", t);
        }
    }

    private void setupParticles() {
        if (!PARTICLE_ENABLED || PARTICLE_COUNT == 0) return;
        try {
            int[] entities = modelViewer.getAsset().getEntities();
            com.google.android.filament.TransformManager tm = modelViewer.getEngine().getTransformManager();
            java.util.Map<String, Integer> nameToInst = new java.util.HashMap<>();
            for (int e : entities) {
                String n = modelViewer.getAsset().getName(e);
                if (n == null || !n.startsWith("p_")) continue;
                int inst = tm.getInstance(e);
                if (inst != 0) nameToInst.put(n, inst);
            }
            particleInstances = new int[PARTICLE_COUNT];
            particlePos = new float[PARTICLE_COUNT * 3];
            particleVel = new float[PARTICLE_COUNT * 3];
            particleAge = new float[PARTICLE_COUNT];
            java.util.Random rnd = new java.util.Random(42);
            for (int i = 0; i < PARTICLE_COUNT; i++) {
                Integer inst = nameToInst.get("p_" + i);
                particleInstances[i] = (inst == null) ? 0 : inst;
                particlePos[i*3]   = (rnd.nextFloat() - 0.5f) * PARTICLE_SPREAD;
                particlePos[i*3+1] = (rnd.nextFloat() - 0.5f) * PARTICLE_SPREAD_Y;
                particlePos[i*3+2] = (rnd.nextFloat() - 0.5f) * PARTICLE_SPREAD;
                particleVel[i*3]   = (rnd.nextFloat() - 0.5f) * PARTICLE_SPEED * 0.3f;
                particleVel[i*3+1] = rnd.nextFloat() * PARTICLE_SPEED;
                particleVel[i*3+2] = (rnd.nextFloat() - 0.5f) * PARTICLE_SPEED * 0.3f;
                particleAge[i] = rnd.nextFloat() * PARTICLE_LIFE;
            }
            Log.i(TAG, "setupParticles: " + PARTICLE_COUNT + " instances, " + nameToInst.size() + " matched");
        } catch (Throwable t) { Log.w(TAG, "setupParticles failed", t); }
    }

    private void updateParticles(float dt) {
        if (!PARTICLE_ENABLED || particleInstances == null) return;
        com.google.android.filament.TransformManager tm = modelViewer.getEngine().getTransformManager();
        java.util.Random rnd = new java.util.Random();
        for (int i = 0; i < PARTICLE_COUNT; i++) {
            int inst = particleInstances[i];
            if (inst == 0) continue;
            particleVel[i*3+1] += PARTICLE_GRAVITY * dt;
            particlePos[i*3]   += particleVel[i*3]   * dt;
            particlePos[i*3+1] += particleVel[i*3+1] * dt;
            particlePos[i*3+2] += particleVel[i*3+2] * dt;
            particleAge[i] += dt;
            if (particleAge[i] > PARTICLE_LIFE || particlePos[i*3+1] < -3f) {
                particlePos[i*3]   = (rnd.nextFloat() - 0.5f) * PARTICLE_SPREAD;
                particlePos[i*3+1] = (rnd.nextFloat() - 0.5f) * PARTICLE_SPREAD_Y;
                particlePos[i*3+2] = (rnd.nextFloat() - 0.5f) * PARTICLE_SPREAD;
                particleVel[i*3]   = (rnd.nextFloat() - 0.5f) * PARTICLE_SPEED * 0.3f;
                particleVel[i*3+1] = rnd.nextFloat() * PARTICLE_SPEED;
                particleVel[i*3+2] = (rnd.nextFloat() - 0.5f) * PARTICLE_SPEED * 0.3f;
                particleAge[i] = 0;
            }
            float[] m = new float[16];
            android.opengl.Matrix.setIdentityM(m, 0);
            android.opengl.Matrix.translateM(m, 0, particlePos[i*3], particlePos[i*3+1], particlePos[i*3+2]);
            tm.setTransform(inst, m);
        }
    }

    private void updateAnimations(long frameTimeNanos) {
        if (modelViewer == null || modelViewer.getEngine() == null) return;
        float t = (frameTimeNanos - firstFrameNanos) / 1_000_000_000f;
        float dt = (lastFrameNanos == 0L) ? 0.016f : (frameTimeNanos - lastFrameNanos) / 1_000_000_000f;
        lastFrameNanos = frameTimeNanos;
        updateParticles(dt);

        // glTF 自带动画驱动（先跑，独立于 xunay 的 spin/bob）
        if (animator != null && animator.getAnimationCount() > 0) {
            int __ac = animator.getAnimationCount();
            boolean __any = false;
            for (int __ai = 0; __ai < __ac; __ai++) {
                float __dur = animator.getAnimationDuration(__ai);
                if (__dur > 0f) {
                    animator.applyAnimation(__ai, (t * ANIM_SPEED) % __dur);
                    __any = true;
                }
            }
            if (__any) animator.updateBoneMatrices();
        }

        if (animInstances == null) return;

        com.google.android.filament.TransformManager tm =
                modelViewer.getEngine().getTransformManager();
        for (int i = 0; i < animNodes.length; i++) {
            int inst = animInstances[i];
            if (inst == 0) continue;
            AnimNode a = animNodes[i];
            float[] m = new float[16];
            android.opengl.Matrix.setIdentityM(m, 0);
            float bobOffset = (a.bobAmp != 0f && a.bobSpeed != 0f)
                    ? a.bobAmp * (float) Math.sin(2 * Math.PI * a.bobSpeed * t)
                    : 0f;
            android.opengl.Matrix.translateM(m, 0, a.px, a.py + bobOffset, a.pz);
            if (a.spinSpeed != 0f) {
                float angle = (float) Math.toDegrees(2 * Math.PI * a.spinSpeed * t);
                android.opengl.Matrix.rotateM(m, 0, angle, a.spinX, a.spinY, a.spinZ);
            }
            tm.setTransform(inst, m);
        }
    }

    private void setupAudios() {
        if (!AUDIO_ENABLED || AUDIO_LIST.length == 0) return;
        try {
            for (String[] a : AUDIO_LIST) {
                if (a.length < 5) continue;
                String name = a[0], path = a[1];
                boolean loop = "true".equals(a[2]);
                boolean autoplay = "true".equals(a[3]);
                float vol = Float.parseFloat(a[4]);
                audioPaths.put(name, path);
                if (autoplay) {
                    playAudio(name);
                    setAudioVolume(name, vol);
                    if (loop) {
                        android.media.MediaPlayer mp = audioPool.get(name);
                        if (mp != null) mp.setLooping(true);
                    }
                }
            }
            Log.i(TAG, "setupAudios: " + AUDIO_LIST.length + " audios");
        } catch (Throwable t) { Log.w(TAG, "setupAudios failed", t); }
    }

    private void playAudio(String name) {
        Log.i(TAG, "playAudio begin: " + name);
        try {
            android.media.MediaPlayer mp = audioPool.get(name);
            if (mp == null) {
                String path = audioPaths.get(name);
                Log.i(TAG, "playAudio path: " + path);
                if (path == null) { Log.w(TAG, "playAudio: no path for " + name); return; }
                android.content.res.AssetFileDescriptor afd = getAssets().openFd(path);
                Log.i(TAG, "playAudio afd: len=" + afd.getLength() + " off=" + afd.getStartOffset());
                mp = new android.media.MediaPlayer();
                mp.setOnErrorListener((m, what, extra) -> { Log.w(TAG, "MediaPlayer error: " + what + " / " + extra); return true; });
                mp.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength());
                afd.close();
                mp.prepare();
                Log.i(TAG, "playAudio prepared");
                audioPool.put(name, mp);
            }
            if (mp.isPlaying()) { Log.i(TAG, "playAudio already playing, seek 0"); mp.seekTo(0); }
            else { mp.start(); Log.i(TAG, "playAudio started"); }
        } catch (Throwable t) { Log.w(TAG, "playAudio failed: " + name, t); }
    }

    private void pauseAudio(String name) {
        android.media.MediaPlayer mp = audioPool.get(name);
        if (mp != null && mp.isPlaying()) mp.pause();
    }

    private void stopAudio(String name) {
        android.media.MediaPlayer mp = audioPool.get(name);
        if (mp != null) { mp.stop(); mp.release(); audioPool.remove(name); }
    }

    private void setAudioVolume(String name, float vol) {
        android.media.MediaPlayer mp = audioPool.get(name);
        Log.i(TAG, "setAudioVolume: " + name + " vol=" + vol + " mp=" + (mp != null));
        if (mp != null) {
            mp.setVolume(vol, vol);
            Log.i(TAG, "setAudioVolume applied");
        }
    }

    private ByteBuffer readAsset(String path) {
        try (InputStream in = getAssets().open(path)) {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            byte[] buf = new byte[8192];
            int n;
            while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
            byte[] bytes = out.toByteArray();
            ByteBuffer bb = ByteBuffer.allocateDirect(bytes.length);
            bb.put(bytes);
            bb.position(0);
            return bb;
        } catch (Exception e) {
            Log.e(TAG, "readAsset failed: " + path, e);
            return null;
        }
    }
}
