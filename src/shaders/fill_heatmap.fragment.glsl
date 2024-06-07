void main() {
    // The max color is reached at 200 features
    float val = 0.005;

    fragColor = vec4(val, 1.0, 1.0, 1.0);

#ifdef OVERDRAW_INSPECTOR
    fragColor = vec4(1.0);
#endif
}
