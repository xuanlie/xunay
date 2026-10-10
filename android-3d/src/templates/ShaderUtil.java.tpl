package com.xunay.gl;

import android.opengl.GLES20;
import android.util.Log;

public class ShaderUtil {
    public static int createProgram(String vs, String fs) {
        int v = load(GLES20.GL_VERTEX_SHADER, vs, "vertex");
        int f = load(GLES20.GL_FRAGMENT_SHADER, fs, "fragment");
        int p = GLES20.glCreateProgram();
        GLES20.glAttachShader(p, v);
        GLES20.glAttachShader(p, f);
        GLES20.glLinkProgram(p);
        int[] ok = new int[1];
        GLES20.glGetProgramiv(p, GLES20.GL_LINK_STATUS, ok, 0);
        if (ok[0] == 0) Log.e("GL", "link: " + GLES20.glGetProgramInfoLog(p));
        return p;
    }
    private static int load(int type, String src, String name) {
        int s = GLES20.glCreateShader(type);
        GLES20.glShaderSource(s, src);
        GLES20.glCompileShader(s);
        int[] ok = new int[1];
        GLES20.glGetShaderiv(s, GLES20.GL_COMPILE_STATUS, ok, 0);
        if (ok[0] == 0) Log.e("GL", name + ": " + GLES20.glGetShaderInfoLog(s));
        return s;
    }
}
