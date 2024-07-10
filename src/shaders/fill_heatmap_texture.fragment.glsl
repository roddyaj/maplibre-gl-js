uniform sampler2D u_image;
uniform sampler2D u_color_ramp;
uniform float u_opacity;
uniform float u_width;
uniform float u_height;
uniform float u_dir;

in vec2 v_pos;

void main() {
    const int size = 17;

    // Define a Gaussian kernel
    float kernel[size];
    kernel[0] = 0.015324;
    kernel[1] = 0.023821;
    kernel[2] = 0.034915;
    kernel[3] = 0.048253;
    kernel[4] = 0.062876;
    kernel[5] = 0.077250;
    kernel[6] = 0.089488;
    kernel[7] = 0.097743;
    kernel[8] = 0.100660;
    kernel[9] = 0.097743;
    kernel[10] = 0.089488;
    kernel[11] = 0.077250;
    kernel[12] = 0.062876;
    kernel[13] = 0.048253;
    kernel[14] = 0.034915;
    kernel[15] = 0.023821;
    kernel[16] = 0.015324;

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
