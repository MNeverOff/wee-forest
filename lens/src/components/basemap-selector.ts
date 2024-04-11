import { html, render } from 'lit-html';
import { CollapsibleWidget } from './collapsible-widget';

export enum BaseMapType {
    Light = 'l',
    Satellite = 's',
    Fallback = 'mapbox://styles/mapbox/standard'
}

type BaseMap = {
    id: string;
    label: string;
    style: string;
}

export const BaseMaps = [
    {
        id: BaseMapType.Light,
        label: 'Light',
        style: 'mapbox://styles/mneveroff/clu0msrla003d01p638f182dv'
    },
    {
        id: BaseMapType.Satellite,
        label: 'Satellite',
        style: 'mapbox://styles/mapbox/satellite-v9'
    }
];

export class BaseMapSelector {
    private _container: HTMLElement;
    private _collapsibleWidget: CollapsibleWidget;

    constructor(
        private _parent: HTMLElement,
        private _selectedBasemap: BaseMapType,
        private _setBaseMap: (type: BaseMapType) => void,
        ) {

        this._container = document.createElement('div');
        this._container.className = 'surface surface-left elevation-100 basemap-selector collapsed';
        this._parent.appendChild(this._container);

        this._collapsibleWidget = new CollapsibleWidget(this._container, true);

        this.render();
    }

    render() {
        const baseMapOptions = BaseMaps.map(baseMap => {
            const isSelected = baseMap.id === this._selectedBasemap;
            return html`<option value="${baseMap.id}" ?selected=${isSelected}>${baseMap.label}</option>`;
        });

        render(html`
            <div class="widget-selector-header">
                <div class="widget-selector-title">
                    <span>Base Map</span>
                </div>
                <div class="widget-selector-dropdown">
                    <select @change=${(e: Event) => this.onSelectChange(e)}>
                        ${baseMapOptions}
                    </select>
                </div>
            </div>
            ${this._collapsibleWidget.render()}`, this._container);
    }

    onSelectChange(event: Event) {
        const selectElement = event.target as HTMLSelectElement;
        this._setBaseMap(selectElement.value as BaseMapType);
    }
}