package com.xunay.gl;

import android.app.Activity;
import android.opengl.GLSurfaceView;
import android.os.Bundle;
import android.view.MotionEvent;

public class MainActivity extends Activity {
    private GLSurfaceView view;
    private SceneRenderer renderer;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        renderer = new SceneRenderer(getAssets());
        view = new GLSurfaceView(this);
        view.setEGLContextClientVersion(2);
        view.setRenderer(renderer);
        view.setRenderMode(GLSurfaceView.RENDERMODE_CONTINUOUSLY);
        view.setOnTouchListener((v, e) -> {
            if (e.getAction() == MotionEvent.ACTION_MOVE) {
                renderer.addDrag(e.getX() - renderer.lastX, e.getY() - renderer.lastY);
                renderer.lastX = e.getX();
                renderer.lastY = e.getY();
            } else if (e.getAction() == MotionEvent.ACTION_DOWN) {
                renderer.lastX = e.getX();
                renderer.lastY = e.getY();
            }
            return true;
        });
        setContentView(view);
    }
    @Override
    protected void onResume() { super.onResume(); view.onResume(); }
    @Override
    protected void onPause() { super.onPause(); view.onPause(); }
}
