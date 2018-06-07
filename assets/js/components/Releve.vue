<template>
    <div id="map"></div>
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
    import Circle from 'ol/style/circle';
    import Fill from 'ol/style/fill';
    import Stroke from 'ol/style/stroke';
    import proj from 'ol/proj';
    import GeomCircle from 'ol/geom/circle';

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
            this.map = new Map({
                target: 'map',
                layers: [
                    /*
                    * LAYER FOND DE PLAN
                    * TODO CHANGEMENT DE LAYER
                    */
                   /* new TileLayer({
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
                    center: [0, 0],
                    zoom: 2
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
                    me.map.getView().animate({center: coordTransform, zoom: 18});
                }
                else {
                    me.posRealTime.setGeometry(geometry);
                }



            }, function(error){
                console.log('code: '+error.code+'\n'+'message: '+ error.message, 6000)
            }, { maximumAge: 3000, timeout: 8000, enableHighAccuracy: true });
        }
    }
</script>

<style scoped>
 #map{
     width: 100%;
     height: 800px;
 }
</style>