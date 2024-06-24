#pragma mapbox: define highp float limit_count

void main() {
    #pragma mapbox: initialize highp float limit_count

    fragColor = vec4(1.0 / limit_count, 1.0, 1.0, 1.0);

#ifdef OVERDRAW_INSPECTOR
    fragColor = vec4(1.0);
#endif
}
