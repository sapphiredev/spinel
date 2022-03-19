export interface Tag {
	keywords: string[];
	content: string;
	hoisted: boolean;
}

export interface TagSimilarityEntry {
	word: string;
	name: string;
	distance: number;
}

export interface Conflict {
	firstName: string;
	secondName: string;
	conflictKeyWords: string[];
	type: ConflictType;
}

type ConflictType = 'uniqueKeywords' | 'headerInKeywords' | 'emptyKeyword' | 'unescapedLink';
