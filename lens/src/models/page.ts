const welcomePageTimeoutDays = 7;

abstract class Page {
    protected _element: HTMLElement | null;
    protected _toggleElement: HTMLElement | null;
    protected _visible: boolean = false;
    static pages: Page[] = [];

    constructor(
        protected elementId: string, 
        protected toggleElementId: string) {
        this._element = document.getElementById(elementId);
        this._toggleElement = document.getElementById(toggleElementId);

        this.bindButton();
        this.bindLogo();
        Page.pages.push(this);
    }

    bindButton() {
        this._toggleElement?.addEventListener('click', () => {
            this.toggle();
        });
    }

    bindLogo() {
        const logoMobile = document.querySelector('.nav.nav-left');
        logoMobile?.addEventListener('click', () => {
            Page.pages.forEach(page => {
                page.hide();
            });
        });
    }

    toggle() {
        if (this._visible) {
            this.hide();
        } else {
            Page.pages.forEach(page => {
                if (page !== this) {
                    page.hide();
                }
            });
            this.show();
        }
    }

    hide() {
        this._element?.classList.add('hidden');
        this._toggleElement?.classList.remove('active');
        this._visible = false;

        const navElements = document.querySelectorAll('.nav');
        navElements.forEach(navElement => {
            navElement.classList.remove('page-open');
        });
    }

    show() {
        this._element?.classList.remove('hidden');
        this._toggleElement?.classList.add('active');
        this._visible = true;

        const navElements = document.querySelectorAll('.nav');
        navElements.forEach(navElement => {
            navElement.classList.add('page-open');
        });
    }
}

export class WelcomePage extends Page {
    constructor(
        protected elementId: string, 
        protected toggleElementId: string) {
        super(elementId, toggleElementId);

        this.checkSuppressed();
    }

    bindButton() {
        this._toggleElement?.addEventListener('click', () => {
            this.hide();
            const n = new Date();
            localStorage.setItem('weeForest.welcomePageClosed', n.getTime().toString());
        });
    }

    checkSuppressed() {
        // Check if the prompt was closed more than 1 week ago
        const promptClosedTimestamp = localStorage.getItem('weeForest.welcomePageClosed');
        if (promptClosedTimestamp === null) {
            this.show();
        } else {
            const promptClosed = new Date(parseInt(promptClosedTimestamp));
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - welcomePageTimeoutDays);

            if (promptClosed.getTime() < oneWeekAgo.getTime()) {
                this.show();
            }
        }
    }
}

export class LearnPage extends Page {
    constructor(
        protected elementId: string, 
        protected toggleElementId: string) {
        super(elementId, toggleElementId);
    }
}

export class ActPage extends Page {
    constructor(
        protected elementId: string, 
        protected toggleElementId: string) {
        super(elementId, toggleElementId);
    }
}

export class SharePage extends Page {
    constructor(
        protected elementId: string, 
        protected toggleElementId: string) {
        super(elementId, toggleElementId);

        const copyButton = document.getElementById('copy-share-url');
        const shareInput = document.getElementById('share-url') as HTMLInputElement;

        copyButton?.addEventListener('click', () => {
            navigator.clipboard.writeText(shareInput.value);

            copyButton.classList.add('copied');
            setTimeout(() => {
                copyButton.classList.remove('copied');
            }, 3000);
        });
    }
}