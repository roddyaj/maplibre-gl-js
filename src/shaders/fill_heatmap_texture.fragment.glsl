uniform sampler2D u_image;
uniform sampler2D u_color_ramp;
uniform float u_opacity;
uniform float u_width;
uniform float u_height;
uniform float u_dir;

in vec2 v_pos;

void main() {
    const int size = 31;

    // Define a Gaussian kernel
    float kernel[size];
    kernel[0] = 0.003280;
    kernel[1] = 0.004829;
    kernel[2] = 0.006922;
    kernel[3] = 0.009660;
    kernel[4] = 0.013127;
    kernel[5] = 0.017368;
    kernel[6] = 0.022376;
    kernel[7] = 0.028069;
    kernel[8] = 0.034283;
    kernel[9] = 0.040772;
    kernel[10] = 0.047212;
    kernel[11] = 0.053232;
    kernel[12] = 0.058439;
    kernel[13] = 0.062468;
    kernel[14] = 0.065017;
    kernel[15] = 0.065890;
    kernel[16] = 0.065017;
    kernel[17] = 0.062468;
    kernel[18] = 0.058439;
    kernel[19] = 0.053232;
    kernel[20] = 0.047212;
    kernel[21] = 0.040772;
    kernel[22] = 0.034283;
    kernel[23] = 0.028069;
    kernel[24] = 0.022376;
    kernel[25] = 0.017368;
    kernel[26] = 0.013127;
    kernel[27] = 0.009660;
    kernel[28] = 0.006922;
    kernel[29] = 0.004829;
    kernel[30] = 0.003280;

    // Blur the fragment by applying the kernel to surrounding fragments
    // The blur dimension is determined by u_dir which is 0 or 1
    vec2 pixelOffset = 1.0 / vec2(u_width, u_height);
    const float edgeDistance = float(size - 1) / 2.0;
    float blurredValue = 0.0;
    for (int i = 0; i < size; i++) {
        float offsetAmount = float(i) - edgeDistance;
        vec2 offset = vec2(pixelOffset.x * offsetAmount * (1.0 - u_dir), pixelOffset.y * offsetAmount * u_dir);
        blurredValue += texture(u_image, v_pos + offset).r * kernel[i];
    }

    if (u_dir == 0.0) {
        // First pass: blur in one dimension only
        fragColor = vec4(blurredValue, 1.0, 1.0, 1.0);
    } else {
        // Second pass: blur in the other dimension and map value to color
        if (blurredValue > 0.0) {
            fragColor = texture(u_color_ramp, vec2(blurredValue, 0.5)) * u_opacity;
        } else {
            fragColor = vec4(0.0);
        }
    }

#ifdef OVERDRAW_INSPECTOR
    fragColor = vec4(1.0);
#endif
}
