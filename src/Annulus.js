import {Circle, SVG} from "leaflet";
import {annularMixin} from "./Mixins.js";

let Annulus = Circle.extend({
  options: {
    stroke: false,
    innerRadius: 0,
  },

  initialize(latlng, options, legacyOptions) {
    Circle.prototype.initialize.call(this, latlng, options, legacyOptions);
    Object.assign(this, annularMixin());
    this._isValidAnnulus();
  },

  _updatePath() {
    this._renderer._updateAnnulus(this);
  },
});

function annulus(latlng, options) {
  return new Annulus(latlng, options);
}

SVG.include({
  _updateAnnulus(layer) {
    if (layer._empty()) {
      return this._setPath(layer, "M0 0");
    }
    const p = layer._map.latLngToLayerPoint(layer._latlng),
      r = Math.max(Math.round(layer._radius), 1),
      r2 = Math.max(Math.round(layer._radiusY), 1) || r;
    const innerP = layer._innerPoint || p,
      innerR = Math.max(Math.round(layer._innerRadius), 1),
      innerR2 = Math.max(Math.round(layer._innerRadiusY), 1) || innerR;

    /*
     * This figure is drawn using two pairs of arcs :
     * the first pair draws the outer circle, starting from the bottom half,
     * the second pair then proceed with the inner circle.
     */
    const d = `M${p.x - r},${p.y}
               a${r},${r2},0,1,0,${r * 2},0
               a${r},${r2},0,1,0 ${-r * 2},0
               M${innerP.x - innerR},${innerP.y}
               a${innerR},${innerR2},0,1,0,${innerR * 2},0
               a${innerR},${innerR2},0,1,0 ${-innerR * 2},0`;
    this._setPath(layer, d);
  },
});

export {Annulus, annulus};