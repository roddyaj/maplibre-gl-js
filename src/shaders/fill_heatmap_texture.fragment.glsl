uniform sampler2D u_image;
uniform sampler2D u_color_ramp;
uniform float u_opacity;
uniform float u_width;
uniform float u_height;

in vec2 v_pos;

void main() {
    const int dim = 7;
    const int size = dim * dim;

    // Define a Gaussian kernel
    float kernel[size];
    kernel[0] = 0.004922;
    kernel[1] = 0.009196;
    kernel[2] = 0.013380;
    kernel[3] = 0.015162;
    kernel[4] = 0.013380;
    kernel[5] = 0.009196;
    kernel[6] = 0.004922;
    kernel[7] = 0.009196;
    kernel[8] = 0.017181;
    kernel[9] = 0.024998;
    kernel[10] = 0.028326;
    kernel[11] = 0.024998;
    kernel[12] = 0.017181;
    kernel[13] = 0.009196;
    kernel[14] = 0.013380;
    kernel[15] = 0.024998;
    kernel[16] = 0.036371;
    kernel[17] = 0.041214;
    kernel[18] = 0.036371;
    kernel[19] = 0.024998;
    kernel[20] = 0.013380;
    kernel[21] = 0.015162;
    kernel[22] = 0.028326;
    kernel[23] = 0.041214;
    kernel[24] = 0.046702;
    kernel[25] = 0.041214;
    kernel[26] = 0.028326;
    kernel[27] = 0.015162;
    kernel[28] = 0.013380;
    kernel[29] = 0.024998;
    kernel[30] = 0.036371;
    kernel[31] = 0.041214;
    kernel[32] = 0.036371;
    kernel[33] = 0.024998;
    kernel[34] = 0.013380;
    kernel[35] = 0.009196;
    kernel[36] = 0.017181;
    kernel[37] = 0.024998;
    kernel[38] = 0.028326;
    kernel[39] = 0.024998;
    kernel[40] = 0.017181;
    kernel[41] = 0.009196;
    kernel[42] = 0.004922;
    kernel[43] = 0.009196;
    kernel[44] = 0.013380;
    kernel[45] = 0.015162;
    kernel[46] = 0.013380;
    kernel[47] = 0.009196;
    kernel[48] = 0.004922;

    // Blur the fragment by applying the kernel to surrounding fragments
    vec2 pixelOffset = 1.0 / vec2(u_width, u_height);
    const float edgeDistance = float(dim - 1) / 2.0;
    float blurredValue = 0.0;
    for (int i = 0; i < size; i++) {
        float xOffset = float(i / dim) - edgeDistance;
        float yOffset = mod(float(i), float(dim)) - edgeDistance;
        vec2 offset = vec2(xOffset * pixelOffset.x, -yOffset * pixelOffset.y);
        blurredValue += texture(u_image, v_pos + offset).r * kernel[i];
    }

    if (blurredValue > 0.0) {
        // Map value to color
        fragColor = texture(u_color_ramp, vec2(blurredValue, 0.5)) * u_opacity;
    } else {
        fragColor = vec4(0.0);
    }

#ifdef OVERDRAW_INSPECTOR
    fragColor = vec4(1.0);
#endif
}
