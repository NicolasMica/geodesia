<template>
    <div>
        <div id="map" class="w-screen h-screen"></div>
        <div class="absolute pin-x pin-b">
            <div class="left-align p-8">
                <a @click="addMarker" class="btn-floating btn-large waves-effect waves-light red"> <i class="material-icons">add</i></a>
            </div>
            <div class="left-align p-8">
                <a @click="addDebutChantier" class="btn-floating btn-large waves-effect waves-light red"> <i class="material-icons">launch</i></a>
            </div>
            <div class="left-align p-8">
                <a @click="addFinChantier" class="btn-floating btn-large waves-effect waves-light red"> <i class="material-icons">stop</i></a>
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
    import osmtogeojson from 'osmtogeojson';
    import proj4 from 'proj4';
    import XYZ from 'ol/source/XYZ';
    import Text from 'ol/style/Text';
    import Select from 'ol/interaction/Select';
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
                markerpoints : [],
                road : null,
                roadactuelle : null,
                vectorSourceroads : null,
                vectorSourcepk : null,
                DebutChantier : new Feature({geometry: null}),
                FinChantier : new Feature({geometry: null}),
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
            this.vectorSourceroads = new Vectorsource({
                features: []
            });
            this.vectorSourcepk = new Vectorsource({
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


                this.coordinate_ = null;
                this.cursor_ = 'pointer';
                this.feature_ = null;
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
                    new TileLayer({
                        source: new XYZ({
                            url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                        }),
                    }),
                    /*new TileLayer({
                        title: "Google Satellite & Roads",
                        source: new TileImage({
                            url: 'http://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
                        })
                    }),*/
                    /*
                     * LAYER POUR DRAW
                     */
                    new Vectorlayer({
                        title : "vectorSourcetrackerpos",
                        source: this.vectorSourcetrackerpos,
                        zIndex: 99999
                    }),
                    new Vectorlayer({
                        title : "vectorSourcepoints",
                        source: this.vectorSourcepoints,
                        zIndex: 99998
                    }),
                    new Vectorlayer({
                        title: 'vectorSourceroads',
                        source: this.vectorSourceroads
                    }),
                    new Vectorlayer({
                        title: 'vectorSourcepk',
                        source: this.vectorSourcepk
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

                let coord = [parseFloat(position.coords.longitude), parseFloat(position.coords.latitude)];
                /*
                * et on envoi les coordonnée à l'api osm pour recuperer la route et laposition par rapport au pk avant et pk d'apres
                */
                me.getNearestRoad(coord[0], coord[1]);

                let coordTransform = proj.fromLonLat(coord,'EPSG:3857');
                me.precision  = position.coords.accuracy;
                let geometry = new Point(coordTransform);
                let geometryPrecision = new GeomCircle(coordTransform,  me.precision);
                 /*
                  * SI LE FEATURE N'EXISTE PAS ON LE CREE SINON ON LE MET JUSTE A JOUR
                  */
                if(me.posRealTime === null && me.posRealTimePrecision === null){
                    me.posRealTime = new Feature({geometry: geometry});
                    me.posRealTimePrecision = new Feature({geometry: geometryPrecision});
                    me.posRealTimePrecision.setStyle(new Style({
                        stroke: new Stroke({
                            color: 'rgba(255, 255, 255, 0.7)',
                            width: 3
                        }),
                        fill: new Fill({
                            color: 'rgba(255, 255, 255, 0.3)'
                        })
                    }));
                    me.posRealTime.setStyle(new Style({
                        image: new Circle({
                            radius: 12,
                            fill: new Fill({
                                color: '#C92B20'
                            }),
                            stroke: new Stroke({
                                color: '#fff',
                                width: 1
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
                let markerpoint = new Feature(geometry);
                let iconStyle = new Style({
                    image: new StyleIcons(/** @type {olx.style.IconOptions} */ ({
                        anchor: [0.5, 46],
                        anchorXUnits: 'fraction',
                        anchorYUnits: 'pixels',
                        src: 'https://openlayers.org/en/v4.6.5/examples/data/icon.png',
                        size : [32,48]
                    }))
                });
                markerpoint.setStyle(iconStyle);
                markerpoint.draggable = true;
                this.vectorSourcepoints.addFeature(markerpoint);
                this.markerpoints.push(markerpoint);
                /*
                * on transform les coordonées dans en 4326
                 */
                let coordpoint = proj.transform(coordPosRealTime, 'EPSG:3857', 'EPSG:4326');


            },
            getNearestRoad(lon,lat){
                /*
                 * GET Name OF the road
                 */
                let me = this;
                let maxDist = 10; // maximum distance from the point in meters
                let query = '[out:json]; way' +
                            '(around:'+maxDist+','+lat+','+lon+')' +
                            '["highway"];' +
                            'out geom;';
                fetch('https://overpass-api.de/api/interpreter', {
                    method: "POST",
                    body: query
                }).then(function(response) {
                    return response.json();
                }).then(function(json) {
                    if(me.roadactuelle === null || json.elements[0].tags.ref !==  me.roadactuelle ){
                        me.roadactuelle = json.elements[0].tags.ref;
                        /*
                         * GET PK
                         */
                        let road =  me.roadactuelle.replace(/\s+/g, '');
                        fetch('http://localhost:8085/api/milestones?lib_rte='+road, {
                            method: "GET"
                        }).then(function (response) {
                            return response.json();
                        }).then(function (responsejson) {
                            //tabpk correspond au pk trouvés
                            let tabpk = [];
                            proj.setProj4(proj4);
                            proj4.defs("EPSG:2154", "+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
                            responsejson.forEach(function(feature){
                                let iconpk = new Style({
                                    image: new StyleIcons(/** @type {olx.style.IconOptions} */ ({
                                        anchor: [0.5, 46],
                                        anchorXUnits: 'fraction',
                                        anchorYUnits: 'pixels',
                                        src: './assets/markers/pk.png'
                                    })),
                                    text: new Text({
                                        text: feature.pr,
                                        fill: new Fill({color: 'black'}),
                                        offsetX: 5,
                                        offsetY: 5
                                    })
                                });
                                var source = new proj4.Proj('EPSG:2154');
                                var merkator = new proj4.Proj('EPSG:3857');
                                let reproj = proj4(source,merkator,[parseFloat(feature.x_gps), parseFloat(feature.y_gps)]);
                                let iconFeature = new Feature({
                                    geometry: new Point(reproj),
                                    pk: feature.pr,
                                    route : feature.lib_rte
                                });
                                iconFeature.setStyle(iconpk);
                                tabpk.push(iconFeature);
                            });
                            me.vectorSourcepk.addFeatures(tabpk);
                        });
                    }
                })
            },
            addDebutChantier(){
                let me = this;
                let iconroadwork1 = new Style({
                    image: new StyleIcons(/** @type {olx.style.IconOptions} */ ({
                        anchor: [0.5, 46],
                        anchorXUnits: 'fraction',
                        anchorYUnits: 'pixels',
                        src: './assets/markers/roadwork1.png'
                    }))
                });
                me.DebutChantier.setStyle(iconroadwork1);
                me.DebutChantier.draggable = true;
                me.DebutChantier.setGeometry(new Point(this.posRealTime.getGeometry().getCoordinates()));
                me.vectorSourcepoints.addFeature(me.DebutChantier);


            },
            addFinChantier(){
                /*
                 * ON declare le point du marker avec la geometry vide
                 */
                let me = this;
                let iconroadwork2 = new Style({
                    image: new StyleIcons(/** @type {olx.style.IconOptions} */ ({
                        anchor: [0.5, 46],
                        anchorXUnits: 'fraction',
                        anchorYUnits: 'pixels',
                        src: './assets/markers/roadwork2.png'
                    }))
                });
                me.FinChantier.setStyle(iconroadwork2);
                me.FinChantier.draggable = true;
                me.FinChantier.setGeometry(new Point(this.posRealTime.getGeometry().getCoordinates()));
                me.vectorSourcepoints.addFeature(me.FinChantier);

            }
        }
    }
</script>
