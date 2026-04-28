import {Circle} from "leaflet";

let Disk = Circle.extend({
    options: {
        stroke: false,
    },

    initialize(latlng, options, legacyOptions) {
        Circle.prototype.initialize.call(this, latlng, options, legacyOptions);
    },
});

function disk(latlng, options) {
  return new Disk(latlng, options);
}

export {Disk, disk};