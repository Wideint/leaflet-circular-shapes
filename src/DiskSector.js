import {Circle, SVG, Point} from "leaflet";
import {sectorMixin} from "./Mixins.js";

Point.prototype.rotated = function (angle, r) {
  return this.add(new Point(Math.cos(angle), Math.sin(angle)).multiplyBy(r));
};

let DiskSector = Circle.extend({
  options: {
    stroke: false,
    startAngle: 0,
    stopAngle: 359.9999,
  },

  initialize(latlng, options, legacyOptions) {
    Circle.prototype.initialize.call(this, latlng, options, legacyOptions);
    Object.assign(this, sectorMixin());
    this._isValidSector();
  },

  _updatePath() {
    this._renderer._updateDiskSector(this);
  },
});

function disksector(latlng, options) {
  return new DiskSector(latlng, options);
}

SVG.include({
  _updateDiskSector(layer) {
    if (layer._empty()) {
      return this._setPath(layer, "M0 0");
    }
    const p = layer._map.latLngToLayerPoint(layer._latlng),
      r = Math.max(Math.round(layer._radius), 1),
      r2 = Math.max(Math.round(layer._radiusY), 1) || r;
    const start = p.rotated(layer.startAngle(), r),
      end = p.rotated(layer.stopAngle(), r);
    const largeArc =
      layer.options.stopAngle - layer.options.startAngle >= 180 ? "1" : "0";
    /*
     * Start from the disk's perimeter at the opening angle, draw the arc
     * until the stop angle then draw the radius.
     */
    const d = `M${start.x},${start.y}
                      A${r},${r2},0,${largeArc},1,${end.x},${end.y}
                      L${p.x},${p.y}
                      Z`;
    this._setPath(layer, d);
  },
});

export {DiskSector, disksector};