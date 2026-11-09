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
	public name: string = $state("");
	public items: HeaderItem[] = $state([]);

	constructor(name: string) {
		this.name = name;
	}

	public setName(name: string): void {
		this.name = name;
	}

	public add(name: string, onclick: () => void): HeaderMenu {
		return this.addItem(new HeaderItem(name, onclick));
	}

	public addItem(item: HeaderItem): HeaderMenu {
		this.items.push(item);
		return this;
	}
}

export class Header {
	public left = $state<HeaderMenu[] | null>(null);
	public right = $state<HeaderMenu[] | null>(null);

	public setLeft(menus: HeaderMenu[]): Header {
		this.left = menus;
		return this;
	}

	public setRight(menus: HeaderMenu[]): Header {
		this.right = menus;
		return this;
	}
}

export const header = new Header();