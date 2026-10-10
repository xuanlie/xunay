package com.xunay.gl;

import android.opengl.GLES20;
import android.opengl.GLSurfaceView;
import android.opengl.GLUtils;
import android.opengl.Matrix;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.FloatBuffer;
import java.util.ArrayList;
import java.util.List;
import javax.microedition.khronos.egl.EGLConfig;
import javax.microedition.khronos.opengles.GL10;

public class SceneRenderer implements GLSurfaceView.Renderer {
    private static final String VS = "__VS__";
    private static final String FS = "__FS__";
    private static final float BG_R = __BGR__, BG_G = __BGG__, BG_B = __BGB__;
    private static final float CAM_DIST = __CAM__;
    private static final float CAM_FOV = __FOV__;
    private static final boolean AUTO_ROTATE = __AR__;
    private static final int LIGHT_COUNT = __LIGHT_COUNT__;
    private static final float[] LIGHT_DIR = {__LIGHT_DIR__};
    private static final float[] LIGHT_COLOR = {__LIGHT_COLOR__};
    private static final float[] LIGHT_INTENSITY = {__LIGHT_INTENSITY__};
    private static final String[] TEX_NAMES = {__TEX_NAMES__};

    public float lastX = 0, lastY = 0;
    private int program, aPos, aNormal, aCol, uMVP, uModel;
    private int uLightDir, uLightColor, uLightIntensity, uLightCount;
    private int uMetalness, uRoughness, uCamPos, uTex, uUseTex, uTexScale;
    private final float[] proj = new float[16];
    private final float[] view = new float[16];
    private final float[] global = new float[16];
    private final float[] objModel = new float[16];
    private final float[] tmpA = new float[16];
    private final float[] tmpB = new float[16];
    private final float[] tmpC = new float[16];
    private float angle = 0;
    private float userX = 0, userY = 0;
    private final android.content.res.AssetManager assets;
    private final int[] texIds;

    private final List<Float> data = new ArrayList<>();
    private int vertexOffset = 0;
    private FloatBuffer buf;
    private float frameTime = 0;

    private static class Mesh {
        int offset, count;
        float tx, ty, tz;
        float userRX, userRY, userRZ;
        float spinSpeed;
        float spinAxisX, spinAxisY, spinAxisZ;
        float bobAmp, bobSpeed;
        float spinAngle = 0;
        float metalness, roughness;
        int texIdx = -1;
        float texScale = 1f;
    }
    private final List<Mesh> meshes = new ArrayList<>();

    public SceneRenderer(android.content.res.AssetManager a) {
        this.assets = a;
        this.texIds = new int[TEX_NAMES.length];
        for (int i = 0; i < texIds.length; i++) texIds[i] = 0;
    }

    private void __commit(float tx, float ty, float tz, float rx, float ry, float rz, float spin, float sax, float say, float saz, float bobAmp, float bobSpeed, float metalness, float roughness, int texIdx, float texScale) {
        Mesh m = new Mesh();
        m.offset = vertexOffset;
        m.count = data.size() / 9 - vertexOffset;
        vertexOffset = data.size() / 9;
        m.tx = tx; m.ty = ty; m.tz = tz;
        m.userRX = rx; m.userRY = ry; m.userRZ = rz;
        m.spinSpeed = spin;
        m.spinAxisX = sax; m.spinAxisY = say; m.spinAxisZ = saz;
        m.bobAmp = bobAmp; m.bobSpeed = bobSpeed;
        m.metalness = metalness;
        m.roughness = roughness;
        m.texIdx = texIdx;
        m.texScale = texScale;
        meshes.add(m);
    }

