import { html, render } from 'lit-html';

export class CollapsibleWidget {
    constructor(
        private _parent: HTMLElement, 
        private _isCollapsed: boolean = false) {

    }

    toggleCollapse() {
        this._isCollapsed = !this._isCollapsed;
        this._parent.classList.toggle('collapsed', this._isCollapsed);
    }

    render() {
        const svgIcon = this._isCollapsed ? 'expand_icon.svg' : 'collapse_icon.svg';

        return html`
            <span class="icon widget-toggle-container" @click=${() => this.toggleCollapse()}></span>
        `;
    }
}