import {mat4} from 'gl-matrix';

import {
    Uniform1i,
    Uniform1f,
    Uniform2f,
    UniformMatrix4f
} from '../uniform_binding';
import {pixelsToTileUnits} from '../../source/pixels_to_tile_units';

import type {Context} from '../../gl/context';
import type {Tile} from '../../source/tile';
import type {UniformValues, UniformLocations} from '../uniform_binding';
import type {Painter} from '../painter';
import type {FillHeatmapStyleLayer} from '../../style/style_layer/fill_heatmap_style_layer';

export type FillHeatmapUniformsType = {
    'u_extrude_scale': Uniform1f;
    'u_matrix': UniformMatrix4f;
};

export type FillHeatmapTextureUniformsType = {
    'u_matrix': UniformMatrix4f;
    'u_world': Uniform2f;
    'u_image': Uniform1i;
    'u_color_ramp': Uniform1i;
    'u_opacity': Uniform1f;
    'u_width': Uniform1f;
    'u_height': Uniform1f;
    'u_dir': Uniform1f;
};

const fillHeatmapUniforms = (context: Context, locations: UniformLocations): FillHeatmapUniformsType => ({
    'u_extrude_scale': new Uniform1f(context, locations.u_extrude_scale),
    'u_matrix': new UniformMatrix4f(context, locations.u_matrix)
});

const fillHeatmapTextureUniforms = (context: Context, locations: UniformLocations): FillHeatmapTextureUniformsType => ({
    'u_matrix': new UniformMatrix4f(context, locations.u_matrix),
    'u_world': new Uniform2f(context, locations.u_world),
    'u_image': new Uniform1i(context, locations.u_image),
    'u_color_ramp': new Uniform1i(context, locations.u_color_ramp),
    'u_opacity': new Uniform1f(context, locations.u_opacity),
    'u_width': new Uniform1f(context, locations.u_width),
    'u_height': new Uniform1f(context, locations.u_height),
    'u_dir': new Uniform1f(context, locations.u_dir)
});

const fillHeatmapUniformValues = (matrix: mat4, tile: Tile, zoom: number): UniformValues<FillHeatmapUniformsType> => ({
    'u_matrix': matrix,
    'u_extrude_scale': pixelsToTileUnits(tile, 1, zoom),
});

const fillHeatmapTextureUniformValues = (
    painter: Painter,
    layer: FillHeatmapStyleLayer,
    textureUnit: number,
    colorRampUnit: number,
    scaleFactor: number,
    dir: number
): UniformValues<FillHeatmapTextureUniformsType> => {
    const matrix = mat4.create();
    mat4.ortho(matrix, 0, painter.width, painter.height, 0, 0, 1);

    const gl = painter.context.gl;

    return {
        'u_matrix': matrix,
        'u_world': [gl.drawingBufferWidth, gl.drawingBufferHeight],
        'u_image': textureUnit,
        'u_color_ramp': colorRampUnit,
        'u_opacity': layer.paint.get('fill-heatmap-opacity'),
        'u_width': gl.drawingBufferWidth / scaleFactor,
        'u_height': gl.drawingBufferHeight / scaleFactor,
        'u_dir': dir
    };
};

export {
    fillHeatmapUniforms,
    fillHeatmapTextureUniforms,
    fillHeatmapUniformValues,
    fillHeatmapTextureUniformValues
};
