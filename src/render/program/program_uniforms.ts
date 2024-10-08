import {fillExtrusionUniforms, fillExtrusionPatternUniforms} from './fill_extrusion_program';
import {fillUniforms, fillPatternUniforms, fillOutlineUniforms, fillOutlinePatternUniforms} from './fill_program';
import {circleUniforms} from './circle_program';
import {collisionUniforms, collisionCircleUniforms} from './collision_program';
import {debugUniforms} from './debug_program';
import {clippingMaskUniforms} from './clipping_mask_program';
import {heatmapUniforms, heatmapTextureUniforms} from './heatmap_program';
import {fillHeatmapUniforms, fillHeatmapTextureUniforms} from './fill_heatmap_program';
import {hillshadeUniforms, hillshadePrepareUniforms} from './hillshade_program';
import {lineUniforms, lineGradientUniforms, linePatternUniforms, lineSDFUniforms} from './line_program';
import {rasterUniforms} from './raster_program';
import {symbolIconUniforms, symbolSDFUniforms, symbolTextAndIconUniforms} from './symbol_program';
import {backgroundUniforms, backgroundPatternUniforms} from './background_program';
import {terrainUniforms, terrainDepthUniforms, terrainCoordsUniforms} from './terrain_program';
import {skyUniforms} from './sky_program';

export const programUniforms = {
    fillExtrusion: fillExtrusionUniforms,
    fillExtrusionPattern: fillExtrusionPatternUniforms,
    fill: fillUniforms,
    fillPattern: fillPatternUniforms,
    fillOutline: fillOutlineUniforms,
    fillOutlinePattern: fillOutlinePatternUniforms,
    circle: circleUniforms,
    collisionBox: collisionUniforms,
    collisionCircle: collisionCircleUniforms,
    debug: debugUniforms,
    clippingMask: clippingMaskUniforms,
    heatmap: heatmapUniforms,
    heatmapTexture: heatmapTextureUniforms,
    fillHeatmap: fillHeatmapUniforms,
    fillHeatmapTexture: fillHeatmapTextureUniforms,
    hillshade: hillshadeUniforms,
    hillshadePrepare: hillshadePrepareUniforms,
    line: lineUniforms,
    lineGradient: lineGradientUniforms,
    linePattern: linePatternUniforms,
    lineSDF: lineSDFUniforms,
    raster: rasterUniforms,
    symbolIcon: symbolIconUniforms,
    symbolSDF: symbolSDFUniforms,
    symbolTextAndIcon: symbolTextAndIconUniforms,
    background: backgroundUniforms,
    backgroundPattern: backgroundPatternUniforms,
    terrain: terrainUniforms,
    terrainDepth: terrainDepthUniforms,
    terrainCoords: terrainCoordsUniforms,
    sky: skyUniforms
};
