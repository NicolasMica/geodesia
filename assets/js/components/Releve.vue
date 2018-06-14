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
    import XYZ from 'ol/source/xyz'
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
    import GeomCircle from 'ol/geom/circle';
    import Pointer from 'ol/interaction/pointer';
    import Interaction from 'ol/interaction';
    import Polyline from 'ol/format/polyline'
    import ol from 'ol';
    export default {
        name: "Releve",
        data () {
            return {
                url_osrm_route : '//router.project-osrm.org/route/v1/driving/',
                map : null,
                vectorSourcetrackerpos: null,
                vectorSourcepoints : null,
                watchPos : null,
                precision : null,
                posRealTime : null,
                posRealTimePrecision : null,
                tabPoints : [],
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
                /*
                 * On regarde à quelle distance on est du point le plus proche
                 */
                if (this.tabPoints.length > 1){
                    /*
                    * les deux derniers points
                    */
                    var point1 = coord;
                    var point2 = this.tabPoints.length-1;
                    point2 = point2.
                    /*
                    * appelle à osrm
                    */
                    fetch(this.url_osrm_route + point1 + ';' + point2).then(function(r) {
                        return r.json();
                    }).then(function(json) {
                        if(json.code !== 'Ok') {
                            this.createLineBetweenTwoPoint();
                        }
                        else {
                            this.road = json.routes[0].geometry;
                            this.createRoute();
                        }

                    });
                }

            }, function(error){
                console.log('code: '+error.code+'\n'+'message: '+ error.message, 6000)
            }, { maximumAge: 3000, timeout: 8000, enableHighAccuracy: true });
        },
        methods : {
            createRoute() {
                let route = new Polyline({
                    factor: 1e5
                }).readGeometry(this.road, {
                    dataProjection: 'EPSG:4326',
                    featureProjection: 'EPSG:3857'
                });
                let feature = new ol.Feature({
                    type: 'route',
                    geometry: route
                });
                feature.setStyle(styles.route);
                vectorSourcepoints.addFeature(feature);
            },
            addMarker() {
                /*
                 * on clone le feature de la geoloc en changeant le style
                 */
                let point = this.posRealTime.clone();
                let iconStyle = new Style({
                    image: new StyleIcons(/** @type {olx.style.IconOptions} */ ({
                        anchor: [0.5, 46],
                        anchorXUnits: 'fraction',
                        anchorYUnits: 'pixels',
                        src: 'https://openlayers.org/en/v4.6.5/examples/data/icon.png'
                    }))
                });
                point.setStyle(iconStyle);
                point.draggable = true;
                this.vectorSourcepoints.addFeature(point);

                /*
                 * on ajoute le point au tableau de point
                 */
                this.tabPoints.push(point);
                /*/!*
                 * Si on à plus de 1 point
                 *!/
                if (this.tabPoints.length > 1){
                    /!*
                     * les deux derniers points
                     *!/
                    var point1 = this.tabPoints.length-2;
                    var point2 = this.tabPoints.length-1;
                    /!*
                     * appelle à osrm
                     *!/
                    fetch(this.url_osrm_route + point1 + ';' + point2).then(function(r) {
                        return r.json();
                    }).then(function(json) {
                        if(json.code !== 'Ok') {
                          this.createLineBetweenTwoPoint();
                        }
                        else {
                            this.road = json.routes[0].geometry;
                            this.createRoute();
                        }

                    });
                }*/
            }
        }
    }
</script>
