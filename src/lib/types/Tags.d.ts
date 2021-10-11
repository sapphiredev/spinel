export interface Tag {
	keywords: string[];
	content: string;
}

export interface TagSimilarityEntry {
	word: string;
	name: string;
	lev: number;
}

export interface Conflict {
	firstName: string;
	secondName: string;
	conflictKeyWords: string[];
	type: ConflictType;
}

type ConflictType = 'uniqueKeywords' | 'headerInKeywords' | 'emptyKeyword' | 'unescapedLink';
