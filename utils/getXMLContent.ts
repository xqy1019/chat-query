export class XML {
    private root: HTMLDivElement;

    constructor(code: string) {
        this.root = document.createElement('div');
        this.root.innerHTML = code;
    }

    get(code: string): string {
        const insertText =
            (this.root.querySelector('FunctionCode') as HTMLElement)?.outerText || '';
        return insertText;
    }
}
