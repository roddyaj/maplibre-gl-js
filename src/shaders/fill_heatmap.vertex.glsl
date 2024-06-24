uniform mat4 u_matrix;

in vec2 a_pos;

void main(void) {
    gl_Position = u_matrix * vec4(a_pos, 0, 1);
}
