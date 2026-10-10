package com.xunay.gl;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

public class ObjLoader {
    public static float[] load(InputStream in, float r, float g, float b, float scale) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(in));
        List<float[]> positions = new ArrayList<>();
        List<int[]> faces = new ArrayList<>();
        String line;
        while ((line = br.readLine()) != null) {
            line = line.trim();
            if (line.startsWith("v ")) {
                String[] p = line.substring(2).trim().split("\\s+");
                positions.add(new float[]{Float.parseFloat(p[0]), Float.parseFloat(p[1]), Float.parseFloat(p[2])});
            } else if (line.startsWith("f ")) {
                String[] p = line.substring(2).trim().split("\\s+");
                if (p.length >= 3) {
                    int[] tri = new int[3];
                    for (int i = 0; i < 3; i++) {
                        String[] parts = p[i].split("/");
                        tri[i] = Integer.parseInt(parts[0]) - 1;
                    }
                    faces.add(tri);
                }
            }
        }
        br.close();
        float[] out = new float[faces.size() * 3 * 9];
        int idx = 0;
        for (int[] tri : faces) {
            float[] p0 = positions.get(tri[0]);
            float[] p1 = positions.get(tri[1]);
            float[] p2 = positions.get(tri[2]);
            float ux = p1[0]-p0[0], uy = p1[1]-p0[1], uz = p1[2]-p0[2];
            float vx = p2[0]-p0[0], vy = p2[1]-p0[1], vz = p2[2]-p0[2];
            float nx = uy*vz - uz*vy;
            float ny = uz*vx - ux*vz;
            float nz = ux*vy - uy*vx;
            float len = (float) Math.sqrt(nx*nx + ny*ny + nz*nz);
            if (len > 0) { nx /= len; ny /= len; nz /= len; }
            for (int vi : tri) {
                float[] pos = positions.get(vi);
                out[idx++] = pos[0] * scale;
                out[idx++] = pos[1] * scale;
                out[idx++] = pos[2] * scale;
                out[idx++] = nx;
                out[idx++] = ny;
                out[idx++] = nz;
                out[idx++] = r;
                out[idx++] = g;
                out[idx++] = b;
            }
        }
        return out;
    }
}