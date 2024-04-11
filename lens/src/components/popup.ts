import mapboxgl from 'mapbox-gl';
import { html, render } from 'lit-html';
import { ExtendedDatasetDataTypes } from '../models/dataset';

export class Popup {
    private _popup: mapboxgl.Popup;
    private _mode: 'hover' | 'click' = 'hover';
    private static _activePopup: Popup | null = null;

    constructor(
        private _map: mapboxgl.Map,
    ) {
        this._popup = new mapboxgl.Popup({
            closeButton: true,
            closeOnClick: true,
            closeOnMove: true,
            className: 'wee-map-popup',
            maxWidth: '320px'
        });

        this._popup.on('close', () => {
            this.handleClose();
        });
    }

    getAltitude(zoom: number): number {
        const scale = 0.05 * (591657550.5 / Math.pow(2, zoom - 1));
        const angle = 85.362; // The viewing angle in degrees
        const altitude = scale * Math.cos(this.toRadians(angle / 2)) / Math.sin(this.toRadians(angle / 2));
        return altitude;
    }
    
    // Helper function to convert degrees to radians
    toRadians(degrees: number): number {
        return degrees * Math.PI / 180;
    }

    show(feature: any, coordinates: mapboxgl.LngLatLike, mode: 'hover' | 'click', zoom: number) {
        // Hide the currently active popup
        if (Popup._activePopup) {
            Popup._activePopup.hide();
        }
    
        // Set this popup as the active one
        Popup._activePopup = this;
    
        this._mode = mode;
        var area = feature.properties.area_ha;
        
        const lngLat = mapboxgl.LngLat.convert(coordinates);
        const altitude = this.getAltitude(zoom);
        // Sadly GMaps don't support rotation and pitch in the URL
        const url = `https://www.google.com/maps/@${lngLat.lat},${lngLat.lng},${altitude}m/data=!3m1!1e3`;
    
        let content = html`
            <span class="popup-title">Area (${lngLat.lat.toFixed(6)}, ${lngLat.lng.toFixed(6)})</span>
            <div class="popup-row">
                <div class="row-label">
                    <span>Area</span>
                </div>
                <div class="row-value">
                <span>${area.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ha</span>
                </div>
            </div>

            ${Object.entries(feature.properties).slice(1, -1).map(([key, value]) => html`
                <div class="popup-row">
                    <div class="row-label">
                        <span>${Object.keys(ExtendedDatasetDataTypes).find(
                            k => ExtendedDatasetDataTypes[k as keyof typeof ExtendedDatasetDataTypes] === key
                        )} type</span>
                    </div>
                    <div class="row-value">
                        <span>${value}</span>
                    </div>
                </div>
            `)}

            <hr/>
            ${mode === 'hover' ? html`
                <div class="popup-row">
                    <span>Click on the area for more actions</span>
                </div>
            ` : html`
                <div class="popup-row">
                    <a href="${url}" target="_blank">
                        See on Google Maps
                    </a>
                </div>
            `}
        `;

        const container = document.createElement('div');
        render(content, container);
        this._popup.setLngLat(coordinates)
            .setDOMContent(container)
            .addTo(this._map);
    }

    hide() {
        this._popup.remove();
        this.handleClose();
    }

    handleClose() {
        if (Popup._activePopup === this) {
            Popup._activePopup = null;
            this._mode = 'hover';
        }
    }

    get mode() {
        return this._mode;
    }
}