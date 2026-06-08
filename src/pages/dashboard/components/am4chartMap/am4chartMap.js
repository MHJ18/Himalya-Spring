import React, { Component } from 'react';

import * as am4core from "@amcharts/amcharts4/core";
import * as am4maps from "@amcharts/amcharts4/maps";
import { getCustomerCoordinates } from '../../../../utils/coordinates';
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";

import AnimateNumber from 'react-animated-number';
import s from './am4chartMap.module.scss';

class Am4chartMap extends Component {

  componentDidMount() {
    this.createMap();
  }

  componentDidUpdate(prevProps) {
    // Re-render map markers when customers change
    if (prevProps.customers !== this.props.customers) {
      this.updateMarkers();
    }
  }

  createMap() {
    let map = am4core.create("map", am4maps.MapChart);
    map.geodata = am4geodata_worldLow;
    map.percentHeight = 90;
    map.dy = 10;
    map.projection = new am4maps.projections.Miller();

    let polygonSeries = map.series.push(new am4maps.MapPolygonSeries());
    polygonSeries.useGeodata = true;

    // Zoom into Pakistan region by default
    map.homeZoomLevel = 5;
    map.homeGeoPoint = { latitude: 30.3753, longitude: 69.3451 };

    map.zoomControl = new am4maps.ZoomControl();
    map.zoomControl.layout = 'horizontal';
    map.zoomControl.align = 'left';
    map.zoomControl.valign = 'bottom';
    map.zoomControl.dy = -10;
    map.zoomControl.contentHeight = 20;
    map.zoomControl.minusButton.background.fill = am4core.color("#E7F0FF");
    map.zoomControl.minusButton.background.stroke = am4core.color("#7E98BE");
    map.zoomControl.minusButton.label.fontWeight = 600;
    map.zoomControl.minusButton.label.fontSize = 22;
    map.zoomControl.minusButton.scale = .75;
    map.zoomControl.minusButton.label.scale = .75;
    map.zoomControl.plusButton.background.fill = am4core.color("#E7F0FF");
    map.zoomControl.plusButton.background.stroke = am4core.color("#7E98BE");
    map.zoomControl.plusButton.label.fontWeight = 600;
    map.zoomControl.plusButton.label.fontSize = 22;
    map.zoomControl.plusButton.label.align = "center";
    map.zoomControl.plusButton.scale = .75;
    map.zoomControl.plusButton.label.scale = .75;
    map.zoomControl.plusButton.dx = 5;

    let plusButtonHoverState = map.zoomControl.plusButton.background.states.create("hover");
    plusButtonHoverState.properties.fill = am4core.color("#BFD8FF");
    let minusButtonHoverState = map.zoomControl.minusButton.background.states.create("hover");
    minusButtonHoverState.properties.fill = am4core.color("#BFD8FF");

    let polygonTemplate = polygonSeries.mapPolygons.template;
    polygonTemplate.tooltipText = "{name}";
    polygonTemplate.fill = am4core.color("#BED0EA");
    polygonTemplate.stroke = am4core.color("#7891B5");
    let hs = polygonTemplate.states.create("hover");
    hs.properties.fill = am4core.color("#8FB8F3");

    // City series for customer markers
    let citySeries = map.series.push(new am4maps.MapImageSeries());
    citySeries.dataFields.value = "size";
    let city = citySeries.mapImages.template;
    city.nonScaling = true;
    city.propertyFields.latitude = "latitude";
    city.propertyFields.longitude = "longitude";

    let circle = city.createChild(am4core.Circle);
    circle.fill = am4core.color("#2477FF");
    circle.strokeWidth = 2;
    circle.stroke = am4core.color("#FFFFFF");
    let circleHoverState = circle.states.create("hover");
    circleHoverState.properties.strokeWidth = 3;
    circleHoverState.properties.fill = am4core.color("#00BBD8");
    circleHoverState.properties.scale = 1.3;
    circle.tooltipText = '{tooltip}';
    circle.propertyFields.radius = 'size';

    // Pulse animation on markers
    let shadow = city.createChild(am4core.Circle);
    shadow.propertyFields.radius = 'size';
    shadow.fill = am4core.color("#2477FF");
    shadow.fillOpacity = 0.3;
    shadow.propertyFields.latitude = "latitude";
    shadow.propertyFields.longitude = "longitude";

    this.map = map;
    this.citySeries = citySeries;

    // Initial data load
    this.updateMarkers();
  }

  updateMarkers() {
    if (!this.citySeries) return;

    const { customers = [] } = this.props;

    if (customers.length === 0) {
      // Fallback: show a default marker at Karachi
      this.citySeries.data = [{
        latitude: 24.8607,
        longitude: 67.0011,
        size: 6,
        tooltip: 'Himaliya HQ – Karachi',
      }];
      return;
    }

    // Build markers from real customer data
    const markers = customers.map((customer) => {
      const coords = getCustomerCoordinates(customer.address || '');
      // Add slight random offset to avoid overlapping markers at exact same coords
      const offset = () => (Math.random() - 0.5) * 0.02;
      return {
        latitude: coords.lat + offset(),
        longitude: coords.lng + offset(),
        size: 5 + Math.min((customer.purchaseHistory || []).length, 10),
        tooltip: `${customer.name}\n${customer.phone}\n${customer.address || ''}`,
      };
    });

    this.citySeries.data = markers;

    // Auto-zoom to fit all markers
    if (this.map && markers.length > 0) {
      // Calculate bounding box
      const lats = markers.map((m) => m.latitude);
      const lngs = markers.map((m) => m.longitude);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);

      // Center the map on the bounding box center
      const centerLat = (minLat + maxLat) / 2;
      const centerLng = (minLng + maxLng) / 2;

      // Zoom level based on spread
      const latSpread = maxLat - minLat;
      const lngSpread = maxLng - minLng;
      const spread = Math.max(latSpread, lngSpread);
      let zoom = 5;
      if (spread > 10) zoom = 3;
      else if (spread > 5) zoom = 4;
      else if (spread > 2) zoom = 5;
      else zoom = 6;

      this.map.zoomToGeoPoint(
        { latitude: centerLat, longitude: centerLng },
        zoom,
        true
      );
    }
  }

  componentWillUnmount() {
    if (this.map) {
      this.map.dispose();
    }
  }

  render() {
    const { customers = [] } = this.props;
    return (
      <div className={s.mapChart}>
        <div className={s.stats}>
          <h6 className="mt-1">CUSTOMER LOCATIONS</h6>
          <p className="h3 m-0">
            <span className="mr-xs fw-normal">
              <AnimateNumber
                value={customers.length || 0}
                initialValue={0}
                duration={1000}
                stepPrecision={0}
                formatValue={n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
              />
            </span>
            <i className="fa fa-map-marker" />
          </p>
        </div>
        <div className={s.map} id="map">
          <span>Alternative content for the map</span>
        </div>
      </div>
    );
  }
}

export default Am4chartMap;
