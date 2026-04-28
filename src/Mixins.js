import {CRS} from "leaflet";

const DEG_TO_RAD = Math.PI / 180;

// make sure 0 degrees is up (North) and convert to radians.
function fixAngle(angle) {
  return (angle - 90) * DEG_TO_RAD;
}

const sectorMixin = () => ({
  stopAngle() {
    if (this.options.startAngle < this.options.stopAngle) {
      return fixAngle(this.options.stopAngle);
    } else {
      return fixAngle(this.options.startAngle);
    }
  },

  startAngle() {
    if (this.options.startAngle < this.options.stopAngle) {
      return fixAngle(this.options.startAngle);
    } else {
      return fixAngle(this.options.stopAngle);
    }
  },

  _isValidSector() {
    if (isNaN(this.options.startAngle)) {
      throw new Error("Start angle cannot be NaN");
    }
    if (isNaN(this.options.stopAngle)) {
      throw new Error("Stop angle cannot be NaN");
    }
    if (this.options.startAngle >= this.options.stopAngle) {
      throw new Error("Stop angle must be greater than the start angle");
    }
  },
});


const annularMixin = () => ({
    /* Override Circle _project */
    _project() {
        const map = this._map,
                crs = map.options.crs;
        if (crs.distance === CRS.Earth.distance) {
            const outer = this._radiusCalculation(this._mRadius);
            this._point = outer.point;
            this._radius = outer.radius;
            this._radiusY = outer.radiusY;
            const inner = this._radiusCalculation(this.options.innerRadius);
            this._innerPoint = inner.point;
            this._innerRadius = inner.radius;
            this._innerRadiusY = inner.radiusY;
        } else {
            const latlng2 = crs.unproject(
                    crs.project(this._latlng).subtract([this._mRadius, 0]),
            );
            this._point = map.latLngToLayerPoint(this._latlng);
            this._radius = this._point.x - map.latLngToLayerPoint(latlng2).x;
            const latlng3 = crs.unproject(
                    crs.project(this._latlng).subtract([this.options.innerRadius, 0]),
            );
            this._innerRadius = this._point.x - map.latLngToLayerPoint(latlng3).x;
        }
        this._updateBounds();
    },

    _radiusCalculation(radius) {
        const lng = this._latlng.lng,
                lat = this._latlng.lat,
                map = this._map;
        const d = Math.PI / 180,
                latR = radius / CRS.Earth.R / d,
                top = map.project([lat + latR, lng]),
                bottom = map.project([lat - latR, lng]),
                p = top.add(bottom).divideBy(2),
                lat2 = map.unproject(p).lat;
        let lngR =
                Math.acos(
                        (Math.cos(latR * d) - Math.sin(lat * d) * Math.sin(lat2 * d)) /
                        (Math.cos(lat * d) * Math.cos(lat2 * d)),
                ) / d;
        if (isNaN(lngR) || lngR === 0) {
            lngR = latR / Math.cos((Math.PI / 180) * lat); // Fallback for edge case, #2425
        }
        return {
            point: p.subtract(map.getPixelOrigin()),
            radius: isNaN(lngR) ? 0 : p.x - map.project([lat2, lng - lngR]).x,
            radiusY: p.y - top.y,
        };
    },

    _isValidAnnulus() {
        if (isNaN(this.options.innerRadius)) {
            throw new Error("Inner radius cannot be NaN");
        }
        if (this.options.innerRadius >= this.options.radius) {
            throw new Error("Outer radius must be greater than the inner radius");
        }
    },
});

export {sectorMixin, annularMixin};