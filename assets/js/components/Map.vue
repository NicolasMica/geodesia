<template>
    <div class="absolute pin">
        <div id="map" class="w-full h-full"></div>
        <div class="fixed pin-x pin-b flex flex-col">
            <div class="p-4">
                <button type="button" class="button is-red p-4" @click="addMarker">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
            <div class="p-4">
                <button type="button" class="button is-red p-4" @click="addDebutChantier">
                    <i class="fas fa-play"></i>
                </button>
            </div>
            <div class="p-4">
                <button type="button" class="button is-red p-4" @click="addFinChantier">
                    <i class="fas fa-stop"></i>
                </button>
            </div>
        </div>
    </div>
</template>

<script>
    import Map from 'ol/map'
    import View from 'ol/view'
    import TileLayer from 'ol/layer/tile'
    import VectorLayer from 'ol/layer/vector'
    import VectorSource from 'ol/source/vector'
    import Feature from 'ol/feature'
    import Point from 'ol/geom/point'
    import Style from 'ol/style/style'
    import StyleIcons from 'ol/style/icon'
    import Circle from 'ol/style/circle'
    import Fill from 'ol/style/fill'
    import Stroke from 'ol/style/stroke'
    import proj from 'ol/proj'
    import Pointer from 'ol/interaction/pointer'
    import Interaction from 'ol/interaction'
    import GeomCircle from 'ol/geom/circle'
    import ol from 'ol'
    import proj4 from 'proj4'
    import XYZ from 'ol/source/XYZ'
    import Text from 'ol/style/Text'

    export default {
        name: 'Map',
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
                url_osrm_route : '//router.project-osrm.org/route/v1/driving/',
                distance : null
            }
        },
        methods: {
            /**
             * Add a marker to the map
             */
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

            /**
             * Determines the nearest road and its milestones
             */
            getNearestRoad(coord){
                let lon = coord[0];
                let lat = coord[1];
                /*
                 * SI les PK Sont charger on recherce la distance sinon on attend qu'ils soient charger
                 * et on appelle la fonction dans le callback de l'appel ajax de la recuperation des pk
                 */

                if(typeof this.vectorSourcepk.features !== "undefined"){
                    me.getDistanceBetweenTwoPoints(coord);
                }
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
                        fetch(window.Api.path + '/milestones?lib_rte='+road, {
                            method: "GET"
                        }).then(function (response) {
                            return response.json();
                        }).then(function (responsejson) {
                            //tabpk correspond au pk trouvés
                            let tabpk = [];
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
                                let source = new proj4.Proj('EPSG:2154');
                                let merkator = new proj4.Proj('EPSG:3857');
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

                            //premiere fois que l'on cherche le point le plus proche
                            me.getDistanceBetweenTwoPoints(coord);
                        });
                    }
                })
            },

            /**
             * Add the first delimitation roadwork marker
             */
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

            /**
             * Add the last delimitation roadwork marker
             */
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

            },

            /**
             * Get the distance between the nearest milestone and the given coords
             */
            getDistanceBetweenTwoPoints(coord){
                let merkator = new proj4.Proj('EPSG:3857')
                let gps = new proj4.Proj('EPSG:4326')

                let reprojcoord = proj4(gps, merkator, [ parseFloat(coord[0]), parseFloat(coord[1]) ])
                let closestFeature = this.vectorSourcepk.getClosestFeatureToCoordinate(reprojcoord)
                let reprojfeature = proj4(merkator, gps, closestFeature.getGeometry().getCoordinates())

                console.log(closestFeature)

                fetch(this.url_osrm_route + coord + ';' + reprojfeature)
                    .then(response => response.json())
                    .then(json => {
                        if(json.code !== 'Ok') {
                            console.log("no result")
                        } else {
                            this.distance = json.routes[0].distance
                        }
                    })
            },

            /**
             * Initialize the component
             */
            initialize () {
                // Add proj4 module to OpenLayer
                proj.setProj4(proj4)
                proj4.defs("EPSG:2154", "+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs")

                this.vectorSourcetrackerpos = new VectorSource({ features: [] })
                this.vectorSourcepoints = new VectorSource({ features: [] })
                this.vectorSourceroads = new VectorSource({ features: [] })
                this.vectorSourcepk = new VectorSource({ features: [] })

                let interaction = this.setupDrag()

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
                        new VectorLayer({
                            title : "vectorSourcetrackerpos",
                            source: this.vectorSourcetrackerpos,
                            zIndex: 99999
                        }),
                        new VectorLayer({
                            title : "vectorSourcepoints",
                            source: this.vectorSourcepoints,
                            zIndex: 99998
                        }),
                        new VectorLayer({
                            title: 'vectorSourceroads',
                            source: this.vectorSourceroads
                        }),
                        new VectorLayer({
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
                    me.getNearestRoad(coord);

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

            /**
             * Setup drag interactions
             */
            setupDrag () {
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

                return interaction
            }
        },
        mounted () {
            this.initialize()
        }
    }
</script>