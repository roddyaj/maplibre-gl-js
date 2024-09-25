import {Texture} from './texture';
import {Color} from '@maplibre/maplibre-gl-style-spec';
import {DepthMode} from '../gl/depth_mode';
import {StencilMode} from '../gl/stencil_mode';
import {ColorMode} from '../gl/color_mode';
import {CullFaceMode} from '../gl/cull_face_mode';
import {Context} from '../gl/context';
import {Framebuffer} from '../gl/framebuffer';
import {
    fillHeatmapUniformValues,
    fillHeatmapTextureUniformValues
} from './program/fill_heatmap_program';

import type {Painter} from './painter';
import type {SourceCache} from '../source/source_cache';
import type {FillHeatmapStyleLayer} from '../style/style_layer/fill_heatmap_style_layer';
import type {FillHeatmapBucket} from '../data/bucket/fill_heatmap_bucket';
import type {OverscaledTileID} from '../source/tile_id';

const scaleFactor = 1.5;

export function drawFillHeatmap(painter: Painter, sourceCache: SourceCache, layer: FillHeatmapStyleLayer, coords: Array<OverscaledTileID>) {
    if (layer.paint.get('fill-heatmap-opacity') === 0) {
        return;
    }

    const context = painter.context;
    if (painter.renderPass === 'offscreen') {
        // Render the tiles to an offscreen buffer using the red channel

        bindFramebuffer(context, painter, layer, 0);

        context.clear({color: Color.transparent});
        painter.clearStencil();
        painter._renderTileClippingMasks(layer, coords);

        drawFillTiles(painter, sourceCache, layer, coords);

        context.viewport.set([0, 0, painter.width, painter.height]);

    } else if (painter.renderPass === 'translucent') {
        // 2-pass blur step 1: Blur the texture in one dimension, rendering to a second buffer

        bindFramebuffer(context, painter, layer, 1);

        context.clear({color: Color.transparent});
        context.setColorMode(painter.colorModeForRenderPass());

        renderTexture(painter, layer, 0);

        // 2-pass blur step 2: Blur the texture in the other dimension, apply the color ramp, rendering to the map

        context.viewport.set([0, 0, painter.width, painter.height]);
        context.bindFramebuffer.set(null);

        renderTexture(painter, layer, 1);
    }
}

function drawFillTiles(
    painter: Painter,
    sourceCache: SourceCache,
    layer: FillHeatmapStyleLayer,
    coords: Array<OverscaledTileID>) {
    const gl = painter.context.gl;
    const {zoom} = painter.transform;

    // Turn on additive blending for kernels, which is a key aspect of kernel density estimation formula
    const colorMode = new ColorMode([gl.ONE, gl.ONE], Color.transparent, [true, true, true, true]);

    for (const coord of coords) {
        // if (sourceCache.hasRenderableParent(coord)) continue; // do we want this?

        const tile = sourceCache.getTile(coord);
        const bucket: FillHeatmapBucket = (tile.getBucket(layer) as any);
        if (!bucket) continue;

        const programConfiguration = bucket.programConfigurations.get(layer.id);
        const program = painter.useProgram('fillHeatmap', programConfiguration);
        const stencilMode = painter.stencilModeForClipping(coord);
        const terrainData = painter.style.map.terrain && painter.style.map.terrain.getTerrainData(coord);
        const terrainCoord = terrainData ? coord : null;
        const posMatrix = terrainCoord ? terrainCoord.posMatrix : coord.posMatrix;
        const uniformValues = fillHeatmapUniformValues(posMatrix, tile, zoom);

        program.draw(painter.context, gl.TRIANGLES, DepthMode.disabled, stencilMode, colorMode, CullFaceMode.disabled,
            uniformValues, terrainData, layer.id, bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments,
            layer.paint, zoom, programConfiguration);
    }
}

function bindFramebuffer(context: Context, painter: Painter, layer: FillHeatmapStyleLayer, fboId: number) {
    const gl = context.gl;
    context.activeTexture.set(gl.TEXTURE1);

    // Use a downscaled screen texture for better performance and increased blur
    context.viewport.set([0, 0, painter.width / scaleFactor, painter.height / scaleFactor]);

    let fbo = fboId === 0 ? layer.heatmapFbo0 : layer.heatmapFbo1;

    if (!fbo) {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        fbo = context.createFramebuffer(painter.width / scaleFactor, painter.height / scaleFactor, true, true);
        if (fboId === 0) {
            layer.heatmapFbo0 = fbo;
        } else {
            layer.heatmapFbo1 = fbo;
        }
        fbo.depthAttachment.set(context.createRenderbuffer(gl.DEPTH_STENCIL, painter.width / scaleFactor, painter.height / scaleFactor));

        bindTextureToFramebuffer(context, painter, texture, fbo);

    } else {
        gl.bindTexture(gl.TEXTURE_2D, fbo.colorAttachment.get());
        context.bindFramebuffer.set(fbo.framebuffer);
    }
}

function bindTextureToFramebuffer(context: Context, painter: Painter, texture: WebGLTexture, fbo: Framebuffer) {
    const gl = context.gl;
    // Use the higher precision half-float texture where available (producing much smoother looking heatmaps);
    // Otherwise, fall back to a low precision texture

    const numType = context.HALF_FLOAT ?? gl.UNSIGNED_BYTE;
    const internalFormat = context.RGBA16F ?? gl.RGBA;

    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, painter.width / scaleFactor, painter.height / scaleFactor, 0, gl.RGBA, numType, null);
    fbo.colorAttachment.set(texture);
}

function renderTexture(painter: Painter, layer: FillHeatmapStyleLayer, fboId: number) {
    const context = painter.context;
    const gl = context.gl;

    // Here we bind two different textures from which we'll sample in drawing
    // heatmaps: the kernel texture, prepared in the offscreen pass, and a
    // color ramp texture.
    const fbo = fboId === 0 ? layer.heatmapFbo0 : layer.heatmapFbo1;
    if (!fbo) return;
    context.activeTexture.set(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, fbo.colorAttachment.get());

    context.activeTexture.set(gl.TEXTURE1);
    let colorRampTexture = layer.colorRampTexture;
    if (!colorRampTexture) {
        colorRampTexture = layer.colorRampTexture = new Texture(context, layer.colorRamp, gl.RGBA);
    }
    colorRampTexture.bind(gl.LINEAR, gl.CLAMP_TO_EDGE);
    const dir = fboId;

    const limitCount = layer.paint.get('fill-heatmap-limit-count').constantOr(100);
    painter.useProgram('fillHeatmapTexture').draw(context, gl.TRIANGLES,
        DepthMode.disabled, StencilMode.disabled, painter.colorModeForRenderPass(), CullFaceMode.disabled,
        fillHeatmapTextureUniformValues(painter, layer, 0, 1, scaleFactor, dir, limitCount), null,
        layer.id, painter.viewportBuffer, painter.quadTriangleIndexBuffer,
        painter.viewportSegments, layer.paint, painter.transform.zoom);
}
