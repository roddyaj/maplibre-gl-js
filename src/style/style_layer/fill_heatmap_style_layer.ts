import {StyleLayer} from '../style_layer';

import {FillHeatmapBucket} from '../../data/bucket/fill_heatmap_bucket';
import {RGBAImage} from '../../util/image';
import properties, {FillHeatmapPaintPropsPossiblyEvaluated} from './fill_heatmap_style_layer_properties.g';
import {renderColorRamp} from '../../util/color_ramp';
import {Transitionable, Transitioning, PossiblyEvaluated} from '../properties';

import type {Texture} from '../../render/texture';
import type {Framebuffer} from '../../gl/framebuffer';
import type {FillHeatmapPaintProps} from './fill_heatmap_style_layer_properties.g';
import type {LayerSpecification} from '@maplibre/maplibre-gl-style-spec';

/**
 * A style layer that defines a fill heatmap
 */
export class FillHeatmapStyleLayer extends StyleLayer {

    heatmapFbo0: Framebuffer;
    heatmapFbo1: Framebuffer;
    colorRamp: RGBAImage;
    colorRampTexture: Texture;

    _transitionablePaint: Transitionable<FillHeatmapPaintProps>;
    _transitioningPaint: Transitioning<FillHeatmapPaintProps>;
    paint: PossiblyEvaluated<FillHeatmapPaintProps, FillHeatmapPaintPropsPossiblyEvaluated>;

    createBucket(options: any) {
        return new FillHeatmapBucket(options);
    }

    constructor(layer: LayerSpecification) {
        super(layer, properties);

        // make sure color ramp texture is generated for default heatmap color too
        this._updateColorRamp();
    }

    _handleSpecialPaintPropertyUpdate(name: string) {
        if (name === 'fill-heatmap-color') {
            this._updateColorRamp();
        }
    }

    _updateColorRamp() {
        const expression = this._transitionablePaint._values['fill-heatmap-color'].value.expression;
        this.colorRamp = renderColorRamp({
            expression,
            evaluationKey: 'heatmapDensity',
            image: this.colorRamp
        });
        this.colorRampTexture = null;
    }

    resize() {
        if (this.heatmapFbo0) {
            this.heatmapFbo0.destroy();
            this.heatmapFbo0 = null;
        }
        if (this.heatmapFbo1) {
            this.heatmapFbo1.destroy();
            this.heatmapFbo1 = null;
        }
    }

    queryRadius(): number {
        return 0;
    }

    queryIntersectsFeature(): boolean {
        return false;
    }

    hasOffscreenPass() {
        return this.paint.get('fill-heatmap-opacity') !== 0 && this.visibility !== 'none';
    }

    isTileClipped() {
        return true;
    }
}
