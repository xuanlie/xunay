package com.xunay.filament;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;
import android.view.Choreographer;
import android.view.SurfaceView;

import com.google.android.filament.Engine;
import com.google.android.filament.Filament;
import com.google.android.filament.android.UiHelper;
import com.google.android.filament.utils.Manipulator;
import com.google.android.filament.EntityManager;
import com.google.android.filament.IndirectLight;
import com.google.android.filament.LightManager;
import com.google.android.filament.utils.Float3;
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

    private final Choreographer.FrameCallback frameCallback = new Choreographer.FrameCallback() {
        @Override
        public void doFrame(long frameTimeNanos) {
            if (modelViewer != null) modelViewer.render(frameTimeNanos);
            choreographer.postFrameCallback(this);
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Log.i(TAG, "=== onCreate begin ===");
        surfaceView = new SurfaceView(this);
        setContentView(surfaceView);

        Engine engine = Engine.create();
        Log.i(TAG, "Engine created");
        UiHelper uiHelper = new UiHelper(UiHelper.ContextErrorPolicy.DONT_CHECK);
        Manipulator manipulator = new Manipulator.Builder().build(Manipulator.Mode.ORBIT);
        modelViewer = new ModelViewer(surfaceView, engine, uiHelper, manipulator);
        Log.i(TAG, "ModelViewer created");
        surfaceView.setOnTouchListener(modelViewer);

        ByteBuffer gltf = readAsset("models/scene.gltf");
        Log.i(TAG, "scene.gltf read: " + (gltf == null ? "null" : gltf.remaining() + " bytes"));
        if (gltf != null) {
            Function1<String, ByteBuffer> resolver = new Function1<String, ByteBuffer>() {
                @Override
                public ByteBuffer invoke(String uri) {
                    ByteBuffer b = readAsset("models/" + uri);
                    Log.i(TAG, "resolver " + uri + " -> " + (b == null ? "null" : b.remaining() + " bytes"));
                    return b;
                }
            };
            modelViewer.loadModelGltf(gltf, resolver);
            Log.i(TAG, "loadModelGltf done");
            modelViewer.transformToUnitCube(new Float3(0f, 0f, 0f));

            // 方向光
            int sun = EntityManager.get().create();
            new LightManager.Builder(LightManager.Type.DIRECTIONAL)
                    .color(1.0f, 1.0f, 1.0f)
                    .intensity(100000.0f)
                    .direction(0.3f, -1.0f, -0.3f)
                    .castShadows(true)
                    .build(engine, sun);
            modelViewer.getScene().addEntity(sun);

            IndirectLight ibl = new IndirectLight.Builder()
                    .intensity(30000f)
                    .build(engine);
            modelViewer.getScene().setIndirectLight(ibl);
            Log.i(TAG, "IndirectLight added");
            Log.i(TAG, "DirectionalLight added");
            Log.i(TAG, "transformToUnitCube done");
        }
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
