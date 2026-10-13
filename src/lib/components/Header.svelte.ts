export class HeaderItem {
	public name: string;
	public callback: () => void;

	constructor(name: string, callback: () => void) {
		this.name = name;
		this.callback = callback;
	}
}

export class HeaderMenu {
	public name: string;
	public items: HeaderItem[];

	constructor(name: string) {
		this.name = name;
		this.items = [];
	}
}

class Header {
	public controls: HeaderMenu[];
	public sysCtrls: HeaderMenu[];

	constructor() {
		this.controls = [];
		this.sysCtrls = [new HeaderMenu("TermOS")];
	}

	public getFormattedDateTime(): string {
		return new Date().toLocaleString();
	}
}

export const header = new Header();