declare module 'discord.js-docs' {
	interface Doc {
		baseDocsURL: string;
		fetch(src: string, options: { force: boolean }): Promise<Doc>;
		formatType(types: DocTypedef[] | DocElement[]): string;
		get(...query: string[]): DocElement | null;
		search(...query: string[]): DocElement[] | null;
	}

	const Doc: Doc;
	export = Doc;
}

interface DocElement {
	formattedDescription: string;
	formattedName: string;
	description: string;
	link: string;
	url: string;
	static: boolean;
	extends: DocElement[] | null;
	implements: DocElement[] | null;
	access: string;
	deprecated: boolean;
	docType: string;
}

interface DocTypedef {}
