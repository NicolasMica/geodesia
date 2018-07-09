<template>
    <div>
        <div id="map" class="w-screen h-screen"></div>
        <div class="absolute pin-x pin-b">
            <div class="center-align p-8">
                <a @click="addMarker" class="btn-floating btn-large waves-effect waves-light red"> <i class="material-icons">add</i></a>
            </div>
        </div>
    </div>
</template>
<script>

    import Map from 'ol/map'
    import View from 'ol/view'
    import TileLayer from 'ol/layer/tile'
    import Vectorlayer from 'ol/layer/vector';
    import TileImage from 'ol/source/tileimage';
    import Vectorsource from 'ol/source/vector';
    import Feature from 'ol/feature';
    import Point from 'ol/geom/point';
    import Style from 'ol/style/style';
    import StyleIcons from 'ol/style/icon';
    import Circle from 'ol/style/circle';
    import Fill from 'ol/style/fill';
    import Stroke from 'ol/style/stroke';
    import proj from 'ol/proj';
    import Pointer from 'ol/interaction/pointer';
    import Interaction from 'ol/interaction';
    import GeomCircle from 'ol/geom/circle';
    import ol from 'ol';
    import GeoJSON from 'ol/format/GeoJSON.js';

    export default {
        name: "Releve",
        data () {
            return {
                map : null,
                vectorSourcetrackerpos: null,
                vectorSourcepoints : null,
                watchPos : null,
                precision : null,
                posRealTime : null,
                posRealTimePrecision : null,
                markerpoint : null,
                road : null,
            }
        },
        mounted () {

            /*
             * DEFINE VECTOR SOURCE (ON AJOUTE LES FEATURES AU VECTOR SOURCE)
             */
            this.vectorSourcetrackerpos = new Vectorsource({
                features: []
            });
            this.vectorSourcepoints = new Vectorsource({
                features: []
            });
            /*
            *
            * INTERACTION DRAG
            *
            * /

            /**
             * @constructor
             * @extends {ol.interaction.Pointer}
             */
            let interaction = {};
            interaction.Drag = function() {

                Pointer.call(this, {
                    handleDownEvent: interaction.Drag.prototype.handleDownEvent,
                    handleDragEvent: interaction.Drag.prototype.handleDragEvent,
                    handleMoveEvent: interaction.Drag.prototype.handleMoveEvent,
                    handleUpEvent: interaction.Drag.prototype.handleUpEvent
                });

                /**
                 * @type {ol.Pixel}
                 * @private
                 */
                this.coordinate_ = null;

                /**
                 * @type {string|undefined}
                 * @private
                 */
                this.cursor_ = 'pointer';

                /**
                 * @type {ol.Feature}
                 * @private
                 */
                this.feature_ = null;

                /**
                 * @type {string|undefined}
                 * @private
                 */
                this.previousCursor_ = undefined;

            };
            ol.inherits(interaction.Drag, Pointer);
            /**
             * @param {ol.MapBrowserEvent} evt Map browser event.
             * @return {boolean} `true` to start the drag sequence.
             */
            interaction.Drag.prototype.handleDownEvent = function(evt) {
                var map = evt.map;

                var feature = map.forEachFeatureAtPixel(evt.pixel,
                    function(feature) {
                        return (feature.draggable === true) ? feature : null
                    });

                if (feature) {
                    this.coordinate_ = evt.coordinate;
                    this.feature_ = feature;
                }

                return !!feature;
            };


            /**
             * @param {ol.MapBrowserEvent} evt Map browser event.
             */
            interaction.Drag.prototype.handleDragEvent = function(evt) {
                var deltaX = evt.coordinate[0] - this.coordinate_[0];
                var deltaY = evt.coordinate[1] - this.coordinate_[1];

                var geometry = this.feature_.getGeometry();
                geometry.translate(deltaX, deltaY);

                this.coordinate_[0] = evt.coordinate[0];
                this.coordinate_[1] = evt.coordinate[1];

                /*
              * on transform les coordonées dans en 4326
               */
                let coordtmp = evt.coordinate;
                let coordpoint = proj.transform(coordtmp, 'EPSG:3857', 'EPSG:4326');
                /*
                 * on envoi les coordonnée à l'api osm
                 */
                //me.getNearestRoad(coordpoint[0], coordpoint[1]);
            };


            /**
             * @param {ol.MapBrowserEvent} evt Event.
             */
            interaction.Drag.prototype.handleMoveEvent = function(evt) {
                if (this.cursor_) {
                    var map = evt.map;
                    var feature = map.forEachFeatureAtPixel(evt.pixel,
                        function(feature) {
                            return feature;
                        });
                    var element = evt.map.getTargetElement();
                    if (feature) {
                        if (element.style.cursor != this.cursor_) {
                            this.previousCursor_ = element.style.cursor;
                            element.style.cursor = this.cursor_;
                        }
                    } else if (this.previousCursor_ !== undefined) {
                        element.style.cursor = this.previousCursor_;
                        this.previousCursor_ = undefined;
                    }
                }
            };
            /**
             * @return {boolean} `false` to stop the drag sequence.
             */
            interaction.Drag.prototype.handleUpEvent = function() {
                this.coordinate_ = null;
                this.feature_ = null;
                return false;
            };

            this.map = new Map({
                target: 'map',
                interactions: new Interaction.defaults().extend([new interaction.Drag()]),
                layers: [
                    /*
                    * LAYER FOND DE PLAN
                    * TODO CHANGEMENT DE LAYER
                    */
                    /*new TileLayer({
                        source: new XYZ({
                            url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                        }),
                    }),*/
                    new TileLayer({
                        title: "Google Satellite & Roads",
                        source: new TileImage({
                            url: 'http://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
                        })
                    }),
                    /*
                     * LAYER POUR DRAW
                     */
                    new Vectorlayer({
                        title : "vectorSourcetrackerpos",
                        source: this.vectorSourcetrackerpos,
                        style: [
                            new Style({
                                stroke: new Stroke({
                                    color: 'blue',
                                    width: 3
                                }),
                                fill: new Fill({
                                    color: 'rgba(0, 0, 255, 0.1)'
                                })
                            })
                        ]
                    }),
                    new Vectorlayer({
                        title : "vectorSourcepoints",
                        source: this.vectorSourcepoints
                    })
                ],
                view: new View({
                    center:  proj.fromLonLat([13.41,52.52],'EPSG:3857'),
                    zoom: 5
                })
            });


            /*
             * ON declare le point du marker avec la geometry vide
             */
            this.markerpoint = new Feature({geometry: null});

            let iconStyle = new Style({
                image: new StyleIcons(/** @type {olx.style.IconOptions} */ ({
                    anchor: [0.5, 46],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    src: 'https://openlayers.org/en/v4.6.5/examples/data/icon.png'
                }))
            });
            this.markerpoint.setStyle(iconStyle);
            this.markerpoint.draggable = true;
            this.vectorSourcepoints.addFeature(this.markerpoint);

            /*
             * MAINTENANT ON MET EN PLACE LE TRACKER
             */
            let me = this;
            this.watchPos = navigator.geolocation.watchPosition(function(position){
                /*
                 * SI LE FEATURE N'EXISTE PAS ON LE CREE SINON ON LE MET JUSTE A JOUR
                 */
                let coord = [parseFloat(position.coords.longitude), parseFloat(position.coords.latitude)];
                let coordTransform = proj.fromLonLat(coord,'EPSG:3857');
                me.precision  = position.coords.accuracy;
                let geometry = new Point(coordTransform);
                let geometryPrecision = new GeomCircle(coordTransform,  me.precision);
                if(me.posRealTime === null && me.posRealTimePrecision === null){
                    me.posRealTime = new Feature({geometry: geometry});
                    me.posRealTimePrecision = new Feature({geometry: geometryPrecision});
                    me.posRealTime.setStyle(new Style({
                        image: new Circle({
                            radius: 6,
                            fill: new Fill({
                                color: '#3399CC'
                            }),
                            stroke: new Stroke({
                                color: '#fff',
                                width: 2
                            })
                        })
                    }));
                    me.vectorSourcetrackerpos.addFeatures([me.posRealTime,me.posRealTimePrecision]);
                    me.posRealTime.draggable = false;
                    me.posRealTimePrecision.draggable = false;
                    me.map.getView().animate({center: coordTransform, zoom: 18});
                }
                else {
                    me.posRealTime.setGeometry(geometry);
                    me.posRealTimePrecision.setGeometry(geometryPrecision);
                }

            }, function(error){
                console.log('code: '+error.code+'\n'+'message: '+ error.message, 6000)
            }, { maximumAge: 3000, timeout: 8000, enableHighAccuracy: true });
        },
        methods : {
            addMarker() {
                /*
                 * on recupere les coordonnée du point de la position en temps reel
                 */
                let coordPosRealTime = this.posRealTime.getGeometry().getCoordinates();
                /*
                 * on cree un point et un vecteur avec ces coordonnée
                 */
                let geometry = new Point(coordPosRealTime);
                this.markerpoint.setGeometry(geometry);
                /*
                * on transform les coordonées dans en 4326
                 */
                let coordpoint = proj.transform(coordPosRealTime, 'EPSG:3857', 'EPSG:4326');
                /*
                 * on envoi les coordonnée à l'api osm
                 */
                this.getNearestRoad(coordpoint[0], coordpoint[1]);

            },
            getNearestRoad(lon,lat){
                let me = this;
                let maxDist = 10; // maximum distance from the point in meters
                let query = '[out:json]; way' +
                            '(around:'+maxDist+','+lat+','+lon+')' +
                            '["highway"];' +
                            'out geom;';
                fetch('https://overpass-api.de/api/interpreter', {
                    method: "POST",
                    body: query
                }).then(function(response) { return response.json(); })
                    .then(function(json) {
                        // use the json
                        var osmtogeojson = require('osmtogeojson');
                        var turf = require('@turf/turf');
                        let format = new GeoJSON({featureProjection:"EPSG:3857"});
                        let jsonfeature = json;

                        console.log(jsonfeature);


                        let temp = osmtogeojson(jsonfeature);
                        console.log(temp);
                        let features = format.readFeatures(temp);
                        let street = features[0];

                        // convert to a turf.js feature
                        let turfLine = format.writeFeatureObject(street);

                        // show a marker every 200 meters
                        let distance = 0.2;

                        // get the line length in kilometers
                        let length = turf.lineDistance(turfLine, 'kilometers');
                        for (let i = 1; i <= length / distance; i++) {
                            let turfPoint = turf.along(turfLine, i * distance, 'kilometers');

                            // convert the generated point to a OpenLayers feature
                            let marker = format.readFeature(turfPoint);
                            marker.getGeometry().transform('EPSG:4326', 'EPSG:3857');
                            me.vectorSourcepoints.addFeature(marker);
                        }

                        street.getGeometry().transform('EPSG:4326', 'EPSG:3857');
                        me.vectorSourcepoints.addFeature(street);
                })
            }
        }
    }
</script>
