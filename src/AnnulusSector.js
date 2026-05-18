import {Circle, SVG, Point} from "leaflet";
import {annularMixin} from "./Mixins.js";
import {sectorMixin} from "./Mixins.js";

Point.prototype.rotated = function (angle, r) {
    return this.add(new Point(Math.cos(angle), Math.sin(angle)).multiplyBy(r));
};

let AnnulusSector = Circle.extend({
  options: {
    stroke: false,
    startAngle: 0,
    stopAngle: 359.9999,
    innerRadius: 0,
  },

  initialize(latlng, options, legacyOptions) {
    Circle.prototype.initialize.call(this, latlng, options, legacyOptions);
    Object.assign(this, sectorMixin());
    Object.assign(this, annularMixin());
    this._isValidAnnulus();
    this._isValidSector();
  },

  _updatePath() {
    this._renderer._updateAnnulusSector(this);
  },
});

function annulussector(latlng, options) {
  return new AnnulusSector(latlng, options);
}

SVG.include({
  _updateAnnulusSector(layer) {
    if (layer._empty()) {
      return this._setPath(layer, "M0 0");
    }
    const p = layer._map.latLngToLayerPoint(layer._latlng),
      r = Math.max(Math.round(layer._radius), 1),
      r2 = Math.max(Math.round(layer._radiusY), 1) || r;
    const innerR = Math.max(Math.round(layer._innerRadius), 1),
      innerR2 = Math.max(Math.round(layer._innerRadiusY), 1) || innerR;
    const start = p.rotated(layer.startAngle(), r),
      end = p.rotated(layer.stopAngle(), r),
      innerStart = p.rotated(layer.startAngle(), innerR),
      innerEnd = p.rotated(layer.stopAngle(), innerR);
    const largeArc = layer.options.stopAngle >= 180 ? "1" : "0";
    /*
     * Start from the annulus's perimeter at the opening angle, draw the arc
     * until the stop angle, draw the line representing R - r then draw
     * the closing arc following the inner circle.
     */
    const d = `M${start.x},${start.y}
                      A${r},${r2},0,${largeArc},1,${end.x},${end.y}
                      L${innerEnd.x},${innerEnd.y}
                      A${innerR},${innerR2},0,${largeArc},0,${innerStart.x},${innerStart.y}
                      Z`;
    this._setPath(layer, d);
  },
});

export {AnnulusSector, annulussector};