    private int loadTexture(String name) {
        try {
            android.graphics.Bitmap bmp = android.graphics.BitmapFactory.decodeStream(assets.open(name));
            if (bmp == null) return 0;
            int[] id = new int[1];
            GLES20.glGenTextures(1, id, 0);
            GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, id[0]);
            GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_MIN_FILTER, GLES20.GL_LINEAR_MIPMAP_LINEAR);
            GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_MAG_FILTER, GLES20.GL_LINEAR);
            GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_WRAP_S, GLES20.GL_REPEAT);
            GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_WRAP_T, GLES20.GL_REPEAT);
            GLUtils.texImage2D(GLES20.GL_TEXTURE_2D, 0, bmp, 0);
            GLES20.glGenerateMipmap(GLES20.GL_TEXTURE_2D);
            bmp.recycle();
            return id[0];
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    @Override
    public void onSurfaceCreated(GL10 gl, EGLConfig config) {
        GLES20.glClearColor(BG_R, BG_G, BG_B, 1f);
        GLES20.glEnable(GLES20.GL_DEPTH_TEST);
        program = ShaderUtil.createProgram(VS, FS);
        aPos = GLES20.glGetAttribLocation(program, "aPos");
        aNormal = GLES20.glGetAttribLocation(program, "aNormal");
        aCol = GLES20.glGetAttribLocation(program, "aColor");
        uMVP = GLES20.glGetUniformLocation(program, "uMVP");
        uModel = GLES20.glGetUniformLocation(program, "uModel");
        uLightDir = GLES20.glGetUniformLocation(program, "uLightDir");
        uLightColor = GLES20.glGetUniformLocation(program, "uLightColor");
        uLightIntensity = GLES20.glGetUniformLocation(program, "uLightIntensity");
        uLightCount = GLES20.glGetUniformLocation(program, "uLightCount");
        uMetalness = GLES20.glGetUniformLocation(program, "uMetalness");
        uRoughness = GLES20.glGetUniformLocation(program, "uRoughness");
        uCamPos = GLES20.glGetUniformLocation(program, "uCamPos");
        uTex = GLES20.glGetUniformLocation(program, "uTex");
        uUseTex = GLES20.glGetUniformLocation(program, "uUseTex");
        uTexScale = GLES20.glGetUniformLocation(program, "uTexScale");
        for (int i = 0; i < TEX_NAMES.length; i++) {
            if (TEX_NAMES[i] != null && !TEX_NAMES[i].isEmpty()) texIds[i] = loadTexture(TEX_NAMES[i]);
        }
        data.clear();
        meshes.clear();
        vertexOffset = 0;
__BUILD__
        float[] verts = new float[data.size()];
        for (int i = 0; i < verts.length; i++) verts[i] = data.get(i);
        ByteBuffer bb = ByteBuffer.allocateDirect(verts.length * 4);
        bb.order(ByteOrder.nativeOrder());
        buf = bb.asFloatBuffer();
        buf.put(verts);
        buf.position(0);
    }

    @Override
    public void onSurfaceChanged(GL10 gl, int w, int h) {
        GLES20.glViewport(0, 0, w, h);
        float ratio = (float) w / h;
        Matrix.perspectiveM(proj, 0, CAM_FOV, ratio, 0.1f, 100f);
        Matrix.setLookAtM(view, 0, 0, 0, CAM_DIST, 0, 0, 0, 0, 1, 0);
    }

    @Override
    public void onDrawFrame(GL10 gl) {
        GLES20.glClear(GLES20.GL_COLOR_BUFFER_BIT | GLES20.GL_DEPTH_BUFFER_BIT);
        if (AUTO_ROTATE) angle += 0.6f;
        frameTime += 1.0f;
        Matrix.setIdentityM(global, 0);
        Matrix.rotateM(global, 0, angle + userY, 0, 1, 0);
        Matrix.rotateM(global, 0, angle * 0.5f + userX, 1, 0, 0);
        GLES20.glUseProgram(program);
        GLES20.glUniform3fv(uLightDir, LIGHT_COUNT, LIGHT_DIR, 0);
        GLES20.glUniform3fv(uLightColor, LIGHT_COUNT, LIGHT_COLOR, 0);
        GLES20.glUniform1fv(uLightIntensity, LIGHT_COUNT, LIGHT_INTENSITY, 0);
        GLES20.glUniform1i(uLightCount, LIGHT_COUNT);
        GLES20.glUniform3f(uCamPos, 0f, 0f, CAM_DIST);
        GLES20.glUniform1i(uTex, 0);
        int stride = 9 * 4;
        for (Mesh m : meshes) {
            if (m.spinSpeed != 0) m.spinAngle += m.spinSpeed;
            float bobY = m.ty;
            if (m.bobAmp != 0) bobY += (float) Math.sin(frameTime * m.bobSpeed) * m.bobAmp;
            Matrix.setIdentityM(objModel, 0);
            Matrix.translateM(objModel, 0, m.tx, bobY, m.tz);
            if (m.userRX != 0) Matrix.rotateM(objModel, 0, m.userRX, 1, 0, 0);
            if (m.userRY != 0) Matrix.rotateM(objModel, 0, m.userRY, 0, 1, 0);
            if (m.userRZ != 0) Matrix.rotateM(objModel, 0, m.userRZ, 0, 0, 1);
            if (m.spinAngle != 0) Matrix.rotateM(objModel, 0, m.spinAngle, m.spinAxisX, m.spinAxisY, m.spinAxisZ);
            Matrix.multiplyMM(tmpA, 0, global, 0, objModel, 0);
            Matrix.multiplyMM(tmpB, 0, view, 0, tmpA, 0);
            Matrix.multiplyMM(tmpC, 0, proj, 0, tmpB, 0);
            GLES20.glUniformMatrix4fv(uMVP, 1, false, tmpC, 0);
            GLES20.glUniformMatrix4fv(uModel, 1, false, tmpA, 0);
            GLES20.glUniform1f(uMetalness, m.metalness);
            GLES20.glUniform1f(uRoughness, m.roughness);
            if (m.texIdx >= 0 && m.texIdx < texIds.length && texIds[m.texIdx] != 0) {
                GLES20.glActiveTexture(GLES20.GL_TEXTURE0);
                GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, texIds[m.texIdx]);
                GLES20.glUniform1f(uUseTex, 1f);
                GLES20.glUniform1f(uTexScale, m.texScale);
            } else {
                GLES20.glUniform1f(uUseTex, 0f);
            }
            buf.position(0);
            GLES20.glVertexAttribPointer(aPos, 3, GLES20.GL_FLOAT, false, stride, buf);
            GLES20.glEnableVertexAttribArray(aPos);
            buf.position(3);
            GLES20.glVertexAttribPointer(aNormal, 3, GLES20.GL_FLOAT, false, stride, buf);
            GLES20.glEnableVertexAttribArray(aNormal);
            buf.position(6);
            GLES20.glVertexAttribPointer(aCol, 3, GLES20.GL_FLOAT, false, stride, buf);
            GLES20.glEnableVertexAttribArray(aCol);
            GLES20.glDrawArrays(GLES20.GL_TRIANGLES, m.offset, m.count);
        }
    }

    public void addDrag(float dx, float dy) {
        if (Math.abs(dx) < 100 && Math.abs(dy) < 100) {
            userY += dx * 0.5f;
            userX += dy * 0.5f;
        }
    }
}