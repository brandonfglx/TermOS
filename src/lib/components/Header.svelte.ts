export class HeaderItem {
	public name: string;
	public onclick: () => void;

	constructor(name: string, onclick: () => void) {
		this.name = name;
		this.onclick = onclick;
	}
}

// On click, shows the dropdown of the header items
export class HeaderMenu {
	public name: string;
	public items: HeaderItem[];

	constructor(name: string) {
		this.name = name;
		this.items = [];
	}
}

// TODO: Each application has its own header instance that manages itself; TermOS has a completely seperate header bar area to store general controls
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